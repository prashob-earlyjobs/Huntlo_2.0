import { AppError } from '../../shared/errors/app-error.js';
import {
  PricingPlanModel,
  type PricingPlanDocument,
} from './pricing-plan.model.js';
import {
  WorkspaceSubscriptionModel,
  type WorkspaceSubscriptionDocument,
} from './subscription.model.js';

function isTrialPlan(plan: Pick<PricingPlanDocument, 'code' | 'isTrialPlan'> | null): boolean {
  if (!plan) return false;
  return Boolean(plan.isTrialPlan) || plan.code === 'trial';
}

/** True when the trial window has ended (by date), regardless of status sync. */
export function isTrialPeriodEnded(
  subscription: Pick<WorkspaceSubscriptionDocument, 'currentPeriodEnd'>
): boolean {
  return subscription.currentPeriodEnd.getTime() < Date.now();
}

/**
 * Sync expired trialing → cancelled so status matches reality.
 * Returns the (possibly updated) subscription.
 */
export async function syncExpiredTrialSubscription(
  subscription: WorkspaceSubscriptionDocument
): Promise<WorkspaceSubscriptionDocument> {
  if (subscription.status !== 'trialing') return subscription;
  if (!isTrialPeriodEnded(subscription)) return subscription;

  subscription.status = 'cancelled';
  await subscription.save();
  return subscription;
}

export async function getWorkspaceSubscriptionAccess(organizationId: string): Promise<{
  subscription: WorkspaceSubscriptionDocument | null;
  plan: PricingPlanDocument | null;
  trialExpired: boolean;
}> {
  let subscription = await WorkspaceSubscriptionModel.findOne({
    organizationId,
    status: { $in: ['active', 'trialing', 'past_due'] },
  });

  if (!subscription) {
    subscription = await WorkspaceSubscriptionModel.findOne({ organizationId }).sort({
      createdAt: -1,
    });
  }

  if (!subscription) {
    return { subscription: null, plan: null, trialExpired: false };
  }

  subscription = await syncExpiredTrialSubscription(subscription);
  const plan = await PricingPlanModel.findById(subscription.planId);
  const trialExpired =
    isTrialPlan(plan) &&
    isTrialPeriodEnded(subscription) &&
    (subscription.status === 'cancelled' || subscription.status === 'trialing');

  return { subscription, plan, trialExpired };
}

/** Throw when the org's trial has ended and they must upgrade. */
export async function assertTrialNotExpired(organizationId: string): Promise<void> {
  const { trialExpired, subscription } = await getWorkspaceSubscriptionAccess(organizationId);
  if (!trialExpired) return;
  throw AppError.trialExpired('Your free trial has ended. Upgrade to keep using Huntlo.', {
    currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
  });
}
