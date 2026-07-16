import mongoose, { type Document, type Model, Schema } from 'mongoose';

export type CampaignActivityDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  enrollmentId: mongoose.Types.ObjectId | null;
  actorUserId: mongoose.Types.ObjectId | null;
  type: string;
  title: string;
  detail: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
};

const campaignActivitySchema = new Schema<CampaignActivityDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    campaignId: { type: Schema.Types.ObjectId, required: true, index: true },
    enrollmentId: { type: Schema.Types.ObjectId, default: null },
    actorUserId: { type: Schema.Types.ObjectId, default: null },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    detail: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

campaignActivitySchema.index({ campaignId: 1, createdAt: -1 });

export const CampaignActivityModel: Model<CampaignActivityDocument> =
  mongoose.models.CampaignActivity ??
  mongoose.model<CampaignActivityDocument>('CampaignActivity', campaignActivitySchema);

export async function recordCampaignActivity(input: {
  organizationId: string;
  campaignId: string;
  enrollmentId?: string | null;
  actorUserId?: string | null;
  type: string;
  title: string;
  detail?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await CampaignActivityModel.create({
    organizationId: input.organizationId,
    campaignId: input.campaignId,
    enrollmentId: input.enrollmentId ?? null,
    actorUserId: input.actorUserId ?? null,
    type: input.type,
    title: input.title,
    detail: input.detail ?? null,
    metadata: input.metadata ?? {},
  });
}
