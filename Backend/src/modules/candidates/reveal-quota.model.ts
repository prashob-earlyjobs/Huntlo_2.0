import mongoose from 'mongoose';

export const REVEAL_QUOTA_RESERVATION_STATUSES = ['reserved', 'committed', 'refunded'] as const;
export type RevealQuotaReservationStatus = (typeof REVEAL_QUOTA_RESERVATION_STATUSES)[number];

export const REVEAL_QUOTA_CONTACT_TYPES = ['email', 'mobile'] as const;
export type RevealQuotaContactType = (typeof REVEAL_QUOTA_CONTACT_TYPES)[number];

const revealQuotaReservationSchema = new mongoose.Schema(
  {
    reservationId: { type: String, required: true, trim: true },
    contactType: {
      type: String,
      enum: REVEAL_QUOTA_CONTACT_TYPES,
      required: true,
    },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: REVEAL_QUOTA_RESERVATION_STATUSES,
      required: true,
      default: 'reserved',
    },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const revealQuotaSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    /** Billing period key, e.g. `2026-07`. */
    periodKey: { type: String, required: true, trim: true },
    plan: { type: String, required: true, trim: true },
    emailLimit: { type: Number, required: true, min: 0 },
    mobileLimit: { type: Number, required: true, min: 0 },
    usedEmail: { type: Number, default: 0, min: 0 },
    reservedEmail: { type: Number, default: 0, min: 0 },
    usedMobile: { type: Number, default: 0, min: 0 },
    reservedMobile: { type: Number, default: 0, min: 0 },
    reservations: { type: [revealQuotaReservationSchema], default: [] },
  },
  { timestamps: true }
);

revealQuotaSchema.index({ organizationId: 1, periodKey: 1 }, { unique: true });

export type RevealQuotaDocument = mongoose.InferSchemaType<typeof revealQuotaSchema> &
  mongoose.Document & {
    _id: mongoose.Types.ObjectId;
  };

export const RevealQuotaModel = (mongoose.models.RevealQuota ??
  mongoose.model('RevealQuota', revealQuotaSchema)) as mongoose.Model<RevealQuotaDocument>;
