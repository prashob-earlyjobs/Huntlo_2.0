import {
  METRIC_DEFAULT_COST,
  quotaService as sharedQuotaService,
  type QuotaUsageView,
} from '../../shared/usage/index.js';
import { OrganizationModel, type OrganizationPlan } from '../organizations/organization.model.js';

/**
 * Cost charged per sourcing search run.
 * Product mock uses 25; backend uses 1 for simplicity until plans meter differently.
 */
export const SOURCING_QUOTA_COST = METRIC_DEFAULT_COST.candidate_search;

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

async function toLegacyStatus(organizationId: string, view: QuotaUsageView): Promise<QuotaStatus> {
  const org = await OrganizationModel.findById(organizationId).select('plan');
  return {
    organizationId,
    periodKey: view.periodKey,
    plan: org?.plan ?? 'Starter',
    limit: view.limit,
    used: view.used,
    reserved: view.reserved,
    remaining: view.remaining,
    costPerSearch: SOURCING_QUOTA_COST,
  };
}

/**
 * Facade over shared quotaService for candidate_search.
 * Preserves the historic sourcing quota API used by session/poller code.
 */
export class QuotaService {
  async getQuotaStatus(organizationId: string): Promise<QuotaStatus> {
    const view = (await sharedQuotaService.getUsage(
      organizationId,
      'candidate_search'
    )) as QuotaUsageView;
    return toLegacyStatus(organizationId, view);
  }

  async reserve(
    organizationId: string,
    sessionId: string,
    amount: number = SOURCING_QUOTA_COST
  ): Promise<QuotaStatus> {
    const result = await sharedQuotaService.reserveUsage({
      organizationId,
      metric: 'candidate_search',
      quantity: amount,
      idempotencyKey: `sourcing:${sessionId}`,
      relatedEntityType: 'sourcing_session',
      relatedEntityId: sessionId,
    });
    return toLegacyStatus(organizationId, result.usage);
  }

  async commit(organizationId: string, sessionId: string): Promise<QuotaStatus> {
    const view = await sharedQuotaService.commitUsage({
      organizationId,
      metric: 'candidate_search',
      idempotencyKey: `sourcing:${sessionId}`,
    });
    return toLegacyStatus(organizationId, view);
  }

  async refund(organizationId: string, sessionId: string): Promise<QuotaStatus> {
    const view = await sharedQuotaService.releaseUsage({
      organizationId,
      metric: 'candidate_search',
      idempotencyKey: `sourcing:${sessionId}`,
    });
    return toLegacyStatus(organizationId, view);
  }
}

export const quotaService = new QuotaService();
