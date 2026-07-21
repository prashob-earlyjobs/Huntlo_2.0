import mongoose from 'mongoose';

export const SOURCING_SESSION_STATUSES = [
  'draft',
  'creating',
  'pending',
  'queued', // legacy alias for pending/creating
  'running', // legacy alias for polling
  'polling',
  'partial',
  'completed',
  'failed',
  'cancelled',
] as const;

export type SourcingSessionStatus = (typeof SOURCING_SESSION_STATUSES)[number];

const profilesPaginationSchema = new mongoose.Schema(
  {
    totalDocs: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    limit: { type: Number, default: 20 },
    totalPages: { type: Number, default: 0 },
    hasNextPage: { type: Boolean, default: false },
    hasPrevPage: { type: Boolean, default: false },
  },
  { _id: false }
);

const sourcingSessionSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    /** Canonical owner field for candidate-search DTOs. */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    /** Legacy alias kept for existing sourcing module code. */
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
    sessionTitle: { type: String, default: '', trim: true, maxlength: 200 },
    naturalLanguageQuery: { type: String, default: '', trim: true, maxlength: 5000 },
    prompt: { type: String, default: '', trim: true, maxlength: 5000 },
    interpretedCriteria: { type: mongoose.Schema.Types.Mixed, default: [] },
    /** Frontend filter drawer form (original, never mutated by geo fallback). */
    filterForm: { type: mongoose.Schema.Types.Mixed, default: null },
    /** Legacy alias for filterForm. */
    normalizedFilters: { type: mongoose.Schema.Types.Mixed, default: null },
    /** Generated Future Jobs session body. */
    sessionPayload: { type: mongoose.Schema.Types.Mixed, default: null },
    /** Legacy alias for sessionPayload. */
    providerPayload: { type: mongoose.Schema.Types.Mixed, default: null },
    originalRegionConfiguration: { type: mongoose.Schema.Types.Mixed, default: null },
    appliedRegionConfiguration: { type: mongoose.Schema.Types.Mixed, default: null },
    regionExpandFallbackUsed: { type: Boolean, default: false },
    regionExpandStep: { type: String, default: null, trim: true },
    /** Future Jobs session id (canonical). */
    futureJobsSessionId: { type: String, default: null, trim: true },
    /** Legacy alias for futureJobsSessionId. */
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
    totalDocs: { type: Number, default: 0, min: 0 },
    candidateCountFirstPage: { type: Number, default: 0, min: 0 },
    candidatePreview: { type: [mongoose.Schema.Types.Mixed], default: [] },
    profilesPagination: { type: profilesPaginationSchema, default: () => ({}) },
    canFetchMore: { type: Boolean, default: false },
    polling: { type: Boolean, default: false },
    profilesFetchError: { type: mongoose.Schema.Types.Mixed, default: null },
    quotaConsumed: { type: Number, default: 0, min: 0 },
    quotaTransactionId: { type: String, default: null, trim: true },
    errorCode: { type: String, default: null },
    errorMessage: { type: String, default: null },
    isPublicClaimable: { type: Boolean, default: false },
    claimToken: { type: String, default: null, trim: true, index: true },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    lastPolledAt: { type: Date, default: null },
    /** When set, session appears in Saved searches (user bookmarked via Save Search). */
    savedAt: { type: Date, default: null, index: true },
    /** Candidate list created when the search was saved (if any). */
    savedListId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CandidateList',
      default: null,
    },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

sourcingSessionSchema.index({ organizationId: 1, createdAt: -1 });
sourcingSessionSchema.index({ organizationId: 1, status: 1 });
sourcingSessionSchema.index({ userId: 1, createdAt: -1 });
sourcingSessionSchema.index({ ownerUserId: 1, createdAt: -1 });
sourcingSessionSchema.index({ futureJobsSessionId: 1 });
sourcingSessionSchema.index({ externalSessionId: 1 });
sourcingSessionSchema.index(
  { organizationId: 1, savedAt: -1 },
  {
    partialFilterExpression: {
      savedAt: { $type: 'date' },
    },
  }
);
sourcingSessionSchema.index(
  { organizationId: 1, futureJobsSessionId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      futureJobsSessionId: { $type: 'string', $gt: '' },
    },
  }
);

sourcingSessionSchema.pre('validate', function syncAliases(next) {
  const doc = this as mongoose.Document & {
    userId?: mongoose.Types.ObjectId | null;
    ownerUserId?: mongoose.Types.ObjectId;
    prompt?: string;
    naturalLanguageQuery?: string;
    sessionTitle?: string;
    name?: string;
    filterForm?: unknown;
    normalizedFilters?: unknown;
    sessionPayload?: unknown;
    providerPayload?: unknown;
    futureJobsSessionId?: string | null;
    externalSessionId?: string | null;
    totalDocs?: number;
    totalResults?: number;
  };

  if (!doc.userId && doc.ownerUserId) doc.userId = doc.ownerUserId;
  if (!doc.ownerUserId && doc.userId) doc.ownerUserId = doc.userId;

  if (!doc.prompt && doc.naturalLanguageQuery) doc.prompt = doc.naturalLanguageQuery;
  if (!doc.naturalLanguageQuery && doc.prompt) doc.naturalLanguageQuery = doc.prompt;

  if (!doc.sessionTitle && doc.name) doc.sessionTitle = doc.name;
  if (!doc.name && doc.sessionTitle) doc.name = doc.sessionTitle;

  if (doc.filterForm == null && doc.normalizedFilters != null) {
    doc.filterForm = doc.normalizedFilters;
  }
  if (doc.normalizedFilters == null && doc.filterForm != null) {
    doc.normalizedFilters = doc.filterForm;
  }

  if (doc.sessionPayload == null && doc.providerPayload != null) {
    doc.sessionPayload = doc.providerPayload;
  }
  if (doc.providerPayload == null && doc.sessionPayload != null) {
    doc.providerPayload = doc.sessionPayload;
  }

  if (!doc.futureJobsSessionId && doc.externalSessionId) {
    doc.futureJobsSessionId = doc.externalSessionId;
  }
  if (!doc.externalSessionId && doc.futureJobsSessionId) {
    doc.externalSessionId = doc.futureJobsSessionId;
  }

  if ((doc.totalDocs == null || doc.totalDocs === 0) && doc.totalResults) {
    doc.totalDocs = doc.totalResults;
  }
  if ((doc.totalResults == null || doc.totalResults === 0) && doc.totalDocs) {
    doc.totalResults = doc.totalDocs;
  }

  next();
});

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
