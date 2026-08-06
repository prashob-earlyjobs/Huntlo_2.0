import mongoose from 'mongoose';

export const WHATSAPP_LIFECYCLE_SEND_STATUSES = ['pending', 'sent', 'skipped'] as const;
export type WhatsAppLifecycleSendStatus =
  (typeof WHATSAPP_LIFECYCLE_SEND_STATUSES)[number];

/**
 * Scheduled / completed one-shot lifecycle WhatsApp sends
 * (for admin-managed product events such as signup nudges).
 */
const whatsappLifecycleSendSchema = new mongoose.Schema(
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
      enum: WHATSAPP_LIFECYCLE_SEND_STATUSES,
      default: 'pending',
      index: true,
    },
    sendAt: { type: Date, required: true, index: true },
    sentAt: { type: Date, default: null },
    skippedAt: { type: Date, default: null },
    skipReason: { type: String, default: null, trim: true, maxlength: 160 },
  },
  { timestamps: true }
);

whatsappLifecycleSendSchema.index({ userId: 1, templateKey: 1 }, { unique: true });
whatsappLifecycleSendSchema.index({ status: 1, sendAt: 1 });

export type WhatsAppLifecycleSendDocument = mongoose.Document &
  mongoose.InferSchemaType<typeof whatsappLifecycleSendSchema> & {
    _id: mongoose.Types.ObjectId;
    status: WhatsAppLifecycleSendStatus;
    createdAt: Date;
    updatedAt: Date;
  };

export const WhatsAppLifecycleSendModel = (mongoose.models.WhatsAppLifecycleSend ??
  mongoose.model(
    'WhatsAppLifecycleSend',
    whatsappLifecycleSendSchema
  )) as mongoose.Model<WhatsAppLifecycleSendDocument>;
