import mongoose, { type Document, type Model, Schema } from 'mongoose';

import { BILLING_CYCLES, type BillingCycle } from './pricing-plan.model.js';

export const SUBSCRIPTION_STATUSES = [
  'trialing',
  'active',
  'past_due',
  'cancelled',
  'incomplete',
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const BILLING_PROVIDERS = ['manual', 'razorpay', 'dodo', 'stripe'] as const;
export type BillingProvider = (typeof BILLING_PROVIDERS)[number];

export type WorkspaceSubscriptionDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  billingProvider: BillingProvider;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  providerCustomerId: string | null;
  providerSubscriptionId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const workspaceSubscriptionSchema = new Schema<WorkspaceSubscriptionDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'PricingPlan',
      required: true,
      index: true,
    },
    billingProvider: {
      type: String,
      enum: BILLING_PROVIDERS,
      default: 'manual',
    },
    billingCycle: {
      type: String,
      enum: BILLING_CYCLES,
      default: 'monthly',
    },
    status: {
      type: String,
      enum: SUBSCRIPTION_STATUSES,
      default: 'active',
      index: true,
    },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    providerCustomerId: { type: String, default: null, trim: true },
    providerSubscriptionId: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

workspaceSubscriptionSchema.index({ organizationId: 1, status: 1 });

export const WorkspaceSubscriptionModel: Model<WorkspaceSubscriptionDocument> =
  mongoose.models.WorkspaceSubscription ??
  mongoose.model<WorkspaceSubscriptionDocument>(
    'WorkspaceSubscription',
    workspaceSubscriptionSchema
  );
