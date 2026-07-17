import mongoose, { type Document, type Model, Schema } from 'mongoose';

import {
  OUTREACH_CHANNELS,
  TEMPLATE_STATUSES,
  type GenerationMetadata,
  type OutreachChannel,
  type TemplateStatus,
} from './outreach-template.model.js';

export type SequenceStepChannel = OutreachChannel | 'wait' | 'branch' | 'task';

export type SequenceStepDefinition = {
  id: string;
  order: number;
  type: string;
  channel: SequenceStepChannel | null;
  delayDays: number;
  delayUnit: 'days' | 'hours' | 'minutes';
  templateId: string | null;
  subject: string | null;
  body: string | null;
  stopOnReply: boolean;
  note: string | null;
  config: Record<string, unknown>;
};

export type QualificationConfig = {
  enabled: boolean;
  questions: Array<{
    id: string;
    prompt: string;
    answerType: string;
    knockout?: boolean;
  }>;
  aiReplyEnabled: boolean;
};

export type SchedulingConfig = {
  enabled: boolean;
  provider: string | null;
  eventTypeUri: string | null;
  messageTemplateId: string | null;
};

export type SequenceTemplateDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  ownerUserId: mongoose.Types.ObjectId;
  name: string;
  channels: OutreachChannel[];
  steps: SequenceStepDefinition[];
  qualificationConfig: QualificationConfig;
  schedulingConfig: SchedulingConfig;
  status: TemplateStatus;
  generation: GenerationMetadata | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const sequenceStepSchema = new Schema(
  {
    id: { type: String, required: true },
    order: { type: Number, required: true, min: 0 },
    type: { type: String, required: true, trim: true },
    channel: { type: String, default: null },
    delayDays: { type: Number, default: 0, min: 0 },
    delayUnit: {
      type: String,
      enum: ['days', 'hours', 'minutes'],
      default: 'days',
    },
    templateId: { type: String, default: null },
    subject: { type: String, default: null, maxlength: 300 },
    body: { type: String, default: null, maxlength: 20000 },
    stopOnReply: { type: Boolean, default: false },
    note: { type: String, default: null, maxlength: 2000 },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const qualificationConfigSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    questions: {
      type: [
        {
          id: { type: String, required: true },
          prompt: { type: String, required: true },
          answerType: { type: String, default: 'text' },
          knockout: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    aiReplyEnabled: { type: Boolean, default: false },
  },
  { _id: false }
);

const schedulingConfigSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    provider: { type: String, default: null },
    eventTypeUri: { type: String, default: null },
    messageTemplateId: { type: String, default: null },
  },
  { _id: false }
);

const generationSchema = new Schema(
  {
    isDraft: { type: Boolean, default: true },
    action: { type: String, default: null },
    model: { type: String, default: null },
    generatedAt: { type: Date, default: null },
    summary: { type: String, default: null, maxlength: 240 },
  },
  { _id: false }
);

const sequenceTemplateSchema = new Schema<SequenceTemplateDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    channels: {
      type: [String],
      enum: OUTREACH_CHANNELS,
      default: [],
    },
    steps: { type: [sequenceStepSchema], default: [] },
    qualificationConfig: {
      type: qualificationConfigSchema,
      default: () => ({ enabled: false, questions: [], aiReplyEnabled: false }),
    },
    schedulingConfig: {
      type: schedulingConfigSchema,
      default: () => ({
        enabled: false,
        provider: null,
        eventTypeUri: null,
        messageTemplateId: null,
      }),
    },
    status: { type: String, enum: TEMPLATE_STATUSES, default: 'draft', index: true },
    generation: { type: generationSchema, default: null },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

sequenceTemplateSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });
sequenceTemplateSchema.index({ organizationId: 1, name: 1 });

export const SequenceTemplateModel: Model<SequenceTemplateDocument> =
  mongoose.models.SequenceTemplate ??
  mongoose.model<SequenceTemplateDocument>('SequenceTemplate', sequenceTemplateSchema);
