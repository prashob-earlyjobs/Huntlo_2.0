import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const COUPON_REDEMPTION_STATUSES = ['pending', 'redeemed', 'released'] as const;
export type CouponRedemptionStatus = (typeof COUPON_REDEMPTION_STATUSES)[number];

export type CouponRedemptionDocument = Document & {
  couponId: mongoose.Types.ObjectId;
  code: string;
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  currency: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: CouponRedemptionStatus;
  redeemedAt: Date | null;
  releasedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const couponRedemptionSchema = new Schema<CouponRedemptionDocument>(
  {
    couponId: {
      type: Schema.Types.ObjectId,
      ref: 'BillingCoupon',
      required: true,
      index: true,
    },
    code: { type: String, required: true, uppercase: true, trim: true, index: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentOrder',
      required: true,
      unique: true,
    },
    currency: { type: String, required: true, uppercase: true, trim: true },
    originalAmount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, required: true, min: 0 },
    finalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: COUPON_REDEMPTION_STATUSES,
      default: 'pending',
      index: true,
    },
    redeemedAt: { type: Date, default: null },
    releasedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

couponRedemptionSchema.index({ couponId: 1, status: 1 });
couponRedemptionSchema.index({ organizationId: 1, code: 1, status: 1 });

export const CouponRedemptionModel: Model<CouponRedemptionDocument> =
  mongoose.models.CouponRedemption ??
  mongoose.model<CouponRedemptionDocument>('CouponRedemption', couponRedemptionSchema);
