import mongoose from 'mongoose';

const basicProfileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    headline: { type: String, default: null, trim: true },
    linkedinUrl: { type: String, default: null, trim: true },
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

const sourcedCandidateSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    sourcingSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SourcingSession',
      required: true,
      index: true,
    },
    externalCandidateId: { type: String, required: true, trim: true },
    basicProfile: { type: basicProfileSchema, required: true },
    currentEmployment: { type: currentEmploymentSchema, default: () => ({}) },
    location: { type: String, default: '', trim: true },
    experienceYears: { type: Number, default: null },
    skills: { type: [String], default: [] },
    educationPreview: { type: [mongoose.Schema.Types.Mixed], default: [] },
    profileSignals: { type: [String], default: [] },
    rawProviderReference: { type: mongoose.Schema.Types.Mixed, default: null },
    rank: { type: Number, default: 0, min: 0 },
    matchScore: { type: Number, default: null },
  },
  { timestamps: true }
);

sourcedCandidateSchema.index(
  { sourcingSessionId: 1, externalCandidateId: 1 },
  { unique: true }
);
sourcedCandidateSchema.index({ organizationId: 1, sourcingSessionId: 1, rank: 1 });

export type SourcedCandidateDocument = mongoose.InferSchemaType<typeof sourcedCandidateSchema> &
  mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };

export const SourcedCandidateModel = (mongoose.models.SourcedCandidate ??
  mongoose.model(
    'SourcedCandidate',
    sourcedCandidateSchema
  )) as mongoose.Model<SourcedCandidateDocument>;
