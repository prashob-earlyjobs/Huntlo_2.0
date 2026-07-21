/**
 * Shared VoiceCall ledger for screening + outreach Hunar dials.
 * Pending stubs use callId `pending:{requestId}:{phoneDigits}` until webhooks arrive.
 */

import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const VOICE_CALL_STATUSES = [
  'pending',
  'queued',
  'ringing',
  'in_progress',
  'completed',
  'no_answer',
  'busy',
  'failed',
  'cancelled',
  'voicemail',
] as const;
export type VoiceCallStatus = (typeof VOICE_CALL_STATUSES)[number];

export const VOICE_CALL_SOURCES = ['outreach', 'screening', 'legacy'] as const;
export type VoiceCallSource = (typeof VOICE_CALL_SOURCES)[number];

export type VoiceCallResult = {
  summary: string | null;
  interestLevel: string | null;
  candidateStatus: string | null;
  finalOutcome: string | null;
  callbackRequested: boolean;
  callbackTime: string | null;
  candidateQuestions: string[];
  objectionsOrConcerns: string[];
  ctc: string | null;
  noticePeriod: string | null;
  skills: string | null;
  education: string | null;
  location: string | null;
  raw: Record<string, unknown> | null;
};

export type VoiceCallDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  source: VoiceCallSource;
  campaignId: mongoose.Types.ObjectId | null;
  screeningId: mongoose.Types.ObjectId | null;
  enrollmentId: mongoose.Types.ObjectId | null;
  candidateId: mongoose.Types.ObjectId | null;
  callId: string;
  requestId: string;
  agentId: string | null;
  contactName: string | null;
  toNumber: string;
  toNumberDigits: string;
  status: VoiceCallStatus;
  lifecycleStatus: string | null;
  durationSeconds: number | null;
  durationMinutes: number | null;
  retryCount: number;
  maxRetries: number;
  retriesLeft: number | null;
  nextRetryAt: Date | null;
  recordingUrl: string | null;
  summaryText: string | null;
  transcript: string | null;
  callResult: VoiceCallResult;
  statusPayload: Record<string, unknown> | null;
  resultPayload: Record<string, unknown> | null;
  recordingPayload: Record<string, unknown> | null;
  summaryPayload: Record<string, unknown> | null;
  quotaReservationKey: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const callResultSchema = new Schema<VoiceCallResult>(
  {
    summary: { type: String, default: null },
    interestLevel: { type: String, default: null },
    candidateStatus: { type: String, default: null },
    finalOutcome: { type: String, default: null },
    callbackRequested: { type: Boolean, default: false },
    callbackTime: { type: String, default: null },
    candidateQuestions: { type: [String], default: [] },
    objectionsOrConcerns: { type: [String], default: [] },
    ctc: { type: String, default: null },
    noticePeriod: { type: String, default: null },
    skills: { type: String, default: null },
    education: { type: String, default: null },
    location: { type: String, default: null },
    raw: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const voiceCallSchema = new Schema<VoiceCallDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    source: { type: String, enum: VOICE_CALL_SOURCES, required: true, index: true },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'OutreachCampaign',
      default: null,
      index: true,
    },
    screeningId: {
      type: Schema.Types.ObjectId,
      ref: 'Screening',
      default: null,
      index: true,
    },
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: 'OutreachEnrollment',
      default: null,
      index: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'SavedCandidate',
      default: null,
      index: true,
    },
    callId: { type: String, required: true, trim: true },
    requestId: { type: String, required: true, trim: true, index: true },
    agentId: { type: String, default: null },
    contactName: { type: String, default: null },
    toNumber: { type: String, required: true },
    toNumberDigits: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: VOICE_CALL_STATUSES,
      default: 'pending',
      index: true,
    },
    lifecycleStatus: { type: String, default: null },
    durationSeconds: { type: Number, default: null },
    durationMinutes: { type: Number, default: null },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 0 },
    retriesLeft: { type: Number, default: null },
    nextRetryAt: { type: Date, default: null },
    recordingUrl: { type: String, default: null },
    summaryText: { type: String, default: null },
    transcript: { type: String, default: null },
    callResult: { type: callResultSchema, default: () => ({}) },
    statusPayload: { type: Schema.Types.Mixed, default: null },
    resultPayload: { type: Schema.Types.Mixed, default: null },
    recordingPayload: { type: Schema.Types.Mixed, default: null },
    summaryPayload: { type: Schema.Types.Mixed, default: null },
    quotaReservationKey: { type: String, default: null },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

voiceCallSchema.index({ campaignId: 1, callId: 1 }, { unique: true, sparse: true });
voiceCallSchema.index(
  { screeningId: 1, callId: 1 },
  { unique: true, partialFilterExpression: { screeningId: { $type: 'objectId' } } }
);
voiceCallSchema.index({ organizationId: 1, requestId: 1, toNumberDigits: 1 });

export function pendingVoiceCallId(requestId: string, phoneDigits: string): string {
  return `pending:${requestId}:${phoneDigits}`;
}

export function isVoiceCallTerminal(input: {
  status: string;
  retriesLeft?: number | null;
  nextRetryAt?: Date | null;
}): boolean {
  const status = String(input.status || '').toLowerCase();
  const retriesLeft =
    typeof input.retriesLeft === 'number' && Number.isFinite(input.retriesLeft)
      ? input.retriesLeft
      : 0;
  if (retriesLeft > 0 || input.nextRetryAt) return false;
  return ['completed', 'failed', 'cancelled', 'no_answer', 'busy', 'voicemail'].includes(
    status
  );
}

export const VoiceCallModel: Model<VoiceCallDocument> =
  mongoose.models.VoiceCall ||
  mongoose.model<VoiceCallDocument>('VoiceCall', voiceCallSchema);
