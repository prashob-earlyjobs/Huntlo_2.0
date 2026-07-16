import mongoose, { type Document, type Model, Schema } from 'mongoose';

import { USAGE_METRICS, type UsageMetric } from './metrics.js';

export type QuotaCounterDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  periodKey: string;
  metric: UsageMetric;
  used: number;
  reserved: number;
  limit: number;
  resetAt: Date;
  allowOverage: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const quotaCounterSchema = new Schema<QuotaCounterDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    periodKey: { type: String, required: true, index: true },
    metric: { type: String, enum: USAGE_METRICS, required: true, index: true },
    used: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    limit: { type: Number, required: true, min: 0 },
    resetAt: { type: Date, required: true },
    allowOverage: { type: Boolean, default: false },
  },
  { timestamps: true }
);

quotaCounterSchema.index(
  { organizationId: 1, periodKey: 1, metric: 1 },
  { unique: true }
);

export const QuotaCounterModel: Model<QuotaCounterDocument> =
  mongoose.models.QuotaCounter ??
  mongoose.model<QuotaCounterDocument>('QuotaCounter', quotaCounterSchema);
