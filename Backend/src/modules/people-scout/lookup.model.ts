import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const PEOPLE_SCOUT_LOOKUP_TYPES = [
  'linkedin_url',
  'linkedin_username',
  'email',
] as const;
export type PeopleScoutLookupType = (typeof PEOPLE_SCOUT_LOOKUP_TYPES)[number];

export const PEOPLE_SCOUT_RESULT_STATUSES = [
  'found',
  'multiple_matches',
  'not_found',
  'invalid_input',
  'quota_exhausted',
  'provider_unavailable',
  'failed',
] as const;
export type PeopleScoutResultStatus = (typeof PEOPLE_SCOUT_RESULT_STATUSES)[number];

export type PeopleScoutCandidateSnapshot = {
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
  numConnections?: number | null;
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
    startDate?: string | null;
    endDate?: string | null;
  }>;
  education?: Array<{
    school: string;
    degree: string;
    field: string;
    years: string;
  }>;
  allTitles?: string[];
  allEmployers?: string[];
  allSchools?: string[];
  allDegrees?: string[];
  matches?: Array<{
    name?: string;
    headline?: string;
    company?: string;
    location?: string;
    linkedinProfileUrl?: string;
  }>;
  /** Future Jobs scout id — opaque reference, not PII */
  scoutId?: string;
  /** Future Jobs profile id — opaque reference */
  fjProfileId?: string;
};

export type PeopleScoutLookupDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  lookupType: PeopleScoutLookupType;
  normalizedInputHash: string;
  /** Full lookup value shown in history (email / LinkedIn URL / username). */
  displayInput: string;
  /** Privacy-safe mask kept for logs / exports. */
  maskedInput: string;
  externalCandidateId: string | null;
  resultStatus: PeopleScoutResultStatus;
  candidateSnapshot: PeopleScoutCandidateSnapshot | null;
  quotaTransactionId: string | null;
  cacheHit: boolean;
  /** Internal: which cache tier / provider sourced this row (not exposed as PII). */
  cacheSource: 'user_cache' | 'shared_cache' | 'futurejobs' | 'none' | null;
  charged: boolean;
  savedCandidateId: mongoose.Types.ObjectId | null;
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
    numConnections: { type: Number, default: null },
    skills: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    summary: { type: String, default: '' },
    experience: {
      type: [
        {
          company: { type: String, default: '' },
          role: { type: String, default: '' },
          duration: { type: String, default: '' },
          description: { type: String, default: '' },
          location: { type: String, default: '' },
          current: { type: Boolean, default: false },
          startDate: { type: String, default: null },
          endDate: { type: String, default: null },
        },
      ],
      default: [],
    },
    education: {
      type: [
        {
          school: { type: String, default: '' },
          degree: { type: String, default: '' },
          field: { type: String, default: '' },
          years: { type: String, default: '' },
        },
      ],
      default: [],
    },
    allTitles: { type: [String], default: [] },
    allEmployers: { type: [String], default: [] },
    allSchools: { type: [String], default: [] },
    allDegrees: { type: [String], default: [] },
    matches: { type: [Schema.Types.Mixed], default: undefined },
    scoutId: { type: String, default: '' },
    fjProfileId: { type: String, default: '' },
  },
  { _id: false }
);

const peopleScoutLookupSchema = new Schema<PeopleScoutLookupDocument>(
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
      enum: PEOPLE_SCOUT_LOOKUP_TYPES,
      required: true,
    },
    normalizedInputHash: { type: String, required: true, index: true },
    displayInput: { type: String, default: '', trim: true },
    maskedInput: { type: String, required: true, trim: true },
    externalCandidateId: { type: String, default: null, trim: true },
    resultStatus: {
      type: String,
      enum: PEOPLE_SCOUT_RESULT_STATUSES,
      required: true,
      index: true,
    },
    candidateSnapshot: { type: candidateSnapshotSchema, default: null },
    quotaTransactionId: { type: String, default: null },
    cacheHit: { type: Boolean, default: false },
    cacheSource: {
      type: String,
      enum: ['user_cache', 'shared_cache', 'futurejobs', 'none', null],
      default: null,
    },
    charged: { type: Boolean, default: false },
    savedCandidateId: { type: Schema.Types.ObjectId, ref: 'SavedCandidate', default: null },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

peopleScoutLookupSchema.index({ organizationId: 1, createdAt: -1 });
peopleScoutLookupSchema.index({ organizationId: 1, userId: 1, createdAt: -1 });
peopleScoutLookupSchema.index({
  organizationId: 1,
  lookupType: 1,
  normalizedInputHash: 1,
  createdAt: -1,
});
peopleScoutLookupSchema.index({
  organizationId: 1,
  userId: 1,
  lookupType: 1,
  normalizedInputHash: 1,
});

export const PeopleScoutLookupModel: Model<PeopleScoutLookupDocument> =
  mongoose.models.PeopleScoutLookup ??
  mongoose.model<PeopleScoutLookupDocument>('PeopleScoutLookup', peopleScoutLookupSchema);
