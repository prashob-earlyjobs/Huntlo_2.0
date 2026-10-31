import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const EASY_SCOUT_LOOKUP_TYPES = [
  'linkedin_url',
  'linkedin_username',
  'din',
] as const;
export type EasyScoutLookupType = (typeof EASY_SCOUT_LOOKUP_TYPES)[number];

export const EASY_SCOUT_RESULT_STATUSES = [
  'found',
  'multiple_matches',
  'not_found',
  'invalid_input',
  'quota_exhausted',
  'provider_unavailable',
  'failed',
] as const;
export type EasyScoutResultStatus = (typeof EASY_SCOUT_RESULT_STATUSES)[number];

export type EasyScoutCandidateSnapshot = {
  name?: string;
  title?: string;
  headline?: string;
  location?: string;
  company?: string;
  role?: string;
  linkedinFlagshipUrl?: string;
  linkedinProfileUrl?: string;
  linkedinUsername?: string;
  profilePictureUrl?: string;
  din?: string;
  skills?: string[];
  languages?: string[];
  summary?: string;
  experience?: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
    location?: string;
    current: boolean;
  }>;
  education?: Array<{
    school: string;
    degree: string;
    field: string;
    years: string;
  }>;
  numConnections?: number | null;
  matches?: Array<{
    name?: string;
    headline?: string;
    company?: string;
    location?: string;
    linkedinProfileUrl?: string;
  }>;
};

export type EasyScoutLookupDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  lookupType: EasyScoutLookupType;
  normalizedInputHash: string;
  displayInput: string;
  maskedInput: string;
  externalCandidateId: string | null;
  resultStatus: EasyScoutResultStatus;
  candidateSnapshot: EasyScoutCandidateSnapshot | null;
  quotaTransactionId: string | null;
  cacheHit: boolean;
  cacheSource: 'user_cache' | 'eazyreach' | 'futurejobs' | 'none' | null;
  charged: boolean;
  savedCandidateId: mongoose.Types.ObjectId | null;
  /** Cached reveal values from EazyReach (encrypted elsewhere for contacts). */
  revealedEmails: string[];
  revealedPhones: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

const candidateSnapshotSchema = new Schema(
  {
    name: { type: String, default: '' },
    title: { type: String, default: '' },
    headline: { type: String, default: '' },
    location: { type: String, default: '' },
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    linkedinFlagshipUrl: { type: String, default: '' },
    linkedinProfileUrl: { type: String, default: '' },
    linkedinUsername: { type: String, default: '' },
    profilePictureUrl: { type: String, default: '' },
    din: { type: String, default: '' },
    skills: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    summary: { type: String, default: '' },
    experience: { type: [Schema.Types.Mixed], default: [] },
    education: { type: [Schema.Types.Mixed], default: [] },
    numConnections: { type: Number, default: null },
    matches: { type: [Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

const easyScoutLookupSchema = new Schema<EasyScoutLookupDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lookupType: {
      type: String,
      enum: EASY_SCOUT_LOOKUP_TYPES,
      required: true,
    },
    normalizedInputHash: { type: String, required: true, index: true },
    displayInput: { type: String, default: '' },
    maskedInput: { type: String, default: '' },
    externalCandidateId: { type: String, default: null },
    resultStatus: {
      type: String,
      enum: EASY_SCOUT_RESULT_STATUSES,
      required: true,
      index: true,
    },
    candidateSnapshot: { type: candidateSnapshotSchema, default: null },
    quotaTransactionId: { type: String, default: null },
    cacheHit: { type: Boolean, default: false },
    cacheSource: {
      type: String,
      enum: ['user_cache', 'eazyreach', 'futurejobs', 'none', null],
      default: null,
    },
    charged: { type: Boolean, default: false },
    savedCandidateId: {
      type: Schema.Types.ObjectId,
      ref: 'SavedCandidate',
      default: null,
    },
    revealedEmails: { type: [String], default: [] },
    revealedPhones: { type: [String], default: [] },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

easyScoutLookupSchema.index(
  { organizationId: 1, userId: 1, lookupType: 1, normalizedInputHash: 1, deletedAt: 1 },
  { name: 'easy_scout_user_cache' }
);
easyScoutLookupSchema.index({ organizationId: 1, createdAt: -1 });

export const EasyScoutLookupModel: Model<EasyScoutLookupDocument> =
  mongoose.models.EasyScoutLookup ??
  mongoose.model<EasyScoutLookupDocument>('EasyScoutLookup', easyScoutLookupSchema);
