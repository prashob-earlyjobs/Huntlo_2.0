import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const INTERVIEW_STATUSES = [
  'draft',
  'link_sent',
  'awaiting_booking',
  'scheduled',
  'rescheduled',
  'completed',
  'cancelled',
  'no_show',
  'expired',
] as const;
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

export const BOOKING_STATUSES = [
  'pending',
  'link_sent',
  'booked',
  'rescheduled',
  'cancelled',
  'expired',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const REMINDER_STATUSES = [
  'not_sent',
  'scheduled',
  '24h_sent',
  '2h_sent',
  'both_sent',
  'failed',
] as const;
export type InterviewReminderStatus = (typeof REMINDER_STATUSES)[number];

export const SCHEDULING_METHODS = [
  'calendly_link',
  'manual',
  'candidate_availability',
] as const;
export type SchedulingMethod = (typeof SCHEDULING_METHODS)[number];

export type InterviewDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId | null;
  jobId: mongoose.Types.ObjectId | null;
  createdBy: mongoose.Types.ObjectId;
  interviewType: string;
  round: string | null;
  interviewerIds: string[];
  schedulingMethod: SchedulingMethod;
  provider: string | null;
  providerEventTypeId: string | null;
  providerBookingId: string | null;
  /** Calendly scheduled_event.uri */
  providerEventUri: string | null;
  /** Calendly invitee.uri */
  providerInviteeUri: string | null;
  schedulingUrl: string | null;
  rescheduleUrl: string | null;
  cancelUrl: string | null;
  startAt: Date | null;
  endAt: Date | null;
  timezone: string;
  location: string | null;
  meetingUrl: string | null;
  instructions: string | null;
  status: InterviewStatus;
  bookingStatus: BookingStatus;
  reminderStatus: InterviewReminderStatus;
  reminderHours: number[];
  sourceModule: string;
  campaignId: mongoose.Types.ObjectId | null;
  screeningId: mongoose.Types.ObjectId | null;
  workflowId: mongoose.Types.ObjectId | null;
  scheduleCandidateId: mongoose.Types.ObjectId | null;
  inviteChannel: 'email' | 'whatsapp' | null;
  linkExpiresAt: Date | null;
  inviteeEmail: string | null;
  inviteeName: string | null;
  deletedAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

const interviewSchema = new Schema<InterviewDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'SavedCandidate',
      default: null,
      index: true,
    },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', default: null, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    interviewType: { type: String, default: 'Intro call', trim: true, maxlength: 120 },
    round: { type: String, default: null },
    interviewerIds: { type: [String], default: [] },
    schedulingMethod: {
      type: String,
      enum: SCHEDULING_METHODS,
      default: 'calendly_link',
      index: true,
    },
    provider: { type: String, default: 'calendly' },
    providerEventTypeId: { type: String, default: null, index: true },
    providerBookingId: { type: String, default: null },
    providerEventUri: { type: String, default: null, index: true },
    providerInviteeUri: { type: String, default: null, index: true },
    schedulingUrl: { type: String, default: null },
    rescheduleUrl: { type: String, default: null },
    cancelUrl: { type: String, default: null },
    startAt: { type: Date, default: null, index: true },
    endAt: { type: Date, default: null },
    timezone: { type: String, default: 'Asia/Kolkata' },
    location: { type: String, default: null },
    meetingUrl: { type: String, default: null },
    instructions: { type: String, default: null },
    status: {
      type: String,
      enum: INTERVIEW_STATUSES,
      default: 'draft',
      index: true,
    },
    bookingStatus: {
      type: String,
      enum: BOOKING_STATUSES,
      default: 'pending',
      index: true,
    },
    reminderStatus: {
      type: String,
      enum: REMINDER_STATUSES,
      default: 'not_sent',
      index: true,
    },
    reminderHours: { type: [Number], default: [24, 2] },
    sourceModule: { type: String, default: 'scheduling', index: true },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'OutreachCampaign',
      default: null,
      index: true,
    },
    screeningId: { type: Schema.Types.ObjectId, default: null },
    workflowId: { type: Schema.Types.ObjectId, ref: 'Huntlo360Workflow', default: null },
    scheduleCandidateId: {
      type: Schema.Types.ObjectId,
      ref: 'ScheduleCandidate',
      default: null,
    },
    inviteChannel: { type: String, enum: ['email', 'whatsapp', null], default: null },
    linkExpiresAt: { type: Date, default: null, index: true },
    inviteeEmail: { type: String, default: null, index: true },
    inviteeName: { type: String, default: null },
    deletedAt: { type: Date, default: null, index: true },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

interviewSchema.index({ organizationId: 1, status: 1, startAt: 1 });
interviewSchema.index({ organizationId: 1, deletedAt: 1, startAt: 1, status: 1 });
interviewSchema.index({ organizationId: 1, providerInviteeUri: 1 });
interviewSchema.index({ organizationId: 1, workflowId: 1 });

export const InterviewModel = (mongoose.models.Interview ??
  mongoose.model<InterviewDocument>('Interview', interviewSchema)) as Model<InterviewDocument>;
