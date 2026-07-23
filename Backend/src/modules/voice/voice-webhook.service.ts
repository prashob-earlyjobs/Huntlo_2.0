/**
 * Shared Hunar webhook upsert for VoiceCall + outreach enrollment sync.
 * Screening continues to use screening/webhook.service.ts for ScreeningCandidate rows;
 * this module handles campaignId callbacks and also mirrors VoiceCall for both.
 */

import mongoose from 'mongoose';

import { getLogger } from '../../config/logger.js';
import {
  hashWebhookPayload,
  mapHunarCallStatus,
  parseHunarWebhookPayload,
  providerEventId,
  verifyHunarWebhookAuthenticity,
  type HunarWebhookKind,
  type ParsedHunarWebhook,
} from '../../providers/hunar/hunar.webhook.js';
import { AppError } from '../../shared/errors/app-error.js';
import { quotaService } from '../../shared/usage/index.js';
import {
  emitConversationMessageCreated,
  emitOutreachCampaignUpdated,
} from '../../realtime/events.js';
import { ConversationMessageModel } from '../conversations/conversation-message.model.js';
import { conversationsService } from '../conversations/conversations.service.js';
import { OutreachCampaignModel } from '../outreach/campaign.model.js';
import { OutreachEnrollmentModel } from '../outreach/enrollment.model.js';
import { refreshCampaignStats } from '../outreach/campaigns.service.js';
import { recordCampaignActivity } from '../outreach/campaign-activity.model.js';
import {
  isVoiceCallTerminal,
  pendingVoiceCallId,
  VoiceCallModel,
  type VoiceCallDocument,
  type VoiceCallStatus,
} from './voice-call.model.js';

const log = () => getLogger().child({ component: 'voice-webhook' });

