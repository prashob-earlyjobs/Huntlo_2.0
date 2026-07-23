import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const ENROLLMENT_STATUSES = [
  'pending',
  'active',
  'waiting',
  'replied',
  'qualified',
  'stopped',
  'completed',
  'failed',
  'opted_out',
  'paused',
  'interested',
  'skipped',
] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export const STOP_REASONS = [
  'candidate_replied',
  'candidate_opted_out',
  'recruiter_stopped',
  'qualification_rejected',
  'sequence_completed',
  'fatal_provider_error',
  'campaign_cancelled',
  'campaign_paused',
  'duplicate',
  'missing_contact',
] as const;
export type StopReason = (typeof STOP_REASONS)[number];

export type OutreachEnrollmentDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  /** String mirror of candidateId, defaulted on save. Kept for forward-compat with builder/tracking APIs. */
  candidateKey: string;
  currentStepIndex: number;
  /** Mirrors sequenceState.lastStepId, kept in sync on save. */
  currentStepId: string | null;
  status: EnrollmentStatus;
  contactAvailability: {
    email: boolean;
    phone: boolean;
    optedOut: boolean;
  };
  sequenceState: {
    lastStepId: string | null;
    completedStepIds: string[];
    waitingUntil: Date | null;
  };
  replyState: {
    hasReply: boolean;
    disposition: string | null;
    repliedAt: Date | null;
    /** First-reply winner channel — locks multi-channel outreach to this channel. */
    channel: 'email' | 'whatsapp' | null;
  };
  /** Mirrors replyState.hasReply, kept in sync on save. */
  hasReply: boolean;
  /** Mirrors replyState.disposition, kept in sync on save. */
  replyDisposition: string | null;
  replyQuestionIndex: number | null;
  autoReplyCount: number;
  interactionCount: number;
  retryCount: number;
  qualificationState: {
    status: 'pending' | 'in_progress' | 'qualified' | 'rejected' | 'skipped';
    answers: Record<string, unknown>;
  };
  screeningState: {
    status: 'not_started' | 'scheduled' | 'completed' | 'skipped';
    screeningId: string | null;
    /** Final screening outcome when status is completed. */
    decision: 'shortlisted' | 'rejected' | 'pending' | null;
  };
  schedulingState: {
    status: 'not_started' | 'link_sent' | 'booked' | 'skipped';
    bookingUrl: string | null;
  };
  nextActionAt: Date | null;
  /** Mirrors nextActionAt, kept in sync on save. */
  nextSendAt: Date | null;
  lastActionAt: Date | null;
  stopReason: StopReason | null;
  pausedReason: string | null;
  errorState: {
    code: string | null;
    message: string | null;
    at: Date | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

const outreachEnrollmentSchema = new Schema<OutreachEnrollmentDocument>(
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
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'SavedCandidate',
      required: true,
      index: true,
    },
    candidateKey: { type: String, default: null, index: true },
    currentStepIndex: { type: Number, default: 0, min: 0 },
    currentStepId: { type: String, default: null },
    status: { type: String, enum: ENROLLMENT_STATUSES, default: 'pending', index: true },
    contactAvailability: {
      type: new Schema(
        {
          email: { type: Boolean, default: false },
          phone: { type: Boolean, default: false },
          optedOut: { type: Boolean, default: false },
        },
        { _id: false }
      ),
      default: () => ({ email: false, phone: false, optedOut: false }),
    },
    sequenceState: {
      type: new Schema(
        {
          lastStepId: { type: String, default: null },
          completedStepIds: { type: [String], default: [] },
          waitingUntil: { type: Date, default: null },
        },
        { _id: false }
      ),
      default: () => ({ lastStepId: null, completedStepIds: [], waitingUntil: null }),
    },
    replyState: {
      type: new Schema(
        {
          hasReply: { type: Boolean, default: false },
          disposition: { type: String, default: null },
          repliedAt: { type: Date, default: null },
          channel: {
            type: String,
            enum: ['email', 'whatsapp'],
            default: null,
          },
        },
        { _id: false }
      ),
      default: () => ({
        hasReply: false,
        disposition: null,
        repliedAt: null,
        channel: null,
      }),
    },
    hasReply: { type: Boolean, default: false },
    replyDisposition: { type: String, default: null },
    replyQuestionIndex: { type: Number, default: null },
    autoReplyCount: { type: Number, default: 0, min: 0 },
    interactionCount: { type: Number, default: 0, min: 0 },
    retryCount: { type: Number, default: 0, min: 0 },
    qualificationState: {
      type: new Schema(
        {
          status: {
            type: String,
            enum: ['pending', 'in_progress', 'qualified', 'rejected', 'skipped'],
            default: 'pending',
          },
          answers: { type: Schema.Types.Mixed, default: {} },
        },
        { _id: false }
      ),
      default: () => ({ status: 'pending', answers: {} }),
    },
    screeningState: {
      type: new Schema(
        {
          status: {
            type: String,
            enum: ['not_started', 'scheduled', 'completed', 'skipped'],
            default: 'not_started',
          },
          screeningId: { type: String, default: null },
          decision: {
            type: String,
            enum: ['shortlisted', 'rejected', 'pending'],
            default: null,
          },
        },
        { _id: false }
      ),
      default: () => ({ status: 'not_started', screeningId: null, decision: null }),
    },
    schedulingState: {
      type: new Schema(
        {
          status: {
            type: String,
            enum: ['not_started', 'link_sent', 'booked', 'skipped'],
            default: 'not_started',
          },
          bookingUrl: { type: String, default: null },
        },
        { _id: false }
      ),
      default: () => ({ status: 'not_started', bookingUrl: null }),
    },
    nextActionAt: { type: Date, default: null, index: true },
    nextSendAt: { type: Date, default: null, index: true },
    lastActionAt: { type: Date, default: null },
    stopReason: { type: String, enum: [...STOP_REASONS, null], default: null },
    pausedReason: { type: String, default: null, maxlength: 500 },
    errorState: {
      type: new Schema(
        {
          code: { type: String, default: null },
          message: { type: String, default: null },
          at: { type: Date, default: null },
        },
        { _id: false }
      ),
      default: null,
    },
  },
  { timestamps: true }
);

// Keep the existing unique index on (org, campaign, candidateId) — candidateKey
// is always set to String(candidateId), so it can never diverge from that
// uniqueness guarantee without a separate index.
outreachEnrollmentSchema.index(
  { organizationId: 1, campaignId: 1, candidateId: 1 },
  { unique: true }
);
outreachEnrollmentSchema.index({ campaignId: 1, status: 1, nextActionAt: 1 });
outreachEnrollmentSchema.index({ organizationId: 1, status: 1, nextActionAt: 1 });

/** Keep string/mirror convenience fields in sync so every write path benefits automatically. */
outreachEnrollmentSchema.pre('save', function preSyncMirrors(next) {
  if (!this.candidateKey) this.candidateKey = String(this.candidateId);
  this.nextSendAt = this.nextActionAt;
  this.hasReply = Boolean(this.replyState?.hasReply);
  this.replyDisposition = this.replyState?.disposition ?? null;
  if (this.sequenceState?.lastStepId) this.currentStepId = this.sequenceState.lastStepId;
  next();
});

export const OutreachEnrollmentModel: Model<OutreachEnrollmentDocument> =
  mongoose.models.OutreachEnrollment ??
  mongoose.model<OutreachEnrollmentDocument>('OutreachEnrollment', outreachEnrollmentSchema);
