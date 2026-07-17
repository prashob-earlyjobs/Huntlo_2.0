import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const BACKGROUND_JOB_TYPES = [
  'sourcing.poll',
  'candidate.bulk_reveal',
  'candidate.import',
  'outreach.execute_step',
  'outreach.sync_email_replies',
  'outreach.retry_delivery',
  'screening.launch_calls',
  'scheduling.sync_bookings',
  'scheduling.send_reminder',
  'usage.reset_period',
  'report.generate',
  'integration.health_check',
  'webhook.retry',
] as const;
export type BackgroundJobType = (typeof BACKGROUND_JOB_TYPES)[number];

export const BACKGROUND_JOB_STATUSES = [
  'pending',
  'leased',
  'running',
  'retrying',
  'completed',
  'failed',
  'cancelled',
] as const;
export type BackgroundJobStatus = (typeof BACKGROUND_JOB_STATUSES)[number];

export type BackgroundJobDocument = Document & {
  type: BackgroundJobType;
  organizationId: mongoose.Types.ObjectId | null;
  entityType: string | null;
  entityId: string | null;
  payload: Record<string, unknown>;
  status: BackgroundJobStatus;
  priority: number;
  runAt: Date;
  attempts: number;
  maxAttempts: number;
  leaseOwner: string | null;
  leaseExpiresAt: Date | null;
  lastError: string | null;
  completedAt: Date | null;
  failedAt: Date | null;
  cancelledAt: Date | null;
  idempotencyKey: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const backgroundJobSchema = new Schema<BackgroundJobDocument>(
  {
    type: {
      type: String,
      enum: BACKGROUND_JOB_TYPES,
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    entityType: { type: String, default: null, maxlength: 80 },
    entityId: { type: String, default: null, maxlength: 80 },
    payload: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: BACKGROUND_JOB_STATUSES,
      default: 'pending',
      index: true,
    },
    priority: { type: Number, default: 100, min: 0, max: 1000 },
    runAt: { type: Date, default: () => new Date(), index: true },
    attempts: { type: Number, default: 0, min: 0 },
    maxAttempts: { type: Number, default: 5, min: 1, max: 25 },
    leaseOwner: { type: String, default: null, index: true },
    leaseExpiresAt: { type: Date, default: null, index: true },
    lastError: { type: String, default: null, maxlength: 4000 },
    completedAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    idempotencyKey: { type: String, default: null },
  },
  { timestamps: true }
);

/** Due / claimable jobs: pending|retrying ready now, or expired leases. */
backgroundJobSchema.index({ status: 1, runAt: 1, priority: -1 });
backgroundJobSchema.index({ status: 1, leaseExpiresAt: 1 });
backgroundJobSchema.index(
  { idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      idempotencyKey: { $type: 'string' },
      status: { $in: ['pending', 'leased', 'running', 'retrying'] },
    },
  }
);
backgroundJobSchema.index({ organizationId: 1, type: 1, createdAt: -1 });
backgroundJobSchema.index({ status: 1, failedAt: -1 });

export const BackgroundJobModel: Model<BackgroundJobDocument> =
  mongoose.models.BackgroundJob ??
  mongoose.model<BackgroundJobDocument>('BackgroundJob', backgroundJobSchema);
