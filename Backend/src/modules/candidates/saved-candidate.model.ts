import mongoose from 'mongoose';

export const POOL_STATUSES = [
  'new',
  'saved',
  'contacted',
  'interested',
  'qualified',
  'screening',
  'shortlisted',
  'interview_scheduled',
  'rejected',
  'hired',
  'archived',
] as const;

export type PoolStatus = (typeof POOL_STATUSES)[number];

export const POOL_SOURCE_TYPES = [
  'sourcing',
  'people_scout',
  'import',
  'referral',
  'manual',
] as const;

export type PoolSourceType = (typeof POOL_SOURCE_TYPES)[number];

const savedCandidateSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    externalCandidateId: {
      type: String,
      default: null,
      trim: true,
    },
    sourceType: {
      type: String,
      enum: POOL_SOURCE_TYPES,
      default: 'manual',
      index: true,
    },
    sourceId: { type: String, default: null, trim: true },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assignedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: POOL_STATUSES,
      default: 'new',
      index: true,
    },
    jobIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
      default: [],
    },
    listIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CandidateList' }],
      default: [],
    },
    tags: { type: [String], default: [] },
    customFields: { type: mongoose.Schema.Types.Mixed, default: {} },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, default: null, trim: true, lowercase: true },
    phone: { type: String, default: null, trim: true },
    linkedinUrl: { type: String, default: null, trim: true },
    headline: { type: String, default: null, trim: true, maxlength: 500 },
    currentTitle: { type: String, default: null, trim: true, maxlength: 200 },
    currentCompany: { type: String, default: null, trim: true, maxlength: 200 },
    location: { type: String, default: null, trim: true, maxlength: 200 },
    experienceYears: { type: Number, default: null, min: 0 },
    skills: { type: [String], default: [] },
    lastActivityAt: { type: Date, default: () => new Date(), index: true },
    archivedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

savedCandidateSchema.index({ organizationId: 1, status: 1, lastActivityAt: -1 });
savedCandidateSchema.index({ organizationId: 1, ownerUserId: 1 });
savedCandidateSchema.index({ organizationId: 1, assignedUserId: 1 });
savedCandidateSchema.index({ organizationId: 1, listIds: 1 });
savedCandidateSchema.index({ organizationId: 1, name: 1 });
savedCandidateSchema.index(
  { organizationId: 1, email: 1 },
  { sparse: true, partialFilterExpression: { email: { $type: 'string' } } }
);
savedCandidateSchema.index(
  { organizationId: 1, phone: 1 },
  { sparse: true, partialFilterExpression: { phone: { $type: 'string' } } }
);
savedCandidateSchema.index(
  { organizationId: 1, externalCandidateId: 1 },
  {
    sparse: true,
    partialFilterExpression: { externalCandidateId: { $type: 'string' } },
  }
);
savedCandidateSchema.index(
  {
    name: 'text',
    email: 'text',
    headline: 'text',
    currentTitle: 'text',
    currentCompany: 'text',
    skills: 'text',
    tags: 'text',
    location: 'text',
  },
  { name: 'saved_candidates_text_search' }
);

export type SavedCandidateDocument = mongoose.InferSchemaType<typeof savedCandidateSchema> &
  mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };

export const SavedCandidateModel = (mongoose.models.SavedCandidate ??
  mongoose.model('SavedCandidate', savedCandidateSchema)) as mongoose.Model<SavedCandidateDocument>;
