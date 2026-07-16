import mongoose from 'mongoose';

export const SOURCING_SESSION_STATUSES = [
  'draft',
  'queued',
  'running',
  'polling',
  'completed',
  'partial',
  'failed',
  'cancelled',
] as const;

export type SourcingSessionStatus = (typeof SOURCING_SESSION_STATUSES)[number];

const sourcingSessionSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    naturalLanguageQuery: { type: String, default: '', trim: true, maxlength: 5000 },
    interpretedCriteria: { type: mongoose.Schema.Types.Mixed, default: [] },
    normalizedFilters: { type: mongoose.Schema.Types.Mixed, default: null },
    providerPayload: { type: mongoose.Schema.Types.Mixed, default: null },
    externalSessionId: { type: String, default: null, trim: true },
    status: {
      type: String,
      enum: SOURCING_SESSION_STATUSES,
      default: 'draft',
      index: true,
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    estimatedResults: { type: Number, default: 0, min: 0 },
    totalResults: { type: Number, default: 0, min: 0 },
    quotaConsumed: { type: Number, default: 0, min: 0 },
    errorCode: { type: String, default: null },
    errorMessage: { type: String, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    lastPolledAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

sourcingSessionSchema.index({ organizationId: 1, createdAt: -1 });
sourcingSessionSchema.index({ organizationId: 1, status: 1 });
sourcingSessionSchema.index({ externalSessionId: 1 });

export type SourcingSessionDocument = mongoose.InferSchemaType<typeof sourcingSessionSchema> &
  mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };

export const SourcingSessionModel = (mongoose.models.SourcingSession ??
  mongoose.model(
    'SourcingSession',
    sourcingSessionSchema
  )) as mongoose.Model<SourcingSessionDocument>;
