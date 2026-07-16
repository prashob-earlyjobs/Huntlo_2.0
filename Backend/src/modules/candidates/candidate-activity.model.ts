import mongoose from 'mongoose';

export const CANDIDATE_ACTIVITY_ACTIONS = [
  'profile_viewed',
  'enriched',
  'email_revealed',
  'mobile_revealed',
  'bulk_reveal_queued',
  'bulk_reveal_completed',
] as const;

export type CandidateActivityAction = (typeof CANDIDATE_ACTIVITY_ACTIONS)[number] | string;

const candidateActivitySchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SourcedCandidate',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: { type: String, required: true, trim: true, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

candidateActivitySchema.index({ organizationId: 1, candidateId: 1, createdAt: -1 });

export type CandidateActivityDocument = mongoose.InferSchemaType<typeof candidateActivitySchema> &
  mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    createdAt?: Date;
  };

export const CandidateActivityModel = (mongoose.models.CandidateActivity ??
  mongoose.model(
    'CandidateActivity',
    candidateActivitySchema
  )) as mongoose.Model<CandidateActivityDocument>;
