import mongoose, { type Document, type Model, Schema } from 'mongoose';

export type ReminderSettingsDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  channel: 'email' | 'whatsapp' | 'both';
  /** Hours before startAt when reminders should fire, e.g. [24, 2] */
  timings: number[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const reminderSettingsSchema = new Schema<ReminderSettingsDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true,
      index: true,
    },
    channel: { type: String, enum: ['email', 'whatsapp', 'both'], default: 'email' },
    timings: { type: [Number], default: () => [24, 2] },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ReminderSettingsModel = (mongoose.models.ReminderSettings ??
  mongoose.model<ReminderSettingsDocument>(
    'ReminderSettings',
    reminderSettingsSchema
  )) as Model<ReminderSettingsDocument>;

export const REMINDER_LOG_STATUSES = [
  'scheduled',
  'sent',
  'failed',
  'cancelled',
  'skipped',
] as const;
export type ReminderLogStatus = (typeof REMINDER_LOG_STATUSES)[number];

export type ReminderLogDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  interviewId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId | null;
  channel: 'email' | 'whatsapp';
  timingHours: number;
  message: string | null;
  scheduledAt: Date;
  sentAt: Date | null;
  status: ReminderLogStatus;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const reminderLogSchema = new Schema<ReminderLogDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      index: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'SavedCandidate',
      default: null,
      index: true,
    },
    channel: { type: String, enum: ['email', 'whatsapp'], required: true },
    timingHours: { type: Number, required: true },
    message: { type: String, default: null, maxlength: 5000 },
    scheduledAt: { type: Date, required: true, index: true },
    sentAt: { type: Date, default: null },
    status: {
      type: String,
      enum: REMINDER_LOG_STATUSES,
      default: 'scheduled',
      index: true,
    },
    error: { type: String, default: null },
  },
  { timestamps: true }
);

reminderLogSchema.index(
  { interviewId: 1, channel: 1, timingHours: 1 },
  { unique: true }
);
reminderLogSchema.index({ status: 1, scheduledAt: 1 });

export const ReminderLogModel = (mongoose.models.ReminderLog ??
  mongoose.model<ReminderLogDocument>(
    'ReminderLog',
    reminderLogSchema
  )) as Model<ReminderLogDocument>;
