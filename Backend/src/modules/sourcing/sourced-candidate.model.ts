import mongoose from 'mongoose';

const basicProfileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    headline: { type: String, default: null, trim: true },
    linkedinUrl: { type: String, default: null, trim: true },
    profilePictureUrl: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const currentEmploymentSchema = new mongoose.Schema(
  {
    title: { type: String, default: null, trim: true },
    company: { type: String, default: null, trim: true },
  },
  { _id: false }
);

/**
 * SourcedCandidateDetail — persisted Future Jobs profiles for a sourcing session.
 * Collection name remains SourcedCandidate for backward compatibility.
 */
const sourcedCandidateSchema = new mongoose.Schema(
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
      default: null,
      index: true,
    },
    sourcingSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SourcingSession',
      required: true,
      index: true,
    },
    futureJobsSessionId: { type: String, default: null, trim: true, index: true },
    /** Future Jobs candidate id (canonical). */
    candidateId: { type: String, default: null, trim: true },
    /** Legacy alias for candidateId. */
    externalCandidateId: { type: String, required: true, trim: true },
    linkedinProfileUrl: { type: String, default: null, trim: true },
    linkedinUrlNormalized: { type: String, default: null, trim: true },
    profilePictureUrl: { type: String, default: null, trim: true },
    name: { type: String, default: '', trim: true },
    firstName: { type: String, default: null, trim: true },
    lastName: { type: String, default: null, trim: true },
    currentRole: { type: String, default: null, trim: true },
    currentCompany: { type: String, default: null, trim: true },
    basicProfile: { type: basicProfileSchema, required: true },
    currentEmployment: { type: currentEmploymentSchema, default: () => ({}) },
    location: { type: String, default: '', trim: true },
    experienceYears: { type: Number, default: null },
    skills: { type: [String], default: [] },
    educationPreview: { type: [mongoose.Schema.Types.Mixed], default: [] },
    finalScore: { type: Number, default: null },
    candidateSummary: { type: String, default: null, trim: true },
    contactStatus: { type: String, default: 'Not contacted', trim: true },
    profileSignals: { type: [String], default: [] },
    mappedCandidate: { type: mongoose.Schema.Types.Mixed, default: null },
    rawDoc: { type: mongoose.Schema.Types.Mixed, default: null },
    rawProviderReference: { type: mongoose.Schema.Types.Mixed, default: null },
    rank: { type: Number, default: 0, min: 0 },
    matchScore: { type: Number, default: null },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

sourcedCandidateSchema.index(
  { sourcingSessionId: 1, externalCandidateId: 1 },
  { unique: true }
);
sourcedCandidateSchema.index(
  { organizationId: 1, sourcingSessionId: 1, candidateId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      candidateId: { $type: 'string', $gt: '' },
    },
  }
);
sourcedCandidateSchema.index(
  { organizationId: 1, sourcingSessionId: 1, linkedinUrlNormalized: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      linkedinUrlNormalized: { $type: 'string', $gt: '' },
    },
  }
);
sourcedCandidateSchema.index({ organizationId: 1, sourcingSessionId: 1, rank: 1 });
sourcedCandidateSchema.index({ organizationId: 1, name: 'text', currentRole: 'text', currentCompany: 'text' });

sourcedCandidateSchema.pre('validate', function syncAliases(next) {
  const doc = this as mongoose.Document & {
    candidateId?: string | null;
    externalCandidateId?: string;
    name?: string;
    basicProfile?: { name?: string; linkedinUrl?: string | null };
    currentRole?: string | null;
    currentCompany?: string | null;
    currentEmployment?: { title?: string | null; company?: string | null };
    linkedinProfileUrl?: string | null;
    linkedinUrlNormalized?: string | null;
    matchScore?: number | null;
    finalScore?: number | null;
  };

  if (!doc.candidateId && doc.externalCandidateId) {
    doc.candidateId = doc.externalCandidateId;
  }
  if (!doc.externalCandidateId && doc.candidateId) {
    doc.externalCandidateId = doc.candidateId;
  }

  if (!doc.name && doc.basicProfile?.name) doc.name = doc.basicProfile.name;
  if (doc.name && doc.basicProfile && !doc.basicProfile.name) {
    doc.basicProfile.name = doc.name;
  }

  if (!doc.currentRole && doc.currentEmployment?.title) {
    doc.currentRole = doc.currentEmployment.title;
  }
  if (!doc.currentCompany && doc.currentEmployment?.company) {
    doc.currentCompany = doc.currentEmployment.company;
  }

  if (!doc.linkedinProfileUrl && doc.basicProfile?.linkedinUrl) {
    doc.linkedinProfileUrl = doc.basicProfile.linkedinUrl;
  }

  if (doc.finalScore == null && doc.matchScore != null) doc.finalScore = doc.matchScore;
  if (doc.matchScore == null && doc.finalScore != null) doc.matchScore = doc.finalScore;

  next();
});

export type SourcedCandidateDocument = mongoose.InferSchemaType<typeof sourcedCandidateSchema> &
  mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };

/** Alias matching the product name SourcedCandidateDetail. */
export type SourcedCandidateDetailDocument = SourcedCandidateDocument;

export const SourcedCandidateModel = (mongoose.models.SourcedCandidate ??
  mongoose.model(
    'SourcedCandidate',
    sourcedCandidateSchema
  )) as mongoose.Model<SourcedCandidateDocument>;

export const SourcedCandidateDetailModel = SourcedCandidateModel;
