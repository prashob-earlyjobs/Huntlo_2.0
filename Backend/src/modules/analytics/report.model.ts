import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const REPORT_STATUSES = [
  'pending',
  'running',
  'ready',
  'failed',
  'expired',
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_TYPES = [
  'overview',
  'pipeline',
  'channels',
  'jobs',
  'recruiters',
  'screening',
  'scheduling',
  'usage',
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export type AnalyticsReportDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  name: string;
  type: ReportType;
  status: ReportStatus;
  filters: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error: string | null;
  rowCount: number;
  expiresAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const analyticsReportSchema = new Schema<AnalyticsReportDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    type: { type: String, enum: REPORT_TYPES, required: true },
    status: {
      type: String,
      enum: REPORT_STATUSES,
      default: 'pending',
      index: true,
    },
    filters: { type: Schema.Types.Mixed, default: {} },
    result: { type: Schema.Types.Mixed, default: null },
    error: { type: String, default: null },
    rowCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

analyticsReportSchema.index({ organizationId: 1, createdAt: -1 });

export const AnalyticsReportModel: Model<AnalyticsReportDocument> =
  mongoose.models.AnalyticsReport ??
  mongoose.model<AnalyticsReportDocument>('AnalyticsReport', analyticsReportSchema);
