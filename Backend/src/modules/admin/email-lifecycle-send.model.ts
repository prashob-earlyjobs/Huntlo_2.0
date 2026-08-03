import mongoose from 'mongoose';

export const EMAIL_LIFECYCLE_SEND_STATUSES = ['pending', 'sent', 'skipped'] as const;
export type EmailLifecycleSendStatus = (typeof EMAIL_LIFECYCLE_SEND_STATUSES)[number];

/**
 * Scheduled / completed one-shot lifecycle emails
 * (e.g. first search → unlock nudge after a delay).
 */
const emailLifecycleSendSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    templateKey: { type: String, required: true, trim: true, maxlength: 80 },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SourcingSession',
      default: null,
    },
    status: {
      type: String,
      enum: EMAIL_LIFECYCLE_SEND_STATUSES,
      default: 'pending',
      index: true,
    },
    /** When a pending send becomes eligible. */
    sendAt: { type: Date, required: true, index: true },
    sentAt: { type: Date, default: null },
    skippedAt: { type: Date, default: null },
    skipReason: { type: String, default: null, trim: true, maxlength: 160 },
  },
  { timestamps: true }
);

emailLifecycleSendSchema.index({ userId: 1, templateKey: 1 }, { unique: true });
emailLifecycleSendSchema.index({ status: 1, sendAt: 1 });

export type EmailLifecycleSendDocument = mongoose.Document &
  mongoose.InferSchemaType<typeof emailLifecycleSendSchema> & {
    _id: mongoose.Types.ObjectId;
    status: EmailLifecycleSendStatus;
    createdAt: Date;
    updatedAt: Date;
  };

export const EmailLifecycleSendModel = (mongoose.models.EmailLifecycleSend ??
  mongoose.model(
    'EmailLifecycleSend',
    emailLifecycleSendSchema
  )) as mongoose.Model<EmailLifecycleSendDocument>;
