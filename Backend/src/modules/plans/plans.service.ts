import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import { isValidObjectId } from '../../shared/validation/object-id.js';
import { quotaService, type QuotaUsageView } from '../../shared/usage/index.js';
import { UserModel } from '../auth/user.model.js';
import { OrganizationMemberModel } from '../organizations/member.model.js';
import { OrganizationModel } from '../organizations/organization.model.js';
import { DEFAULT_PRICING_PLANS } from './plan-defaults.js';
import {
  PricingPlanModel,
  type BillingCycle,
  type PlanLimits,
  type PricingPlanDocument,
} from './pricing-plan.model.js';
import { WorkspaceSubscriptionModel } from './subscription.model.js';

function formatInr(amount: number | null): string {
  if (amount == null) return 'Custom';
  if (amount === 0) return 'Free';
  return `₹${amount.toLocaleString('en-IN')}`;
}

const DEFAULT_TRIAL_DAYS = 14;

function toPublicPlan(plan: PricingPlanDocument) {
  return {
    id: plan._id.toHexString(),
    name: plan.name,
    code: plan.code,
    description: plan.description,
    billingCycles: plan.billingCycles,
    prices: plan.prices,
    currency: plan.currency,
    featureAccess: plan.featureAccess ?? {},
    limits: plan.limits ?? {},
    active: plan.active,
    public: plan.public,
    sortOrder: plan.sortOrder,
    isDefaultSignup: Boolean(plan.isDefaultSignup),
    isTrialPlan: Boolean(plan.isTrialPlan),
    trialDays: plan.trialDays ?? DEFAULT_TRIAL_DAYS,
    priceLabel: {
      monthly: formatInr(plan.prices?.monthly ?? null),
      yearly: formatInr(plan.prices?.yearly ?? null),
    },
  };
}

async function clearOtherDefaultSignup(exceptPlanId?: mongoose.Types.ObjectId) {
  const filter: Record<string, unknown> = { isDefaultSignup: true };
  if (exceptPlanId) filter._id = { $ne: exceptPlanId };
  await PricingPlanModel.updateMany(filter, { $set: { isDefaultSignup: false } });
}

export class PlansService {
  async ensureDefaultPlans(): Promise<void> {
    const count = await PricingPlanModel.countDocuments();
    if (count === 0) {
      await PricingPlanModel.insertMany(
        DEFAULT_PRICING_PLANS.map((plan) => ({
          ...plan,
          billingCycles: ['monthly', 'yearly'],
          currency: 'INR',
          active: true,
          isDefaultSignup: Boolean(plan.isDefaultSignup),
          isTrialPlan: Boolean(plan.isTrialPlan),
          trialDays: plan.trialDays ?? DEFAULT_TRIAL_DAYS,
        }))
      );
      return;
    }

    // Upsert any newly added default plans without overwriting admin edits.
    for (const plan of DEFAULT_PRICING_PLANS) {
      await PricingPlanModel.updateOne(
        { code: plan.code },
        {
          $setOnInsert: {
            ...plan,
            billingCycles: ['monthly', 'yearly'],
            currency: 'INR',
            active: true,
            isDefaultSignup: Boolean(plan.isDefaultSignup),
            isTrialPlan: Boolean(plan.isTrialPlan),
            trialDays: plan.trialDays ?? DEFAULT_TRIAL_DAYS,
          },
        },
        { upsert: true }
      );
    }

    // Ensure exactly one default signup plan exists when none is marked.
    const hasDefault = await PricingPlanModel.exists({ isDefaultSignup: true, active: true });
    if (!hasDefault) {
      const preferred =
        (await PricingPlanModel.findOne({ code: 'trial', active: true })) ??
        (await PricingPlanModel.findOne({ active: true }).sort({ sortOrder: 1 }));
      if (preferred) {
        preferred.isDefaultSignup = true;
        await preferred.save();
      }
    }
  }

  /**
   * Resolve the plan assigned to new workspaces.
   * Admin sets this via `isDefaultSignup` on a pricing plan.
   */
  async resolveSignupPlan(): Promise<PricingPlanDocument> {
    await this.ensureDefaultPlans();
    const configured = await PricingPlanModel.findOne({
      isDefaultSignup: true,
      active: true,
    });
    if (configured) return configured;

    const fallback =
      (await PricingPlanModel.findOne({ code: 'trial', active: true })) ??
      (await PricingPlanModel.findOne({ active: true }).sort({ sortOrder: 1 }));
    if (fallback) return fallback;

    throw new AppError(
      500,
      'AUTH_DEFAULT_PLAN_NOT_CONFIGURED',
      'No default signup plan is configured. Set one in Admin → Plans.'
    );
  }

