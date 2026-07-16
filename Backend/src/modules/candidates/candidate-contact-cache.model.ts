import mongoose from 'mongoose';

import type { EncryptedPayload } from '../../shared/encryption/cipher.js';

const CONTACT_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const encryptedPayloadSchema = new mongoose.Schema(
  {
    ciphertext: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, required: true },
    version: { type: Number, required: true, default: 1 },
  },
  { _id: false }
);

const candidateContactCacheSchema = new mongoose.Schema(
  {
    externalCandidateId: { type: String, default: null, trim: true, index: true },
    linkedinUrlKey: { type: String, required: true, trim: true, index: true },
    encryptedEmails: { type: [encryptedPayloadSchema], default: [] },
    encryptedPhones: { type: [encryptedPayloadSchema], default: [] },
    verificationData: { type: mongoose.Schema.Types.Mixed, default: null },
    provider: { type: String, required: true, default: 'future_jobs', trim: true },
    fetchedAt: { type: Date, required: true, default: () => new Date() },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + CONTACT_CACHE_TTL_MS),
    },
  },
  { timestamps: true }
);

candidateContactCacheSchema.index({ provider: 1, linkedinUrlKey: 1 }, { unique: true });
candidateContactCacheSchema.index(
  { provider: 1, externalCandidateId: 1 },
  {
    unique: true,
    partialFilterExpression: { externalCandidateId: { $type: 'string' } },
  }
);
candidateContactCacheSchema.index({ expiresAt: 1 });

export const CANDIDATE_CONTACT_CACHE_TTL_MS = CONTACT_CACHE_TTL_MS;

export type CandidateContactCacheDocument = mongoose.InferSchemaType<
  typeof candidateContactCacheSchema
> &
  mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    encryptedEmails: EncryptedPayload[];
    encryptedPhones: EncryptedPayload[];
  };

export const CandidateContactCacheModel = (mongoose.models.CandidateContactCache ??
  mongoose.model(
    'CandidateContactCache',
    candidateContactCacheSchema
  )) as mongoose.Model<CandidateContactCacheDocument>;
