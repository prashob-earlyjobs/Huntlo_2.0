import mongoose from 'mongoose';

export const REVEALED_CONTACT_TYPES = ['email', 'mobile'] as const;
export type RevealedContactType = (typeof REVEALED_CONTACT_TYPES)[number];

const revealedContactSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SourcedCandidate',
      required: true,
      index: true,
    },
    externalCandidateId: { type: String, required: true, trim: true },
    contactType: {
      type: String,
      enum: REVEALED_CONTACT_TYPES,
      required: true,
    },
    contactCacheId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CandidateContactCache',
      default: null,
    },
    quotaTransactionId: { type: String, default: null, trim: true },
    revealedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true }
);

revealedContactSchema.index(
  { organizationId: 1, userId: 1, candidateId: 1, contactType: 1 },
  { unique: true }
);
revealedContactSchema.index({ organizationId: 1, externalCandidateId: 1, contactType: 1 });

export type RevealedContactDocument = mongoose.InferSchemaType<typeof revealedContactSchema> &
  mongoose.Document & {
    _id: mongoose.Types.ObjectId;
  };

export const RevealedContactModel = (mongoose.models.RevealedContact ??
  mongoose.model(
    'RevealedContact',
    revealedContactSchema
  )) as mongoose.Model<RevealedContactDocument>;
