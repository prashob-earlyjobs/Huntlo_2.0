import mongoose, { type InferSchemaType, type Model } from 'mongoose';

/**
 * Ring buffer of outbound Future Jobs HTTP / reveal-session debug rows.
 * Kept at max 100 docs via insert-time trim (uncapped so poll arrays can grow).
 */
export const FUTURE_JOBS_OUTBOUND_DEBUG_COLLECTION = 'future_jobs_outbound_debug';
export const FUTURE_JOBS_OUTBOUND_DEBUG_MAX = 100;

export type FutureJobsOutboundKind = 'scout' | 'reveal' | 'search' | 'other';
export type FutureJobsOutboundRevealType = 'email' | 'phone';
export type FutureJobsOutboundSessionStatus =
  | 'in_progress'
  | 'completed'
  | 'failed'
  | null;
export type FutureJobsOutboundDataFoundFrom = 'main_api' | 'poll' | 'cache' | null;

const outboundCallSchema = new mongoose.Schema(
  {
    at: { type: Date, default: () => new Date() },
    operation: { type: String, default: '' },
    method: { type: String, default: 'POST' },
    url: { type: String, default: '' },
    body: { type: mongoose.Schema.Types.Mixed, default: null },
    response: { type: mongoose.Schema.Types.Mixed, default: null },
    status: { type: Number, default: null },
    statusText: { type: String, default: null },
    ok: { type: Boolean, default: false },
    elapsedMs: { type: Number, default: null },
    attempt: { type: Number, default: 1 },
    error: { type: String, default: null },
  },
  { _id: false }
);

const outboundPollSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    response: { type: mongoose.Schema.Types.Mixed, default: null },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { _id: false }
);

const futureJobsOutboundDebugSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ['scout', 'reveal', 'search', 'other'],
      required: true,
      index: true,
    },
    /** Set when kind is `reveal` — email or phone contact unlock. */
    type: {
      type: String,
      enum: ['email', 'phone'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    /** Reveal-session only */
    lookupId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    linkedinUrl: { type: String, trim: true },
    sessionStatus: {
      type: String,
      enum: ['in_progress', 'completed', 'failed'],
      index: true,
    },
    mainApi: { type: outboundCallSchema },
    calls: { type: [outboundCallSchema] },
    polls: { type: [outboundPollSchema] },
    dataFoundFrom: {
      type: String,
      enum: ['main_api', 'poll', 'cache'],
    },
    resultSummary: { type: mongoose.Schema.Types.Mixed },
    // Flat fields for one-shot outbound rows (scout / search / other)
    operation: { type: String, required: true, trim: true },
    method: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    body: { type: mongoose.Schema.Types.Mixed },
    response: { type: mongoose.Schema.Types.Mixed },
    status: { type: Number },
    statusText: { type: String },
    ok: { type: Boolean, default: false },
    elapsedMs: { type: Number },
    attempt: { type: Number, default: 1 },
    error: { type: String },
  },
  {
    collection: FUTURE_JOBS_OUTBOUND_DEBUG_COLLECTION,
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
    minimize: true,
  }
);

export type FutureJobsOutboundDebugDocument = InferSchemaType<
  typeof futureJobsOutboundDebugSchema
> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const FutureJobsOutboundDebugModel = (mongoose.models
  .FutureJobsOutboundDebug ||
  mongoose.model(
    'FutureJobsOutboundDebug',
    futureJobsOutboundDebugSchema
  )) as Model<FutureJobsOutboundDebugDocument>;
