import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const INVITATION_STATUSES = [
  'pending',
  'invited',
  'started',
  'completed',
  'expired',
  'cancelled',
  'failed',
] as const;
export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

export const ASSESSMENT_RESULTS = ['pass', 'fail', 'pending'] as const;
export type AssessmentResult = (typeof ASSESSMENT_RESULTS)[number];

export const RECRUITER_DECISIONS = [
  'pending',
  'shortlisted',
  'rejected',
  'needs_review',
] as const;
export type RecruiterDecision = (typeof RECRUITER_DECISIONS)[number];

export type AssessmentCandidateDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  workflowId: mongoose.Types.ObjectId | null;
  invitationStatus: InvitationStatus;
  inviteChannel: 'email' | 'whatsapp' | null;
  inviteUrl: string | null;
  invitedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  expiresAt: Date | null;
  score: number | null;
  sectionScores: Record<string, number>;
  result: AssessmentResult;
  providerAssessmentId: string | null;
  providerAttemptId: string | null;
  recruiterDecision: RecruiterDecision;
  reminderCount: number;
  nextReminderAt: Date | null;
  lastReminderAt: Date | null;
  quotaReservationKey: string | null;
  quotaCommitted: boolean;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const assessmentCandidateSchema = new Schema<AssessmentCandidateDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'AssessmentCampaign',
      required: true,
      index: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'SavedCandidate',
      required: true,
      index: true,
    },
    workflowId: { type: Schema.Types.ObjectId, ref: 'Huntlo360Workflow', default: null },
    invitationStatus: {
      type: String,
      enum: INVITATION_STATUSES,
      default: 'pending',
      index: true,
    },
    inviteChannel: { type: String, enum: ['email', 'whatsapp', null], default: null },
    inviteUrl: { type: String, default: null },
    invitedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null, index: true },
    score: { type: Number, default: null },
    sectionScores: { type: Schema.Types.Mixed, default: {} },
    result: {
      type: String,
      enum: ASSESSMENT_RESULTS,
      default: 'pending',
      index: true,
    },
    providerAssessmentId: { type: String, default: null, index: true },
    providerAttemptId: { type: String, default: null, index: true },
    recruiterDecision: {
      type: String,
      enum: RECRUITER_DECISIONS,
      default: 'pending',
      index: true,
    },
    reminderCount: { type: Number, default: 0 },
    nextReminderAt: { type: Date, default: null, index: true },
    lastReminderAt: { type: Date, default: null },
    quotaReservationKey: { type: String, default: null },
    quotaCommitted: { type: Boolean, default: false },
    error: { type: String, default: null },
  },
  { timestamps: true }
);

assessmentCandidateSchema.index(
  { organizationId: 1, campaignId: 1, candidateId: 1 },
  { unique: true }
);
assessmentCandidateSchema.index({ organizationId: 1, invitationStatus: 1, updatedAt: -1 });
assessmentCandidateSchema.index({ organizationId: 1, providerAttemptId: 1 });

export const AssessmentCandidateModel = (mongoose.models.AssessmentCandidate ??
  mongoose.model<AssessmentCandidateDocument>(
    'AssessmentCandidate',
    assessmentCandidateSchema
  )) as Model<AssessmentCandidateDocument>;
