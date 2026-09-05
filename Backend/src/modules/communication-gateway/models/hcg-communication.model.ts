import mongoose, { type Document, type Model, Schema } from 'mongoose';

import {
  HCG_COMMUNICATION_STATUSES,
  HCG_COMMUNICATION_TYPES,
  type HcgCommunicationStatus,
  type HcgCommunicationType,
} from './hcg.types.js';

export type HcgCommunicationDocument = Document & {
  type: HcgCommunicationType;
  vendor: string;
  receiver: string;
  message?: string;
  details?: unknown;
  metadata?: unknown;
  idempotencyKey?: string;
  status: HcgCommunicationStatus;
  attempts: number;
  providerMessageId?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
};

const hcgCommunicationSchema = new Schema<HcgCommunicationDocument>(
  {
    type: { type: String, enum: HCG_COMMUNICATION_TYPES, required: true },
    vendor: { type: String, required: true },
    receiver: { type: String, required: true },
    message: { type: String },
    details: { type: Schema.Types.Mixed },
    metadata: { type: Schema.Types.Mixed },
    idempotencyKey: { type: String, unique: true, sparse: true },
    status: {
      type: String,
      enum: HCG_COMMUNICATION_STATUSES,
      default: 'queued',
    },
    attempts: { type: Number, default: 0 },
    providerMessageId: { type: String },
    error: { type: String },
  },
  { timestamps: true }
);

export const HcgCommunicationModel = (mongoose.models.HcgCommunication ??
  mongoose.model<HcgCommunicationDocument>(
    'HcgCommunication',
    hcgCommunicationSchema,
    'hcg_communications'
  )) as Model<HcgCommunicationDocument>;
