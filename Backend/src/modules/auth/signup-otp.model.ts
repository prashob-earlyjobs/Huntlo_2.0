import mongoose from 'mongoose';

const signupOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    otpHash: { type: String, required: true, index: true },
    /** Mongo TTL deletes the doc when this time is reached. */
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
    /** Earliest time a new OTP may be issued for this email (resend cooldown). */
    resendAvailableAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

signupOtpSchema.index({ email: 1, createdAt: -1 });
signupOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type SignupOtpDocument = {
  _id: mongoose.Types.ObjectId;
  email: string;
  otpHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  resendAvailableAt: Date;
  createdAt: Date;
};

export const SignupOtpModel = (mongoose.models.SignupOtp ??
  mongoose.model('SignupOtp', signupOtpSchema)) as mongoose.Model<SignupOtpDocument>;
