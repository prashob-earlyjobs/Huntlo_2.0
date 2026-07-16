import mongoose, { type Document, type Model, Schema } from 'mongoose';

import {
  USAGE_LEDGER_ACTIONS,
  USAGE_LEDGER_STATUSES,
  USAGE_METRICS,
  type UsageLedgerAction,
  type UsageLedgerStatus,
  type UsageMetric,
} from './metrics.js';

export type UsageLedgerDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId | null;
  metric: UsageMetric;
  quantity: number;
  action: UsageLedgerAction;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  status: UsageLedgerStatus;
  idempotencyKey: string | null;
  metadata: Record<string, unknown>;
  periodKey: string;
  createdAt: Date;
  updatedAt: Date;
};

const usageLedgerSchema = new Schema<UsageLedgerDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    metric: { type: String, enum: USAGE_METRICS, required: true, index: true },
    quantity: { type: Number, required: true },
    action: { type: String, enum: USAGE_LEDGER_ACTIONS, required: true },
    relatedEntityType: { type: String, default: null, trim: true },
    relatedEntityId: { type: String, default: null, trim: true },
    status: {
      type: String,
      enum: USAGE_LEDGER_STATUSES,
      required: true,
      index: true,
    },
    idempotencyKey: { type: String, default: null, trim: true, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    periodKey: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

usageLedgerSchema.index({ organizationId: 1, createdAt: -1 });
usageLedgerSchema.index({ organizationId: 1, metric: 1, createdAt: -1 });
usageLedgerSchema.index(
  { organizationId: 1, idempotencyKey: 1, action: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: 'string' } },
  }
);

export const UsageLedgerModel: Model<UsageLedgerDocument> =
  mongoose.models.UsageLedger ??
  mongoose.model<UsageLedgerDocument>('UsageLedger', usageLedgerSchema);
