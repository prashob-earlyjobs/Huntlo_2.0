import mongoose, { type Document, type Model, Schema } from 'mongoose';

import {
  HCG_OVERALL_AI_STATUSES,
  HCG_QUESTION_STATUSES,
  type HcgOverallAiStatus,
  type HcgQuestionStatus,
  type HcgScreeningQuestion,
} from './hcg.types.js';

export type HcgZyvkaCallStatus = {
  answered_by?: string;
  call_id?: string;
  created_at?: string;
  duration_minutes?: number;
  duration_seconds?: number;
  ended_at?: string;
  event_type?: string;
  from_phone_number?: string;
  lifecycle_status?: string;
  request_id?: string;
  started_at?: string;
  status?: string;
  to_number?: string;
};

export type HcgZyvkaCallRecording = {
  call_id?: string;
  event_type?: string;
  recording_url?: string;
  request_id?: string;
};

export type HcgZyvkaCallResult = {
  call_id?: string;
  event_type?: string;
  request_id?: string;
  result?: Record<string, unknown>;
};

export type HcgZyvkaCallSummary = {
  call_id?: string;
  event_type?: string;
  request_id?: string;
  summary?: string;
};

export type HcgZyvkaQuestion = HcgScreeningQuestion & {
  required?: boolean;
  pass_condition?: string;
};

export type HcgZyvkaCommunicationDocument = Document & {
  campaignId: string;
  mobileNumber: string;
  calleeName?: string | null;
  callId?: string | null;
  prompt?: string | null;
  metadata?: Record<string, unknown> | null;
  call_status?: HcgZyvkaCallStatus | null;
  call_recording?: HcgZyvkaCallRecording | null;
  call_result?: HcgZyvkaCallResult | null;
  call_summary?: HcgZyvkaCallSummary | null;
  questions: HcgZyvkaQuestion[];
  overallAIStatus?: HcgOverallAiStatus | string | null;
  overallAIDescription?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const hcgZyvkaCommunicationSchema = new Schema<HcgZyvkaCommunicationDocument>(
  {
    campaignId: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    calleeName: String,
    callId: String,
    prompt: String,
    metadata: Schema.Types.Mixed,
    call_status: Schema.Types.Mixed,
    call_recording: Schema.Types.Mixed,
    call_result: Schema.Types.Mixed,
    call_summary: Schema.Types.Mixed,
    questions: {
      type: [
        {
          id: String,
          question: String,
          required: { type: Boolean, default: false },
          pass_condition: String,
          asked: { type: Boolean, default: false },
          answer: String,
          status: {
            type: String,
            enum: HCG_QUESTION_STATUSES as unknown as string[],
            default: 'unanswered' satisfies HcgQuestionStatus,
          },
          description: String,
        },
      ],
      default: [],
    },
    overallAIStatus: {
      type: String,
      enum: HCG_OVERALL_AI_STATUSES as unknown as string[],
    },
    overallAIDescription: String,
  },
  { timestamps: true }
);

hcgZyvkaCommunicationSchema.index({ campaignId: 1, mobileNumber: 1 }, { unique: true });
hcgZyvkaCommunicationSchema.index({ callId: 1 }, { sparse: true });

export const HcgZyvkaCommunicationModel = (mongoose.models.HcgZyvkaCommunication ??
  mongoose.model<HcgZyvkaCommunicationDocument>(
    'HcgZyvkaCommunication',
    hcgZyvkaCommunicationSchema,
    'hcg_zyvkay_communications'
  )) as Model<HcgZyvkaCommunicationDocument>;
