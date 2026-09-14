import mongoose, { type Document, type Model, Schema } from 'mongoose';

import {
  HCG_MESSAGE_DIRECTIONS,
  HCG_QUESTION_STATUSES,
  type HcgMessageDirection,
  type HcgOverallAiStatus,
  type HcgScreeningQuestion,
} from './hcg.types.js';

export type HcgGmailConversationMessage = {
  messageId: string;
  from?: string;
  campaignId?:string;
  to?: string;
  subject?: string;
  snippet?: string;
  body?: string;
  html?: string;
  direction?: HcgMessageDirection;
  internalDate?: string;
};

export type HcgGmailConversationDocument = Document & {
  threadId: string;
  emailAddress?: string;
  autoReply: boolean;
  campaignId?: string;
  subject?: string;
  prompt?: string;
  overallAIStatus: HcgOverallAiStatus;
  overallAIDescription?: string;
  lastRepliedInboundId?: string;
  questions: HcgScreeningQuestion[];
  messages: HcgGmailConversationMessage[];
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

const hcgGmailConversationSchema = new Schema<HcgGmailConversationDocument>(
  {
    threadId: { type: String, required: true, unique: true },
    emailAddress: { type: String, lowercase: true, trim: true },
    autoReply: { type: Boolean, default: false },
    campaignId: String,
    subject: String,
    prompt: String,
    overallAIStatus: {
      type: String,
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

export const HcgGmailConversationModel = (mongoose.models.HcgGmailConversation ??
  mongoose.model<HcgGmailConversationDocument>(
    'HcgGmailConversation',
    hcgGmailConversationSchema,
    'hcg_gmail_conversations'
  )) as Model<HcgGmailConversationDocument>;
