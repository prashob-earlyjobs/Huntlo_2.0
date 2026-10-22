import mongoose from 'mongoose';

const pendingPhoneRevealSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    externalCandidateId: { type: String, default: '', trim: true },
    /** FutureJobs profile id echoed on contact.reveal.completed. */
    profileId: { type: String, default: '', trim: true },
    linkedinUrlKey: { type: String, required: true, trim: true, index: true },
    sourcingSessionId: { type: String, default: '', trim: true },
    reservationId: { type: String, required: true, trim: true },
    /** People Scout lookup id, when the unlock started there. */
    lookupId: { type: String, default: null, trim: true },
    /** Phone numbers from a REVEALED webhook, so the open card can finish without the socket. */
    values: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['pending', 'settling', 'completed', 'missing'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

pendingPhoneRevealSchema.index({ profileId: 1, status: 1 });
pendingPhoneRevealSchema.index({ linkedinUrlKey: 1, status: 1 });
pendingPhoneRevealSchema.index({
  organizationId: 1,
  userId: 1,
  candidateId: 1,
  status: 1,
});

export type PendingPhoneRevealDocument = mongoose.InferSchemaType<
  typeof pendingPhoneRevealSchema
> &
  mongoose.Document & { _id: mongoose.Types.ObjectId };

export const PendingPhoneRevealModel = (mongoose.models.PendingPhoneReveal ??
  mongoose.model(
    'PendingPhoneReveal',
    pendingPhoneRevealSchema
  )) as mongoose.Model<PendingPhoneRevealDocument>;
