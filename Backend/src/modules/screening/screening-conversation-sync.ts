import mongoose from 'mongoose';

import { emitConversationMessageCreated, emitOutreachEnrollmentUpdated } from '../../realtime/events.js';
import { ConversationMessageModel } from '../conversations/conversation-message.model.js';
import { ConversationThreadModel } from '../conversations/conversation-thread.model.js';
import { OutreachEnrollmentModel } from '../outreach/enrollment.model.js';
import { decisionFromAiRecommendation } from './scoring.js';

function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || seconds <= 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

function outcomeLine(row: {
  recommendation?: string | null;
  overallScore?: number | null;
  callStatus: string;
}): string {
  if (row.recommendation) {
    const rec = String(row.recommendation).replace(/_/g, ' ');
    if (row.overallScore != null) return `${rec} · score ${row.overallScore}`;
    return rec;
  }
  if (row.overallScore != null) return `Score ${row.overallScore}`;
  return `Screening call ${row.callStatus}`;
}

function highlightsFromRow(row: {
  extractedVariables?: Record<string, unknown>;
}): string[] {
  const extracted = row.extractedVariables || {};
  const out: string[] = [];
  const keys = [
    'interest_level',
    'final_outcome',
    'notice_period',
    'notice_period_answer',
    'salary',
    'salary_expectation',
    'ctc',
    'location',
    'preferred_location',
    'skills',
  ];
  for (const key of keys) {
    const value = extracted[key];
    if (value == null || value === '') continue;
    out.push(`${key.replace(/_/g, ' ')}: ${String(value)}`);
    if (out.length >= 6) break;
  }
  return out;
}

async function resolveOutreachThread(input: {
  organizationId: string;
  candidateId: string;
  enrollmentId?: string | null;
  campaignId?: string | null;
}) {
  if (input.enrollmentId && mongoose.isValidObjectId(input.enrollmentId)) {
    const byEnrollment = await ConversationThreadModel.findOne({
      organizationId: input.organizationId,
      enrollmentId: input.enrollmentId,
    }).sort({ updatedAt: -1 });
    if (byEnrollment) return byEnrollment;
  }

  if (input.campaignId && mongoose.isValidObjectId(input.campaignId)) {
    return ConversationThreadModel.findOne({
      organizationId: input.organizationId,
      candidateId: input.candidateId,
      campaignId: input.campaignId,
    }).sort({ updatedAt: -1 });
  }

  return null;
}

