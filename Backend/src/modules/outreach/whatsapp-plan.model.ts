import mongoose, { type Document, type Model, Schema } from 'mongoose';

import { OUTREACH_PLAN_STATUSES, type OutreachPlanStatus } from './outreach-plan.model.js';

export const WHATSAPP_WAIT_UNITS = ['hours', 'minutes'] as const;
export type WhatsAppWaitUnit = (typeof WHATSAPP_WAIT_UNITS)[number];

export type WhatsAppOutreachTouchpoint = {
  id: string;
  order: number;
  label: string;
  body: string;
  waitHours: number;
  waitMinutes: number;
  waitUnit: WhatsAppWaitUnit;
  templateId: string;
  templateVariables: Record<string, string>;
  isNoReplyFallback: boolean;
  isReplyFollowUp: boolean;
  required: boolean;
  active: boolean;
};

export type WhatsAppOutreachCalendlyAutomation = {
  enabled: boolean;
  schedulingUrl: string | null;
  meetingUri: string | null;
  sendAfterQualification: boolean;
  messageTemplate: string | null;
};

export type WhatsAppOutreachPlanDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  jobDescription: string | null;
  touchpoints: WhatsAppOutreachTouchpoint[];
  calendlyAutomation: WhatsAppOutreachCalendlyAutomation;
  status: OutreachPlanStatus;
  createdAt: Date;
  updatedAt: Date;
};

const touchpointSchema = new Schema(
  {
    id: { type: String, required: true },
    order: { type: Number, required: true, min: 0 },
    label: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, maxlength: 4096 },
    waitHours: { type: Number, default: 0, min: 0 },
    waitMinutes: { type: Number, default: 0, min: 0 },
    waitUnit: { type: String, enum: WHATSAPP_WAIT_UNITS, default: 'hours' },
    templateId: { type: String, required: true, trim: true, maxlength: 120 },
    templateVariables: { type: Schema.Types.Mixed, default: {} },
    isNoReplyFallback: { type: Boolean, default: false },
    isReplyFollowUp: { type: Boolean, default: false },
    required: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
  },
  { _id: false }
);

const calendlyAutomationSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    schedulingUrl: { type: String, default: null },
    meetingUri: { type: String, default: null },
    sendAfterQualification: { type: Boolean, default: false },
    messageTemplate: { type: String, default: null, maxlength: 4096 },
  },
  { _id: false }
);

const whatsAppOutreachPlanSchema = new Schema<WhatsAppOutreachPlanDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    jobDescription: { type: String, default: null, maxlength: 10000 },
    touchpoints: { type: [touchpointSchema], default: [] },
    calendlyAutomation: {
      type: calendlyAutomationSchema,
      default: () => ({
        enabled: false,
        schedulingUrl: null,
        meetingUri: null,
        sendAfterQualification: false,
        messageTemplate: null,
      }),
    },
    status: { type: String, enum: OUTREACH_PLAN_STATUSES, default: 'draft', index: true },
  },
  { timestamps: true }
);

whatsAppOutreachPlanSchema.index({ organizationId: 1, status: 1 });
whatsAppOutreachPlanSchema.index({ organizationId: 1, name: 1 });

export const WhatsAppOutreachPlanModel: Model<WhatsAppOutreachPlanDocument> =
  mongoose.models.WhatsAppOutreachPlan ??
  mongoose.model<WhatsAppOutreachPlanDocument>('WhatsAppOutreachPlan', whatsAppOutreachPlanSchema);
