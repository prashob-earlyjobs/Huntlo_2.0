import {
  METRIC_DEFAULT_COST,
  UsageReservationModel,
  quotaService as sharedQuotaService,
  type QuotaUsageView,
  type UsageMetric,
} from '../../shared/usage/index.js';
import { OrganizationModel, type OrganizationPlan } from '../organizations/organization.model.js';
import type { RevealQuotaContactType } from './reveal-quota.model.js';

export const EMAIL_REVEAL_COST = METRIC_DEFAULT_COST.email_reveal;
export const MOBILE_REVEAL_COST = METRIC_DEFAULT_COST.mobile_reveal;

/** Monthly email reveal credit limits by organization plan. */
export const PLAN_EMAIL_REVEAL_LIMITS: Record<OrganizationPlan, number> = {
  Trial: 50,
  Starter: 500,
  Growth: 2500,
  Scale: 10_000,
  Enterprise: 999_999_999,
};

/** Monthly mobile reveal credit limits by organization plan. */
export const PLAN_MOBILE_REVEAL_LIMITS: Record<OrganizationPlan, number> = {
  Trial: 25,
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

function metricFor(contactType: RevealQuotaContactType): UsageMetric {
  return contactType === 'email' ? 'email_reveal' : 'mobile_reveal';
}

function costFor(contactType: RevealQuotaContactType): number {
  return contactType === 'email' ? EMAIL_REVEAL_COST : MOBILE_REVEAL_COST;
}

async function toStatus(organizationId: string): Promise<RevealQuotaStatus> {
  const [email, mobile] = await Promise.all([
    sharedQuotaService.getUsage(organizationId, 'email_reveal') as Promise<QuotaUsageView>,
    sharedQuotaService.getUsage(organizationId, 'mobile_reveal') as Promise<QuotaUsageView>,
  ]);
  const org = await OrganizationModel.findById(organizationId).select('plan');
  return {
    organizationId,
    periodKey: email.periodKey,
    plan: org?.plan ?? 'Starter',
    email: {
      limit: email.limit,
      used: email.used,
      reserved: email.reserved,
      remaining: email.remaining,
      costPerReveal: EMAIL_REVEAL_COST,
    },
    mobile: {
      limit: mobile.limit,
      used: mobile.used,
      reserved: mobile.reserved,
      remaining: mobile.remaining,
      costPerReveal: MOBILE_REVEAL_COST,
    },
  };
}

async function findRevealReservation(organizationId: string, reservationId: string) {
  return UsageReservationModel.findOne({
    organizationId,
    idempotencyKey: `reveal:${reservationId}`,
    metric: { $in: ['email_reveal', 'mobile_reveal'] },
  });
}

export class RevealQuotaService {
  async getQuotaStatus(organizationId: string): Promise<RevealQuotaStatus> {
    return toStatus(organizationId);
  }

  /** Alias used by tests and callers. */
  async getStatus(organizationId: string): Promise<RevealQuotaStatus> {
    return this.getQuotaStatus(organizationId);
  }

  async reserve(
    organizationId: string,
    reservationId: string,
    contactType: RevealQuotaContactType,
    amount?: number
  ): Promise<RevealQuotaStatus> {
    await sharedQuotaService.reserveUsage({
      organizationId,
      metric: metricFor(contactType),
      quantity: amount ?? costFor(contactType),
      idempotencyKey: `reveal:${reservationId}`,
      relatedEntityType: 'reveal',
      relatedEntityId: reservationId,
    });
    return toStatus(organizationId);
  }

  async commit(organizationId: string, reservationId: string): Promise<RevealQuotaStatus> {
    const reservation = await findRevealReservation(organizationId, reservationId);
    if (reservation) {
      await sharedQuotaService.commitUsage({
        organizationId,
        metric: reservation.metric,
        idempotencyKey: `reveal:${reservationId}`,
      });
    }
    return toStatus(organizationId);
  }

  async refund(organizationId: string, reservationId: string): Promise<RevealQuotaStatus> {
    const reservation = await findRevealReservation(organizationId, reservationId);
    if (reservation) {
      await sharedQuotaService.releaseUsage({
        organizationId,
        metric: reservation.metric,
        idempotencyKey: `reveal:${reservationId}`,
      });
    }
    return toStatus(organizationId);
  }
}

export const revealQuotaService = new RevealQuotaService();
