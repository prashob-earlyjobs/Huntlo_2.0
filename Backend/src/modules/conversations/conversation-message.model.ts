import mongoose, { type Document, type Model, Schema } from 'mongoose';

import {
  CONVERSATION_CHANNELS,
  type ConversationChannel,
} from './conversation-thread.model.js';

export const MESSAGE_PROVIDERS = [
  'gmail',
  'outlook',
  'zoho-mail',
  'smtp',
  'imap',
  'meta-whatsapp',
  'gupshup',
  'huntlo-whatsapp',
  'hunar',
  'system',
  'recruiter',
] as const;
export type MessageProvider = (typeof MESSAGE_PROVIDERS)[number];

export const MESSAGE_DIRECTIONS = ['inbound', 'outbound', 'internal'] as const;
export type MessageDirection = (typeof MESSAGE_DIRECTIONS)[number];

export const DELIVERY_STATUSES = [
  'queued',
  'sent',
  'delivered',
  'read',
  'failed',
  'bounced',
] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export const MESSAGE_TYPES = [
  'message',
  'note',
  'system',
  'voice_summary',
  'qualification',
] as const;
export type MessageType = (typeof MESSAGE_TYPES)[number];

export type ConversationMessageDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  threadId: mongoose.Types.ObjectId;
  provider: MessageProvider;
  channel: ConversationChannel;
  direction: MessageDirection;
  sender: string | null;
  recipient: string | null;
  subject: string | null;
  bodyText: string;
  bodyHtml: string | null;
  providerMessageId: string | null;
  providerThreadId: string | null;
  deliveryStatus: DeliveryStatus;
  messageType: MessageType;
  aiGenerated: boolean;
  attachments: Array<{ name: string; url?: string | null; size?: string | null }>;
  sentAt: Date | null;
  receivedAt: Date | null;
  error: { code: string | null; message: string | null } | null;
  createdByUserId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
};

const conversationMessageSchema = new Schema<ConversationMessageDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    threadId: {
      type: Schema.Types.ObjectId,
      ref: 'ConversationThread',
      required: true,
      index: true,
    },
    provider: { type: String, enum: MESSAGE_PROVIDERS, required: true, index: true },
    channel: { type: String, enum: CONVERSATION_CHANNELS, required: true, index: true },
    direction: { type: String, enum: MESSAGE_DIRECTIONS, required: true, index: true },
    sender: { type: String, default: null, maxlength: 320 },
    recipient: { type: String, default: null, maxlength: 320 },
    subject: { type: String, default: null, maxlength: 500 },
    bodyText: { type: String, required: true, maxlength: 50000 },
    bodyHtml: { type: String, default: null, maxlength: 200000 },
    providerMessageId: { type: String, default: null, maxlength: 500, index: true },
    providerThreadId: { type: String, default: null, maxlength: 500, index: true },
    deliveryStatus: {
      type: String,
      enum: DELIVERY_STATUSES,
      default: 'sent',
      index: true,
    },
    messageType: { type: String, enum: MESSAGE_TYPES, default: 'message', index: true },
    aiGenerated: { type: Boolean, default: false },
    attachments: {
      type: [
        new Schema(
          {
            name: { type: String, required: true },
            url: { type: String, default: null },
            size: { type: String, default: null },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    sentAt: { type: Date, default: null },
    receivedAt: { type: Date, default: null },
    error: {
      type: new Schema(
        {
          code: { type: String, default: null },
          message: { type: String, default: null },
        },
        { _id: false }
      ),
      default: null,
    },
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

conversationMessageSchema.index({ threadId: 1, createdAt: 1 });
conversationMessageSchema.index({ threadId: 1, messageType: 1, createdAt: 1 });
conversationMessageSchema.index(
  { organizationId: 1, provider: 1, providerMessageId: 1 },
  {
    unique: true,
    partialFilterExpression: { providerMessageId: { $type: 'string' } },
  }
);

export const ConversationMessageModel = (mongoose.models.ConversationMessage ??
  mongoose.model<ConversationMessageDocument>(
    'ConversationMessage',
    conversationMessageSchema
  )) as Model<ConversationMessageDocument>;
