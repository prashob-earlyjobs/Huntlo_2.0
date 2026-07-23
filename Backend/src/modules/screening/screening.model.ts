import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const SCREENING_STATUSES = [
  'draft',
  'scheduled',
  'running',
  'paused',
  'completed',
  'cancelled',
  'failed',
] as const;
export type ScreeningStatus = (typeof SCREENING_STATUSES)[number];

export type ScreeningQuestion = {
  id: string;
  prompt: string;
  /** Builder category label (Introduction, Experience, Skills, …). */
  type?: string | null;
  required?: boolean;
  /** Probe guidance for the voice agent — not read aloud as a scripted line. */
  followUp?: string | null;
  /** Scorecard / result-field key (e.g. notice_period). */
  expectedVariable?: string | null;
  /** When true, answer feeds evaluationCriteria at launch. */
  evaluationEnabled?: boolean;
  knockout?: boolean;
};

export type EvaluationCriterion = {
  id: string;
  label: string;
  weight: number;
  description?: string | null;
};

export type ScreeningCallSettings = {
  maxAttempts: number;
  attemptIntervalHours: number;
  maxRetryCount: number;
  retryIntervalHours: number;
  consentRequired: boolean;
  /** Human-readable dial window, e.g. "10 AM – 7 PM". */
  callWindow: string;
  timezone: string;
  voicemailBehaviour: string;
};

export type ScreeningStats = {
  enrolled: number;
  queued: number;
  inProgress: number;
  completed: number;
  noAnswer: number;
  failed: number;
  shortlisted: number;
  rejected: number;
  averageScore: number | null;
};

export function defaultScreeningStats(): ScreeningStats {
  return {
    enrolled: 0,
    queued: 0,
    inProgress: 0,
    completed: 0,
    noAnswer: 0,
    failed: 0,
    shortlisted: 0,
    rejected: 0,
    averageScore: null,
  };
}

export type ScreeningDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  ownerUserId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId | null;
  campaignId: mongoose.Types.ObjectId | null;
  workflowId: mongoose.Types.ObjectId | null;
  sourceModule: string;
  name: string;
  description: string | null;
  objective: string | null;
  language: string | null;
  voice: string | null;
  tone: string | null;
  introductionScript: string | null;
  agentPrompt: string | null;
  closingScript: string | null;
  consentText: string | null;
  questions: ScreeningQuestion[];
  evaluationCriteria: EvaluationCriterion[];
  /** Minimum overall score (0–100) for an AI Shortlist recommendation. */
  minShortlistScore: number;
  /** Human-readable knockout rules; a match forces Reject regardless of score. */
  knockouts: string[];
  callSettings: ScreeningCallSettings;
  candidateIds: string[];
  providerAgentId: string | null;
  status: ScreeningStatus;
  stats: ScreeningStats;
  lastLaunchRequestId: string | null;
  lastValidation: {
    ok: boolean;
    checkedAt: Date | null;
    issues: Array<{ id: string; severity: string; code: string; message: string }>;
  } | null;
  launchedAt: Date | null;
  pausedAt: Date | null;
  completedAt: Date | null;
  deletedAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

const screeningSchema = new Schema<ScreeningDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', default: null, index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'OutreachCampaign', default: null },
    workflowId: { type: Schema.Types.ObjectId, ref: 'Huntlo360Workflow', default: null },
    sourceModule: { type: String, default: 'screening', index: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: null },
    objective: { type: String, default: null },
    language: { type: String, default: null },
    voice: { type: String, default: null },
    tone: { type: String, default: null },
    introductionScript: { type: String, default: null },
    agentPrompt: { type: String, default: null },
    closingScript: { type: String, default: null },
    consentText: { type: String, default: null },
    questions: {
      type: [
        {
          id: { type: String, required: true },
          prompt: { type: String, required: true },
          type: { type: String, default: null, maxlength: 80 },
          required: { type: Boolean, default: false },
          followUp: { type: String, default: null, maxlength: 1000 },
          expectedVariable: { type: String, default: null, maxlength: 80 },
          evaluationEnabled: { type: Boolean, default: true },
          knockout: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    evaluationCriteria: {
      type: [
        {
          id: { type: String, required: true },
          label: { type: String, required: true },
          weight: { type: Number, default: 1 },
          description: { type: String, default: null },
        },
      ],
      default: [],
    },
    minShortlistScore: { type: Number, default: 70, min: 0, max: 100 },
    knockouts: { type: [String], default: [] },
    callSettings: {
      type: {
        maxAttempts: { type: Number, default: 2 },
        attemptIntervalHours: { type: Number, default: 24 },
        maxRetryCount: { type: Number, default: 2 },
        retryIntervalHours: { type: Number, default: 6 },
        consentRequired: { type: Boolean, default: true },
        callWindow: { type: String, default: '10 AM – 7 PM' },
        timezone: { type: String, default: "Candidate's local timezone" },
        voicemailBehaviour: {
          type: String,
          default: 'Leave a short callback message',
        },
      },
      default: () => ({
        maxAttempts: 2,
        attemptIntervalHours: 24,
        maxRetryCount: 2,
        retryIntervalHours: 6,
        consentRequired: true,
        callWindow: '10 AM – 7 PM',
        timezone: "Candidate's local timezone",
        voicemailBehaviour: 'Leave a short callback message',
      }),
    },
    candidateIds: { type: [String], default: [] },
    providerAgentId: { type: String, default: null },
    status: {
      type: String,
      enum: SCREENING_STATUSES,
      default: 'draft',
      index: true,
    },
    stats: {
      type: {
        enrolled: { type: Number, default: 0 },
        queued: { type: Number, default: 0 },
        inProgress: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        noAnswer: { type: Number, default: 0 },
        failed: { type: Number, default: 0 },
        shortlisted: { type: Number, default: 0 },
        rejected: { type: Number, default: 0 },
        averageScore: { type: Number, default: null },
      },
      default: () => defaultScreeningStats(),
    },
    lastLaunchRequestId: { type: String, default: null },
    lastValidation: {
      type: {
        ok: { type: Boolean, default: false },
        checkedAt: { type: Date, default: null },
        issues: { type: [Schema.Types.Mixed] as any, default: [] },
      },
      default: null,
    },
    launchedAt: { type: Date, default: null },
    pausedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null, index: true },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

screeningSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });
screeningSchema.index({ organizationId: 1, workflowId: 1 });

export const ScreeningModel = (mongoose.models.Screening ??
  mongoose.model<ScreeningDocument>('Screening', screeningSchema)) as Model<ScreeningDocument>;
