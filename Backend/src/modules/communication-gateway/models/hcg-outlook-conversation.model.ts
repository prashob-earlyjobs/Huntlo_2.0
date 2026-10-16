import mongoose, { type Document, type Model, Schema } from 'mongoose';

import {
  HCG_MESSAGE_DIRECTIONS,
  HCG_OVERALL_AI_STATUSES,
  HCG_QUESTION_STATUSES,
  type HcgMessageDirection,
  type HcgOverallAiStatus,
  type HcgScreeningQuestion,
} from './hcg.types.js';

export type HcgOutlookConversationMessage = {
  messageId: string;
  from?: string;
  to?: string;
  subject?: string;
  snippet?: string;
  body?: string;
  html?: string;
  direction?: HcgMessageDirection;
  internalDate?: string;
};

export type HcgOutlookConversationDocument = Document & {
  threadId: string;
  emailAddress?: string;
  accountId?: string;
  dataCenter?: string;
  providerThreadId?: string;
  autoReply: boolean;
  campaignId?: string;
  subject?: string;
  prompt?: string;
  overallAIStatus: HcgOverallAiStatus;
  overallAIDescription?: string;
  lastRepliedInboundId?: string;
  questions: HcgScreeningQuestion[];
  messages: HcgOutlookConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
};

const conversationMessageSchema = new Schema(
  {
    messageId: { type: String, required: true },
    from: String,
    to: String,
    subject: String,
    snippet: String,
    body: String,
    html: String,
    direction: { type: String, enum: HCG_MESSAGE_DIRECTIONS },
    internalDate: String,
  },
  { _id: false }
);

const hcgOutlookConversationSchema = new Schema<HcgOutlookConversationDocument>(
  {
    threadId: { type: String, required: true, unique: true },
    emailAddress: { type: String, lowercase: true, trim: true },
    accountId: String,
    dataCenter: String,
    providerThreadId: String,
    autoReply: { type: Boolean, default: false },
    campaignId: String,
    subject: String,
    prompt: String,
    overallAIStatus: {
      type: String,
      enum: HCG_OVERALL_AI_STATUSES,
      default: 'awaiting_reply',
    },
    overallAIDescription: String,
    lastRepliedInboundId: String,
    questions: {
      type: [
        {
          id: String,
          question: String,
          asked: { type: Boolean, default: false },
          answer: String,
          status: {
            type: String,
            enum: HCG_QUESTION_STATUSES,
            default: 'unanswered',
          },
          description: String,
        },
      ],
      default: [],
    },
    messages: { type: [conversationMessageSchema], default: [] },
  },
  { timestamps: true }
);

export const HcgOutlookConversationModel = (mongoose.models.HcgOutlookConversation ??
  mongoose.model<HcgOutlookConversationDocument>(
    'HcgOutlookConversation',
    hcgOutlookConversationSchema,
    'hcg_outlook_conversations'
  )) as Model<HcgOutlookConversationDocument>;
