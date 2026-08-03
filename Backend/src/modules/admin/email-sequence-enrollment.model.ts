import mongoose from 'mongoose';

import { EMAIL_SEQUENCE_TYPES, type EmailSequenceType } from './email-template.model.js';

export const EMAIL_SEQUENCE_ENROLLMENT_STATUSES = ['active', 'completed', 'cancelled'] as const;
export type EmailSequenceEnrollmentStatus = (typeof EMAIL_SEQUENCE_ENROLLMENT_STATUSES)[number];

const sentStepSchema = new mongoose.Schema(
  {
    stepIndex: { type: Number, required: true, min: 0 },
    templateKey: { type: String, required: true, trim: true, maxlength: 80 },
    sentAt: { type: Date, required: true },
    skipped: { type: Boolean, default: false },
  },
  { _id: false }
);

const emailSequenceEnrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 320 },
    firstName: { type: String, default: '', trim: true, maxlength: 80 },
    type: {
      type: String,
      enum: EMAIL_SEQUENCE_TYPES,
      required: true,
      index: true,
    },
    startedAt: { type: Date, required: true },
    nextStepIndex: { type: Number, default: 0, min: 0, max: 30 },
    nextSendAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: EMAIL_SEQUENCE_ENROLLMENT_STATUSES,
      default: 'active',
      index: true,
    },
    sentSteps: { type: [sentStepSchema], default: [] },
  },
  { timestamps: true }
);

emailSequenceEnrollmentSchema.index({ userId: 1, type: 1 }, { unique: true });
emailSequenceEnrollmentSchema.index({ status: 1, nextSendAt: 1 });

export type EmailSequenceEnrollmentDocument = mongoose.Document &
  mongoose.InferSchemaType<typeof emailSequenceEnrollmentSchema> & {
    _id: mongoose.Types.ObjectId;
    type: EmailSequenceType;
    status: EmailSequenceEnrollmentStatus;
    createdAt: Date;
    updatedAt: Date;
  };

export const EmailSequenceEnrollmentModel = (mongoose.models.EmailSequenceEnrollment ??
  mongoose.model(
    'EmailSequenceEnrollment',
    emailSequenceEnrollmentSchema
  )) as mongoose.Model<EmailSequenceEnrollmentDocument>;
