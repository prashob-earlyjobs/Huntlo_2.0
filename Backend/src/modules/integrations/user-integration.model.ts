import mongoose, { type Document, type Model, Schema } from 'mongoose';

import type { EncryptedPayload } from '../../shared/encryption/cipher.js';

export const INTEGRATION_PROVIDERS = [
  'gmail',
  'outlook',
  'zoho-mail',
  'smtp',
  'meta-whatsapp',
  'gupshup',
  'huntlo-whatsapp',
  'hunar',
  'calendly',
  'future-jobs',
] as const;
export type IntegrationProviderId = (typeof INTEGRATION_PROVIDERS)[number];

export const INTEGRATION_CATEGORIES = [
  'email',
  'whatsapp',
  'voice',
  'scheduling',
  'candidate_data',
  'payment',
] as const;
export type IntegrationCategory = (typeof INTEGRATION_CATEGORIES)[number];

export const INTEGRATION_STATUSES = [
  'connected',
  'disconnected',
  'needs_attention',
  'expired',
  'disabled',
  'testing',
] as const;
export type IntegrationStatus = (typeof INTEGRATION_STATUSES)[number];

export const PROVIDER_CATEGORY: Record<IntegrationProviderId, IntegrationCategory> = {
  gmail: 'email',
  outlook: 'email',
  'zoho-mail': 'email',
  smtp: 'email',
  'meta-whatsapp': 'whatsapp',
  gupshup: 'whatsapp',
  'huntlo-whatsapp': 'whatsapp',
  hunar: 'voice',
  calendly: 'scheduling',
  'future-jobs': 'candidate_data',
};

export type UserIntegrationDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  provider: IntegrationProviderId;
  category: IntegrationCategory;
  encryptedCredentials: EncryptedPayload | null;
  encryptedRefreshToken: EncryptedPayload | null;
  encryptedAccessToken: EncryptedPayload | null;
  tokenExpiresAt: Date | null;
  providerAccountId: string | null;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  status: IntegrationStatus;
  isDefault: boolean;
  config: Record<string, unknown>;
  scopes: string[];
  lastTestedAt: Date | null;
  lastSyncAt: Date | null;
  errorCode: string | null;
  errorMessage: string | null;
  disconnectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const encryptedPayloadSchema = new Schema(
  {
    ciphertext: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, required: true },
    version: { type: Number, required: true, default: 1 },
  },
  { _id: false }
);

const userIntegrationSchema = new Schema<UserIntegrationDocument>(
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
    provider: {
      type: String,
      enum: INTEGRATION_PROVIDERS,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: INTEGRATION_CATEGORIES,
      required: true,
      index: true,
    },
    encryptedCredentials: { type: encryptedPayloadSchema, default: null },
    encryptedRefreshToken: { type: encryptedPayloadSchema, default: null },
    encryptedAccessToken: { type: encryptedPayloadSchema, default: null },
    tokenExpiresAt: { type: Date, default: null },
    providerAccountId: { type: String, default: null, trim: true },
    displayName: { type: String, default: null, trim: true },
    email: { type: String, default: null, trim: true, lowercase: true },
    phone: { type: String, default: null, trim: true },
    status: {
      type: String,
      enum: INTEGRATION_STATUSES,
      default: 'disconnected',
      index: true,
    },
    isDefault: { type: Boolean, default: false, index: true },
    config: { type: Schema.Types.Mixed, default: {} },
    scopes: { type: [String], default: [] },
    lastTestedAt: { type: Date, default: null },
    lastSyncAt: { type: Date, default: null },
    errorCode: { type: String, default: null },
    errorMessage: { type: String, default: null },
    disconnectedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userIntegrationSchema.index({ organizationId: 1, userId: 1, provider: 1 });
userIntegrationSchema.index({ organizationId: 1, category: 1, isDefault: 1 });
userIntegrationSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

export const UserIntegrationModel: Model<UserIntegrationDocument> =
  mongoose.models.UserIntegration ??
  mongoose.model<UserIntegrationDocument>('UserIntegration', userIntegrationSchema);
