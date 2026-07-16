import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const WORKFLOW_STAGES = [
  'outreach',
  'qualification',
  'screening',
  'recruiter_review',
  'scheduling',
  'completed',
  'stopped',
] as const;
export type WorkflowStage = (typeof WORKFLOW_STAGES)[number];

export const EXCEPTION_CODES = [
  'missing_contact',
  'provider_disconnected',
  'outreach_failed',
  'opted_out',
  'qualification_incomplete',
  'screening_unanswered',
  'screening_failed',
  'assessment_failed',
  'scheduling_link_expired',
  'quota_exhausted',
] as const;
export type ExceptionCode = (typeof EXCEPTION_CODES)[number];

export type Huntlo360CandidateStateDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  workflowId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  enrollmentId: mongoose.Types.ObjectId | null;
  currentStage: WorkflowStage;
  outreachStatus: string;
  interestStatus: string;
  qualificationStatus: string;
  screeningId: mongoose.Types.ObjectId | null;
  screeningStatus: string;
  assessmentCandidateId: mongoose.Types.ObjectId | null;
  assessmentStatus: string;
  recruiterDecision: string | null;
  scheduleCandidateId: mongoose.Types.ObjectId | null;
  schedulingStatus: string;
  exceptionCode: ExceptionCode | null;
  exceptionDetail: string | null;
  lastTransitionAt: Date | null;
  lastTransitionKey: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const huntlo360CandidateStateSchema = new Schema<Huntlo360CandidateStateDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    workflowId: {
      type: Schema.Types.ObjectId,
      ref: 'Huntlo360Workflow',
      required: true,
      index: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'SavedCandidate',
      required: true,
      index: true,
    },
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: 'OutreachEnrollment',
      default: null,
      index: true,
    },
    currentStage: {
      type: String,
      enum: WORKFLOW_STAGES,
      default: 'outreach',
      index: true,
    },
    outreachStatus: { type: String, default: 'pending' },
    interestStatus: { type: String, default: 'unknown' },
    qualificationStatus: { type: String, default: 'pending' },
    screeningId: {
      type: Schema.Types.ObjectId,
      ref: 'ScreeningCandidate',
      default: null,
    },
    screeningStatus: { type: String, default: 'not_started' },
    assessmentCandidateId: {
      type: Schema.Types.ObjectId,
      ref: 'AssessmentCandidate',
      default: null,
    },
    assessmentStatus: { type: String, default: 'not_started' },
    recruiterDecision: { type: String, default: null },
    scheduleCandidateId: {
      type: Schema.Types.ObjectId,
      ref: 'ScheduleCandidate',
      default: null,
    },
    schedulingStatus: { type: String, default: 'not_started' },
    exceptionCode: {
      type: String,
      enum: [...EXCEPTION_CODES, null],
      default: null,
      index: true,
    },
    exceptionDetail: { type: String, default: null },
    lastTransitionAt: { type: Date, default: null },
    lastTransitionKey: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

huntlo360CandidateStateSchema.index(
  { workflowId: 1, candidateId: 1 },
  { unique: true }
);
huntlo360CandidateStateSchema.index({ organizationId: 1, workflowId: 1, currentStage: 1 });
huntlo360CandidateStateSchema.index({
  organizationId: 1,
  workflowId: 1,
  exceptionCode: 1,
});

export const Huntlo360CandidateStateModel =
  (mongoose.models.Huntlo360CandidateState ??
    mongoose.model<Huntlo360CandidateStateDocument>(
      'Huntlo360CandidateState',
      huntlo360CandidateStateSchema
    )) as Model<Huntlo360CandidateStateDocument>;

/** Idempotent transition ledger */
export type Huntlo360TransitionDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  workflowId: mongoose.Types.ObjectId;
  candidateStateId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  idempotencyKey: string;
  fromStage: WorkflowStage | null;
  toStage: WorkflowStage;
  event: string;
  actorUserId: mongoose.Types.ObjectId | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
};

const huntlo360TransitionSchema = new Schema<Huntlo360TransitionDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    workflowId: {
      type: Schema.Types.ObjectId,
      ref: 'Huntlo360Workflow',
      required: true,
      index: true,
    },
    candidateStateId: {
      type: Schema.Types.ObjectId,
      ref: 'Huntlo360CandidateState',
      required: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'SavedCandidate',
      required: true,
    },
    idempotencyKey: { type: String, required: true },
    fromStage: { type: String, enum: [...WORKFLOW_STAGES, null], default: null },
    toStage: { type: String, enum: WORKFLOW_STAGES, required: true },
    event: { type: String, required: true },
    actorUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

huntlo360TransitionSchema.index(
  { organizationId: 1, workflowId: 1, idempotencyKey: 1 },
  { unique: true }
);

export const Huntlo360TransitionModel = (mongoose.models.Huntlo360Transition ??
  mongoose.model<Huntlo360TransitionDocument>(
    'Huntlo360Transition',
    huntlo360TransitionSchema
  )) as Model<Huntlo360TransitionDocument>;
