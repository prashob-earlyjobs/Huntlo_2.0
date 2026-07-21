import { createHash, randomBytes } from 'node:crypto';

import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import {
  ORGANIZATION_PLANS,
  OrganizationModel,
  type OrganizationPlan,
} from '../organizations/organization.model.js';
import {
  PricingPlanModel,
  type BillingCycle,
  type PricingPlanDocument,
} from '../plans/pricing-plan.model.js';
import { WorkspaceSubscriptionModel } from '../plans/subscription.model.js';
import { plansService } from '../plans/plans.service.js';
import { BillingInvoiceModel } from './billing-invoice.model.js';
import { PlanHistoryModel } from './plan-history.model.js';
import {
  PaymentOrderModel,
  type PaymentOrderDocument,
  type PaymentProvider,
} from './payment-order.model.js';

const PLAN_RANK: Record<string, number> = {
  trial: 0,
  starter: 1,
  growth: 2,
  scale: 3,
  enterprise: 4,
};

export function hashPayload(raw: Buffer | string): string {
  const buf = Buffer.isBuffer(raw) ? raw : Buffer.from(String(raw || ''), 'utf8');
  return createHash('sha256').update(buf).digest('hex');
}

export function buildReceipt(planCode: string): string {
  const stamp = Date.now().toString(36);
  return `h_${String(planCode).slice(0, 10)}_${stamp}`.slice(0, 40);
}

export function buildIdempotencyKey(): string {
  return `chk_${Date.now().toString(36)}_${randomBytes(8).toString('hex')}`;
}

export function resolveCheckoutProvider(input: {
  currency: string;
  provider?: PaymentProvider;
}): PaymentProvider {
  if (input.provider) return input.provider;
  return input.currency.toUpperCase() === 'INR' ? 'razorpay' : 'dodo';
}

export function resolveCheckoutCurrency(input: {
  currency?: string;
  provider?: PaymentProvider;
}): 'INR' | 'USD' {
  if (input.currency) {
    const c = input.currency.toUpperCase();
    if (c === 'INR' || c === 'USD') return c;
  }
  if (input.provider === 'razorpay') return 'INR';
  if (input.provider === 'dodo') return 'USD';
  return 'INR';
}

/** Returns amount in smallest unit (paise / cents). */
export function resolvePlanAmount(
  plan: PricingPlanDocument,
  billingCycle: BillingCycle,
  currency: 'INR' | 'USD'
): { amount: number; currency: 'INR' | 'USD'; major: number } {
  if (currency === 'USD') {
    const major =
      billingCycle === 'yearly' ? plan.usdPrices?.yearly : plan.usdPrices?.monthly;
    if (major == null || !(major > 0)) {
      throw AppError.badRequest(
        'This plan is not available for USD checkout. Contact sales or use INR via Razorpay.'
      );
    }
    return { amount: Math.round(major * 100), currency: 'USD', major };
  }

  const major = billingCycle === 'yearly' ? plan.prices?.yearly : plan.prices?.monthly;
  if (major == null || !(major > 0)) {
    throw AppError.badRequest(
      'This plan is not available for online checkout. Contact sales for custom pricing.'
    );
  }
  return { amount: Math.round(major * 100), currency: 'INR', major };
}

export async function resolvePricingPlan(planIdOrCode: string) {
  await plansService.ensureDefaultPlans();
  if (mongoose.isValidObjectId(planIdOrCode)) {
    const byId = await PricingPlanModel.findById(planIdOrCode);
    if (byId?.active) return byId;
  }
  const byCode = await PricingPlanModel.findOne({
    code: planIdOrCode.trim().toLowerCase(),
    active: true,
  });
  if (!byCode) throw AppError.notFound('Pricing plan not found');
  return byCode;
}

export async function assertCanPurchase(
  organizationId: string,
  targetPlan: PricingPlanDocument
) {
  const subscription = await plansService.ensureSubscription(organizationId);
  const current = await PricingPlanModel.findById(subscription.planId);
  const currentCode = (current?.code || 'starter').toLowerCase();
  const targetCode = targetPlan.code.toLowerCase();

  if (currentCode === targetCode) {
    throw AppError.badRequest('You are already on this plan');
  }
  const currentRank = PLAN_RANK[currentCode] ?? 0;
  const targetRank = PLAN_RANK[targetCode] ?? 0;
  if (currentRank > 0 && targetRank < currentRank) {
    throw AppError.badRequest(
      'Plan downgrades are not available online. Contact support.'
    );
  }
  if (!targetPlan.public || !targetPlan.active) {
    throw AppError.badRequest('This plan is not available for checkout');
  }
  return { subscription, currentPlan: current };
}

function toOrgPlanName(code: string): OrganizationPlan {
  const titled = code.charAt(0).toUpperCase() + code.slice(1);
  if ((ORGANIZATION_PLANS as readonly string[]).includes(titled)) {
    return titled as OrganizationPlan;
  }
  return 'Starter';
}

function periodEndFrom(start: Date, billingCycle: BillingCycle): Date {
  const end = new Date(start);
  if (billingCycle === 'yearly') {
    end.setUTCFullYear(end.getUTCFullYear() + 1);
  } else {
    end.setUTCMonth(end.getUTCMonth() + 1);
  }
  return end;
}

function nextInvoiceNumber(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const rand = randomBytes(2).toString('hex').toUpperCase();
  return `INV-${y}-${m}-${rand}`;
}

