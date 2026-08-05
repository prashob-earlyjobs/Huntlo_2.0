import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const UTM_CAMPAIGN_STATUSES = ['active', 'archived'] as const;
export type UtmCampaignStatus = (typeof UTM_CAMPAIGN_STATUSES)[number];

export type UtmCampaignDocument = Document & {
  name: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string | null;
  utmTerm: string | null;
  landingPath: string;
  notes: string | null;
  status: UtmCampaignStatus;
  createdBy: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
};

const utmCampaignSchema = new Schema<UtmCampaignDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    utmSource: { type: String, required: true, trim: true, maxlength: 120, index: true },
    utmMedium: { type: String, required: true, trim: true, maxlength: 120, index: true },
    utmCampaign: { type: String, required: true, trim: true, maxlength: 160, index: true },
    utmContent: { type: String, default: null, trim: true, maxlength: 160 },
    utmTerm: { type: String, default: null, trim: true, maxlength: 160 },
    landingPath: { type: String, required: true, trim: true, maxlength: 300, default: '/' },
    notes: { type: String, default: null, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: UTM_CAMPAIGN_STATUSES,
      default: 'active',
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  },
  { timestamps: true }
);

utmCampaignSchema.index(
  { utmSource: 1, utmMedium: 1, utmCampaign: 1 },
  { unique: true }
);
utmCampaignSchema.index({ status: 1, updatedAt: -1 });

export const UtmCampaignModel = (mongoose.models.UtmCampaign ??
  mongoose.model<UtmCampaignDocument>(
    'UtmCampaign',
    utmCampaignSchema
  )) as Model<UtmCampaignDocument>;
