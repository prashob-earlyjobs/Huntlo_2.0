import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const UTM_EVENT_TYPES = [
  'signup',
  'demo_clicked',
  'conversion',
] as const;
export type UtmEventType = (typeof UTM_EVENT_TYPES)[number];

export type UtmEventDocument = Document & {
  eventType: UtmEventType;
  sessionId: string | null;
  visitorId: string | null;
  userId: mongoose.Types.ObjectId | null;
  organizationId: mongoose.Types.ObjectId | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  landingPage: string | null;
  referrer: string | null;
  userAgent: string | null;
  meta: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
};

const utmEventSchema = new Schema<UtmEventDocument>(
  {
    eventType: {
      type: String,
      enum: UTM_EVENT_TYPES,
      required: true,
      index: true,
    },
    sessionId: { type: String, default: null, trim: true, maxlength: 120, index: true },
    visitorId: { type: String, default: null, trim: true, maxlength: 120, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    utmSource: { type: String, default: null, trim: true, maxlength: 120, index: true },
    utmMedium: { type: String, default: null, trim: true, maxlength: 120, index: true },
    utmCampaign: { type: String, default: null, trim: true, maxlength: 160, index: true },
    utmContent: { type: String, default: null, trim: true, maxlength: 160 },
    utmTerm: { type: String, default: null, trim: true, maxlength: 160 },
    landingPage: { type: String, default: null, trim: true, maxlength: 500 },
    referrer: { type: String, default: null, trim: true, maxlength: 1000 },
    userAgent: { type: String, default: null, trim: true, maxlength: 500 },
    meta: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

utmEventSchema.index({ eventType: 1, createdAt: -1 });
utmEventSchema.index({ createdAt: -1 });

export const UtmEventModel = (mongoose.models.UtmEvent ??
  mongoose.model<UtmEventDocument>('UtmEvent', utmEventSchema)) as Model<UtmEventDocument>;
