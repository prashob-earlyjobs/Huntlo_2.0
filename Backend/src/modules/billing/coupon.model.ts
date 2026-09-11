import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const COUPON_DISCOUNT_TYPES = ['percent', 'fixed'] as const;
export type CouponDiscountType = (typeof COUPON_DISCOUNT_TYPES)[number];

export type BillingCouponDocument = Document & {
  code: string;
  description: string | null;
  discountType: CouponDiscountType;
  /** Percent 1–100, or major currency units for fixed. */
  discountValue: number;
  /** Required for fixed discounts; optional for percent (applies to any currency). */
  currency: 'INR' | 'USD' | null;
  /** Empty = all public paid plans. */
  planCodes: string[];
  maxRedemptions: number | null;
  maxPerOrganization: number;
  /** Times users clicked Apply / validated the code (preview). */
  appliedCount: number;
  /** Times checkout completed successfully with this coupon. */
  redemptionCount: number;
  startsAt: Date | null;
  expiresAt: Date | null;
  active: boolean;
  createdByUserId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
};

const billingCouponSchema = new Schema<BillingCouponDocument>(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 40,
    },
    description: { type: String, default: null, trim: true, maxlength: 240 },
    discountType: {
      type: String,
      enum: COUPON_DISCOUNT_TYPES,
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      enum: ['INR', 'USD'],
      default: null,
    },
    planCodes: { type: [String], default: [] },
    maxRedemptions: { type: Number, default: null, min: 1 },
    maxPerOrganization: { type: Number, default: 1, min: 1, max: 100 },
    appliedCount: { type: Number, default: 0, min: 0 },
    redemptionCount: { type: Number, default: 0, min: 0 },
    startsAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    active: { type: Boolean, default: true, index: true },
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

billingCouponSchema.index({ code: 1 }, { unique: true });
billingCouponSchema.index({ active: 1, expiresAt: 1 });

export const BillingCouponModel: Model<BillingCouponDocument> =
  mongoose.models.BillingCoupon ??
  mongoose.model<BillingCouponDocument>('BillingCoupon', billingCouponSchema);
