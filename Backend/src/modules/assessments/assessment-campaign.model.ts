import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const CAMPAIGN_STATUSES = [
  'draft',
  'scheduled',
  'running',
  'completed',
  'cancelled',
  'failed',
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export type InvitationConfig = {
  channel: 'email' | 'whatsapp';
  subject?: string | null;
  message?: string | null;
  sendImmediately: boolean;
};

export type ReminderConfig = {
  enabled: boolean;
  /** Hours after invite before each reminder. */
  intervalsHours: number[];
  maxReminders: number;
  channel?: 'email' | 'whatsapp' | null;
};

export type AssessmentCampaignStats = {
  enrolled: number;
  invited: number;
  started: number;
  completed: number;
  expired: number;
  cancelled: number;
  passed: number;
  failed: number;
  averageScore: number | null;
};

export function defaultCampaignStats(): AssessmentCampaignStats {
  return {
    enrolled: 0,
    invited: 0,
    started: 0,
    completed: 0,
    expired: 0,
    cancelled: 0,
    passed: 0,
    failed: 0,
    averageScore: null,
  };
}

export type AssessmentCampaignDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId | null;
  ownerUserId: mongoose.Types.ObjectId;
  workflowId: mongoose.Types.ObjectId | null;
  sourceModule: string;
  name: string;
  candidateIds: string[];
  status: CampaignStatus;
  invitationConfig: InvitationConfig;
  reminderConfig: ReminderConfig;
  expiresAt: Date | null;
  providerAssessmentId: string | null;
  stats: AssessmentCampaignStats;
  launchedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  deletedAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

const assessmentCampaignSchema = new Schema<AssessmentCampaignDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'AssessmentTemplate',
      required: true,
      index: true,
    },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', default: null, index: true },
    ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workflowId: { type: Schema.Types.ObjectId, ref: 'Huntlo360Workflow', default: null },
    sourceModule: { type: String, default: 'assessments', index: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    candidateIds: { type: [String], default: [] },
    status: {
      type: String,
      enum: CAMPAIGN_STATUSES,
      default: 'draft',
      index: true,
    },
    invitationConfig: {
      type: {
        channel: { type: String, enum: ['email', 'whatsapp'], default: 'email' },
        subject: { type: String, default: null },
        message: { type: String, default: null },
        sendImmediately: { type: Boolean, default: true },
      },
      default: () => ({
        channel: 'email',
        subject: null,
        message: null,
        sendImmediately: true,
      }),
    },
    reminderConfig: {
      type: {
        enabled: { type: Boolean, default: true },
        intervalsHours: { type: [Number], default: [24, 72] },
        maxReminders: { type: Number, default: 2 },
        channel: { type: String, enum: ['email', 'whatsapp', null], default: null },
      },
      default: () => ({
        enabled: true,
        intervalsHours: [24, 72],
        maxReminders: 2,
        channel: null,
      }),
    },
    expiresAt: { type: Date, default: null, index: true },
    providerAssessmentId: { type: String, default: null },
    stats: {
      type: {
        enrolled: { type: Number, default: 0 },
        invited: { type: Number, default: 0 },
        started: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        expired: { type: Number, default: 0 },
        cancelled: { type: Number, default: 0 },
        passed: { type: Number, default: 0 },
        failed: { type: Number, default: 0 },
        averageScore: { type: Number, default: null },
      },
      default: () => defaultCampaignStats(),
    },
    launchedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null, index: true },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

assessmentCampaignSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });
assessmentCampaignSchema.index({ organizationId: 1, templateId: 1 });
assessmentCampaignSchema.index({ organizationId: 1, workflowId: 1 });

export const AssessmentCampaignModel = (mongoose.models.AssessmentCampaign ??
  mongoose.model<AssessmentCampaignDocument>(
    'AssessmentCampaign',
    assessmentCampaignSchema
  )) as Model<AssessmentCampaignDocument>;