function digitsOnly(value: string): string {
  return String(value || '').replace(/\D/g, '');
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

function parseCallResult(result: Record<string, unknown> | null) {
  if (!result) {
    return {
      summary: null,
      interestLevel: null,
      candidateStatus: null,
      finalOutcome: null,
      callbackRequested: false,
      callbackTime: null,
      candidateQuestions: [] as string[],
      objectionsOrConcerns: [] as string[],
      ctc: null,
      noticePeriod: null,
      skills: null,
      education: null,
      location: null,
      raw: null as Record<string, unknown> | null,
    };
  }
  const questions = result.candidate_questions ?? result.candidateQuestions;
  const objections = result.objections_or_concerns ?? result.objectionsOrConcerns;
  return {
    summary: asString(result.summary) || null,
    interestLevel:
      asString(result.interest_level || result.interestLevel || result.interested) || null,
    candidateStatus:
      asString(result.candidate_status || result.candidateStatus) || null,
    finalOutcome: asString(result.final_outcome || result.finalOutcome) || null,
    callbackRequested: Boolean(result.callback_requested ?? result.callbackRequested),
    callbackTime: asString(result.callback_time || result.callbackTime) || null,
    candidateQuestions: Array.isArray(questions)
      ? questions.map((q) => asString(q)).filter(Boolean)
      : [],
    objectionsOrConcerns: Array.isArray(objections)
      ? objections.map((q) => asString(q)).filter(Boolean)
      : [],
    ctc: asString(result.ctc) || null,
    noticePeriod: asString(result.notice_period || result.noticePeriod) || null,
    skills: asString(result.skills) || null,
    education: asString(result.education) || null,
    location: asString(result.location) || null,
    raw: result,
  };
}

async function findVoiceCall(input: {
  campaignId?: string | null;
  screeningId?: string | null;
  callId: string;
  requestId: string;
  toNumber: string;
}) {
  if (input.callId) {
    const byId = await VoiceCallModel.findOne({
      ...(input.campaignId ? { campaignId: input.campaignId } : {}),
      ...(input.screeningId ? { screeningId: input.screeningId } : {}),
      callId: input.callId,
    });
    if (byId) return byId;
  }

  const digits = digitsOnly(input.toNumber);
  if (input.requestId && digits) {
    const pendingId = pendingVoiceCallId(input.requestId, digits);
    const pending = await VoiceCallModel.findOne({
      ...(input.campaignId ? { campaignId: input.campaignId } : {}),
      ...(input.screeningId ? { screeningId: input.screeningId } : {}),
      $or: [{ callId: pendingId }, { requestId: input.requestId, toNumberDigits: digits }],
    });
    if (pending) return pending;
  }

  if (digits) {
    return VoiceCallModel.findOne({
      ...(input.campaignId ? { campaignId: input.campaignId } : {}),
      ...(input.screeningId ? { screeningId: input.screeningId } : {}),
      toNumberDigits: digits,
    }).sort({ updatedAt: -1 });
  }
  return null;
}

function applyParsedToCall(row: VoiceCallDocument, kind: HunarWebhookKind, parsed: ParsedHunarWebhook) {
  const previousCallId = row.callId;
  if (parsed.callId && row.callId.startsWith('pending:')) {
    row.callId = parsed.callId;
  } else if (parsed.callId) {
    row.callId = parsed.callId;
  }
  if (parsed.requestId) row.requestId = parsed.requestId;
  if (parsed.agentId) row.agentId = parsed.agentId;
  if (parsed.toNumber) {
    row.toNumber = parsed.toNumber;
    row.toNumberDigits = digitsOnly(parsed.toNumber) || row.toNumberDigits;
  }

  if (kind === 'call-status' || parsed.status) {
    row.statusPayload = parsed.raw;
    if (parsed.status) {
      row.status = mapHunarCallStatus(parsed.status, parsed.answeredBy) as VoiceCallStatus;
    }
    if (parsed.lifecycleStatus) row.lifecycleStatus = parsed.lifecycleStatus;
    if (typeof parsed.retryCount === 'number') row.retryCount = parsed.retryCount;
    if (typeof parsed.maxRetries === 'number') row.maxRetries = parsed.maxRetries;
    const retriesLeftRaw = (parsed.raw as { retries_left?: unknown }).retries_left;
    if (typeof retriesLeftRaw === 'number') row.retriesLeft = retriesLeftRaw;
    const nextRetry = asString(
      (parsed.raw as { next_retry_scheduled_at?: unknown }).next_retry_scheduled_at
    );
    row.nextRetryAt = nextRetry ? new Date(nextRetry) : row.nextRetryAt;
  }

  if (kind === 'call-recording' || parsed.recordingUrl) {
    row.recordingPayload = parsed.raw;
    if (parsed.recordingUrl) row.recordingUrl = parsed.recordingUrl;
  }

  if (kind === 'call-summary' || parsed.summaryText) {
    row.summaryPayload = parsed.raw;
    if (parsed.summaryText) {
      row.summaryText = parsed.summaryText;
      row.callResult = { ...row.callResult, summary: parsed.summaryText };
    }
    if (parsed.transcript) row.transcript = parsed.transcript;
  }

  if (kind === 'call-result' || parsed.result) {
    row.resultPayload = parsed.raw;
    row.callResult = parseCallResult(parsed.result);
    if (!row.summaryText && row.callResult.summary) {
      row.summaryText = row.callResult.summary;
    }
    if (parsed.transcript) row.transcript = parsed.transcript;
  }

  const durationSeconds =
    parsed.durationSeconds ??
    (parsed.durationMinutes != null ? Math.round(parsed.durationMinutes * 60) : null);
  if (durationSeconds != null) {
    row.durationSeconds = durationSeconds;
    row.durationMinutes = Math.max(1, Math.ceil(durationSeconds / 60));
  } else if (parsed.durationMinutes != null) {
    row.durationMinutes = parsed.durationMinutes;
    row.durationSeconds = Math.round(parsed.durationMinutes * 60);
  }

  if (parsed.startedAt) row.startedAt = new Date(parsed.startedAt);
  if (parsed.endedAt) row.endedAt = new Date(parsed.endedAt);

  return previousCallId;
}

async function commitVoiceQuota(row: VoiceCallDocument) {
  if (!row.quotaReservationKey) return;
  try {
    const minutes = Math.max(1, row.durationMinutes || 1);
    if (minutes > 1) {
      const extraKey = `${row.quotaReservationKey}:extra:${minutes}`;
      await quotaService.reserveUsage({
        organizationId: String(row.organizationId),
        metric: 'ai_voice_minutes',
        quantity: minutes - 1,
        idempotencyKey: extraKey,
        relatedEntityType: 'campaign',
        relatedEntityId: String(row.campaignId || row.screeningId || ''),
      });
      await quotaService.commitUsage({
        organizationId: String(row.organizationId),
        metric: 'ai_voice_minutes',
        idempotencyKey: extraKey,
      });
    }
    await quotaService.commitUsage({
      organizationId: String(row.organizationId),
      metric: 'ai_voice_minutes',
      idempotencyKey: row.quotaReservationKey,
    });
  } catch {
    // Already committed or missing reservation — non-fatal.
  }
}

function formatCallDuration(row: VoiceCallDocument): string {
  const seconds = row.durationSeconds;
  if (typeof seconds === 'number' && seconds > 0) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  }
  if (row.durationMinutes) return `${row.durationMinutes}m`;
  return '—';
}

