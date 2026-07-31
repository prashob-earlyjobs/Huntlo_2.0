import mongoose, { type Document, type Model, Schema } from 'mongoose';

export type UtmVisitDocument = Document & {
  sessionId: string;
  visitorId: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  landingPage: string | null;
  referrer: string | null;
  userAgent: string | null;
  dayKey: string;
  createdAt: Date;
  updatedAt: Date;
};

const utmVisitSchema = new Schema<UtmVisitDocument>(
  {
    sessionId: { type: String, required: true, trim: true, maxlength: 120, index: true },
    visitorId: { type: String, default: null, trim: true, maxlength: 120, index: true },
    utmSource: { type: String, default: null, trim: true, maxlength: 120, index: true },
    utmMedium: { type: String, default: null, trim: true, maxlength: 120, index: true },
    utmCampaign: { type: String, default: null, trim: true, maxlength: 160, index: true },
    utmContent: { type: String, default: null, trim: true, maxlength: 160 },
    utmTerm: { type: String, default: null, trim: true, maxlength: 160 },
    landingPage: { type: String, default: null, trim: true, maxlength: 500 },
    referrer: { type: String, default: null, trim: true, maxlength: 1000 },
    userAgent: { type: String, default: null, trim: true, maxlength: 500 },
    dayKey: { type: String, required: true, trim: true, maxlength: 10, index: true },
  },
  { timestamps: true }
);

/** One attributed visit per browser session per calendar day. */
utmVisitSchema.index({ sessionId: 1, dayKey: 1 }, { unique: true });
utmVisitSchema.index({ createdAt: -1 });

export const UtmVisitModel = (mongoose.models.UtmVisit ??
  mongoose.model<UtmVisitDocument>('UtmVisit', utmVisitSchema)) as Model<UtmVisitDocument>;
