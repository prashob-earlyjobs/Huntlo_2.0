import mongoose from 'mongoose';

export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export const DENSITY_PREFERENCES = ['compact', 'comfortable'] as const;
export type DensityPreference = (typeof DENSITY_PREFERENCES)[number];

export const NOTIFICATION_EVENT_IDS = [
  'candidateReplies',
  'campaignCompletion',
  'screeningCompletion',
  'interviewBooking',
  'usageWarnings',
  'integrationErrors',
  'productUpdates',
] as const;
export type NotificationEventId = (typeof NOTIFICATION_EVENT_IDS)[number];

export type NotificationChannelPrefs = {
  inApp: boolean;
  email: boolean;
  whatsapp: boolean;
};

export type NotificationPreferences = Record<NotificationEventId, NotificationChannelPrefs>;

const channelSchema = new mongoose.Schema(
  {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false },
  },
  { _id: false }
);

function defaultNotificationPreferences(): NotificationPreferences {
  return {
    candidateReplies: { inApp: true, email: true, whatsapp: true },
    campaignCompletion: { inApp: true, email: true, whatsapp: false },
    screeningCompletion: { inApp: true, email: true, whatsapp: false },
    interviewBooking: { inApp: true, email: true, whatsapp: true },
    usageWarnings: { inApp: true, email: true, whatsapp: false },
    integrationErrors: { inApp: true, email: true, whatsapp: false },
    productUpdates: { inApp: true, email: false, whatsapp: false },
  };
}

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    theme: { type: String, enum: THEME_PREFERENCES, default: 'system' },
    density: { type: String, enum: DENSITY_PREFERENCES, default: 'comfortable' },
    timezone: { type: String, default: 'Asia/Kolkata', trim: true, maxlength: 80 },
    locale: { type: String, default: 'en-IN', trim: true, maxlength: 20 },
    dateFormat: { type: String, default: 'DD MMM YYYY', trim: true, maxlength: 40 },
    notificationPreferences: {
      type: new mongoose.Schema(
        {
          candidateReplies: { type: channelSchema, default: () => ({ inApp: true, email: true, whatsapp: true }) },
          campaignCompletion: {
            type: channelSchema,
            default: () => ({ inApp: true, email: true, whatsapp: false }),
          },
          screeningCompletion: {
            type: channelSchema,
            default: () => ({ inApp: true, email: true, whatsapp: false }),
          },
          interviewBooking: {
            type: channelSchema,
            default: () => ({ inApp: true, email: true, whatsapp: true }),
          },
          usageWarnings: {
            type: channelSchema,
            default: () => ({ inApp: true, email: true, whatsapp: false }),
          },
          integrationErrors: {
            type: channelSchema,
            default: () => ({ inApp: true, email: true, whatsapp: false }),
          },
          productUpdates: {
            type: channelSchema,
            default: () => ({ inApp: true, email: false, whatsapp: false }),
          },
        },
        { _id: false }
      ),
      default: () => defaultNotificationPreferences(),
    },
  },
  { timestamps: true }
);

export type UserPreferenceDocument = mongoose.InferSchemaType<typeof userPreferenceSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserPreferenceModel = (mongoose.models.UserPreference ??
  mongoose.model(
    'UserPreference',
    userPreferenceSchema
  )) as mongoose.Model<UserPreferenceDocument>;

export function toPublicPreferences(doc: UserPreferenceDocument) {
  const notifications =
    (doc.notificationPreferences as NotificationPreferences | undefined) ??
    defaultNotificationPreferences();
  return {
    theme: doc.theme as ThemePreference,
    density: doc.density as DensityPreference,
    timezone: doc.timezone,
    locale: doc.locale,
    dateFormat: doc.dateFormat,
    notificationPreferences: notifications,
    appearance: {
      theme: doc.theme as ThemePreference,
      density: doc.density as DensityPreference,
    },
  };
}

export { defaultNotificationPreferences };