function voiceOutcomeLine(row: VoiceCallDocument): string {
  const interest = asString(row.callResult?.interestLevel);
  const outcome = asString(row.callResult?.finalOutcome || row.callResult?.candidateStatus);
  const summary = asString(row.summaryText || row.callResult?.summary);
  if (interest && outcome) return `${interest} — ${outcome}`;
  if (outcome) return outcome;
  if (interest) return interest;
  if (summary) return summary.slice(0, 160);
  return row.status ? `Call ${row.status}` : 'AI voice call';
}

function voiceHighlights(row: VoiceCallDocument): string[] {
  const highlights: string[] = [];
  const cr = row.callResult;
  if (!cr) return highlights;
  if (cr.noticePeriod) highlights.push(`Notice period: ${cr.noticePeriod}`);
  if (cr.ctc) highlights.push(`CTC: ${cr.ctc}`);
  if (cr.location) highlights.push(`Location: ${cr.location}`);
  if (cr.skills) highlights.push(`Skills: ${cr.skills}`);
  if (cr.education) highlights.push(`Education: ${cr.education}`);
  if (cr.callbackRequested && cr.callbackTime) {
    highlights.push(`Callback requested: ${cr.callbackTime}`);
  }
  for (const q of cr.candidateQuestions || []) {
    if (highlights.length >= 6) break;
    highlights.push(`Asked: ${q}`);
  }
  for (const o of cr.objectionsOrConcerns || []) {
    if (highlights.length >= 6) break;
    highlights.push(`Concern: ${o}`);
  }
  return highlights.slice(0, 6);
}

/** Persist call summary + transcript onto the enrollment conversation thread. */
async function syncConversationVoiceTranscript(row: VoiceCallDocument) {
  if (!row.campaignId || !row.enrollmentId) return;
  const transcript = asString(row.transcript);
  const summary = asString(row.summaryText || row.callResult?.summary);
  if (!transcript && !summary && !isVoiceCallTerminal(row)) return;

  const enrollment = await OutreachEnrollmentModel.findById(row.enrollmentId)
    .select('candidateId campaignId organizationId')
    .lean();
  if (!enrollment?.candidateId) return;

  const campaign = await OutreachCampaignModel.findById(row.campaignId)
    .select('jobId')
    .lean();

  const thread = await conversationsService.ensureThreadForEnrollment({
    organizationId: String(row.organizationId),
    candidateId: String(enrollment.candidateId),
    campaignId: String(row.campaignId),
    enrollmentId: String(row.enrollmentId),
    jobId: campaign?.jobId ? String(campaign.jobId) : null,
    channel: 'ai_voice',
  });

  const providerMessageId = `voice-summary:${row.callId}`;
  const meta = {
    duration: formatCallDuration(row),
    outcome: voiceOutcomeLine(row),
    highlights: voiceHighlights(row),
    recordingUrl: row.recordingUrl || null,
    callId: row.callId,
    status: row.status,
  };
  const bodyText = (transcript || summary || `AI voice call ${row.status}`).slice(0, 50000);

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
        recipient: row.toNumber || null,
        subject: 'AI voice call',
        bodyText,
        bodyHtml: JSON.stringify(meta),
        providerMessageId,
        providerThreadId: row.callId,
        deliveryStatus: 'delivered',
        messageType: 'voice_summary',
        aiGenerated: true,
        sentAt: row.endedAt || row.updatedAt || new Date(),
        receivedAt: row.endedAt || new Date(),
        error: null,
      },
    },
    { upsert: true, new: true }
  );

  thread.lastMessageAt = msg.sentAt || new Date();
  thread.lastMessagePreview = (summary || transcript || 'AI voice call').slice(0, 240);
  if (!thread.channels.includes('ai_voice')) {
    thread.channels = [...thread.channels, 'ai_voice'];
  }
  await thread.save();

  emitConversationMessageCreated({
    organizationId: String(thread.organizationId),
    threadId: String(thread._id),
    messageId: String(msg._id),
    campaignId: String(row.campaignId),
    candidateId: String(enrollment.candidateId),
    direction: 'outbound',
    channel: 'ai_voice',
  });
}

