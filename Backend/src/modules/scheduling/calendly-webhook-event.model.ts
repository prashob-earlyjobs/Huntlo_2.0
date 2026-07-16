import mongoose, { type Document, type Model, Schema } from 'mongoose';

export type CalendlyWebhookEventDocument = Document & {
  organizationId: mongoose.Types.ObjectId | null;
  eventKey: string;
  inviteeUri: string | null;
  eventUri: string | null;
  payload: unknown;
  processedAt: Date | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const calendlyWebhookEventSchema = new Schema<CalendlyWebhookEventDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    eventKey: { type: String, required: true, unique: true, index: true },
    inviteeUri: { type: String, default: null, index: true },
    eventUri: { type: String, default: null, index: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    processedAt: { type: Date, default: null },
    error: { type: String, default: null },
  },
  { timestamps: true }
);

export const CalendlyWebhookEventModel = (mongoose.models.CalendlyWebhookEvent ??
  mongoose.model<CalendlyWebhookEventDocument>(
    'CalendlyWebhookEvent',
    calendlyWebhookEventSchema
  )) as Model<CalendlyWebhookEventDocument>;