  async ensureSubscription(organizationId: string) {
    await this.ensureDefaultPlans();
    const existing = await WorkspaceSubscriptionModel.findOne({
      organizationId,
      status: { $in: ['active', 'trialing', 'past_due'] },
    });
    if (existing) return existing;

    const org = await OrganizationModel.findById(organizationId).select('plan');
    let plan: PricingPlanDocument | null = null;

    if (org?.plan) {
      const byName = await PricingPlanModel.findOne({
        name: org.plan,
        active: true,
      });
      const byCode = await PricingPlanModel.findOne({
        code: org.plan.toLowerCase(),
        active: true,
      });
      plan = byName ?? byCode;
    }

    if (!plan) {
      plan = await this.resolveSignupPlan();
    }

    const isTrial = Boolean(plan.isTrialPlan) || plan.code === 'trial';
    const trialDays = plan.trialDays > 0 ? plan.trialDays : DEFAULT_TRIAL_DAYS;
    const start = new Date();
    const end = new Date(start);
    if (isTrial) {
      end.setUTCDate(end.getUTCDate() + trialDays);
    } else {
      end.setUTCMonth(end.getUTCMonth() + 1);
    }

    try {
      return await WorkspaceSubscriptionModel.create({
        organizationId,
        planId: plan._id,
        billingProvider: 'manual',
        billingCycle: 'monthly',
        status: isTrial ? 'trialing' : 'active',
        currentPeriodStart: start,
        currentPeriodEnd: end,
        cancelAtPeriodEnd: false,
      });
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code?: number }).code === 11000
      ) {
        const retry = await WorkspaceSubscriptionModel.findOne({
          organizationId,
          status: { $in: ['active', 'trialing', 'past_due'] },
        });
        if (retry) return retry;
      }
      throw error;
    }
  }

  async listPublicPlans() {
    await this.ensureDefaultPlans();
    const plans = await PricingPlanModel.find({ active: true, public: true }).sort({
      sortOrder: 1,
    });
    return plans.map(toPublicPlan);
  }

  async getCurrentPlan(organizationId: string, userId: string) {
    const subscription = await this.ensureSubscription(organizationId);
    const plan = await PricingPlanModel.findById(subscription.planId);
    if (!plan) throw AppError.notFound('Current plan not found');

    const org = await OrganizationModel.findById(organizationId);
    const owner = org?.ownerUserId
      ? await UserModel.findById(org.ownerUserId).select('firstName lastName email')
      : await UserModel.findById(userId).select('firstName lastName email');

    const seats = (await quotaService.getUsage(organizationId, 'team_seats')) as QuotaUsageView;
    const occupied = await OrganizationMemberModel.countDocuments({
      organizationId,
      status: 'active',
      deletedAt: null,
    });

    const cycle = subscription.billingCycle;
    const priceValue =
      cycle === 'yearly' ? plan.prices.yearly : plan.prices.monthly;

    return {
      id: plan._id.toHexString(),
      name: plan.name,
      code: plan.code,
      billingCycle: cycle === 'yearly' ? 'Yearly' : 'Monthly',
      renewalDate: subscription.currentPeriodEnd.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      owner: owner ? `${owner.firstName} ${owner.lastName}`.trim() : 'Workspace owner',
      ownerEmail: owner?.email ?? '',
      status:
        subscription.status === 'trialing'
          ? 'Trial'
          : subscription.status === 'active'
            ? 'Active'
            : subscription.status === 'past_due'
              ? 'Past due'
              : 'Cancelled',
      price: formatInr(priceValue),
      pricePeriod:
        subscription.status === 'trialing'
          ? ` · ${plan.trialDays || DEFAULT_TRIAL_DAYS}-day trial`
          : cycle === 'yearly'
            ? '/ year'
            : '/ month',
      seats: `${occupied} of ${Number.isFinite(seats.limit) ? seats.limit : '∞'} seats used`,
      subscription: {
        id: subscription._id.toHexString(),
        status: subscription.status,
        billingProvider: subscription.billingProvider,
        currentPeriodStart: subscription.currentPeriodStart.toISOString(),
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      },
      featureAccess: plan.featureAccess ?? {},
      limits: plan.limits ?? {},
    };
  }

  async listAdminPlans() {
    await this.ensureDefaultPlans();
    const plans = await PricingPlanModel.find({}).sort({ sortOrder: 1 });
    return plans.map(toPublicPlan);
  }

  async createPlan(input: {
    name: string;
    code: string;
    description?: string | null;
    billingCycles?: BillingCycle[];
    prices?: { monthly?: number | null; yearly?: number | null };
    currency?: string;
    featureAccess?: Record<string, boolean>;
    limits?: PlanLimits;
    public?: boolean;
    sortOrder?: number;
    active?: boolean;
    isDefaultSignup?: boolean;
    isTrialPlan?: boolean;
    trialDays?: number;
  }) {
    const code = input.code.trim().toLowerCase();
    const existing = await PricingPlanModel.findOne({ code });
    if (existing) throw AppError.conflict('A plan with this code already exists');

    if (input.isDefaultSignup) {
      await clearOtherDefaultSignup();
    }

    const plan = await PricingPlanModel.create({
      name: input.name.trim(),
      code,
      description: input.description ?? null,
      billingCycles: input.billingCycles ?? ['monthly', 'yearly'],
      prices: {
        monthly: input.prices?.monthly ?? null,
        yearly: input.prices?.yearly ?? null,
      },
      currency: input.currency ?? 'INR',
      featureAccess: input.featureAccess ?? {},
      limits: input.limits ?? {},
      public: input.public ?? true,
      sortOrder: input.sortOrder ?? 100,
      active: input.active ?? true,
      isDefaultSignup: Boolean(input.isDefaultSignup),
      isTrialPlan: Boolean(input.isTrialPlan),
      trialDays: input.trialDays ?? DEFAULT_TRIAL_DAYS,
    });
    return toPublicPlan(plan);
  }

  async updatePlan(planId: string, input: Record<string, unknown>) {
    if (!isValidObjectId(planId)) throw AppError.badRequest('Invalid plan id');
    const plan = await PricingPlanModel.findById(planId);
    if (!plan) throw AppError.notFound('Plan not found');

    if (typeof input.name === 'string') plan.name = input.name.trim();
    if (typeof input.description === 'string' || input.description === null) {
      plan.description = input.description as string | null;
    }
    if (Array.isArray(input.billingCycles)) {
      plan.billingCycles = input.billingCycles as BillingCycle[];
    }
    if (input.prices && typeof input.prices === 'object') {
      const prices = input.prices as { monthly?: number | null; yearly?: number | null };
      if ('monthly' in prices) plan.prices.monthly = prices.monthly ?? null;
      if ('yearly' in prices) plan.prices.yearly = prices.yearly ?? null;
    }
    if (typeof input.currency === 'string') plan.currency = input.currency.toUpperCase();
    if (input.featureAccess && typeof input.featureAccess === 'object') {
      plan.featureAccess = input.featureAccess as Record<string, boolean>;
    }
    if (input.limits && typeof input.limits === 'object') {
      plan.limits = input.limits as PlanLimits;
    }
    if (typeof input.public === 'boolean') plan.public = input.public;
    if (typeof input.sortOrder === 'number') plan.sortOrder = input.sortOrder;
    if (typeof input.active === 'boolean') plan.active = input.active;
    if (typeof input.isTrialPlan === 'boolean') plan.isTrialPlan = input.isTrialPlan;
    if (typeof input.trialDays === 'number' && input.trialDays > 0) {
      plan.trialDays = input.trialDays;
    }
    if (typeof input.isDefaultSignup === 'boolean') {
      if (input.isDefaultSignup) {
        await clearOtherDefaultSignup(plan._id);
        plan.isDefaultSignup = true;
      } else {
        plan.isDefaultSignup = false;
      }
    }

    await plan.save();
    return toPublicPlan(plan);
  }

  async updatePlanStatus(planId: string, active: boolean) {
    return this.updatePlan(planId, { active });
  }

  async setDefaultSignupPlan(planId: string) {
    if (!isValidObjectId(planId)) throw AppError.badRequest('Invalid plan id');
    const plan = await PricingPlanModel.findById(planId);
    if (!plan) throw AppError.notFound('Plan not found');
    if (!plan.active) {
      throw AppError.badRequest('Cannot set an inactive plan as the default signup plan');
    }
    await clearOtherDefaultSignup(plan._id);
    plan.isDefaultSignup = true;
    await plan.save();
    return toPublicPlan(plan);
  }

  async syncOrgPlanFromSubscription(organizationId: string) {
    const subscription = await this.ensureSubscription(organizationId);
    const plan = await PricingPlanModel.findById(subscription.planId);
    if (!plan) return;
    await OrganizationModel.updateOne(
      { _id: new mongoose.Types.ObjectId(organizationId) },
      { $set: { plan: plan.name } }
    );
  }
}

export const plansService = new PlansService();
