import mongoose, { type Document, type Model, Schema } from 'mongoose';

import { USAGE_METRICS, type UsageMetric } from '../../shared/usage/metrics.js';

export const BILLING_CYCLES = ['monthly', 'yearly'] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export type PlanLimits = Partial<Record<UsageMetric, number>> & {
  allowOverage?: boolean;
};

export type PricingPlanDocument = Document & {
  name: string;
  code: string;
  billingCycles: BillingCycle[];
  prices: {
    monthly: number | null;
    yearly: number | null;
  };
  currency: string;
  featureAccess: Record<string, boolean>;
  limits: PlanLimits;
  active: boolean;
  public: boolean;
  sortOrder: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const pricingPlanSchema = new Schema<PricingPlanDocument>(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    billingCycles: {
      type: [String],
      enum: BILLING_CYCLES,
      default: ['monthly', 'yearly'],
    },
    prices: {
      monthly: { type: Number, default: null },
      yearly: { type: Number, default: null },
    },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    featureAccess: { type: Schema.Types.Mixed, default: {} },
    limits: { type: Schema.Types.Mixed, default: {} },
    active: { type: Boolean, default: true, index: true },
    public: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
    description: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

pricingPlanSchema.index({ active: 1, public: 1, sortOrder: 1 });

export const PricingPlanModel: Model<PricingPlanDocument> =
  mongoose.models.PricingPlan ??
  mongoose.model<PricingPlanDocument>('PricingPlan', pricingPlanSchema);

export function emptyMetricLimits(): Record<UsageMetric, number> {
  return USAGE_METRICS.reduce(
    (acc, metric) => {
      acc[metric] = 0;
      return acc;
    },
    {} as Record<UsageMetric, number>
  );
}
