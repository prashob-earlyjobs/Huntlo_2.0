import { AppError } from '../../shared/errors/app-error.js';
import {
  METRIC_DEFAULT_COST,
  getMetricCost,
  quotaService as sharedQuotaService,
  type QuotaUsageView,
} from '../../shared/usage/index.js';

/**
 * People Scout lookups use the dedicated `people_scout` metric.
 * Cost matches one search credit by default (overridable in platform settings).
 */
export const PEOPLE_SCOUT_LOOKUP_COST = METRIC_DEFAULT_COST.people_scout;

export class PeopleScoutQuotaService {
  async getStatus(organizationId: string) {
    const [status, costPerLookup] = await Promise.all([
      sharedQuotaService.getUsage(organizationId, 'people_scout') as Promise<QuotaUsageView>,
      getMetricCost('people_scout'),
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
        metric: 'people_scout',
        quantity: await getMetricCost('people_scout'),
        idempotencyKey: `people-scout:${lookupId}`,
        relatedEntityType: 'people_scout_lookup',
        relatedEntityId: lookupId,
      });
    } catch (error) {
      if (error instanceof AppError && error.code === 'QUOTA_EXCEEDED') {
        throw AppError.quotaExceeded(
          'Lookup quota exhausted for this billing period',
          (error.meta?.quota as {
            metric: string;
            limit: number;
            used: number;
            remaining: number;
            resetAt: string;
          }) ?? {
            metric: 'people_scout',
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
      metric: 'people_scout',
      idempotencyKey: `people-scout:${lookupId}`,
    });
  }

  async refund(organizationId: string, lookupId: string) {
    return sharedQuotaService.releaseUsage({
      organizationId,
      metric: 'people_scout',
      idempotencyKey: `people-scout:${lookupId}`,
    });
  }
}

export const peopleScoutQuotaService = new PeopleScoutQuotaService();
