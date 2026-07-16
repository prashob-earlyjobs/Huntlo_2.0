import mongoose, { type Document, type Model, Schema } from 'mongoose';

export type WeeklyHourSlot = {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
};

export type DateOverride = {
  date: string;
  enabled: boolean;
  start?: string | null;
  end?: string | null;
  label?: string | null;
};

export type AvailabilityRuleDocument = Document & {
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  timezone: string;
  weeklyHours: WeeklyHourSlot[];
  dateOverrides: DateOverride[];
  unavailableDates: string[];
  bufferBefore: number;
  bufferAfter: number;
  minimumNotice: number;
  maximumBookingWindow: number;
  dailyLimit: number;
  createdAt: Date;
  updatedAt: Date;
};

export const DEFAULT_WEEKLY_HOURS: WeeklyHourSlot[] = [
  { day: 'Monday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Wednesday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Thursday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Friday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Saturday', enabled: false, start: '10:00', end: '14:00' },
  { day: 'Sunday', enabled: false, start: '10:00', end: '14:00' },
];

const availabilityRuleSchema = new Schema<AvailabilityRuleDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    timezone: { type: String, default: 'Asia/Kolkata' },
    weeklyHours: { type: [Schema.Types.Mixed], default: () => [...DEFAULT_WEEKLY_HOURS] },
    dateOverrides: { type: [Schema.Types.Mixed], default: [] },
    unavailableDates: { type: [String], default: [] },
    bufferBefore: { type: Number, default: 15 },
    bufferAfter: { type: Number, default: 15 },
    minimumNotice: { type: Number, default: 24 },
    maximumBookingWindow: { type: Number, default: 14 },
    dailyLimit: { type: Number, default: 6 },
  },
  { timestamps: true }
);

availabilityRuleSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

export const AvailabilityRuleModel = (mongoose.models.AvailabilityRule ??
  mongoose.model<AvailabilityRuleDocument>(
    'AvailabilityRule',
    availabilityRuleSchema
  )) as Model<AvailabilityRuleDocument>;
