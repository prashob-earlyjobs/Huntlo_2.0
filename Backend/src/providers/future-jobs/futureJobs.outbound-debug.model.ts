import mongoose, { type InferSchemaType, type Model } from 'mongoose';

/**
 * Ring buffer of Future Jobs gateway calls.
 * One document per HTTP call: which API, who called it, URL, body, response.
 * `webhook` is set only on `phone_reveal`, when contact.reveal.completed arrives.
 */
export const FUTURE_JOBS_OUTBOUND_DEBUG_COLLECTION = 'future_jobs_outbound_debug';
export const FUTURE_JOBS_OUTBOUND_DEBUG_MAX = 4_000;

export const FUTURE_JOBS_OUTBOUND_KINDS = [
  'search',
  'session_create',
  'session_update',
  'session_profiles',
  'session_fetch_more',
  'candidate_details',
  'filter_autocomplete',
  'session_preview',
  'session_annotation',
  'scout_lookup',
  'email_reveal',
  'phone_reveal',
] as const;

export type FutureJobsOutboundKind = (typeof FUTURE_JOBS_OUTBOUND_KINDS)[number];

/** Email or phone, used by reveal callers. Not stored on the gateway row. */
export type FutureJobsOutboundRevealType = 'email' | 'phone';

const futureJobsOutboundDebugSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: FUTURE_JOBS_OUTBOUND_KINDS,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    /** Called Future Jobs URL. */
    url: { type: String, default: '', trim: true },
    /** Request body, or the query parameters when the call has no JSON body. */
    body: { type: mongoose.Schema.Types.Mixed, default: null },
    /** Future Jobs response JSON. */
    response: { type: mongoose.Schema.Types.Mixed, default: null },
    /** Incoming contact.reveal webhook. Only set on phone_reveal. */
    webhook: { type: mongoose.Schema.Types.Mixed, default: null },
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
