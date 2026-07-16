import mongoose, { type Document, type Model, Schema } from 'mongoose';

export type AssessmentWebhookEventDocument = Document & {
  organizationId: mongoose.Types.ObjectId | null;
  provider: string;
  eventId: string;
  eventType: string;
  providerAttemptId: string | null;
  providerAssessmentId: string | null;
  assessmentCandidateId: mongoose.Types.ObjectId | null;
  payload: unknown;
  processedAt: Date | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const assessmentWebhookEventSchema = new Schema<AssessmentWebhookEventDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    provider: { type: String, required: true, index: true },
    eventId: { type: String, required: true, index: true },
    eventType: { type: String, required: true },
    providerAttemptId: { type: String, default: null, index: true },
    providerAssessmentId: { type: String, default: null },
    assessmentCandidateId: {
      type: Schema.Types.ObjectId,
      ref: 'AssessmentCandidate',
      default: null,
    },
    payload: { type: Schema.Types.Mixed, default: {} },
    processedAt: { type: Date, default: null },
    error: { type: String, default: null },
  },
  { timestamps: true }
);

assessmentWebhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

export const AssessmentWebhookEventModel = (mongoose.models.AssessmentWebhookEvent ??
  mongoose.model<AssessmentWebhookEventDocument>(
    'AssessmentWebhookEvent',
    assessmentWebhookEventSchema
  )) as Model<AssessmentWebhookEventDocument>;
