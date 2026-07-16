import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const CONVERSATION_CHANNELS = ['email', 'whatsapp', 'ai_voice', 'note'] as const;
export type ConversationChannel = (typeof CONVERSATION_CHANNELS)[number];

export const THREAD_STATUSES = [
  'open',
  'awaiting_reply',
  'replied',
  'handed_off',
  'closed',
  'opted_out',
] as const;
export type ThreadStatus = (typeof THREAD_STATUSES)[number];

export const QUALIFICATION_STATUSES = [
  'pending',
  'in_progress',
  'qualified',
  'rejected',
  'handed_off',
  'skipped',
] as const;
export type ThreadQualificationStatus = (typeof QUALIFICATION_STATUSES)[number];

export const AUTOMATION_STATUSES = ['active', 'stopped'] as const;
export type AutomationStatus = (typeof AUTOMATION_STATUSES)[number];

export type ConversationThreadDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId | null;
  enrollmentId: mongoose.Types.ObjectId | null;
  jobId: mongoose.Types.ObjectId | null;
  channels: ConversationChannel[];
  status: ThreadStatus;
  unreadCount: number;
  qualificationStatus: ThreadQualificationStatus;
  assignedUserId: mongoose.Types.ObjectId | null;
  automationStatus: AutomationStatus;
  lastMessageAt: Date | null;
  lastCandidateMessageAt: Date | null;
  lastRecruiterMessageAt: Date | null;
  lastMessagePreview: string | null;
  providerThreadIds: Array<{ provider: string; threadId: string }>;
  createdAt: Date;
  updatedAt: Date;
};

const conversationThreadSchema = new Schema<ConversationThreadDocument>(
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
      required: true,
      index: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'OutreachCampaign',
      default: null,
      index: true,
    },
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: 'OutreachEnrollment',
      default: null,
      index: true,
    },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', default: null, index: true },
    channels: {
      type: [{ type: String, enum: CONVERSATION_CHANNELS }],
      default: [],
    },
    status: { type: String, enum: THREAD_STATUSES, default: 'open', index: true },
    unreadCount: { type: Number, default: 0, min: 0 },
    qualificationStatus: {
      type: String,
      enum: QUALIFICATION_STATUSES,
      default: 'pending',
      index: true,
    },
    assignedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    automationStatus: {
      type: String,
      enum: AUTOMATION_STATUSES,
      default: 'active',
      index: true,
    },
    lastMessageAt: { type: Date, default: null, index: true },
    lastCandidateMessageAt: { type: Date, default: null },
    lastRecruiterMessageAt: { type: Date, default: null },
    lastMessagePreview: { type: String, default: null, maxlength: 500 },
    providerThreadIds: {
      type: [
        new Schema(
          {
            provider: { type: String, required: true },
            threadId: { type: String, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

conversationThreadSchema.index({ organizationId: 1, lastMessageAt: -1 });
conversationThreadSchema.index({ organizationId: 1, candidateId: 1, campaignId: 1 });
conversationThreadSchema.index({
  organizationId: 1,
  'providerThreadIds.provider': 1,
  'providerThreadIds.threadId': 1,
});

export const ConversationThreadModel = (mongoose.models.ConversationThread ??
  mongoose.model<ConversationThreadDocument>(
    'ConversationThread',
    conversationThreadSchema
  )) as Model<ConversationThreadDocument>;
