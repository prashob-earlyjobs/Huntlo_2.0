import { AppError } from '../../shared/errors/app-error.js';
import { isValidObjectId } from '../../shared/validation/object-id.js';
import {
  OrganizationModel,
  type OrganizationPlan,
} from '../organizations/organization.model.js';
import {
  RevealQuotaModel,
  type RevealQuotaContactType,
  type RevealQuotaDocument,
} from './reveal-quota.model.js';

export const EMAIL_REVEAL_COST = 2;
export const MOBILE_REVEAL_COST = 5;

/** Monthly email reveal credit limits by organization plan. */
export const PLAN_EMAIL_REVEAL_LIMITS: Record<OrganizationPlan, number> = {
  Starter: 500,
  Growth: 2500,
  Scale: 10_000,
  Enterprise: 999_999_999,
};

/** Monthly mobile reveal credit limits by organization plan. */
export const PLAN_MOBILE_REVEAL_LIMITS: Record<OrganizationPlan, number> = {
  Starter: 200,
  Growth: 1200,
  Scale: 5000,
  Enterprise: 999_999_999,
};

export type RevealQuotaStatus = {
  organizationId: string;
  periodKey: string;
  plan: string;
  email: {
    limit: number;
    used: number;
    reserved: number;
    remaining: number;
    costPerReveal: number;
  };
  mobile: {
    limit: number;
    used: number;
    reserved: number;
    remaining: number;
    costPerReveal: number;
  };
};

function currentPeriodKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function resolveEmailLimit(plan: string): number {
  if (plan in PLAN_EMAIL_REVEAL_LIMITS) {
    return PLAN_EMAIL_REVEAL_LIMITS[plan as OrganizationPlan];
  }
  return PLAN_EMAIL_REVEAL_LIMITS.Starter;
}

function resolveMobileLimit(plan: string): number {
  if (plan in PLAN_MOBILE_REVEAL_LIMITS) {
    return PLAN_MOBILE_REVEAL_LIMITS[plan as OrganizationPlan];
  }
  return PLAN_MOBILE_REVEAL_LIMITS.Starter;
}

function costFor(contactType: RevealQuotaContactType): number {
  return contactType === 'email' ? EMAIL_REVEAL_COST : MOBILE_REVEAL_COST;
}

async function ensureQuotaDoc(organizationId: string): Promise<RevealQuotaDocument> {
  if (!isValidObjectId(organizationId)) {
    throw AppError.badRequest('Invalid organization id');
  }

  const periodKey = currentPeriodKey();
  const existing = await RevealQuotaModel.findOne({ organizationId, periodKey });
  if (existing) return existing;

  const org = await OrganizationModel.findById(organizationId).select('plan');
  const plan = org?.plan ?? 'Starter';

  try {
    return await RevealQuotaModel.create({
      organizationId,
      periodKey,
      plan,
      emailLimit: resolveEmailLimit(plan),
      mobileLimit: resolveMobileLimit(plan),
      usedEmail: 0,
      reservedEmail: 0,
      usedMobile: 0,
      reservedMobile: 0,
      reservations: [],
    });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      const retry = await RevealQuotaModel.findOne({ organizationId, periodKey });
      if (retry) return retry;
    }
    throw error;
  }
}

function toStatus(doc: RevealQuotaDocument): RevealQuotaStatus {
  return {
    organizationId: doc.organizationId.toHexString(),
    periodKey: doc.periodKey,
    plan: doc.plan,
    email: {
      limit: doc.emailLimit,
      used: doc.usedEmail,
      reserved: doc.reservedEmail,
      remaining: Math.max(0, doc.emailLimit - doc.usedEmail - doc.reservedEmail),
      costPerReveal: EMAIL_REVEAL_COST,
    },
    mobile: {
      limit: doc.mobileLimit,
      used: doc.usedMobile,
      reserved: doc.reservedMobile,
      remaining: Math.max(0, doc.mobileLimit - doc.usedMobile - doc.reservedMobile),
      costPerReveal: MOBILE_REVEAL_COST,
    },
  };
}

export class RevealQuotaService {
  async getStatus(organizationId: string): Promise<RevealQuotaStatus> {
    const doc = await ensureQuotaDoc(organizationId);
    const org = await OrganizationModel.findById(organizationId).select('plan');
    if (org && org.plan !== doc.plan) {
      doc.plan = org.plan;
      doc.emailLimit = resolveEmailLimit(org.plan);
      doc.mobileLimit = resolveMobileLimit(org.plan);
      await doc.save();
    }
    return toStatus(doc);
  }

