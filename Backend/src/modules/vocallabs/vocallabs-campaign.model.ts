import mongoose from 'mongoose';

const vocallabsCampaignSchema = new mongoose.Schema(
  {
    organizationId: { type: String, required: true, trim: true, maxlength: 40, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    campaignId: { type: String, required: true, trim: true, maxlength: 80 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    agentId: { type: String, required: true, trim: true, maxlength: 80 },
    contactGroupId: { type: String, default: '', trim: true, maxlength: 80 },
    contactGroupName: { type: String, default: '', trim: true, maxlength: 120 },
  },
  { timestamps: true, collection: 'vocallabs_campaigns' }
);

vocallabsCampaignSchema.index({ campaignId: 1 }, { unique: true });
vocallabsCampaignSchema.index({ organizationId: 1, createdAt: -1 });

export type VocallabsCampaignDocument = mongoose.Document &
  mongoose.InferSchemaType<typeof vocallabsCampaignSchema> & {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  };

export const VocallabsCampaignModel = (mongoose.models.VocallabsCampaign ??
  mongoose.model(
    'VocallabsCampaign',
    vocallabsCampaignSchema
  )) as mongoose.Model<VocallabsCampaignDocument>;
