import mongoose from 'mongoose';

const recruitingDefaultsSchema = new mongoose.Schema(
  {
    defaultCandidateStatus: { type: String, default: 'New', trim: true, maxlength: 80 },
    defaultRecruiter: { type: String, default: '', trim: true, maxlength: 120 },
    defaultTalentList: { type: String, default: '', trim: true, maxlength: 160 },
    defaultJobLocation: { type: String, default: '', trim: true, maxlength: 160 },
  },
  { _id: false }
);

const outreachDefaultsSchema = new mongoose.Schema(
  {
    defaultSender: { type: String, default: '', trim: true, maxlength: 200 },
    sendWindowStart: { type: String, default: '09:00', trim: true, maxlength: 8 },
    sendWindowEnd: { type: String, default: '19:00', trim: true, maxlength: 8 },
    timezoneHandling: {
      type: String,
      default: 'Candidate local timezone',
      trim: true,
      maxlength: 80,
    },
    replyStopBehaviour: {
      type: String,
      default: 'Stop sequence on any reply',
      trim: true,
      maxlength: 120,
    },
    optOutFooter: { type: String, default: '', trim: true, maxlength: 500 },
  },
  { _id: false }
);

const screeningDefaultsSchema = new mongoose.Schema(
  {
    language: { type: String, default: 'English (India)', trim: true, maxlength: 80 },
    voiceTone: { type: String, default: 'Professional & warm', trim: true, maxlength: 80 },
    attempts: { type: String, default: '3', trim: true, maxlength: 8 },
    attemptInterval: { type: String, default: '4 hours', trim: true, maxlength: 40 },
    minimumShortlistScore: { type: String, default: '70', trim: true, maxlength: 8 },
  },
  { _id: false }
);

const schedulingDefaultsSchema = new mongoose.Schema(
  {
    defaultCalendlyEvent: {
      type: String,
      default: '30-min Screening Call',
      trim: true,
      maxlength: 160,
    },
    reminderTimings: {
      type: String,
      default: '24h · 1h · 15m before',
      trim: true,
      maxlength: 80,
    },
    interviewDuration: { type: String, default: '30 minutes', trim: true, maxlength: 40 },
    bufferTime: { type: String, default: '15 minutes', trim: true, maxlength: 40 },
  },
  { _id: false }
);

const consentSettingsSchema = new mongoose.Schema(
  {
    email: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: true },
    voice: { type: Boolean, default: true },
    dataSharing: { type: Boolean, default: false },
  },
  { _id: false }
);

const workspaceSettingsSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true,
      index: true,
    },
    defaultCurrency: { type: String, default: 'INR', trim: true, maxlength: 16 },
    defaultTimezone: { type: String, default: 'Asia/Kolkata', trim: true, maxlength: 80 },
    dateFormat: { type: String, default: 'DD MMM YYYY', trim: true, maxlength: 40 },
    recruitingDefaults: { type: recruitingDefaultsSchema, default: () => ({}) },
    outreachDefaults: { type: outreachDefaultsSchema, default: () => ({}) },
    screeningDefaults: { type: screeningDefaultsSchema, default: () => ({}) },
    schedulingDefaults: { type: schedulingDefaultsSchema, default: () => ({}) },
    /** Retention window in days. Null / 0 means retain indefinitely. */
    candidateRetentionDays: { type: Number, default: 730, min: 0, max: 3650 },
    consentSettings: { type: consentSettingsSchema, default: () => ({}) },
    featureFlags: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
  },
  { timestamps: true }
);

export type WorkspaceSettingsDocument = mongoose.InferSchemaType<
  typeof workspaceSettingsSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const WorkspaceSettingsModel = (mongoose.models.WorkspaceSettings ??
  mongoose.model(
    'WorkspaceSettings',
    workspaceSettingsSchema
  )) as mongoose.Model<WorkspaceSettingsDocument>;
