import mongoose from 'mongoose';

const PROFILE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const candidateProfileCacheSchema = new mongoose.Schema(
  {
    externalCandidateId: { type: String, required: true, trim: true },
    provider: { type: String, required: true, default: 'future_jobs', trim: true },
    profileData: { type: mongoose.Schema.Types.Mixed, required: true },
    fetchedAt: { type: Date, required: true, default: () => new Date() },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + PROFILE_CACHE_TTL_MS),
    },
    dataVersion: { type: mongoose.Schema.Types.Mixed, default: 1 },
  },
  { timestamps: true }
);

candidateProfileCacheSchema.index({ provider: 1, externalCandidateId: 1 }, { unique: true });
candidateProfileCacheSchema.index({ expiresAt: 1 });

export const CANDIDATE_PROFILE_CACHE_TTL_MS = PROFILE_CACHE_TTL_MS;

export type CandidateProfileCacheDocument = mongoose.InferSchemaType<
  typeof candidateProfileCacheSchema
> &
  mongoose.Document & {
    _id: mongoose.Types.ObjectId;
  };

export const CandidateProfileCacheModel = (mongoose.models.CandidateProfileCache ??
  mongoose.model(
    'CandidateProfileCache',
    candidateProfileCacheSchema
  )) as mongoose.Model<CandidateProfileCacheDocument>;
