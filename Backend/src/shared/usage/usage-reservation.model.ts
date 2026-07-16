import mongoose, { type Document, type Model, Schema } from 'mongoose';

import {
  USAGE_METRICS,
  USAGE_RESERVATION_STATUSES,
  type UsageMetric,
  type UsageReservationStatus,
} from './metrics.js';

export type UsageReservationDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  metric: UsageMetric;
  quantity: number;
  status: UsageReservationStatus;
  expiresAt: Date;
  idempotencyKey: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  periodKey: string;
  userId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
};

const usageReservationSchema = new Schema<UsageReservationDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    metric: { type: String, enum: USAGE_METRICS, required: true, index: true },
    quantity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: USAGE_RESERVATION_STATUSES,
      required: true,
      index: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    idempotencyKey: { type: String, required: true, trim: true },
    relatedEntityType: { type: String, default: null, trim: true },
    relatedEntityId: { type: String, default: null, trim: true },
    periodKey: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

usageReservationSchema.index(
  { organizationId: 1, metric: 1, idempotencyKey: 1 },
  { unique: true }
);
usageReservationSchema.index({ organizationId: 1, status: 1, expiresAt: 1 });

export const UsageReservationModel: Model<UsageReservationDocument> =
  mongoose.models.UsageReservation ??
  mongoose.model<UsageReservationDocument>('UsageReservation', usageReservationSchema);
