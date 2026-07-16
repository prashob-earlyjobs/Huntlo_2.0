import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const WORKFLOW_STATUSES = [
  'draft',
  'running',
  'paused',
  'completed',
  'cancelled',
  'failed',
] as const;
export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

export type Huntlo360StageStats = {
  enrolled: number;
  outreach: number;
  qualification: number;
  screening: number;
  recruiter_review: number;
  scheduling: number;
  completed: number;
  stopped: number;
  exceptions: number;
};

export type Huntlo360WorkflowDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId | null;
  ownerUserId: mongoose.Types.ObjectId;
  name: string;
  status: WorkflowStatus;
  campaignId: mongoose.Types.ObjectId | null;
  qualificationConfig: {
    enabled: boolean;
    interestClassification: boolean;
    questions: Array<{
      id: string;
      prompt: string;
      answerType: string;
      knockout?: boolean;
    }>;
    aiReplyEnabled: boolean;
    handoffCondition: string | null;
    autoShortlist: string | null;
  };
  screeningConfig: {
    enabled: boolean;
    language: string | null;
    voiceTone: string | null;
    questions: string[];
    evaluationFields: string[];
    attempts: number;
    attemptIntervalHours: number;
    minScore: number;
    autoReject: boolean;
    /** After screening pass: recruiter_review | scheduling */
    onPass: 'recruiter_review' | 'scheduling';
    /** After screening fail: stop | recruiter_review */
    onFail: 'stop' | 'recruiter_review';
  };
  assessmentConfig: {
    enabled: boolean;
    templateId: string | null;
    channel: 'email' | 'whatsapp';
    expiryHours: number;
    /** After assessment pass: recruiter_review | scheduling */
    onPass: 'recruiter_review' | 'scheduling';
    /** After assessment fail: stop | recruiter_review */
    onFail: 'stop' | 'recruiter_review';
  };
  schedulingConfig: {
    enabled: boolean;
    provider: string | null;
    eventTypeUri: string | null;
    channel: 'email' | 'whatsapp';
    messageTemplateId: string | null;
    reminders: string | null;
    autoSendAfterQualification: boolean;
    autoSendAfterScreening: boolean;
    bookingExpiryHours: number;
  };
  outreachConfig: {
    emailEnabled: boolean;
    whatsappEnabled: boolean;
    channelOrder: 'email_first' | 'whatsapp_first';
    openingMessage: string | null;
    followUps: string[];
    stopOnReply: boolean;
    stopOnOptOut: boolean;
  };
  candidateSource: {
    type: string;
    listId: string | null;
    candidateIds: string[];
    label: string | null;
  };
  stageStats: Huntlo360StageStats;
  lastValidation: {
    ok: boolean;
    checkedAt: Date | null;
    issues: Array<{ id: string; severity: string; code: string; message: string }>;
  } | null;
  launchedAt: Date | null;
  pausedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  deletedAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

export function defaultStageStats(): Huntlo360StageStats {
  return {
    enrolled: 0,
    outreach: 0,
    qualification: 0,
    screening: 0,
    recruiter_review: 0,
    scheduling: 0,
    completed: 0,
    stopped: 0,
    exceptions: 0,
  };
}

