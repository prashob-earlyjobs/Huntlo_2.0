import mongoose from 'mongoose';

export const NOTE_VISIBILITIES = ['private', 'team'] as const;
export type NoteVisibility = (typeof NOTE_VISIBILITIES)[number];

const candidateNoteSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SavedCandidate',
      required: true,
      index: true,
    },
    authorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    body: { type: String, required: true, trim: true, maxlength: 10_000 },
    visibility: {
      type: String,
      enum: NOTE_VISIBILITIES,
      default: 'team',
    },
  },
  { timestamps: true }
);

candidateNoteSchema.index({ organizationId: 1, candidateId: 1, createdAt: -1 });

export type CandidateNoteDocument = mongoose.InferSchemaType<typeof candidateNoteSchema> &
  mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };

export const CandidateNoteModel = (mongoose.models.CandidateNote ??
  mongoose.model('CandidateNote', candidateNoteSchema)) as mongoose.Model<CandidateNoteDocument>;
