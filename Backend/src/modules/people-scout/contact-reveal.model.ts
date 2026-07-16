import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const PEOPLE_SCOUT_CONTACT_TYPES = ['email', 'mobile'] as const;
export type PeopleScoutContactType = (typeof PEOPLE_SCOUT_CONTACT_TYPES)[number];

export type PeopleScoutContactRevealDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  lookupId: mongoose.Types.ObjectId;
  contactType: PeopleScoutContactType;
  contactCacheId: mongoose.Types.ObjectId | null;
  quotaTransactionId: string | null;
  revealedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

const peopleScoutContactRevealSchema = new Schema<PeopleScoutContactRevealDocument>(
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
      ref: 'PeopleScoutLookup',
      required: true,
      index: true,
    },
    contactType: {
      type: String,
      enum: PEOPLE_SCOUT_CONTACT_TYPES,
      required: true,
    },
    contactCacheId: {
      type: Schema.Types.ObjectId,
      ref: 'CandidateContactCache',
      default: null,
    },
    quotaTransactionId: { type: String, default: null },
    revealedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true }
);

peopleScoutContactRevealSchema.index(
  { organizationId: 1, userId: 1, lookupId: 1, contactType: 1 },
  { unique: true }
);

export const PeopleScoutContactRevealModel: Model<PeopleScoutContactRevealDocument> =
  mongoose.models.PeopleScoutContactReveal ??
  mongoose.model<PeopleScoutContactRevealDocument>(
    'PeopleScoutContactReveal',
    peopleScoutContactRevealSchema
  );