async function syncOutreachEnrollment(row: VoiceCallDocument, parsed: ParsedHunarWebhook) {
  if (!row.campaignId || !row.enrollmentId) return;
  const enrollment = await OutreachEnrollmentModel.findById(row.enrollmentId);
  if (!enrollment) return;

  const interest = String(row.callResult?.interestLevel || '').toLowerCase();
  const outcome = String(row.callResult?.finalOutcome || row.callResult?.candidateStatus || '').toLowerCase();

  if (interest.includes('interest') || interest === 'yes' || interest === 'true' || interest === 'high') {
    enrollment.replyState = {
      ...enrollment.replyState,
      hasReply: true,
      disposition: 'interested',
      repliedAt: enrollment.replyState?.repliedAt || new Date(),
    };
    if (['active', 'waiting', 'pending', 'replied'].includes(enrollment.status)) {
      enrollment.status = 'interested';
    }
  } else if (
    interest.includes('not') ||
    outcome.includes('reject') ||
    interest === 'low' ||
    interest === 'no'
  ) {
    enrollment.replyState = {
      ...enrollment.replyState,
      hasReply: true,
      disposition: 'not_interested',
      repliedAt: enrollment.replyState?.repliedAt || new Date(),
    };
  } else if (isVoiceCallTerminal(row) && !enrollment.replyState?.hasReply) {
    enrollment.replyState = {
      ...enrollment.replyState,
      hasReply: true,
      disposition: enrollment.replyState?.disposition || null,
      repliedAt: new Date(),
    };
  }

  enrollment.lastActionAt = new Date();
  await enrollment.save();

  await recordCampaignActivity({
    organizationId: String(row.organizationId),
    campaignId: String(row.campaignId),
    enrollmentId: String(row.enrollmentId),
    type: 'enrollment.voice_updated',
    title: `Voice call ${row.status}`,
    metadata: {
      callId: parsed.callId,
      status: row.status,
      interestLevel: row.callResult?.interestLevel,
      finalOutcome: row.callResult?.finalOutcome,
    },
  }).catch(() => undefined);
}

async function maybeCompleteOutreachCampaign(campaignId: string) {
  const campaign = await OutreachCampaignModel.findById(campaignId);
  if (!campaign || campaign.status !== 'running') return;

  const dialable = await OutreachEnrollmentModel.countDocuments({
    campaignId,
    'contactAvailability.phone': true,
    'contactAvailability.optedOut': { $ne: true },
  });
  if (dialable === 0) return;

  const openCalls = await VoiceCallModel.countDocuments({
    campaignId,
    status: { $nin: ['completed', 'failed', 'cancelled', 'no_answer', 'busy', 'voicemail'] },
  });
  const withRetries = await VoiceCallModel.countDocuments({
    campaignId,
    $or: [{ retriesLeft: { $gt: 0 } }, { nextRetryAt: { $ne: null } }],
  });

  // All enrollments that got a voice attempt should be terminal.
  const voiceAttempts = await VoiceCallModel.distinct('enrollmentId', {
    campaignId,
    enrollmentId: { $ne: null },
  });
  if (voiceAttempts.length === 0) return;
  if (openCalls > 0 || withRetries > 0) return;

  const activeEnrollments = await OutreachEnrollmentModel.countDocuments({
    campaignId,
    status: { $in: ['active', 'waiting', 'pending'] },
  });
  if (activeEnrollments > 0) return;

  campaign.status = 'completed';
  campaign.completedAt = new Date();
  await campaign.save();
  await refreshCampaignStats(campaignId).catch(() => undefined);
  emitOutreachCampaignUpdated({
    organizationId: String(campaign.organizationId),
    campaignId: String(campaign._id),
    status: 'completed',
  });
  log().info({ campaignId }, 'Outreach campaign auto-completed after voice dials');
}

