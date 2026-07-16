import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import { isValidObjectId } from '../../shared/validation/object-id.js';
import {
  OrganizationModel,
  type OrganizationPlan,
} from '../organizations/organization.model.js';
import { SearchQuotaModel, type SearchQuotaDocument } from './quota.model.js';

/**
 * Cost charged per sourcing search run.
 * Product mock uses 25; backend uses 1 for simplicity until plans meter differently.
 */
export const SOURCING_QUOTA_COST = 1;

/** Monthly search limits by organization plan. Enterprise uses a large finite cap. */
export const PLAN_SEARCH_LIMITS: Record<OrganizationPlan, number> = {
  Starter: 50,
  Growth: 200,
  Scale: 1000,
  Enterprise: 999_999_999,
};

export type QuotaStatus = {
  organizationId: string;
  periodKey: string;
  plan: string;
  limit: number;
  used: number;
  reserved: number;
  remaining: number;
  costPerSearch: number;
};

function currentPeriodKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function resolvePlanLimit(plan: string): number {
  if (plan in PLAN_SEARCH_LIMITS) {
    return PLAN_SEARCH_LIMITS[plan as OrganizationPlan];
  }
  return PLAN_SEARCH_LIMITS.Starter;
}

async function ensureQuotaDoc(organizationId: string): Promise<SearchQuotaDocument> {
  if (!isValidObjectId(organizationId)) {
    throw AppError.badRequest('Invalid organization id');
  }

  const periodKey = currentPeriodKey();
  const existing = await SearchQuotaModel.findOne({ organizationId, periodKey });
  if (existing) return existing;

  const org = await OrganizationModel.findById(organizationId).select('plan');
  const plan = org?.plan ?? 'Starter';
  const limit = resolvePlanLimit(plan);

  try {
    return await SearchQuotaModel.create({
      organizationId,
      periodKey,
      plan,
      limit,
      used: 0,
      reserved: 0,
      reservations: [],
    });
  } catch (error) {
    // Race on unique index — re-read.
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      const retry = await SearchQuotaModel.findOne({ organizationId, periodKey });
      if (retry) return retry;
    }
    throw error;
  }
}

function toStatus(doc: SearchQuotaDocument): QuotaStatus {
  const remaining = Math.max(0, doc.limit - doc.used - doc.reserved);
  return {
    organizationId: doc.organizationId.toHexString(),
    periodKey: doc.periodKey,
    plan: doc.plan,
    limit: doc.limit,
    used: doc.used,
    reserved: doc.reserved,
    remaining,
    costPerSearch: SOURCING_QUOTA_COST,
  };
}

export class QuotaService {
  async getQuotaStatus(organizationId: string): Promise<QuotaStatus> {
    const doc = await ensureQuotaDoc(organizationId);
    // Refresh plan limit if org upgraded mid-period.
    const org = await OrganizationModel.findById(organizationId).select('plan');
    if (org && org.plan !== doc.plan) {
      doc.plan = org.plan;
      doc.limit = resolvePlanLimit(org.plan);
      await doc.save();
    }
    return toStatus(doc);
  }

  /**
   * Atomically reserve `amount` units for a session.
   * Fails when remaining < amount.
   */
  async reserve(
    organizationId: string,
    sessionId: string,
    amount: number = SOURCING_QUOTA_COST
  ): Promise<QuotaStatus> {
    if (!isValidObjectId(sessionId)) {
      throw AppError.badRequest('Invalid session id');
    }
    if (!Number.isFinite(amount) || amount < 1) {
      throw AppError.badRequest('Invalid quota amount');
    }

    await ensureQuotaDoc(organizationId);
    const periodKey = currentPeriodKey();
    const sessionObjectId = new mongoose.Types.ObjectId(sessionId);

    const updated = await SearchQuotaModel.findOneAndUpdate(
      {
        organizationId,
        periodKey,
        $expr: {
          $lte: [{ $add: ['$used', '$reserved', amount] }, '$limit'],
        },
        // Idempotent: do not double-reserve the same session while reserved.
        reservations: {
          $not: {
            $elemMatch: { sessionId: sessionObjectId, status: 'reserved' },
          },
        },
      },
      {
        $inc: { reserved: amount },
        $push: {
          reservations: {
            sessionId: sessionObjectId,
            amount,
            status: 'reserved',
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      // Already reserved for this session → return current status.
      const existing = await SearchQuotaModel.findOne({
        organizationId,
        periodKey,
        reservations: {
          $elemMatch: { sessionId: sessionObjectId, status: 'reserved' },
        },
      });
      if (existing) return toStatus(existing);

      throw AppError.conflict('Search quota exhausted for this billing period');
    }

    return toStatus(updated);
  }

  async commit(organizationId: string, sessionId: string): Promise<QuotaStatus> {
    if (!isValidObjectId(sessionId)) {
      throw AppError.badRequest('Invalid session id');
    }

    const periodKey = currentPeriodKey();
    const sessionObjectId = new mongoose.Types.ObjectId(sessionId);
    const doc = await SearchQuotaModel.findOne({ organizationId, periodKey });
    if (!doc) {
      return this.getQuotaStatus(organizationId);
    }

    const reservation = doc.reservations.find(
      (item) => item.sessionId.equals(sessionObjectId) && item.status === 'reserved'
    );
    if (!reservation) {
      return toStatus(doc);
    }

    const updated = await SearchQuotaModel.findOneAndUpdate(
      {
        organizationId,
        periodKey,
        reservations: {
          $elemMatch: { sessionId: sessionObjectId, status: 'reserved' },
        },
      },
      {
        $inc: { used: reservation.amount, reserved: -reservation.amount },
        $set: { 'reservations.$[r].status': 'committed' },
      },
      {
        new: true,
        arrayFilters: [{ 'r.sessionId': sessionObjectId, 'r.status': 'reserved' }],
      }
    );

    return toStatus(updated ?? doc);
  }

  async refund(organizationId: string, sessionId: string): Promise<QuotaStatus> {
    if (!isValidObjectId(sessionId)) {
      throw AppError.badRequest('Invalid session id');
    }

    const periodKey = currentPeriodKey();
    const sessionObjectId = new mongoose.Types.ObjectId(sessionId);
    const doc = await SearchQuotaModel.findOne({ organizationId, periodKey });
    if (!doc) {
      return this.getQuotaStatus(organizationId);
    }

    const reservation = doc.reservations.find(
      (item) => item.sessionId.equals(sessionObjectId) && item.status === 'reserved'
    );
    if (!reservation) {
      return toStatus(doc);
    }

    const updated = await SearchQuotaModel.findOneAndUpdate(
      {
        organizationId,
        periodKey,
        reservations: {
          $elemMatch: { sessionId: sessionObjectId, status: 'reserved' },
        },
      },
      {
        $inc: { reserved: -reservation.amount },
        $set: { 'reservations.$[r].status': 'refunded' },
      },
      {
        new: true,
        arrayFilters: [{ 'r.sessionId': sessionObjectId, 'r.status': 'reserved' }],
      }
    );

    return toStatus(updated ?? doc);
  }
}

export const quotaService = new QuotaService();
