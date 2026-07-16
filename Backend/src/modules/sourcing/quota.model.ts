import mongoose from 'mongoose';

export const QUOTA_RESERVATION_STATUSES = ['reserved', 'committed', 'refunded'] as const;
export type QuotaReservationStatus = (typeof QUOTA_RESERVATION_STATUSES)[number];

const quotaReservationSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SourcingSession',
      required: true,
    },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: QUOTA_RESERVATION_STATUSES,
      required: true,
      default: 'reserved',
    },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const searchQuotaSchema = new mongoose.Schema(
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
    limit: { type: Number, required: true, min: 0 },
    /** Units permanently consumed (committed searches). */
    used: { type: Number, default: 0, min: 0 },
    /** Units held by active reservations. */
    reserved: { type: Number, default: 0, min: 0 },
    reservations: { type: [quotaReservationSchema], default: [] },
  },
  { timestamps: true }
);

searchQuotaSchema.index({ organizationId: 1, periodKey: 1 }, { unique: true });

export type SearchQuotaDocument = mongoose.InferSchemaType<typeof searchQuotaSchema> &
  mongoose.Document & {
    _id: mongoose.Types.ObjectId;
  };

export const SearchQuotaModel = (mongoose.models.SearchQuota ??
  mongoose.model('SearchQuota', searchQuotaSchema)) as mongoose.Model<SearchQuotaDocument>;