const huntlo360WorkflowSchema = new Schema<Huntlo360WorkflowDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', default: null, index: true },
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    status: { type: String, enum: WORKFLOW_STATUSES, default: 'draft', index: true },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'OutreachCampaign',
      default: null,
      index: true,
    },
    qualificationConfig: {
      type: new Schema(
        {
          enabled: { type: Boolean, default: true },
          interestClassification: { type: Boolean, default: true },
          questions: { type: [Schema.Types.Mixed], default: [] },
          aiReplyEnabled: { type: Boolean, default: true },
          handoffCondition: { type: String, default: null },
          autoShortlist: { type: String, default: null },
        },
        { _id: false }
      ),
      default: () => ({
        enabled: true,
        interestClassification: true,
        questions: [],
        aiReplyEnabled: true,
        handoffCondition: null,
        autoShortlist: null,
      }),
    },
    screeningConfig: {
      type: new Schema(
        {
          enabled: { type: Boolean, default: false },
          language: { type: String, default: null },
          voiceTone: { type: String, default: null },
          questions: { type: [String], default: [] },
          evaluationFields: { type: [String], default: [] },
          attempts: { type: Number, default: 2 },
          attemptIntervalHours: { type: Number, default: 24 },
          minScore: { type: Number, default: 70 },
          autoReject: { type: Boolean, default: false },
          onPass: {
            type: String,
            enum: ['recruiter_review', 'scheduling'],
            default: 'recruiter_review',
          },
          onFail: {
            type: String,
            enum: ['stop', 'recruiter_review'],
            default: 'recruiter_review',
          },
        },
        { _id: false }
      ),
      default: () => ({
        enabled: false,
        language: null,
        voiceTone: null,
        questions: [],
        evaluationFields: [],
        attempts: 2,
        attemptIntervalHours: 24,
        minScore: 70,
        autoReject: false,
        onPass: 'recruiter_review',
        onFail: 'recruiter_review',
      }),
    },
    assessmentConfig: {
      type: new Schema(
        {
          enabled: { type: Boolean, default: false },
          templateId: { type: String, default: null },
          channel: { type: String, enum: ['email', 'whatsapp'], default: 'email' },
          expiryHours: { type: Number, default: 168 },
          onPass: {
            type: String,
            enum: ['recruiter_review', 'scheduling'],
            default: 'recruiter_review',
          },
          onFail: {
            type: String,
            enum: ['stop', 'recruiter_review'],
            default: 'recruiter_review',
          },
        },
        { _id: false }
      ),
      default: () => ({
        enabled: false,
        templateId: null,
        channel: 'email',
        expiryHours: 168,
        onPass: 'recruiter_review',
        onFail: 'recruiter_review',
      }),
    },
    schedulingConfig: {
      type: new Schema(
        {
          enabled: { type: Boolean, default: false },
          provider: { type: String, default: 'calendly' },
          eventTypeUri: { type: String, default: null },
          channel: { type: String, enum: ['email', 'whatsapp'], default: 'email' },
          messageTemplateId: { type: String, default: null },
          reminders: { type: String, default: null },
          autoSendAfterQualification: { type: Boolean, default: false },
          autoSendAfterScreening: { type: Boolean, default: true },
          bookingExpiryHours: { type: Number, default: 72 },
        },
        { _id: false }
      ),
      default: () => ({
        enabled: false,
        provider: 'calendly',
        eventTypeUri: null,
        channel: 'email',
        messageTemplateId: null,
        reminders: null,
        autoSendAfterQualification: false,
        autoSendAfterScreening: true,
        bookingExpiryHours: 72,
      }),
    },
    outreachConfig: {
      type: new Schema(
        {
          emailEnabled: { type: Boolean, default: true },
          whatsappEnabled: { type: Boolean, default: false },
          channelOrder: {
            type: String,
            enum: ['email_first', 'whatsapp_first'],
            default: 'email_first',
          },
          openingMessage: { type: String, default: null },
          followUps: { type: [String], default: [] },
          stopOnReply: { type: Boolean, default: true },
          stopOnOptOut: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: () => ({
        emailEnabled: true,
        whatsappEnabled: false,
        channelOrder: 'email_first',
        openingMessage: null,
        followUps: [],
        stopOnReply: true,
        stopOnOptOut: true,
      }),
    },
    candidateSource: {
      type: new Schema(
        {
          type: { type: String, default: 'manual' },
          listId: { type: String, default: null },
          candidateIds: { type: [String], default: [] },
          label: { type: String, default: null },
        },
        { _id: false }
      ),
      default: () => ({ type: 'manual', listId: null, candidateIds: [], label: null }),
    },
    stageStats: {
      type: new Schema(
        {
          enrolled: { type: Number, default: 0 },
          outreach: { type: Number, default: 0 },
          qualification: { type: Number, default: 0 },
          screening: { type: Number, default: 0 },
          recruiter_review: { type: Number, default: 0 },
          scheduling: { type: Number, default: 0 },
          completed: { type: Number, default: 0 },
          stopped: { type: Number, default: 0 },
          exceptions: { type: Number, default: 0 },
        },
        { _id: false }
      ),
      default: defaultStageStats,
    },
    lastValidation: { type: Schema.Types.Mixed, default: null },
    launchedAt: { type: Date, default: null },
    pausedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

huntlo360WorkflowSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });
huntlo360WorkflowSchema.index({ organizationId: 1, campaignId: 1 });

export const Huntlo360WorkflowModel = (mongoose.models.Huntlo360Workflow ??
  mongoose.model<Huntlo360WorkflowDocument>(
    'Huntlo360Workflow',
    huntlo360WorkflowSchema
  )) as Model<Huntlo360WorkflowDocument>;
