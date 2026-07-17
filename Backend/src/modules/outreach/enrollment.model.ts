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
  currentStepIndex: number;
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
  };
  qualificationState: {
    status: 'pending' | 'in_progress' | 'qualified' | 'rejected' | 'skipped';
    answers: Record<string, unknown>;
  };
  screeningState: {
    status: 'not_started' | 'scheduled' | 'completed' | 'skipped';
    screeningId: string | null;
  };
  schedulingState: {
    status: 'not_started' | 'link_sent' | 'booked' | 'skipped';
    bookingUrl: string | null;
  };
  nextActionAt: Date | null;
  lastActionAt: Date | null;
  stopReason: StopReason | null;
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
    currentStepIndex: { type: Number, default: 0, min: 0 },
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
        },
        { _id: false }
      ),
      default: () => ({ hasReply: false, disposition: null, repliedAt: null }),
    },
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
        },
        { _id: false }
      ),
      default: () => ({ status: 'not_started', screeningId: null }),
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
    lastActionAt: { type: Date, default: null },
    stopReason: { type: String, enum: [...STOP_REASONS, null], default: null },
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

outreachEnrollmentSchema.index(
  { organizationId: 1, campaignId: 1, candidateId: 1 },
  { unique: true }
);
outreachEnrollmentSchema.index({ campaignId: 1, status: 1, nextActionAt: 1 });
outreachEnrollmentSchema.index({ organizationId: 1, status: 1, nextActionAt: 1 });

export const OutreachEnrollmentModel: Model<OutreachEnrollmentDocument> =
  mongoose.models.OutreachEnrollment ??
  mongoose.model<OutreachEnrollmentDocument>('OutreachEnrollment', outreachEnrollmentSchema);
