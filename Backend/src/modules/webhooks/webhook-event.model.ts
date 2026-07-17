import { createHash } from 'node:crypto';

import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const WEBHOOK_PROVIDERS = [
  'meta',
  'gupshup',
  'hunar',
  'calendly',
  'razorpay',
  'dodo',
] as const;
export type WebhookProvider = (typeof WEBHOOK_PROVIDERS)[number];

export const WEBHOOK_PROCESSING_STATUSES = [
  'received',
  'queued',
  'processing',
  'processed',
  'ignored',
  'failed',
  'duplicate',
] as const;
export type WebhookProcessingStatus = (typeof WEBHOOK_PROCESSING_STATUSES)[number];

export type WebhookEventDocument = Document & {
  provider: WebhookProvider;
  providerEventId: string;
  eventType: string;
  payloadHash: string;
  signatureValid: boolean;
  processingStatus: WebhookProcessingStatus;
  receivedAt: Date;
  processedAt: Date | null;
  attempts: number;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  organizationId: mongoose.Types.ObjectId | null;
  error: string | null;
  /** Sanitized payload — PII masked / trimmed for storage. */
  payload: Record<string, unknown>;
  headers: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
};

const webhookEventSchema = new Schema<WebhookEventDocument>(
  {
    provider: { type: String, enum: WEBHOOK_PROVIDERS, required: true, index: true },
    providerEventId: { type: String, required: true, trim: true, maxlength: 200 },
    eventType: { type: String, required: true, trim: true, maxlength: 120, default: 'unknown' },
    payloadHash: { type: String, required: true, trim: true, maxlength: 64 },
    signatureValid: { type: Boolean, required: true },
    processingStatus: {
      type: String,
      enum: WEBHOOK_PROCESSING_STATUSES,
      default: 'received',
      index: true,
    },
    receivedAt: { type: Date, default: () => new Date(), index: true },
    processedAt: { type: Date, default: null },
    attempts: { type: Number, default: 0, min: 0 },
    relatedEntityType: { type: String, default: null, maxlength: 80 },
    relatedEntityId: { type: String, default: null, maxlength: 80 },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    error: { type: String, default: null, maxlength: 4000 },
    payload: { type: Schema.Types.Mixed, default: {} },
    headers: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

webhookEventSchema.index({ provider: 1, providerEventId: 1 }, { unique: true });
webhookEventSchema.index({ provider: 1, payloadHash: 1 });
webhookEventSchema.index({ provider: 1, payloadHash: 1, processingStatus: 1 });
webhookEventSchema.index({ processingStatus: 1, receivedAt: -1 });
webhookEventSchema.index({ processingStatus: 1, attempts: 1 });

export const WebhookEventModel: Model<WebhookEventDocument> =
  mongoose.models.WebhookEvent ??
  mongoose.model<WebhookEventDocument>('WebhookEvent', webhookEventSchema);

export function hashWebhookRawBody(raw: Buffer | string): string {
  const buf = typeof raw === 'string' ? Buffer.from(raw, 'utf8') : raw;
  return createHash('sha256').update(buf).digest('hex');
}