export async function syncScreeningCandidateToConversation(input: {
  row: {
    _id: unknown;
    candidateId: unknown;
    enrollmentId?: unknown;
    providerCallId?: string | null;
    callStatus: string;
    durationSeconds?: number | null;
    summary?: string | null;
    transcript?: string | null;
    recordingReference?: string | null;
    overallScore?: number | null;
    recommendation?: string | null;
    extractedVariables?: Record<string, unknown>;
    completedAt?: Date | null;
    updatedAt?: Date;
  };
  screening: {
    _id: unknown;
    organizationId: unknown;
    campaignId?: unknown;
    jobId?: unknown;
    name?: string | null;
  };
}): Promise<{ synced: boolean; threadId?: string }> {
  const { row, screening } = input;
  const transcript = String(row.transcript || '').trim();
  const summary = String(row.summary || '').trim();
  const recordingUrl = String(row.recordingReference || '').trim() || null;
  const terminal = ['completed', 'no_answer', 'voicemail', 'busy', 'failed', 'cancelled'].includes(
    String(row.callStatus || '')
  );

  if (!transcript && !summary && !recordingUrl && !terminal) {
    return { synced: false };
  }

  const thread = await resolveOutreachThread({
    organizationId: String(screening.organizationId),
    candidateId: String(row.candidateId),
    enrollmentId: row.enrollmentId ? String(row.enrollmentId) : null,
    campaignId: screening.campaignId ? String(screening.campaignId) : null,
  });
  if (!thread) return { synced: false };

  const callKey = row.providerCallId || String(row._id);
  const providerMessageId = `screening-voice:${String(screening._id)}:${callKey}`;
  const meta = {
    duration: formatDuration(row.durationSeconds),
    outcome: outcomeLine(row),
    highlights: highlightsFromRow(row),
    recordingUrl,
    callId: row.providerCallId || null,
    screeningId: String(screening._id),
    resultId: String(row._id),
    status: row.callStatus,
    source: 'screening',
  };
  const bodyText = (transcript || summary || `AI screening call ${row.callStatus}`).slice(
    0,
    50000
  );

  const msg = await ConversationMessageModel.findOneAndUpdate(
    {
      organizationId: thread.organizationId,
      provider: 'hunar',
      providerMessageId,
    },
    {
      $set: {
        organizationId: thread.organizationId,
        threadId: thread._id,
        provider: 'hunar',
        channel: 'ai_voice',
        direction: 'outbound',
        sender: 'Huntlo Voice AI',
        recipient: null,
        subject: screening.name ? `Screening: ${screening.name}` : 'AI screening call',
        bodyText,
        bodyHtml: JSON.stringify(meta),
        providerMessageId,
        providerThreadId: row.providerCallId || String(screening._id),
        deliveryStatus: 'delivered',
        messageType: 'voice_summary',
        aiGenerated: true,
        sentAt: row.completedAt || row.updatedAt || new Date(),
        receivedAt: row.completedAt || new Date(),
        error: null,
      },
    },
    { upsert: true, new: true }
  );

  thread.lastMessageAt = msg.sentAt || new Date();
  thread.lastMessagePreview = (summary || transcript || 'AI screening call').slice(0, 240);
  if (!thread.channels.includes('ai_voice')) {
    thread.channels = [...thread.channels, 'ai_voice'];
  }
  await thread.save();

  emitConversationMessageCreated({
    organizationId: String(thread.organizationId),
    threadId: String(thread._id),
    messageId: String(msg._id),
    campaignId: thread.campaignId ? String(thread.campaignId) : null,
    candidateId: String(row.candidateId),
    direction: 'outbound',
    channel: 'ai_voice',
  });

  return { synced: true, threadId: String(thread._id) };
}

/**
 * Push screening completion + AI decision onto the outreach enrollment so
 * inbox/campaign badges move from "In screening" to Shortlisted/Rejected.
 */
export async function syncEnrollmentScreeningDecision(input: {
  organizationId: string;
  candidateId: string;
  enrollmentId?: string | null;
  screeningId: string;
  recommendation?: string | null;
  recruiterDecision?: string | null;
}): Promise<boolean> {
  const decision =
    input.recruiterDecision === 'shortlisted' || input.recruiterDecision === 'rejected'
      ? input.recruiterDecision
      : decisionFromAiRecommendation(input.recommendation);
  if (!decision) return false;

  let enrollment = null;
  if (input.enrollmentId && mongoose.isValidObjectId(input.enrollmentId)) {
    enrollment = await OutreachEnrollmentModel.findById(input.enrollmentId);
  }
  if (!enrollment) {
    enrollment = await OutreachEnrollmentModel.findOne({
      organizationId: input.organizationId,
      candidateId: input.candidateId,
      'screeningState.screeningId': input.screeningId,
    });
  }
  if (!enrollment) return false;

  const prevStatus = enrollment.screeningState?.status;
  const prevDecision = enrollment.screeningState?.decision ?? null;
  enrollment.screeningState = {
    status: 'completed',
    screeningId: input.screeningId,
    decision,
  };
  await enrollment.save();

  if (prevStatus !== 'completed' || prevDecision !== decision) {
    emitOutreachEnrollmentUpdated({
      organizationId: input.organizationId,
      campaignId: String(enrollment.campaignId),
      candidateId: String(enrollment.candidateId),
      enrollmentId: String(enrollment._id),
      status: enrollment.status,
      currentStepIndex: enrollment.currentStepIndex,
      nextSendAt: enrollment.nextActionAt?.toISOString() ?? null,
    });
  }

  return true;
}
