import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const INTEREST_LABELS = [
  'interested',
  'not_interested',
  'neutral',
  'unclear',
  'opt_out',
] as const;
export type InterestLabel = (typeof INTEREST_LABELS)[number];

export const INTENT_LABELS = [
  'ask_question',
  'provide_info',
  'request_call',
  'decline',
  'opt_out',
  'other',
] as const;
export type IntentLabel = (typeof INTENT_LABELS)[number];

export type ReplyClassificationDocument = Omit<Document, 'model'> & {
  organizationId: mongoose.Types.ObjectId;
  threadId: mongoose.Types.ObjectId;
  messageId: mongoose.Types.ObjectId;
  interest: InterestLabel;
  intent: IntentLabel;
  extractedVariables: Record<string, unknown>;
  confidence: number;
  model: string;
  suggestedQualificationStatus: string | null;
  recruiterReviewedAt: Date | null;
  recruiterOverride: {
    interest: InterestLabel | null;
    intent: IntentLabel | null;
    qualificationStatus: string | null;
    note: string | null;
    userId: mongoose.Types.ObjectId | null;
    at: Date | null;
  } | null;
  audit: Array<{
    action: string;
    at: Date;
    userId: mongoose.Types.ObjectId | null;
    detail: string | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
};

const replyClassificationSchema = new Schema<ReplyClassificationDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    threadId: {
      type: Schema.Types.ObjectId,
      ref: 'ConversationThread',
      required: true,
      index: true,
    },
    messageId: {
      type: Schema.Types.ObjectId,
      ref: 'ConversationMessage',
      required: true,
      unique: true,
    },
    interest: { type: String, enum: INTEREST_LABELS, required: true },
    intent: { type: String, enum: INTENT_LABELS, required: true },
    extractedVariables: { type: Schema.Types.Mixed, default: {} },
    confidence: { type: Number, min: 0, max: 1, default: 0 },
    model: { type: String, required: true },
    suggestedQualificationStatus: { type: String, default: null },
    recruiterReviewedAt: { type: Date, default: null },
    recruiterOverride: {
      type: new Schema(
        {
          interest: { type: String, enum: INTEREST_LABELS, default: null },
          intent: { type: String, enum: INTENT_LABELS, default: null },
          qualificationStatus: { type: String, default: null },
          note: { type: String, default: null },
          userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
          at: { type: Date, default: null },
        },
        { _id: false }
      ),
      default: null,
    },
    audit: {
      type: [
        new Schema(
          {
            action: { type: String, required: true },
            at: { type: Date, required: true },
            userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
            detail: { type: String, default: null },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

replyClassificationSchema.index({ threadId: 1, createdAt: -1 });

export const ReplyClassificationModel = (mongoose.models.ReplyClassification ??
  mongoose.model<ReplyClassificationDocument>(
    'ReplyClassification',
    replyClassificationSchema
  )) as Model<ReplyClassificationDocument>;
