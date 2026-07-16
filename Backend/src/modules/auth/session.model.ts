import mongoose from 'mongoose';

const userSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true, unique: true, index: true },
    device: { type: String, default: 'Unknown device' },
    browser: { type: String, default: 'Unknown browser' },
    ipHash: { type: String, default: null },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null, index: true },
    lastUsedAt: { type: Date, default: null },
    replacedBySessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserSession',
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type UserSessionDocument = mongoose.InferSchemaType<typeof userSessionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserSessionModel = (mongoose.models.UserSession ??
  mongoose.model('UserSession', userSessionSchema)) as mongoose.Model<UserSessionDocument>;

const tokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type SecurityTokenDocument = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
};

export const EmailVerificationTokenModel = (mongoose.models.EmailVerificationToken ??
  mongoose.model('EmailVerificationToken', tokenSchema)) as mongoose.Model<SecurityTokenDocument>;

export const PasswordResetTokenModel = (mongoose.models.PasswordResetToken ??
  mongoose.model('PasswordResetToken', tokenSchema)) as mongoose.Model<SecurityTokenDocument>;
