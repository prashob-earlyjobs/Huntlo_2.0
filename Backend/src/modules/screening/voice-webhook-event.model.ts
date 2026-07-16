import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const WEBHOOK_EVENT_STATUSES = [
  'received',
  'processed',
  'duplicate',
  'ignored',
  'failed',
] as const;
export type WebhookEventStatus = (typeof WEBHOOK_EVENT_STATUSES)[number];

export type VoiceWebhookEventDocument = Document & {
  provider: string;
  providerEventId: string;
  payloadHash: string;
  screeningId: mongoose.Types.ObjectId | null;
  organizationId: mongoose.Types.ObjectId | null;
  kind: string;
  status: WebhookEventStatus;
  payload: Record<string, unknown>;
  processedAt: Date | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const voiceWebhookEventSchema = new Schema<VoiceWebhookEventDocument>(
  {
    provider: { type: String, required: true, default: 'hunar', index: true },
    providerEventId: { type: String, required: true },
    payloadHash: { type: String, required: true, index: true },
    screeningId: { type: Schema.Types.ObjectId, ref: 'Screening', default: null, index: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    kind: { type: String, required: true },
    status: {
      type: String,
      enum: WEBHOOK_EVENT_STATUSES,
      default: 'received',
      index: true,
    },
    payload: { type: Schema.Types.Mixed, required: true },
    processedAt: { type: Date, default: null },
    error: { type: String, default: null },
  },
  { timestamps: true }
);

voiceWebhookEventSchema.index(
  { provider: 1, providerEventId: 1 },
  { unique: true }
);

export const VoiceWebhookEventModel = (mongoose.models.VoiceWebhookEvent ??
  mongoose.model<VoiceWebhookEventDocument>(
    'VoiceWebhookEvent',
    voiceWebhookEventSchema
  )) as Model<VoiceWebhookEventDocument>;
