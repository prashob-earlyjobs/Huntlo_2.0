import mongoose, { type Document, type Model, Schema } from 'mongoose';

import { PAYMENT_PROVIDERS, type PaymentProvider } from './payment-order.model.js';

export const WEBHOOK_PROCESSING_STATUSES = [
  'received',
  'processed',
  'ignored',
  'failed',
  'duplicate',
] as const;
export type WebhookProcessingStatus = (typeof WEBHOOK_PROCESSING_STATUSES)[number];

export type BillingWebhookEventDocument = Document & {
  provider: PaymentProvider;
  providerEventId: string;
  payloadHash: string;
  signatureValid: boolean;
  processingStatus: WebhookProcessingStatus;
  processedAt: Date | null;
  error: string | null;
  eventType: string | null;
  payload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

const billingWebhookEventSchema = new Schema<BillingWebhookEventDocument>(
  {
    provider: { type: String, enum: PAYMENT_PROVIDERS, required: true, index: true },
    providerEventId: { type: String, required: true, trim: true },
    payloadHash: { type: String, required: true, trim: true },
    signatureValid: { type: Boolean, required: true },
    processingStatus: {
      type: String,
      enum: WEBHOOK_PROCESSING_STATUSES,
      default: 'received',
      index: true,
    },
    processedAt: { type: Date, default: null },
    error: { type: String, default: null },
    eventType: { type: String, default: null, trim: true },
    payload: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

billingWebhookEventSchema.index({ provider: 1, providerEventId: 1 }, { unique: true });

export const BillingWebhookEventModel: Model<BillingWebhookEventDocument> =
  mongoose.models.BillingWebhookEvent ??
  mongoose.model<BillingWebhookEventDocument>(
    'BillingWebhookEvent',
    billingWebhookEventSchema
  );
