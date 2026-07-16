import mongoose from 'mongoose';

export const LIST_VISIBILITIES = ['private', 'team', 'organization'] as const;
export type ListVisibility = (typeof LIST_VISIBILITIES)[number];

const candidateListSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: null, trim: true, maxlength: 2000 },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null,
      index: true,
    },
    visibility: {
      type: String,
      enum: LIST_VISIBILITIES,
      default: 'team',
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tags: { type: [String], default: [] },
    candidateCount: { type: Number, default: 0, min: 0 },
    archivedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

candidateListSchema.index(
  { organizationId: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  }
);
candidateListSchema.index({ organizationId: 1, ownerUserId: 1 });
candidateListSchema.index({ organizationId: 1, archivedAt: 1 });

export type CandidateListDocument = mongoose.InferSchemaType<typeof candidateListSchema> &
  mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };

export const CandidateListModel = (mongoose.models.CandidateList ??
  mongoose.model('CandidateList', candidateListSchema)) as mongoose.Model<CandidateListDocument>;
