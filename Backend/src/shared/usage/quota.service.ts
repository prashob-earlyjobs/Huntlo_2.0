import mongoose from 'mongoose';

import { AppError } from '../errors/app-error.js';
import { isValidObjectId } from '../validation/object-id.js';
import { OrganizationModel } from '../../modules/organizations/organization.model.js';
import {
  PricingPlanModel,
  type PricingPlanDocument,
} from '../../modules/plans/pricing-plan.model.js';
import { WorkspaceSubscriptionModel } from '../../modules/plans/subscription.model.js';
import {
  METRIC_DEFAULT_COST,
  METRIC_LABELS,
  USAGE_METRICS,
  currentPeriodKey,
  periodResetAt,
  type UsageMetric,
} from './metrics.js';
import { QuotaCounterModel, type QuotaCounterDocument } from './quota-counter.model.js';
import { UsageLedgerModel } from './usage-ledger.model.js';
import { UsageReservationModel } from './usage-reservation.model.js';
import { emitUsageUpdated } from '../../realtime/events.js';
import { notificationsService } from '../../modules/notifications/notifications.service.js';

const RESERVATION_TTL_MS = 30 * 60 * 1000;

export type FeatureKey =
  | 'sourcing'
  | 'peopleScout'
  | 'outreach'
  | 'screening'
  | 'assessments'
  | 'huntlo360'
  | 'analytics'
  | 'integrations'
  | 'team';

export type QuotaUsageView = {
  metric: UsageMetric;
  label: string;
  used: number;
  reserved: number;
  limit: number;
  remaining: number;
  resetAt: string;
  allowOverage: boolean;
  periodKey: string;
};

export type ReserveUsageInput = {
  organizationId: string;
  userId?: string | null;
  metric: UsageMetric;
  quantity?: number;
  idempotencyKey: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  expiresInMs?: number;
};

export type UsageActor = {
  organizationId: string;
  userId?: string | null;
};

function remainingOf(doc: QuotaCounterDocument): number {
  if (doc.allowOverage) return Number.POSITIVE_INFINITY;
  return Math.max(0, doc.limit - doc.used - doc.reserved);
}

function toUsageView(doc: QuotaCounterDocument): QuotaUsageView {
  const remaining = remainingOf(doc);
  return {
    metric: doc.metric,
    label: METRIC_LABELS[doc.metric],
    used: doc.used,
    reserved: doc.reserved,
    limit: doc.limit,
    remaining: Number.isFinite(remaining) ? remaining : doc.limit,
    resetAt: doc.resetAt.toISOString(),
    allowOverage: doc.allowOverage,
    periodKey: doc.periodKey,
  };
}

function throwQuotaExceeded(doc: QuotaCounterDocument, message?: string): never {
  const view = toUsageView(doc);
  throw AppError.quotaExceeded(
    message ?? `${METRIC_LABELS[doc.metric]} quota exhausted for this billing period`,
    {
      metric: view.metric,
      limit: view.limit,
      used: view.used,
      remaining: view.remaining,
      resetAt: view.resetAt,
    },
    [
      { path: 'metric', message: view.metric },
      { path: 'limit', message: String(view.limit) },
      { path: 'used', message: String(view.used) },
      { path: 'remaining', message: String(view.remaining) },
      { path: 'resetAt', message: view.resetAt },
    ]
  );
}

