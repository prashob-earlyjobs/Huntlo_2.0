import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const OUTREACH_PLAN_STATUSES = ['draft', 'active', 'archived'] as const;
export type OutreachPlanStatus = (typeof OUTREACH_PLAN_STATUSES)[number];

export const WAIT_UNITS = ['days', 'hours', 'minutes'] as const;
export type WaitUnit = (typeof WAIT_UNITS)[number];

export const START_SCHEDULE_MODES = [
  'immediate',
  'scheduled',
  'soonest_at',
  'after',
  'next_business_day',
] as const;
export type StartScheduleMode = (typeof START_SCHEDULE_MODES)[number];

export type OutreachPlanTouchpoint = {
  id: string;
  order: number;
  label: string;
  subject: string | null;
  body: string;
  waitDays: number;
  waitHours: number;
  waitMinutes: number;
  waitUnit: WaitUnit;
  sendTime: string | null;
  timezone: string | null;
  stopOnReply: boolean;
  active: boolean;
};

export type OutreachPlanStartSchedule = {
  mode: StartScheduleMode;
  scheduledAt: Date | null;
  sendTime: string | null;
  timezone: string | null;
};

export type OutreachPlanCalendlyAutomation = {
  enabled: boolean;
  schedulingUrl: string | null;
  meetingUri: string | null;
  sendAfterQualification: boolean;
  messageTemplate: string | null;
};

export type OutreachPlanDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string | null;
  touchpoints: OutreachPlanTouchpoint[];
  startSchedule: OutreachPlanStartSchedule;
  calendlyAutomation: OutreachPlanCalendlyAutomation;
  status: OutreachPlanStatus;
  createdAt: Date;
  updatedAt: Date;
};

const touchpointSchema = new Schema(
  {
    id: { type: String, required: true },
    order: { type: Number, required: true, min: 0 },
    label: { type: String, required: true, trim: true, maxlength: 160 },
    subject: { type: String, default: null, maxlength: 300 },
    body: { type: String, required: true, maxlength: 20000 },
    waitDays: { type: Number, default: 0, min: 0 },
    waitHours: { type: Number, default: 0, min: 0 },
    waitMinutes: { type: Number, default: 0, min: 0 },
    waitUnit: { type: String, enum: WAIT_UNITS, default: 'days' },
    sendTime: { type: String, default: null },
    timezone: { type: String, default: null },
    stopOnReply: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
  },
  { _id: false }
);

const startScheduleSchema = new Schema(
  {
    mode: { type: String, enum: START_SCHEDULE_MODES, default: 'immediate' },
    scheduledAt: { type: Date, default: null },
    sendTime: { type: String, default: null },
    timezone: { type: String, default: null },
  },
  { _id: false }
);

const calendlyAutomationSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    schedulingUrl: { type: String, default: null },
    meetingUri: { type: String, default: null },
    sendAfterQualification: { type: Boolean, default: false },
    messageTemplate: { type: String, default: null, maxlength: 20000 },
  },
  { _id: false }
);

const outreachPlanSchema = new Schema<OutreachPlanDocument>(
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
    description: { type: String, default: null, maxlength: 2000 },
    touchpoints: { type: [touchpointSchema], default: [] },
    startSchedule: {
      type: startScheduleSchema,
      default: () => ({
        mode: 'immediate',
        scheduledAt: null,
        sendTime: null,
        timezone: null,
      }),
    },
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

outreachPlanSchema.index({ organizationId: 1, status: 1 });
outreachPlanSchema.index({ organizationId: 1, name: 1 });

export const OutreachPlanModel: Model<OutreachPlanDocument> =
  mongoose.models.OutreachPlan ??
  mongoose.model<OutreachPlanDocument>('OutreachPlan', outreachPlanSchema);
