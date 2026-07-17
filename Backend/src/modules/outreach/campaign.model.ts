import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const CAMPAIGN_STATUSES = [
  'draft',
  'scheduled',
  'running',
  'paused',
  'completed',
  'cancelled',
  'failed',
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const CAMPAIGN_SOURCE_MODULES = ['outreach', 'screening', 'huntlo360'] as const;
export type CampaignSourceModule = (typeof CAMPAIGN_SOURCE_MODULES)[number];

export const CAMPAIGN_TYPES = ['single_channel', 'multi_channel'] as const;
export type CampaignType = (typeof CAMPAIGN_TYPES)[number];

export const SEQUENCE_STEP_TYPES = [
  'email',
  'whatsapp',
  'ai_voice',
  'wait',
  'conditional',
  'recruiter_task',
  'scheduling_link',
] as const;
export type SequenceStepType = (typeof SEQUENCE_STEP_TYPES)[number];

export const DELAY_UNITS = ['days', 'hours', 'minutes'] as const;
export type DelayUnit = (typeof DELAY_UNITS)[number];

export function sequenceDelayToMs(
  amount: number,
  unit: DelayUnit | string | null | undefined
): number {
  const value = Math.max(0, Number(amount) || 0);
  switch (unit) {
    case 'minutes':
      return value * 60 * 1000;
    case 'hours':
      return value * 60 * 60 * 1000;
    case 'days':
    default:
      return value * 24 * 60 * 60 * 1000;
  }
}

export type CampaignSequenceStep = {
  id: string;
  order: number;
  type: SequenceStepType;
  /** Numeric delay amount; interpreted with delayUnit. */
  delayDays: number;
  /** Unit for delayDays. Defaults to days for backward compatibility. */
  delayUnit: 'days' | 'hours' | 'minutes';
  templateId: string | null;
  subject: string | null;
  body: string | null;
  stopOnReply: boolean;
  note: string | null;
  sendWindow: {
    startHour: number;
    endHour: number;
    daysOfWeek: number[];
    timezone: string | null;
  } | null;
  config: Record<string, unknown>;
};

export type CampaignCandidateSource = {
  type: 'candidate_pool' | 'saved_list' | 'manual' | 'job' | 'import';
  listId: string | null;
  jobId: string | null;
  candidateIds: string[];
  label: string | null;
};

export type CampaignChannelConfig = {
  email: {
    enabled: boolean;
    integrationId: string | null;
    senderEmail: string | null;
  };
  whatsapp: {
    enabled: boolean;
    integrationId: string | null;
  };
  ai_voice: {
    enabled: boolean;
    integrationId: string | null;
  };
  timezone: string;
  sendWindow: {
    startHour: number;
    endHour: number;
    daysOfWeek: number[];
  };
};

export type CampaignStats = {
  enrolled: number;
  pending: number;
  active: number;
  sent: number;
  delivered: number;
  replies: number;
  interested: number;
  qualified: number;
  stopped: number;
  failed: number;
  completed: number;
};

export type OutreachCampaignDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  ownerUserId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId | null;
  name: string;
  description: string | null;
  objective: string | null;
  sourceModule: CampaignSourceModule;
  campaignType: CampaignType;
  status: CampaignStatus;
  candidateSource: CampaignCandidateSource;
  channelConfig: CampaignChannelConfig;
  sequenceSteps: CampaignSequenceStep[];
  qualificationConfig: {
    enabled: boolean;
    questions: Array<{
      id: string;
      prompt: string;
      answerType: string;
      knockout?: boolean;
    }>;
    aiReplyEnabled: boolean;
  };
  schedulingConfig: {
    enabled: boolean;
    provider: string | null;
    eventTypeUri: string | null;
    messageTemplateId: string | null;
  };
  stats: CampaignStats;
  scheduledAt: Date | null;
  launchedAt: Date | null;
  pausedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  version: number;
  lastValidation: {
    ok: boolean;
    checkedAt: Date | null;
    issues: Array<{ id: string; severity: 'error' | 'warning'; code: string; message: string }>;
  } | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const sequenceStepSchema = new Schema(
  {
    id: { type: String, required: true },
    order: { type: Number, required: true, min: 0 },
    type: { type: String, enum: SEQUENCE_STEP_TYPES, required: true },
    delayDays: { type: Number, default: 0, min: 0 },
    delayUnit: {
      type: String,
      enum: ['days', 'hours', 'minutes'],
      default: 'days',
    },
    templateId: { type: String, default: null },
    subject: { type: String, default: null, maxlength: 300 },
    body: { type: String, default: null, maxlength: 20000 },
    stopOnReply: { type: Boolean, default: true },
    note: { type: String, default: null, maxlength: 2000 },
    sendWindow: {
      type: new Schema(
        {
          startHour: { type: Number, default: 9 },
          endHour: { type: Number, default: 18 },
          daysOfWeek: { type: [Number], default: [1, 2, 3, 4, 5] },
          timezone: { type: String, default: null },
        },
        { _id: false }
      ),
      default: null,
    },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const defaultChannelConfig = (): CampaignChannelConfig => ({
  email: { enabled: false, integrationId: null, senderEmail: null },
  whatsapp: { enabled: false, integrationId: null },
  ai_voice: { enabled: false, integrationId: null },
  timezone: 'Asia/Kolkata',
  sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
});

const defaultStats = (): CampaignStats => ({
  enrolled: 0,
  pending: 0,
  active: 0,
  sent: 0,
  delivered: 0,
  replies: 0,
  interested: 0,
  qualified: 0,
  stopped: 0,
  failed: 0,
  completed: 0,
});

const outreachCampaignSchema = new Schema<OutreachCampaignDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', default: null, index: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: null, maxlength: 4000 },
    objective: { type: String, default: null, maxlength: 500 },
    sourceModule: {
      type: String,
      enum: CAMPAIGN_SOURCE_MODULES,
      default: 'outreach',
      index: true,
    },
    campaignType: { type: String, enum: CAMPAIGN_TYPES, default: 'multi_channel' },
    status: { type: String, enum: CAMPAIGN_STATUSES, default: 'draft', index: true },
    candidateSource: {
      type: new Schema(
        {
          type: {
            type: String,
            enum: ['candidate_pool', 'saved_list', 'manual', 'job', 'import'],
            default: 'manual',
          },
          listId: { type: String, default: null },
          jobId: { type: String, default: null },
          candidateIds: { type: [String], default: [] },
          label: { type: String, default: null },
        },
        { _id: false }
      ),
      default: () => ({
        type: 'manual',
        listId: null,
        jobId: null,
        candidateIds: [],
        label: null,
      }),
    },
    channelConfig: {
      type: Schema.Types.Mixed,
      default: defaultChannelConfig,
    },
    sequenceSteps: { type: [sequenceStepSchema], default: [] },
    qualificationConfig: {
      type: Schema.Types.Mixed,
      default: () => ({ enabled: false, questions: [], aiReplyEnabled: false }),
    },
    schedulingConfig: {
      type: Schema.Types.Mixed,
      default: () => ({
        enabled: false,
        provider: null,
        eventTypeUri: null,
        messageTemplateId: null,
      }),
    },
    stats: { type: Schema.Types.Mixed, default: defaultStats },
    scheduledAt: { type: Date, default: null },
    launchedAt: { type: Date, default: null },
    pausedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    version: { type: Number, default: 1, min: 1 },
    lastValidation: { type: Schema.Types.Mixed, default: null },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

outreachCampaignSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });
outreachCampaignSchema.index({ organizationId: 1, sourceModule: 1, createdAt: -1 });
outreachCampaignSchema.index({ organizationId: 1, name: 1 });

export const OutreachCampaignModel: Model<OutreachCampaignDocument> =
  mongoose.models.OutreachCampaign ??
  mongoose.model<OutreachCampaignDocument>('OutreachCampaign', outreachCampaignSchema);

export { defaultChannelConfig, defaultStats };
