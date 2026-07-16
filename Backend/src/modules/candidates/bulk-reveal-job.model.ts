import mongoose from 'mongoose';

export const BULK_REVEAL_JOB_STATUSES = [
  'queued',
  'running',
  'completed',
  'failed',
  'cancelled',
] as const;
export type BulkRevealJobStatus = (typeof BULK_REVEAL_JOB_STATUSES)[number];

export const BULK_REVEAL_ITEM_STATUSES = [
  'queued',
  'running',
  'success',
  'cache_hit',
  'previously_revealed',
  'missing',
  'failed',
  'quota_exhausted',
  'skipped',
] as const;
export type BulkRevealItemStatus = (typeof BULK_REVEAL_ITEM_STATUSES)[number];

const bulkRevealItemSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SourcedCandidate',
      required: true,
    },
    contactTypes: {
      type: [String],
      enum: ['email', 'mobile'],
      required: true,
    },
    status: {
      type: String,
      enum: BULK_REVEAL_ITEM_STATUSES,
      default: 'queued',
    },
    source: { type: String, default: null },
    error: { type: String, default: null },
  },
  { _id: false }
);

const bulkRevealCountsSchema = new mongoose.Schema(
  {
    success: { type: Number, default: 0, min: 0 },
    cacheHit: { type: Number, default: 0, min: 0 },
    previouslyRevealed: { type: Number, default: 0, min: 0 },
    missing: { type: Number, default: 0, min: 0 },
    failed: { type: Number, default: 0, min: 0 },
    quotaExhausted: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const bulkRevealJobSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: BULK_REVEAL_JOB_STATUSES,
      default: 'queued',
      index: true,
    },
    items: { type: [bulkRevealItemSchema], default: [] },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    counts: { type: bulkRevealCountsSchema, default: () => ({}) },
    idempotencyKey: { type: String, required: true, trim: true },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

bulkRevealJobSchema.index(
  { organizationId: 1, userId: 1, idempotencyKey: 1 },
  { unique: true }
);
bulkRevealJobSchema.index({ organizationId: 1, status: 1, createdAt: 1 });

export type BulkRevealJobDocument = mongoose.InferSchemaType<typeof bulkRevealJobSchema> &
  mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };

export const BulkRevealJobModel = (mongoose.models.BulkRevealJob ??
  mongoose.model('BulkRevealJob', bulkRevealJobSchema)) as mongoose.Model<BulkRevealJobDocument>;
