import mongoose, { type Document, type Model, Schema } from 'mongoose';

export type PlanHistoryDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  planIdBefore: mongoose.Types.ObjectId | null;
  planIdAfter: mongoose.Types.ObjectId;
  planCodeBefore: string | null;
  planCodeAfter: string;
  performedBy: mongoose.Types.ObjectId | null;
  paymentOrderId: mongoose.Types.ObjectId | null;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const planHistorySchema = new Schema<PlanHistoryDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planIdBefore: { type: Schema.Types.ObjectId, ref: 'PricingPlan', default: null },
    planIdAfter: { type: Schema.Types.ObjectId, ref: 'PricingPlan', required: true },
    planCodeBefore: { type: String, default: null, trim: true },
    planCodeAfter: { type: String, required: true, trim: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    paymentOrderId: { type: Schema.Types.ObjectId, ref: 'PaymentOrder', default: null },
    reason: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

planHistorySchema.index({ organizationId: 1, createdAt: -1 });

export const PlanHistoryModel: Model<PlanHistoryDocument> =
  mongoose.models.PlanHistory ??
  mongoose.model<PlanHistoryDocument>('PlanHistory', planHistorySchema);
