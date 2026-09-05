import mongoose, { type Document, type Model, Schema } from 'mongoose';

import {
  HCG_MESSAGE_DIRECTIONS,
  HCG_OVERALL_AI_STATUSES,
  HCG_QUESTION_STATUSES,
  type HcgMessageDirection,
  type HcgOverallAiStatus,
  type HcgScreeningQuestion,
} from './hcg.types.js';

export type HcgWhatsappConversationMessage = {
  messageId: string;
  from?: string;
  to?: string;
  snippet?: string;
  body?: string;
  template?: string;
  direction?: HcgMessageDirection;
  internalDate?: string;
};

export type HcgWhatsappConversationDocument = Document & {
  threadId: string;
  phone: string;
  autoReply: boolean;
  campaignId?: string;
  prompt?: string;
  overallAIStatus: HcgOverallAiStatus;
  overallAIDescription?: string;
  lastRepliedInboundId?: string;
  questions: HcgScreeningQuestion[];
  messages: HcgWhatsappConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
};

const conversationMessageSchema = new Schema(
  {
    messageId: { type: String, required: true },
    from: String,
    to: String,
    snippet: String,
    body: String,
    template: String,
    direction: { type: String, enum: HCG_MESSAGE_DIRECTIONS },
    internalDate: String,
  },
  { _id: false }
);

const hcgWhatsappConversationSchema = new Schema<HcgWhatsappConversationDocument>(
  {
    threadId: { type: String, required: true, unique: true },
    phone: { type: String, required: true, trim: true },
    autoReply: { type: Boolean, default: false },
    campaignId: String,
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

export const HcgWhatsappConversationModel = (mongoose.models.HcgWhatsappConversation ??
  mongoose.model<HcgWhatsappConversationDocument>(
    'HcgWhatsappConversation',
    hcgWhatsappConversationSchema,
    'hcg_whatsapp_conversations'
  )) as Model<HcgWhatsappConversationDocument>;
