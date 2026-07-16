import mongoose, { type Document, type Model, Schema } from 'mongoose';

import { BILLING_CYCLES, type BillingCycle } from '../plans/pricing-plan.model.js';

export const PAYMENT_PROVIDERS = ['razorpay', 'dodo'] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export const PAYMENT_ORDER_STATUSES = [
  'created',
  'pending',
  'paid',
  'failed',
  'expired',
  'refunded',
] as const;
export type PaymentOrderStatus = (typeof PAYMENT_ORDER_STATUSES)[number];

export type PaymentOrderDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  billingCycle: BillingCycle;
  provider: PaymentProvider;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  currency: string;
  /** Amount in smallest currency unit (paise / cents). */
  amount: number;
  status: PaymentOrderStatus;
  idempotencyKey: string | null;
  checkoutUrl: string | null;
  expiresAt: Date | null;
  paidAt: Date | null;
  failedAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

const paymentOrderSchema = new Schema<PaymentOrderDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: 'PricingPlan', required: true, index: true },
    billingCycle: { type: String, enum: BILLING_CYCLES, required: true },
    provider: { type: String, enum: PAYMENT_PROVIDERS, required: true, index: true },
    providerOrderId: { type: String, default: null, trim: true, index: true },
    providerPaymentId: { type: String, default: null, trim: true, index: true },
    currency: { type: String, required: true, uppercase: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: PAYMENT_ORDER_STATUSES,
      default: 'created',
      index: true,
    },
    idempotencyKey: { type: String, default: null, trim: true },
    checkoutUrl: { type: String, default: null, trim: true },
    expiresAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

paymentOrderSchema.index(
  { organizationId: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } }
);
paymentOrderSchema.index(
  { provider: 1, providerOrderId: 1 },
  { unique: true, partialFilterExpression: { providerOrderId: { $type: 'string' } } }
);

export const PaymentOrderModel: Model<PaymentOrderDocument> =
  mongoose.models.PaymentOrder ??
  mongoose.model<PaymentOrderDocument>('PaymentOrder', paymentOrderSchema);