  /**
   * Atomically reserve credits for a reveal.
   * `reservationId` should be unique per reveal attempt (e.g. ObjectId hex).
   */
  async reserve(
    organizationId: string,
    reservationId: string,
    contactType: RevealQuotaContactType
  ): Promise<RevealQuotaStatus> {
    if (!reservationId || !String(reservationId).trim()) {
      throw AppError.badRequest('Invalid reservation id');
    }

    const amount = costFor(contactType);
    await ensureQuotaDoc(organizationId);
    const periodKey = currentPeriodKey();
    const rid = String(reservationId).trim();

    const usedField = contactType === 'email' ? 'usedEmail' : 'usedMobile';
    const reservedField = contactType === 'email' ? 'reservedEmail' : 'reservedMobile';
    const limitField = contactType === 'email' ? 'emailLimit' : 'mobileLimit';

    const updated = await RevealQuotaModel.findOneAndUpdate(
      {
        organizationId,
        periodKey,
        $expr: {
          $lte: [{ $add: [`$${usedField}`, `$${reservedField}`, amount] }, `$${limitField}`],
        },
        reservations: {
          $not: {
            $elemMatch: {
              reservationId: rid,
              status: { $in: ['reserved', 'committed'] },
            },
          },
        },
      },
      {
        $inc: { [reservedField]: amount },
        $push: {
          reservations: {
            reservationId: rid,
            contactType,
            amount,
            status: 'reserved',
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      const existing = await RevealQuotaModel.findOne({
        organizationId,
        periodKey,
        reservations: {
          $elemMatch: {
            reservationId: rid,
            status: { $in: ['reserved', 'committed'] },
          },
        },
      });
      if (existing) return toStatus(existing);

      throw AppError.conflict(
        contactType === 'email'
          ? 'Email reveal quota exhausted for this billing period'
          : 'Mobile reveal quota exhausted for this billing period'
      );
    }

    return toStatus(updated);
  }

  async commit(organizationId: string, reservationId: string): Promise<RevealQuotaStatus> {
    const periodKey = currentPeriodKey();
    const rid = String(reservationId).trim();
    const doc = await RevealQuotaModel.findOne({ organizationId, periodKey });
    if (!doc) {
      return this.getStatus(organizationId);
    }

    const reservation = doc.reservations.find(
      (item) => item.reservationId === rid && item.status === 'reserved'
    );
    if (!reservation) {
      return toStatus(doc);
    }

    const reservedField =
      reservation.contactType === 'email' ? 'reservedEmail' : 'reservedMobile';
    const usedField = reservation.contactType === 'email' ? 'usedEmail' : 'usedMobile';

    const updated = await RevealQuotaModel.findOneAndUpdate(
      {
        organizationId,
        periodKey,
        reservations: {
          $elemMatch: { reservationId: rid, status: 'reserved' },
        },
      },
      {
        $inc: { [usedField]: reservation.amount, [reservedField]: -reservation.amount },
        $set: { 'reservations.$[r].status': 'committed' },
      },
      {
        new: true,
        arrayFilters: [{ 'r.reservationId': rid, 'r.status': 'reserved' }],
      }
    );

    return toStatus(updated ?? doc);
  }

  async refund(organizationId: string, reservationId: string): Promise<RevealQuotaStatus> {
    const periodKey = currentPeriodKey();
    const rid = String(reservationId).trim();
    const doc = await RevealQuotaModel.findOne({ organizationId, periodKey });
    if (!doc) {
      return this.getStatus(organizationId);
    }

    const reservation = doc.reservations.find(
      (item) => item.reservationId === rid && item.status === 'reserved'
    );
    if (!reservation) {
      return toStatus(doc);
    }

    const reservedField =
      reservation.contactType === 'email' ? 'reservedEmail' : 'reservedMobile';

    const updated = await RevealQuotaModel.findOneAndUpdate(
      {
        organizationId,
        periodKey,
        reservations: {
          $elemMatch: { reservationId: rid, status: 'reserved' },
        },
      },
      {
        $inc: { [reservedField]: -reservation.amount },
        $set: { 'reservations.$[r].status': 'refunded' },
      },
      {
        new: true,
        arrayFilters: [{ 'r.reservationId': rid, 'r.status': 'reserved' }],
      }
    );

    return toStatus(updated ?? doc);
  }
}

export const revealQuotaService = new RevealQuotaService();
