import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const OUTREACH_CHANNELS = ['email', 'whatsapp', 'ai_voice'] as const;
export type OutreachChannel = (typeof OUTREACH_CHANNELS)[number];

export const TEMPLATE_CATEGORIES = [
  'opening',
  'follow_up',
  'no_reply',
  'qualification',
  'scheduling',
  'rejection',
  'reminder',
  'voice_script',
] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export const TEMPLATE_SCOPES = ['personal', 'organization', 'system'] as const;
export type TemplateScope = (typeof TEMPLATE_SCOPES)[number];

export const TEMPLATE_STATUSES = ['draft', 'active', 'archived'] as const;
export type TemplateStatus = (typeof TEMPLATE_STATUSES)[number];

export type GenerationMetadata = {
  isDraft: boolean;
  action: string | null;
  model: string | null;
  generatedAt: Date | null;
  /** Non-sensitive summary only — never store full prompts. */
  summary: string | null;
};

export type OutreachTemplateDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  ownerUserId: mongoose.Types.ObjectId;
  name: string;
  channel: OutreachChannel;
  category: TemplateCategory;
  subject: string | null;
  body: string;
  variables: string[];
  language: string;
  scope: TemplateScope;
  status: TemplateStatus;
  usageCount: number;
  archivedAt: Date | null;
  generation: GenerationMetadata | null;
  createdAt: Date;
  updatedAt: Date;
};

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

const outreachTemplateSchema = new Schema<OutreachTemplateDocument>(
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
    channel: { type: String, enum: OUTREACH_CHANNELS, required: true, index: true },
    category: { type: String, enum: TEMPLATE_CATEGORIES, required: true, index: true },
    subject: { type: String, default: null, trim: true, maxlength: 300 },
    body: { type: String, required: true, maxlength: 20000 },
    variables: { type: [String], default: [] },
    language: { type: String, default: 'en', trim: true, maxlength: 16 },
    scope: { type: String, enum: TEMPLATE_SCOPES, default: 'organization', index: true },
    status: { type: String, enum: TEMPLATE_STATUSES, default: 'draft', index: true },
    usageCount: { type: Number, default: 0, min: 0 },
    archivedAt: { type: Date, default: null },
    generation: { type: generationSchema, default: null },
  },
  { timestamps: true }
);

outreachTemplateSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });
outreachTemplateSchema.index({ organizationId: 1, channel: 1, category: 1 });
outreachTemplateSchema.index({ organizationId: 1, name: 1 });

export const OutreachTemplateModel: Model<OutreachTemplateDocument> =
  mongoose.models.OutreachTemplate ??
  mongoose.model<OutreachTemplateDocument>('OutreachTemplate', outreachTemplateSchema);
