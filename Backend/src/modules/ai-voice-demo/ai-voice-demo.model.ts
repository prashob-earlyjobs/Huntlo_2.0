import mongoose, { type Document, type Model, Schema } from 'mongoose';

import type { AiVoiceDemoJob } from './ai-voice-demo.jobs.js';

export const AI_VOICE_DEMO_STATUSES = ['dialed', 'failed'] as const;
export type AiVoiceDemoStatus = (typeof AI_VOICE_DEMO_STATUSES)[number];

export type AiVoiceDemoCallDocument = Document & {
  company: string;
  companyKey: string;
  email: string;
  phone: string;
  phoneDigits: string;
  job: AiVoiceDemoJob;
  agentId: string | null;
  requestId: string | null;
  status: AiVoiceDemoStatus;
  dialedCount: number;
  errorMessage: string | null;
  callStatus: string | null;
  whatsappStatus: 'none' | 'sending' | 'sent' | 'failed' | 'skipped';
  whatsappTemplateId: string | null;
  whatsappMessageId: string | null;
  whatsappError: string | null;
  whatsappSentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const aiVoiceDemoCallSchema = new Schema<AiVoiceDemoCallDocument>(
  {
    company: { type: String, required: true, trim: true, maxlength: 160 },
    companyKey: { type: String, required: true, trim: true, maxlength: 160, index: true },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    phoneDigits: { type: String, required: true, trim: true, maxlength: 15, index: true },
    job: { type: String, required: true, trim: true, maxlength: 80 },
    agentId: { type: String, default: null, trim: true },
    requestId: { type: String, default: null, trim: true },
    status: { type: String, enum: AI_VOICE_DEMO_STATUSES, required: true, index: true },
    dialedCount: { type: Number, default: 0 },
    errorMessage: { type: String, default: null, maxlength: 500 },
    callStatus: { type: String, default: null, trim: true, maxlength: 40 },
    whatsappStatus: {
      type: String,
      enum: ['none', 'sending', 'sent', 'failed', 'skipped'],
      default: 'none',
    },
    whatsappTemplateId: { type: String, default: null, trim: true, maxlength: 80 },
    whatsappMessageId: { type: String, default: null, trim: true, maxlength: 120 },
    whatsappError: { type: String, default: null, maxlength: 500 },
    whatsappSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

aiVoiceDemoCallSchema.index({ companyKey: 1, status: 1, createdAt: -1 });
aiVoiceDemoCallSchema.index({ phoneDigits: 1, status: 1, createdAt: -1 });

export const AiVoiceDemoCallModel = (mongoose.models.AiVoiceDemoCall ??
  mongoose.model<AiVoiceDemoCallDocument>(
    'AiVoiceDemoCall',
    aiVoiceDemoCallSchema
  )) as Model<AiVoiceDemoCallDocument>;