export async function processCampaignVoiceWebhook(input: {
  kind: HunarWebhookKind;
  campaignId: string | null;
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
  rawBody?: Buffer | string | null;
  alreadyVerified?: boolean;
}) {
  if (!input.alreadyVerified) {
    const auth = verifyHunarWebhookAuthenticity({
      headers: input.headers,
      rawBody: input.rawBody,
      campaignId: input.campaignId,
      entityId: input.campaignId,
    });
    if (!auth.ok) {
      throw new AppError(401, 'WEBHOOK_UNAUTHORIZED', auth.reason || 'Unauthorized webhook');
    }
  }

  if (!input.campaignId || !mongoose.Types.ObjectId.isValid(input.campaignId)) {
    throw new AppError(400, 'INVALID_CAMPAIGN_ID', 'Valid campaignId is required');
  }

  const campaign = await OutreachCampaignModel.findOne({
    _id: input.campaignId,
    deletedAt: null,
  });
  if (!campaign) {
    throw new AppError(404, 'CAMPAIGN_NOT_FOUND', 'Campaign not found for voice callback');
  }

  const parsed = parseHunarWebhookPayload(input.kind, input.body);
  if (!parsed.callId) {
    throw new AppError(400, 'CALL_ID_REQUIRED', 'call_id is required');
  }

  const eventId = providerEventId(input.kind, parsed);
  const rawBody =
    typeof input.rawBody === 'string'
      ? input.rawBody
      : Buffer.isBuffer(input.rawBody)
        ? input.rawBody.toString('utf8')
        : JSON.stringify(input.body ?? {});
  void hashWebhookPayload(rawBody);
  void eventId;

  let row = await findVoiceCall({
    campaignId: input.campaignId,
    callId: parsed.callId,
    requestId: parsed.requestId,
    toNumber: parsed.toNumber,
  });

  if (!row) {
    // Create late-arriving row if stub was missing.
    const digits = digitsOnly(parsed.toNumber) || digitsOnly(parsed.callId);
    row = await VoiceCallModel.create({
      organizationId: campaign.organizationId,
      source: 'outreach',
      campaignId: campaign._id,
      callId: parsed.callId,
      requestId: parsed.requestId || `${input.campaignId}-unknown`,
      agentId: parsed.agentId || null,
      toNumber: parsed.toNumber || digits,
      toNumberDigits: digits || 'unknown',
      status: 'queued',
    });
  }

  const previousCallId = applyParsedToCall(row, input.kind, parsed);

  // If we promoted pending→real callId, clear unique conflict by removing other pending.
  if (previousCallId.startsWith('pending:') && row.callId !== previousCallId) {
    await VoiceCallModel.deleteMany({
      campaignId: campaign._id,
      callId: previousCallId,
      _id: { $ne: row._id },
    }).catch(() => undefined);
  }

  try {
    await row.save();
  } catch (error) {
    if ((error as { code?: number }).code === 11000 && parsed.callId) {
      // Real callId already exists — merge into that doc and drop pending.
      const existing = await VoiceCallModel.findOne({
        campaignId: campaign._id,
        callId: parsed.callId,
      });
      if (existing) {
        applyParsedToCall(existing, input.kind, parsed);
        await existing.save();
        if (row.callId.startsWith('pending:')) {
          await VoiceCallModel.deleteOne({ _id: row._id }).catch(() => undefined);
        }
        row = existing;
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }

  if (isVoiceCallTerminal(row)) {
    await commitVoiceQuota(row);
  }

  await syncOutreachEnrollment(row, parsed);
  await syncConversationVoiceTranscript(row).catch((err) => {
    log().warn(
      { err, callId: row.callId, campaignId: input.campaignId },
      'Failed to sync voice transcript to conversation'
    );
  });
  await maybeCompleteOutreachCampaign(String(campaign._id));
  await refreshCampaignStats(String(campaign._id)).catch(() => undefined);

  log().info(
    {
      campaignId: input.campaignId,
      callId: row.callId,
      kind: input.kind,
      status: row.status,
    },
    'Campaign voice webhook applied'
  );

  return {
    duplicate: false,
    status: row.status,
    campaignId: String(campaign._id),
    callId: row.callId,
  };
}
