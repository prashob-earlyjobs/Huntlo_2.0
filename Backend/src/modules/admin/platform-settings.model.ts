import mongoose from 'mongoose';

export const PLATFORM_PROVIDERS = [
  'future-jobs',
  'gemini',
  'gmail',
  'outlook',
  'zoho',
  'smtp',
  'meta-whatsapp',
  'gupshup',
  'hunar',
  'calendly',
  'razorpay',
  'dodo',
  'realtime',
] as const;

export type PlatformProviderId = (typeof PLATFORM_PROVIDERS)[number];

export const PROVIDER_STATUSES = [
  'connected',
  'not_configured',
  'error',
  'degraded',
] as const;
export type ProviderStatus = (typeof PROVIDER_STATUSES)[number];

const providerSettingSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: PLATFORM_PROVIDERS, required: true },
    /** Encrypted or redacted config blob — never returned raw to clients. */
    secretsCiphertext: { type: String, default: null },
    /** Non-secret metadata (base URLs, account labels, etc.). */
    publicConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
    maskedIdentifier: { type: String, default: null },
    status: { type: String, enum: PROVIDER_STATUSES, default: 'not_configured' },
    lastTestedAt: { type: Date, default: null },
    errorSummary: { type: String, default: null, maxlength: 500 },
    configured: { type: Boolean, default: false },
  },
  { _id: false }
);

const platformSettingsSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, default: 'platform', unique: true },
    providers: { type: [providerSettingSchema], default: [] },
    featureFlags: { type: mongoose.Schema.Types.Mixed, default: {} },
    maintenanceMode: { type: Boolean, default: false },
    updatedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

export type PlatformSettingsDocument = mongoose.InferSchemaType<
  typeof platformSettingsSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const PlatformSettingsModel = (mongoose.models.PlatformSettings ??
  mongoose.model(
    'PlatformSettings',
    platformSettingsSchema
  )) as mongoose.Model<PlatformSettingsDocument>;
