import mongoose, { type Document, type Model, Schema } from 'mongoose';

import {
  HCG_QUESTION_STATUSES,
  type HcgOverallAiStatus,
  type HcgQuestionStatus,
  type HcgScreeningQuestion,
} from './hcg.types.js';

export type HcgHunarCallStatus = {
  agent_id?: string;
  answered_by?: string;
  call_id?: string;
  created_at?: string;
  duration_minutes?: number;
  duration_seconds?: number;
  ended_at?: string;
  event_type?: string;
  from_phone_number?: string;
  lifecycle_status?: string;
  max_retries?: number;
  next_retry_scheduled_at?: string | null;
  request_id?: string;
  retries_left?: number;
  retry_count?: number;
  retry_reason?: string | null;
  started_at?: string;
  /** Primary Hunar call status, e.g. COMPLETED, FAILED, QUEUED. */
  status?: string;
  timezone?: string;
  to_number?: string;
};

export type HcgHunarCallRecording = {
  agent_id?: string;
  call_id?: string;
  event_type?: string;
  recording_url?: string;
  request_id?: string;
};

export type HcgHunarCallResult = {
  agent_id?: string;
  call_id?: string;
  event_type?: string;
  request_id?: string;
  result?: Record<string, unknown>;
};

export type HcgHunarCallSummary = {
  agent_id?: string;
  call_id?: string;
  event_type?: string;
  request_id?: string;
  summary?: string;
};

export type HcgHunarCommunicationDocument = Document & {
  agentId: string;
  campaignId: string;
  mobileNumber: string;
  callId?: string;
  overallAIStatus?: HcgOverallAiStatus | string | null;
  overallAIDescription?: string | null;
  questions: HcgScreeningQuestion[];
  call_status?: HcgHunarCallStatus | null;
  call_recording?: HcgHunarCallRecording | null;
  call_result?: HcgHunarCallResult | null;
  call_summary?: HcgHunarCallSummary | null;
  createdAt: Date;
  updatedAt: Date;
};

const hcgHunarCommunicationSchema = new Schema<HcgHunarCommunicationDocument>(
  {
    agentId: { type: String, required: true },
    campaignId: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    callId: String,
    overallAIStatus: { type: String, default: 'awaiting_reply' },
    overallAIDescription: String,
    questions: {
      type: [
        {
          id: String,
          question: String,
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
    call_status: Schema.Types.Mixed,
    call_recording: Schema.Types.Mixed,
    call_result: Schema.Types.Mixed,
    call_summary: Schema.Types.Mixed,
  },
  { timestamps: true }
);

hcgHunarCommunicationSchema.index(
  { agentId: 1, campaignId: 1, mobileNumber: 1 },
  { unique: true }
);

export const HcgHunarCommunicationModel = (mongoose.models.HcgHunarCommunication ??
  mongoose.model<HcgHunarCommunicationDocument>(
    'HcgHunarCommunication',
    hcgHunarCommunicationSchema,
    'hcg_hunar_communications'
  )) as Model<HcgHunarCommunicationDocument>;
