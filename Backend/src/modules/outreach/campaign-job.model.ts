import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const CAMPAIGN_JOB_TYPES = [
  'send_email',
  'send_whatsapp',
  'launch_voice',
  'wait',
  'evaluate_conditional',
  'create_recruiter_task',
  'send_scheduling_link',
  'advance_sequence',
] as const;
export type CampaignJobType = (typeof CAMPAIGN_JOB_TYPES)[number];

export const CAMPAIGN_JOB_STATUSES = [
  'queued',
  /** Isolated queue: legacy workers only poll `queued`, so they cannot steal these jobs. */
  'queued_v2',
  'leased',
  'running',
  'succeeded',
  'failed',
  'cancelled',
  'dead',
] as const;
export type CampaignJobStatus = (typeof CAMPAIGN_JOB_STATUSES)[number];

/** Status used for new/retryable campaign jobs (ignored by pre-v2 workers). */
export const OUTREACH_QUEUE_STATUS = 'queued_v2' as const;

export type CampaignJobDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  enrollmentId: mongoose.Types.ObjectId;
  stepId: string;
  jobType: CampaignJobType;
  scheduledAt: Date;
  status: CampaignJobStatus;
  attempts: number;
  leaseOwner: string | null;
  leaseExpiresAt: Date | null;
  error: string | null;
  result: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
};

const campaignJobSchema = new Schema<CampaignJobDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'OutreachCampaign',
      required: true,
      index: true,
    },
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: 'OutreachEnrollment',
      required: true,
      index: true,
    },
    stepId: { type: String, required: true },
    jobType: { type: String, enum: CAMPAIGN_JOB_TYPES, required: true },
    scheduledAt: { type: Date, required: true, index: true },
    status: { type: String, enum: CAMPAIGN_JOB_STATUSES, default: 'queued', index: true },
    attempts: { type: Number, default: 0, min: 0 },
    leaseOwner: { type: String, default: null },
    leaseExpiresAt: { type: Date, default: null },
    error: { type: String, default: null },
    result: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

campaignJobSchema.index({ status: 1, scheduledAt: 1 });
campaignJobSchema.index(
  { campaignId: 1, enrollmentId: 1, stepId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['queued', 'queued_v2', 'leased', 'running'] },
    },
  }
);

export const CampaignJobModel: Model<CampaignJobDocument> =
  mongoose.models.CampaignJob ??
  mongoose.model<CampaignJobDocument>('CampaignJob', campaignJobSchema);