export function toPublicOrder(order: PaymentOrderDocument, extras?: Record<string, unknown>) {
  return {
    id: order._id.toHexString(),
    organizationId: order.organizationId.toHexString(),
    userId: order.userId.toHexString(),
    planId: order.planId.toHexString(),
    billingCycle: order.billingCycle,
    provider: order.provider,
    providerOrderId: order.providerOrderId,
    providerPaymentId: order.providerPaymentId,
    currency: order.currency,
    amount: order.amount,
    amountMajor: order.amount / 100,
    status: order.status,
    idempotencyKey: order.idempotencyKey,
    checkoutUrl: order.checkoutUrl,
    expiresAt: order.expiresAt?.toISOString() ?? null,
    paidAt: order.paidAt?.toISOString() ?? null,
    failedAt: order.failedAt?.toISOString() ?? null,
    metadata: order.metadata ?? {},
    createdAt: order.createdAt.toISOString(),
    ...extras,
  };
}

/**
 * Atomic subscription activation after verified payment.
 * Idempotent when order is already paid.
 */
export async function fulfillPaidOrder(
  order: PaymentOrderDocument,
  input: {
    providerPaymentId?: string | null;
    performedByUserId?: string;
    reason?: string;
  }
): Promise<{ alreadyPaid: boolean; order: PaymentOrderDocument }> {
  if (order.status === 'paid') {
    return { alreadyPaid: true, order };
  }
  if (order.status === 'refunded') {
    throw AppError.conflict('Order was refunded and cannot be activated');
  }

  const session = await mongoose.startSession();
  try {
    let resultOrder = order;
    let alreadyPaid = false;

    await session.withTransaction(async () => {
      const locked = await PaymentOrderModel.findById(order._id).session(session);
      if (!locked) throw AppError.notFound('Payment order not found');
      if (locked.status === 'paid') {
        alreadyPaid = true;
        resultOrder = locked;
        return;
      }

      const plan = await PricingPlanModel.findById(locked.planId).session(session);
      if (!plan) throw AppError.notFound('Pricing plan not found');

      const existingSub = await WorkspaceSubscriptionModel.findOne({
        organizationId: locked.organizationId,
        status: { $in: ['active', 'trialing', 'past_due', 'incomplete'] },
      }).session(session);

      const periodStart = new Date();
      const periodEnd = periodEndFrom(periodStart, locked.billingCycle);
      const planIdBefore = existingSub?.planId ?? null;
      const planCodeBefore = planIdBefore
        ? (await PricingPlanModel.findById(planIdBefore).session(session))?.code ?? null
        : null;

      locked.status = 'paid';
      locked.paidAt = new Date();
      locked.failedAt = null;
      if (input.providerPaymentId) {
        locked.providerPaymentId = String(input.providerPaymentId);
      }
      await locked.save({ session });

      if (existingSub) {
        existingSub.planId = plan._id;
        existingSub.billingProvider = locked.provider;
        existingSub.billingCycle = locked.billingCycle;
        existingSub.status = 'active';
        existingSub.currentPeriodStart = periodStart;
        existingSub.currentPeriodEnd = periodEnd;
        existingSub.cancelAtPeriodEnd = false;
        existingSub.providerSubscriptionId = locked.providerPaymentId;
        await existingSub.save({ session });
      } else {
        await WorkspaceSubscriptionModel.create(
          [
            {
              organizationId: locked.organizationId,
              planId: plan._id,
              billingProvider: locked.provider,
              billingCycle: locked.billingCycle,
              status: 'active',
              currentPeriodStart: periodStart,
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: false,
              providerSubscriptionId: locked.providerPaymentId,
            },
          ],
          { session }
        );
      }

      await OrganizationModel.updateOne(
        { _id: locked.organizationId },
        { $set: { plan: toOrgPlanName(plan.code) } },
        { session }
      );

      await PlanHistoryModel.create(
        [
          {
            organizationId: locked.organizationId,
            userId: locked.userId,
            planIdBefore,
            planIdAfter: plan._id,
            planCodeBefore,
            planCodeAfter: plan.code,
            performedBy: input.performedByUserId
              ? new mongoose.Types.ObjectId(input.performedByUserId)
              : locked.userId,
            paymentOrderId: locked._id,
            reason: input.reason || 'payment_fulfilled',
          },
        ],
        { session }
      );

      const existingInvoice = await BillingInvoiceModel.findOne({
        paymentOrderId: locked._id,
      }).session(session);
      if (!existingInvoice) {
        await BillingInvoiceModel.create(
          [
            {
              organizationId: locked.organizationId,
              paymentOrderId: locked._id,
              invoiceNumber: nextInvoiceNumber(),
              amount: locked.amount,
              currency: locked.currency,
              periodStart,
              periodEnd,
              status: 'paid',
              invoiceUrl: null,
              planName: plan.name,
              provider: locked.provider,
            },
          ],
          { session }
        );
      }

      resultOrder = locked;
    });

    return { alreadyPaid, order: resultOrder };
  } finally {
    await session.endSession();
  }
}

export async function markOrderFailed(
  order: PaymentOrderDocument,
  reason?: string
): Promise<PaymentOrderDocument> {
  if (order.status === 'paid' || order.status === 'refunded') return order;
  order.status = 'failed';
  order.failedAt = new Date();
  order.metadata = {
    ...(order.metadata || {}),
    failureReason: reason || 'payment_failed',
  };
  await order.save();
  return order;
}

export async function markOrderRefunded(
  order: PaymentOrderDocument,
  reason?: string
): Promise<PaymentOrderDocument> {
  order.status = 'refunded';
  order.metadata = {
    ...(order.metadata || {}),
    refundReason: reason || 'refunded',
  };
  await order.save();

  await BillingInvoiceModel.updateOne(
    { paymentOrderId: order._id },
    { $set: { status: 'refunded' } }
  );

  return order;
}