async function resolvePlanLimits(
  organizationId: string
): Promise<{
  limits: Record<UsageMetric, number>;
  allowOverage: boolean;
  featureAccess: Record<string, boolean>;
  planCode: string;
}> {
  const org = await OrganizationModel.findById(organizationId).select('plan');
  const planCode = (org?.plan ?? 'Starter').toLowerCase();

  const subscription = await WorkspaceSubscriptionModel.findOne({
    organizationId,
    status: { $in: ['active', 'trialing', 'past_due'] },
  }).sort({ createdAt: -1 });

  let plan: PricingPlanDocument | null = null;
  if (subscription?.planId) {
    plan = await PricingPlanModel.findById(subscription.planId);
  }
  if (!plan) {
    plan = await PricingPlanModel.findOne({
      code: planCode,
      active: true,
    });
  }
  if (!plan) {
    plan = await PricingPlanModel.findOne({ code: 'starter', active: true });
  }

  const defaults = defaultLimitsForOrgPlan(org?.plan ?? 'Starter');
  const limits = { ...defaults } as Record<UsageMetric, number>;
  if (plan?.limits) {
    for (const metric of USAGE_METRICS) {
      const value = plan.limits[metric];
      if (typeof value === 'number' && Number.isFinite(value)) {
        limits[metric] = value;
      }
    }
  }

  return {
    limits,
    allowOverage: Boolean(plan?.limits?.allowOverage),
    featureAccess: (plan?.featureAccess as Record<string, boolean>) ?? {},
    planCode: plan?.code ?? planCode,
  };
}

function defaultLimitsForOrgPlan(plan: string): Record<UsageMetric, number> {
  const key = plan as 'Starter' | 'Growth' | 'Scale' | 'Enterprise';
  const table: Record<string, Record<UsageMetric, number>> = {
    Starter: {
      candidate_search: 50,
      email_reveal: 500,
      mobile_reveal: 200,
      people_scout: 50,
      email_outreach: 2000,
      whatsapp_outreach: 500,
      ai_voice_minutes: 100,
      assessment_invites: 50,
      team_seats: 3,
    },
    Growth: {
      candidate_search: 200,
      email_reveal: 2500,
      mobile_reveal: 1200,
      people_scout: 200,
      email_outreach: 20_000,
      whatsapp_outreach: 5000,
      ai_voice_minutes: 600,
      assessment_invites: 200,
      team_seats: 15,
    },
    Scale: {
      candidate_search: 1000,
      email_reveal: 10_000,
      mobile_reveal: 5000,
      people_scout: 1000,
      email_outreach: 100_000,
      whatsapp_outreach: 25_000,
      ai_voice_minutes: 3000,
      assessment_invites: 1000,
      team_seats: 50,
    },
    Enterprise: {
      candidate_search: 999_999_999,
      email_reveal: 999_999_999,
      mobile_reveal: 999_999_999,
      people_scout: 999_999_999,
      email_outreach: 999_999_999,
      whatsapp_outreach: 999_999_999,
      ai_voice_minutes: 999_999_999,
      assessment_invites: 999_999_999,
      team_seats: 999_999_999,
    },
  };
  return table[key] ?? table.Starter!;
}

async function ensureCounter(
  organizationId: string,
  metric: UsageMetric
): Promise<QuotaCounterDocument> {
  if (!isValidObjectId(organizationId)) {
    throw AppError.badRequest('Invalid organization id');
  }

  const periodKey = currentPeriodKey();
  const existing = await QuotaCounterModel.findOne({
    organizationId,
    periodKey,
    metric,
  });
  if (existing) {
    return existing;
  }

  const { limits, allowOverage } = await resolvePlanLimits(organizationId);
  try {
    return await QuotaCounterModel.create({
      organizationId,
      periodKey,
      metric,
      used: 0,
      reserved: 0,
      limit: limits[metric],
      resetAt: periodResetAt(periodKey),
      allowOverage,
    });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      const retry = await QuotaCounterModel.findOne({
        organizationId,
        periodKey,
        metric,
      });
      if (retry) return retry;
    }
    throw error;
  }
}

async function writeLedger(input: {
  organizationId: string;
  userId?: string | null;
  metric: UsageMetric;
  quantity: number;
  action: 'reserve' | 'commit' | 'release' | 'increment' | 'refund';
  status: 'pending' | 'committed' | 'released' | 'refunded' | 'failed';
  idempotencyKey?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  metadata?: Record<string, unknown>;
  periodKey: string;
}) {
  try {
    await UsageLedgerModel.create({
      organizationId: input.organizationId,
      userId: input.userId ?? null,
      metric: input.metric,
      quantity: input.quantity,
      action: input.action,
      status: input.status,
      idempotencyKey: input.idempotencyKey
        ? `${input.action}:${input.idempotencyKey}`
        : null,
      relatedEntityType: input.relatedEntityType ?? null,
      relatedEntityId: input.relatedEntityId ?? null,
      metadata: input.metadata ?? {},
      periodKey: input.periodKey,
    });
  } catch (error) {
    // Idempotent ledger writes — ignore duplicate key.
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      return;
    }
    throw error;
  }
}

