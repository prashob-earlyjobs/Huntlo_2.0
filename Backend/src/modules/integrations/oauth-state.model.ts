import mongoose, { type Document, type Model, Schema } from 'mongoose';

import type { IntegrationProviderId } from './user-integration.model.js';

export type OAuthStateDocument = Document & {
  state: string;
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  provider: IntegrationProviderId;
  codeVerifier: string | null;
  redirectUri: string;
  extras: Record<string, unknown>;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const oauthStateSchema = new Schema<OAuthStateDocument>(
  {
    state: { type: String, required: true, unique: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    provider: { type: String, required: true },
    codeVerifier: { type: String, default: null },
    redirectUri: { type: String, required: true },
    extras: { type: Schema.Types.Mixed, default: {} },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

oauthStateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OAuthStateModel: Model<OAuthStateDocument> =
  mongoose.models.OAuthState ??
  mongoose.model<OAuthStateDocument>('OAuthState', oauthStateSchema);
