import mongoose, { type Document, type Model, Schema } from 'mongoose';

import type { ScreeningLogEntry } from './screening.model.js';
import type { ScreeningMode } from './screening.model.js';

export const CALL_STATUSES = [
  'queued',
  'invited',
  'ringing',
  'in_progress',
  'completed',
  'no_answer',
  'voicemail',
  'busy',
  'failed',
  'cancelled',
  'opted_out',
] as const;
export type CallStatus = (typeof CALL_STATUSES)[number];

export const RECRUITER_DECISIONS = [
  'pending',
  'shortlisted',
  'rejected',
  'call_again',
] as const;
export type RecruiterDecision = (typeof RECRUITER_DECISIONS)[number];

export type ScreeningCandidateDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  screeningId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  mode: ScreeningMode;
  workflowId: mongoose.Types.ObjectId | null;
  enrollmentId: mongoose.Types.ObjectId | null;
  providerCallId: string | null;
  providerRequestId: string | null;
  callStatus: CallStatus;
  providerStatus: string | null;
  lifecycleStatus: string | null;
  attempts: number;
  durationSeconds: number | null;
  transcript: string | null;
  recordingReference: string | null;
  summary: string | null;
  extractedVariables: Record<string, unknown>;
  scoreBreakdown: Record<string, number>;
  overallScore: number | null;
  recommendation: string | null;
  recruiterDecision: RecruiterDecision;
  notes: Array<{ id: string; text: string; authorUserId: string | null; createdAt: Date }>;
  quotaReservationKey: string | null;
  quotaCommittedMinutes: number;
  completedAt: Date | null;
  error: string | null;
  logs: ScreeningLogEntry[];
  audio: {
    requestId: string | null;
    callId: string | null;
    providerStatus: string | null;
    lifecycleStatus: string | null;
    durationSeconds: number | null;
    transcript: string | null;
    recordingReference: string | null;
    summary: string | null;
    quotaReservationKey: string | null;
    quotaCommittedMinutes: number;
  };
  video: {
    jobId: string | null;
    applicationId: string | null;
    invitationStatus: string | null;
    invitationError: string | null;
    logs: ScreeningLogEntry[];
  };
  createdAt: Date;
  updatedAt: Date;
};

const screeningCandidateSchema = new Schema<ScreeningCandidateDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    screeningId: {
      type: Schema.Types.ObjectId,
      ref: 'Screening',
      required: true,
      index: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'SavedCandidate',
      required: true,
      index: true,
    },
    mode: { type: String, enum: ['voice', 'video'], default: 'voice', index: true },
    workflowId: { type: Schema.Types.ObjectId, ref: 'Huntlo360Workflow', default: null },
    enrollmentId: { type: Schema.Types.ObjectId, ref: 'OutreachEnrollment', default: null },
    providerCallId: { type: String, default: null, index: true },
    providerRequestId: { type: String, default: null, index: true },
    callStatus: {
      type: String,
      enum: CALL_STATUSES,
      default: 'queued',
      index: true,
    },
    providerStatus: { type: String, default: null },
    lifecycleStatus: { type: String, default: null },
    attempts: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: null },
    transcript: { type: String, default: null },
    recordingReference: { type: String, default: null },
    summary: { type: String, default: null },
    extractedVariables: { type: Schema.Types.Mixed, default: {} },
    scoreBreakdown: { type: Schema.Types.Mixed, default: {} },
    overallScore: { type: Number, default: null },
    recommendation: { type: String, default: null },
    recruiterDecision: {
      type: String,
      enum: RECRUITER_DECISIONS,
      default: 'pending',
      index: true,
    },
    notes: {
      type: [
        {
          id: { type: String, required: true },
          text: { type: String, required: true },
          authorUserId: { type: String, default: null },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    quotaReservationKey: { type: String, default: null },
    quotaCommittedMinutes: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
    error: { type: String, default: null },
    logs: {
      type: [
        {
          at: { type: Date, required: true },
          event: { type: String, required: true },
          message: { type: String, default: null },
          request: { type: Schema.Types.Mixed, default: null },
          response: { type: Schema.Types.Mixed, default: null },
          error: { type: String, default: null },
        },
      ],
      default: [],
    },
    audio: {
      type: {
        requestId: { type: String, default: null },
        callId: { type: String, default: null },
        providerStatus: { type: String, default: null },
        lifecycleStatus: { type: String, default: null },
        durationSeconds: { type: Number, default: null },
        transcript: { type: String, default: null },
        recordingReference: { type: String, default: null },
        summary: { type: String, default: null },
        quotaReservationKey: { type: String, default: null },
        quotaCommittedMinutes: { type: Number, default: 0 },
      },
      default: undefined,
    },
    video: {
      type: {
        jobId: { type: String, default: null },
        applicationId: { type: String, default: null },
        invitationStatus: { type: String, default: null },
        invitationError: { type: String, default: null },
        logs: {
          type: [
            {
              at: { type: Date, required: true },
              event: { type: String, required: true },
              message: { type: String, default: null },
              request: { type: Schema.Types.Mixed, default: null },
              response: { type: Schema.Types.Mixed, default: null },
              error: { type: String, default: null },
            },
          ],
          default: [],
        },
      },
      default: () => ({
        jobId: null,
        applicationId: null,
        invitationStatus: null,
        invitationError: null,
        logs: [],
      }),
    },
  },
  { timestamps: true }
);

screeningCandidateSchema.index(
  { organizationId: 1, screeningId: 1, candidateId: 1 },
  { unique: true }
);
screeningCandidateSchema.index({ organizationId: 1, providerCallId: 1 });
screeningCandidateSchema.index({ organizationId: 1, recruiterDecision: 1, updatedAt: -1 });

export const ScreeningCandidateModel = (mongoose.models.ScreeningCandidate ??
  mongoose.model<ScreeningCandidateDocument>(
    'ScreeningCandidate',
    screeningCandidateSchema
  )) as Model<ScreeningCandidateDocument>;