export class QuotaService {
  async checkFeatureAccess(
    organizationId: string,
    feature: FeatureKey | string
  ): Promise<boolean> {
    const { featureAccess, planCode } = await resolvePlanLimits(organizationId);
    if (Object.keys(featureAccess).length === 0) {
      // Default plans: all core features enabled except enterprise-only.
      return feature !== 'huntlo360' || planCode === 'scale' || planCode === 'enterprise';
    }
    if (featureAccess[feature] === false) return false;
    return featureAccess[feature] !== undefined ? Boolean(featureAccess[feature]) : true;
  }

  async assertFeatureAccess(organizationId: string, feature: FeatureKey | string) {
    const allowed = await this.checkFeatureAccess(organizationId, feature);
    if (!allowed) {
      throw AppError.forbidden(`Feature "${feature}" is not available on the current plan`);
    }
  }

  async getUsage(
    organizationId: string,
    metric?: UsageMetric
  ): Promise<QuotaUsageView | QuotaUsageView[]> {
    if (metric) {
      const doc = await ensureCounter(organizationId, metric);
      return toUsageView(doc);
    }
    const views: QuotaUsageView[] = [];
    for (const item of USAGE_METRICS) {
      const doc = await ensureCounter(organizationId, item);
      views.push(toUsageView(doc));
    }
    return views;
  }

