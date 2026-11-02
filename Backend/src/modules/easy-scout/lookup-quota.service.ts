import { AppError } from '../../shared/errors/app-error.js';
import {
  METRIC_DEFAULT_COST,
  getMetricCost,
  quotaService as sharedQuotaService,
  type QuotaUsageView,
  type UsageMetric,
} from '../../shared/usage/index.js';
import type { EasyScoutContactType } from './contact-reveal.model.js';

/** Easy Scout lookups. Email and phone reveals use their own meters. */
const EASY_SCOUT_LOOKUP_METRIC = 'easy_scout' as const;

export const EASY_SCOUT_LOOKUP_COST = METRIC_DEFAULT_COST.easy_scout;
export const EASY_SCOUT_EMAIL_REVEAL_COST = METRIC_DEFAULT_COST.easy_scout_email_reveal;
export const EASY_SCOUT_PHONE_REVEAL_COST = METRIC_DEFAULT_COST.easy_scout_phone_reveal;

export function easyScoutRevealMetric(contactType: EasyScoutContactType): UsageMetric {
  return contactType === 'email' ? 'easy_scout_email_reveal' : 'easy_scout_phone_reveal';
}

export async function easyScoutRevealCost(contactType: EasyScoutContactType): Promise<number> {
  return getMetricCost(easyScoutRevealMetric(contactType));
}

function quotaExceededMessage(metric: UsageMetric): string {
  if (metric === 'easy_scout_email_reveal') {
    return 'Easy Scout email reveal quota exhausted for this billing period';
  }
  if (metric === 'easy_scout_phone_reveal') {
    return 'Easy Scout phone reveal quota exhausted for this billing period';
  }
  return 'Easy Scout lookup quota exhausted for this billing period';
}

function rethrowQuota(error: unknown, metric: UsageMetric): never {
  if (error instanceof AppError && error.code === 'QUOTA_EXCEEDED') {
    throw AppError.quotaExceeded(
      quotaExceededMessage(metric),
      (error.meta?.quota as {
        metric: string;
        limit: number;
        used: number;
        remaining: number;
        resetAt: string;
      }) ?? {
        metric,
        limit: 0,
        used: 0,
        remaining: 0,
        resetAt: new Date().toISOString(),
      }
    );
  }
  throw error;
}

export class EasyScoutQuotaService {
  async getStatus(organizationId: string) {
    const [status, costPerLookup] = await Promise.all([
      sharedQuotaService.getUsage(organizationId, EASY_SCOUT_LOOKUP_METRIC) as Promise<QuotaUsageView>,
      getMetricCost(EASY_SCOUT_LOOKUP_METRIC),
    ]);
    return {
      organizationId,
      periodKey: status.periodKey,
      plan: '',
      limit: status.limit,
      used: status.used,
      reserved: status.reserved,
      remaining: status.remaining,
      costPerLookup,
    };
  }

  async reserve(organizationId: string, lookupId: string) {
    try {
      return await sharedQuotaService.reserveUsage({
        organizationId,
        metric: EASY_SCOUT_LOOKUP_METRIC,
        quantity: await getMetricCost(EASY_SCOUT_LOOKUP_METRIC),
        idempotencyKey: `easy-scout:${lookupId}`,
        relatedEntityType: 'easy_scout_lookup',
        relatedEntityId: lookupId,
      });
    } catch (error) {
      rethrowQuota(error, EASY_SCOUT_LOOKUP_METRIC);
    }
  }

  async commit(organizationId: string, lookupId: string) {
    return sharedQuotaService.commitUsage({
      organizationId,
      metric: EASY_SCOUT_LOOKUP_METRIC,
      idempotencyKey: `easy-scout:${lookupId}`,
    });
  }

  async refund(organizationId: string, lookupId: string) {
    return sharedQuotaService.releaseUsage({
      organizationId,
      metric: EASY_SCOUT_LOOKUP_METRIC,
      idempotencyKey: `easy-scout:${lookupId}`,
    });
  }

  async reserveReveal(
    organizationId: string,
    reservationId: string,
    contactType: EasyScoutContactType
  ) {
    const metric = easyScoutRevealMetric(contactType);
    try {
      return await sharedQuotaService.reserveUsage({
        organizationId,
        metric,
        quantity: await getMetricCost(metric),
        idempotencyKey: `easy-scout-reveal:${reservationId}`,
        relatedEntityType: 'easy_scout_reveal',
        relatedEntityId: reservationId,
      });
    } catch (error) {
      rethrowQuota(error, metric);
    }
  }

  async commitReveal(
    organizationId: string,
    reservationId: string,
    contactType: EasyScoutContactType
  ) {
    return sharedQuotaService.commitUsage({
      organizationId,
      metric: easyScoutRevealMetric(contactType),
      idempotencyKey: `easy-scout-reveal:${reservationId}`,
    });
  }

  async refundReveal(
    organizationId: string,
    reservationId: string,
    contactType: EasyScoutContactType
  ) {
    return sharedQuotaService.releaseUsage({
      organizationId,
      metric: easyScoutRevealMetric(contactType),
      idempotencyKey: `easy-scout-reveal:${reservationId}`,
    });
  }
}

export const easyScoutQuotaService = new EasyScoutQuotaService();
