import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const EASY_SCOUT_CONTACT_TYPES = ['email', 'mobile'] as const;
export type EasyScoutContactType = (typeof EASY_SCOUT_CONTACT_TYPES)[number];

export type EasyScoutContactRevealDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  lookupId: mongoose.Types.ObjectId;
  contactType: EasyScoutContactType;
  quotaTransactionId: string | null;
  revealedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

const easyScoutContactRevealSchema = new Schema<EasyScoutContactRevealDocument>(
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
    lookupId: {
      type: Schema.Types.ObjectId,
      ref: 'EasyScoutLookup',
      required: true,
      index: true,
    },
    contactType: {
      type: String,
      enum: EASY_SCOUT_CONTACT_TYPES,
      required: true,
    },
    quotaTransactionId: { type: String, default: null },
    revealedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true }
);

easyScoutContactRevealSchema.index(
  { organizationId: 1, userId: 1, lookupId: 1, contactType: 1 },
  { unique: true }
);

export const EasyScoutContactRevealModel: Model<EasyScoutContactRevealDocument> =
  mongoose.models.EasyScoutContactReveal ??
  mongoose.model<EasyScoutContactRevealDocument>(
    'EasyScoutContactReveal',
    easyScoutContactRevealSchema
  );
