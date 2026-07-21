import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const BULL_JOB_KINDS = [
  'send',
  'followup',
  'sync_replies',
  'launch_screening',
] as const;
export type BullJobKind = (typeof BULL_JOB_KINDS)[number];

export const BULL_JOB_CHANNELS = ['email', 'whatsapp', 'ai_voice'] as const;
export type BullJobChannel = (typeof BULL_JOB_CHANNELS)[number];

export const BULL_JOB_STATUSES = [
  'pending',
  'queued',
  'running',
  'done',
  'failed',
  'cancelled',
] as const;
export type BullJobStatus = (typeof BULL_JOB_STATUSES)[number];

export type BullOutreachJobDocument = Document & {
  kind: BullJobKind;
  channel: BullJobChannel | null;
  organizationId: mongoose.Types.ObjectId | null;
  campaignId: mongoose.Types.ObjectId | null;
  enrollmentId: mongoose.Types.ObjectId | null;
  stepId: string | null;
  runAt: Date;
  status: BullJobStatus;
  attempts: number;
  lastError: string | null;
  details: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

const schema = new Schema<BullOutreachJobDocument>(
  {
    kind: { type: String, enum: BULL_JOB_KINDS, required: true, index: true },
    channel: { type: String, enum: BULL_JOB_CHANNELS, default: null },
    organizationId: { type: Schema.Types.ObjectId, default: null, index: true },
    campaignId: { type: Schema.Types.ObjectId, default: null, index: true },
    enrollmentId: { type: Schema.Types.ObjectId, default: null, index: true },
    stepId: { type: String, default: null },
    runAt: { type: Date, required: true, index: true },
    status: { type: String, enum: BULL_JOB_STATUSES, default: 'pending', index: true },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: null },
    details: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: 'bull_outreach_jobs' }
);

schema.index({ status: 1, runAt: 1 });
schema.index(
  { enrollmentId: 1, stepId: 1, kind: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'queued', 'running'] },
      enrollmentId: { $type: 'objectId' },
      stepId: { $type: 'string' },
    },
  }
);

export const BullOutreachJobModel: Model<BullOutreachJobDocument> =
  mongoose.models.BullOutreachJob ??
  mongoose.model<BullOutreachJobDocument>('BullOutreachJob', schema);
