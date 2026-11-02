import { AppError } from '../../shared/errors/app-error.js';
import {
  METRIC_DEFAULT_COST,
  getMetricCost,
  quotaService as sharedQuotaService,
  type QuotaUsageView,
} from '../../shared/usage/index.js';

export const EASY_SCOUT_LOOKUP_COST = METRIC_DEFAULT_COST.easy_scout;

export class EasyScoutQuotaService {
  async getStatus(organizationId: string) {
    const [status, costPerLookup] = await Promise.all([
      sharedQuotaService.getUsage(organizationId, 'easy_scout') as Promise<QuotaUsageView>,
      getMetricCost('easy_scout'),
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
        metric: 'easy_scout',
        quantity: await getMetricCost('easy_scout'),
        idempotencyKey: `easy-scout:${lookupId}`,
        relatedEntityType: 'easy_scout_lookup',
        relatedEntityId: lookupId,
      });
    } catch (error) {
      if (error instanceof AppError && error.code === 'QUOTA_EXCEEDED') {
        throw AppError.quotaExceeded(
          'Easy Scout lookup quota exhausted for this billing period',
          (error.meta?.quota as {
            metric: string;
            limit: number;
            used: number;
            remaining: number;
            resetAt: string;
          }) ?? {
            metric: 'easy_scout',
            limit: 0,
            used: 0,
            remaining: 0,
            resetAt: new Date().toISOString(),
          }
        );
      }
      throw error;
    }
  }

  async commit(organizationId: string, lookupId: string) {
    return sharedQuotaService.commitUsage({
      organizationId,
      metric: 'easy_scout',
      idempotencyKey: `easy-scout:${lookupId}`,
    });
  }

  async refund(organizationId: string, lookupId: string) {
    return sharedQuotaService.releaseUsage({
      organizationId,
      metric: 'easy_scout',
      idempotencyKey: `easy-scout:${lookupId}`,
    });
  }
}

export const easyScoutQuotaService = new EasyScoutQuotaService();