  async reserveUsage(input: ReserveUsageInput): Promise<{
    reservationId: string;
    usage: QuotaUsageView;
  }> {
    const quantity = input.quantity ?? METRIC_DEFAULT_COST[input.metric];
    if (!Number.isFinite(quantity) || quantity < 1) {
      throw AppError.badRequest('Invalid quota quantity');
    }
    if (!input.idempotencyKey?.trim()) {
      throw AppError.badRequest('idempotencyKey is required to reserve usage');
    }

    const existing = await UsageReservationModel.findOne({
      organizationId: input.organizationId,
      metric: input.metric,
      idempotencyKey: input.idempotencyKey,
    });
    if (existing?.status === 'reserved' || existing?.status === 'committed') {
      const usage = await ensureCounter(input.organizationId, input.metric);
      return { reservationId: existing._id.toHexString(), usage: toUsageView(usage) };
    }

    const counter = await ensureCounter(input.organizationId, input.metric);
    const periodKey = counter.periodKey;
    const expiresAt = new Date(Date.now() + (input.expiresInMs ?? RESERVATION_TTL_MS));

    const filter: Record<string, unknown> = {
      _id: counter._id,
    };
    if (!counter.allowOverage) {
      filter.$expr = {
        $lte: [{ $add: ['$used', '$reserved', quantity] }, '$limit'],
      };
    }

    const updated = await QuotaCounterModel.findOneAndUpdate(
      filter,
      { $inc: { reserved: quantity } },
      { new: true }
    );

    if (!updated) {
      const fresh = await ensureCounter(input.organizationId, input.metric);
      throwQuotaExceeded(fresh);
    }

    try {
      // Re-use a previously released/expired/refunded row for the same idempotency key
      // instead of inserting a duplicate (unique index on org+metric+key).
      if (existing) {
        const revived = await UsageReservationModel.findOneAndUpdate(
          {
            _id: existing._id,
            status: { $in: ['released', 'expired', 'refunded'] },
          },
          {
            $set: {
              status: 'reserved',
              quantity,
              expiresAt,
              periodKey,
              relatedEntityType: input.relatedEntityType ?? null,
              relatedEntityId: input.relatedEntityId ?? null,
              userId: input.userId ?? existing.userId ?? null,
            },
          },
          { new: true }
        );

        if (revived) {
          await writeLedger({
            organizationId: input.organizationId,
            userId: input.userId,
            metric: input.metric,
            quantity,
            action: 'reserve',
            status: 'pending',
            idempotencyKey: input.idempotencyKey,
            relatedEntityType: input.relatedEntityType,
            relatedEntityId: input.relatedEntityId,
            periodKey,
          });
          return {
            reservationId: revived._id.toHexString(),
            usage: toUsageView(updated),
          };
        }

        // Lost the race — another request already reserved/committed this key.
        await QuotaCounterModel.updateOne(
          { _id: updated._id },
          { $inc: { reserved: -quantity } }
        );
        const raced = await UsageReservationModel.findOne({
          organizationId: input.organizationId,
          metric: input.metric,
          idempotencyKey: input.idempotencyKey,
        });
        if (raced && (raced.status === 'reserved' || raced.status === 'committed')) {
          const usage = await ensureCounter(input.organizationId, input.metric);
          return { reservationId: raced._id.toHexString(), usage: toUsageView(usage) };
        }
        throw AppError.conflict('Usage reservation is in an unexpected state; retry shortly');
      }

      const reservation = await UsageReservationModel.create({
        organizationId: input.organizationId,
        metric: input.metric,
        quantity,
        status: 'reserved',
        expiresAt,
        idempotencyKey: input.idempotencyKey,
        relatedEntityType: input.relatedEntityType ?? null,
        relatedEntityId: input.relatedEntityId ?? null,
        periodKey,
        userId: input.userId ?? null,
      });

      await writeLedger({
        organizationId: input.organizationId,
        userId: input.userId,
        metric: input.metric,
        quantity,
        action: 'reserve',
        status: 'pending',
        idempotencyKey: input.idempotencyKey,
        relatedEntityType: input.relatedEntityType,
        relatedEntityId: input.relatedEntityId,
        periodKey,
      });

      return {
        reservationId: reservation._id.toHexString(),
        usage: toUsageView(updated),
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      // Roll back reserved credits if reservation insert/update races/fails.
      await QuotaCounterModel.updateOne(
        { _id: updated._id },
        { $inc: { reserved: -quantity } }
      );

      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code?: number }).code === 11000
      ) {
        const raced = await UsageReservationModel.findOne({
          organizationId: input.organizationId,
          metric: input.metric,
          idempotencyKey: input.idempotencyKey,
        });
        if (raced && (raced.status === 'reserved' || raced.status === 'committed')) {
          const usage = await ensureCounter(input.organizationId, input.metric);
          return { reservationId: raced._id.toHexString(), usage: toUsageView(usage) };
        }
      }
      throw error;
    }
  }

  async commitUsage(input: {
    organizationId: string;
    userId?: string | null;
    metric: UsageMetric;
    idempotencyKey: string;
  }): Promise<QuotaUsageView> {
    const reservation = await UsageReservationModel.findOne({
      organizationId: input.organizationId,
      metric: input.metric,
      idempotencyKey: input.idempotencyKey,
    });
    if (!reservation) {
      return toUsageView(await ensureCounter(input.organizationId, input.metric));
    }
    if (reservation.status === 'committed') {
      return toUsageView(await ensureCounter(input.organizationId, input.metric));
    }
    if (reservation.status !== 'reserved') {
      return toUsageView(await ensureCounter(input.organizationId, input.metric));
    }

    const claimed = await UsageReservationModel.findOneAndUpdate(
      { _id: reservation._id, status: 'reserved' },
      { $set: { status: 'committed' } },
      { new: true }
    );
    if (!claimed) {
      return toUsageView(await ensureCounter(input.organizationId, input.metric));
    }

    const updated = await QuotaCounterModel.findOneAndUpdate(
      {
        organizationId: input.organizationId,
        periodKey: reservation.periodKey,
        metric: input.metric,
        reserved: { $gte: reservation.quantity },
      },
      {
        $inc: { used: reservation.quantity, reserved: -reservation.quantity },
      },
      { new: true }
    );

    await writeLedger({
      organizationId: input.organizationId,
      userId: input.userId ?? reservation.userId?.toHexString(),
      metric: input.metric,
      quantity: reservation.quantity,
      action: 'commit',
      status: 'committed',
      idempotencyKey: input.idempotencyKey,
      relatedEntityType: reservation.relatedEntityType,
      relatedEntityId: reservation.relatedEntityId,
      periodKey: reservation.periodKey,
    });

    const view = toUsageView(
      updated ?? (await ensureCounter(input.organizationId, input.metric))
    );
    emitUsageUpdated({
      organizationId: input.organizationId,
      metric: view.metric,
      used: view.used,
      limit: view.limit,
      remaining: view.remaining,
      userId: input.userId ?? undefined,
    });

    const recipient =
      input.userId ?? reservation.userId?.toHexString() ?? null;
    if (recipient && view.limit > 0) {
      const ratio = view.remaining / view.limit;
      if (view.remaining <= 0) {
        void notificationsService
          .create({
            organizationId: input.organizationId,
            userId: recipient,
            type: 'quota_exhausted',
            severity: 'error',
            title: `${view.label} exhausted`,
            message: `Your ${view.label.toLowerCase()} quota is exhausted for this billing period.`,
            relatedEntityType: 'usage_metric',
            relatedEntityId: view.metric,
            actionUrl: '/dashboard/plans',
          })
          .catch(() => undefined);
      } else if (ratio <= 0.15) {
        void notificationsService
          .create({
            organizationId: input.organizationId,
            userId: recipient,
            type: 'quota_warning',
            severity: 'warning',
            title: `${view.label} running low`,
            message: `Only ${view.remaining} ${view.label.toLowerCase()} remaining this period.`,
            relatedEntityType: 'usage_metric',
            relatedEntityId: view.metric,
            actionUrl: '/dashboard/plans',
          })
          .catch(() => undefined);
      }
    }

    return view;
  }

  async releaseUsage(input: {
    organizationId: string;
    userId?: string | null;
    metric: UsageMetric;
    idempotencyKey: string;
  }): Promise<QuotaUsageView> {
    const reservation = await UsageReservationModel.findOne({
      organizationId: input.organizationId,
      metric: input.metric,
      idempotencyKey: input.idempotencyKey,
    });
    if (!reservation || reservation.status !== 'reserved') {
      return toUsageView(await ensureCounter(input.organizationId, input.metric));
    }

    const claimed = await UsageReservationModel.findOneAndUpdate(
      { _id: reservation._id, status: 'reserved' },
      { $set: { status: 'released' } },
      { new: true }
    );
    if (!claimed) {
      return toUsageView(await ensureCounter(input.organizationId, input.metric));
    }

    const updated = await QuotaCounterModel.findOneAndUpdate(
      {
        organizationId: input.organizationId,
        periodKey: reservation.periodKey,
        metric: input.metric,
        reserved: { $gte: reservation.quantity },
      },
      { $inc: { reserved: -reservation.quantity } },
      { new: true }
    );

    await writeLedger({
      organizationId: input.organizationId,
      userId: input.userId ?? reservation.userId?.toHexString(),
      metric: input.metric,
      quantity: reservation.quantity,
      action: 'release',
      status: 'released',
      idempotencyKey: input.idempotencyKey,
      relatedEntityType: reservation.relatedEntityType,
      relatedEntityId: reservation.relatedEntityId,
      periodKey: reservation.periodKey,
    });

    return toUsageView(updated ?? (await ensureCounter(input.organizationId, input.metric)));
  }

  /** Alias for releaseUsage — provider failure path. */
  async refundUsage(input: {
    organizationId: string;
    userId?: string | null;
    metric: UsageMetric;
    idempotencyKey: string;
  }): Promise<QuotaUsageView> {
    const reservation = await UsageReservationModel.findOne({
      organizationId: input.organizationId,
      metric: input.metric,
      idempotencyKey: input.idempotencyKey,
    });

    if (reservation?.status === 'committed') {
      const claimed = await UsageReservationModel.findOneAndUpdate(
        { _id: reservation._id, status: 'committed' },
        { $set: { status: 'refunded' } },
        { new: true }
      );
      if (claimed) {
        const updated = await QuotaCounterModel.findOneAndUpdate(
          {
            organizationId: input.organizationId,
            periodKey: reservation.periodKey,
            metric: input.metric,
            used: { $gte: reservation.quantity },
          },
          { $inc: { used: -reservation.quantity } },
          { new: true }
        );
        await writeLedger({
          organizationId: input.organizationId,
          userId: input.userId,
          metric: input.metric,
          quantity: reservation.quantity,
          action: 'refund',
          status: 'refunded',
          idempotencyKey: input.idempotencyKey,
          relatedEntityType: reservation.relatedEntityType,
          relatedEntityId: reservation.relatedEntityId,
          periodKey: reservation.periodKey,
        });
        return toUsageView(
          updated ?? (await ensureCounter(input.organizationId, input.metric))
        );
      }
    }

    return this.releaseUsage(input);
  }

  async incrementUsage(input: {
    organizationId: string;
    userId?: string | null;
    metric: UsageMetric;
    quantity?: number;
    idempotencyKey?: string;
    relatedEntityType?: string | null;
    relatedEntityId?: string | null;
    requireAvailable?: boolean;
  }): Promise<QuotaUsageView> {
    const quantity = input.quantity ?? METRIC_DEFAULT_COST[input.metric];
    if (input.idempotencyKey) {
      await this.reserveUsage({
        organizationId: input.organizationId,
        userId: input.userId,
        metric: input.metric,
        quantity,
        idempotencyKey: input.idempotencyKey,
        relatedEntityType: input.relatedEntityType,
        relatedEntityId: input.relatedEntityId,
      });
      return this.commitUsage({
        organizationId: input.organizationId,
        userId: input.userId,
        metric: input.metric,
        idempotencyKey: input.idempotencyKey,
      });
    }

    const counter = await ensureCounter(input.organizationId, input.metric);
    const filter: Record<string, unknown> = { _id: counter._id };
    if (!counter.allowOverage && input.requireAvailable !== false) {
      filter.$expr = {
        $lte: [{ $add: ['$used', '$reserved', quantity] }, '$limit'],
      };
    }

    const updated = await QuotaCounterModel.findOneAndUpdate(
      filter,
      { $inc: { used: quantity } },
      { new: true }
    );
    if (!updated) {
      throwQuotaExceeded(await ensureCounter(input.organizationId, input.metric));
    }

    await writeLedger({
      organizationId: input.organizationId,
      userId: input.userId,
      metric: input.metric,
      quantity,
      action: 'increment',
      status: 'committed',
      relatedEntityType: input.relatedEntityType,
      relatedEntityId: input.relatedEntityId,
      periodKey: counter.periodKey,
    });

    return toUsageView(updated!);
  }

  async getHistory(
    organizationId: string,
    query: { page?: number; limit?: number; metric?: UsageMetric }
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const filter: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };
    if (query.metric) filter.metric = query.metric;

    const [total, items] = await Promise.all([
      UsageLedgerModel.countDocuments(filter),
      UsageLedgerModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return {
      items: items.map((row) => ({
        id: row._id.toString(),
        metric: row.metric,
        quantity: row.quantity,
        action: row.action,
        status: row.status,
        userId: row.userId ? String(row.userId) : null,
        relatedEntityType: row.relatedEntityType,
        relatedEntityId: row.relatedEntityId,
        idempotencyKey: row.idempotencyKey,
        metadata: row.metadata ?? {},
        createdAt: row.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getSummary(organizationId: string) {
    const usage = (await this.getUsage(organizationId)) as QuotaUsageView[];
    const critical = usage.filter((item) => {
      if (item.limit <= 0) return false;
      const ratio = item.used / item.limit;
      return ratio >= 0.9;
    });
    return {
      periodKey: currentPeriodKey(),
      metrics: usage,
      criticalMetrics: critical.map((item) => item.metric),
      totals: {
        used: usage.reduce((sum, item) => sum + item.used, 0),
        reserved: usage.reduce((sum, item) => sum + item.reserved, 0),
        limit: usage.reduce((sum, item) => sum + item.limit, 0),
      },
    };
  }
}

export const quotaService = new QuotaService();
