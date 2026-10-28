import mongoose from 'mongoose';

const vocallabsCampaignContactSchema = new mongoose.Schema(
  {
    organizationId: { type: String, required: true, trim: true, maxlength: 40 },
    campaignId: { type: String, required: true, trim: true, maxlength: 80 },
    name: { type: String, default: '', trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    email: { type: String, default: '', trim: true, maxlength: 200 },
    data: { type: Map, of: String, default: {} },
    callStatus: { type: String, default: '', trim: true, maxlength: 40 },
    callId: { type: String, default: '', trim: true, maxlength: 80 },
    queueId: { type: String, default: '', trim: true, maxlength: 80 },
    callSummary: { type: String, default: '', maxlength: 8000 },
    callDurationSeconds: { type: Number, default: null },
    callRecordingUrl: { type: String, default: '', maxlength: 500 },
    callAnswers: {
      type: [
        {
          key: { type: String, default: '' },
          value: { type: String, default: '' },
        },
      ],
      default: [],
    },
    callMessages: {
      type: [
        {
          role: { type: String, default: '' },
          content: { type: String, default: '' },
          createdAt: { type: String, default: '' },
        },
      ],
      default: [],
    },
  },
  { timestamps: true, collection: 'vocallabs_campaign_contacts' }
);

vocallabsCampaignContactSchema.index({ organizationId: 1, campaignId: 1, phone: 1 }, { unique: true });

export type VocallabsCampaignContactDocument = mongoose.Document &
  mongoose.InferSchemaType<typeof vocallabsCampaignContactSchema> & {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  };

export const VocallabsCampaignContactModel = (mongoose.models.VocallabsCampaignContact ??
  mongoose.model(
    'VocallabsCampaignContact',
    vocallabsCampaignContactSchema
  )) as mongoose.Model<VocallabsCampaignContactDocument>;
