import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import { quotaService } from '../../shared/usage/index.js';
import { normalizePhone } from '../../shared/validation/phone.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import {
  hashWebhookPayload,
  mapHunarCallStatus,
  parseHunarWebhookPayload,
  providerEventId,
  verifyHunarWebhookAuthenticity,
  type HunarWebhookKind,
} from '../../providers/hunar/hunar.webhook.js';
import { emitScreeningResultUpdated } from '../../realtime/events.js';
import { ScreeningModel } from './screening.model.js';
import { ScreeningCandidateModel } from './screening-candidate.model.js';
import { VoiceWebhookEventModel } from './voice-webhook-event.model.js';
import { mapEvaluationScores, minutesFromDuration } from './scoring.js';
import { refreshScreeningStats } from './screening.service.js';

function digitsOnly(value: string): string {
  return String(value || '').replace(/\D/g, '');
}

async function findCandidateRow(input: {
  screeningId: string;
  callId: string;
  requestId: string;
  toNumber: string;
}) {
  if (input.callId) {
    const byCall = await ScreeningCandidateModel.findOne({
      screeningId: input.screeningId,
      providerCallId: input.callId,
    });
    if (byCall) return byCall;
  }

  const rows = await ScreeningCandidateModel.find({
    screeningId: input.screeningId,
    ...(input.requestId ? { providerRequestId: input.requestId } : {}),
  });

  if (!input.toNumber) {
    return rows.find((r) => !r.providerCallId) || rows[0] || null;
  }

  const target = digitsOnly(input.toNumber);
  const candidates = await SavedCandidateModel.find({
    _id: { $in: rows.map((r) => r.candidateId) },
  })
    .select('phone')
    .lean();
  const phoneMap = new Map(
    candidates.map((c) => [digitsOnly(normalizePhone(c.phone || '')), String(c._id)])
  );
  const matchedId = phoneMap.get(target);
  if (matchedId) {
    return rows.find((r) => String(r.candidateId) === matchedId) || null;
  }
  return rows.find((r) => !r.providerCallId) || null;
}

export async function processHunarWebhook(input: {
  kind: HunarWebhookKind;
  screeningId: string | null;
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
  rawBody?: Buffer | string | null;
}) {
  const auth = verifyHunarWebhookAuthenticity({
    headers: input.headers,
    rawBody: input.rawBody,
    screeningId: input.screeningId,
  });
  if (!auth.ok) {
    throw new AppError(401, 'WEBHOOK_UNAUTHORIZED', auth.reason || 'Unauthorized webhook');
  }

  if (!input.screeningId || !mongoose.Types.ObjectId.isValid(input.screeningId)) {
    throw new AppError(400, 'INVALID_SCREENING_ID', 'Valid screeningId is required');
  }

  const screening = await ScreeningModel.findOne({
    _id: input.screeningId,
    deletedAt: null,
  });
  if (!screening) {
    throw new AppError(404, 'SCREENING_NOT_FOUND', 'Screening not found for callback');
  }

  const parsed = parseHunarWebhookPayload(input.kind, input.body);
  if (!parsed.callId) {
    throw new AppError(400, 'CALL_ID_REQUIRED', 'call_id is required');
  }

  const rawBody =
    typeof input.rawBody === 'string'
      ? input.rawBody
      : Buffer.isBuffer(input.rawBody)
        ? input.rawBody.toString('utf8')
        : JSON.stringify(input.body ?? {});
  const payloadHash = hashWebhookPayload(rawBody);
  const eventId = providerEventId(input.kind, parsed);

  try {
    await VoiceWebhookEventModel.create({
      provider: 'hunar',
      providerEventId: eventId,
      payloadHash,
      screeningId: screening._id,
      organizationId: screening.organizationId,
      kind: input.kind,
      status: 'received',
      payload: parsed.raw,
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      const existing = await VoiceWebhookEventModel.findOne({
        provider: 'hunar',
        providerEventId: eventId,
      }).lean();
      return {
        duplicate: true,
        status: existing?.status || 'duplicate',
        screeningId: String(screening._id),
        callId: parsed.callId,
      };
    }
    throw error;
  }

  const event = await VoiceWebhookEventModel.findOne({
    provider: 'hunar',
    providerEventId: eventId,
  });

  try {
    const row = await findCandidateRow({
      screeningId: String(screening._id),
      callId: parsed.callId,
      requestId: parsed.requestId || screening.lastLaunchRequestId || '',
      toNumber: parsed.toNumber,
    });

    if (!row) {
      if (event) {
        event.status = 'ignored';
        event.error = 'No matching screening candidate';
        event.processedAt = new Date();
        await event.save();
      }
      return {
        duplicate: false,
        status: 'ignored',
        screeningId: String(screening._id),
        callId: parsed.callId,
      };
    }

    row.providerCallId = parsed.callId;
    if (parsed.requestId) row.providerRequestId = parsed.requestId;
    if (parsed.status) {
      row.providerStatus = parsed.status;
      row.callStatus = mapHunarCallStatus(parsed.status, parsed.answeredBy) as typeof row.callStatus;
    }
    if (parsed.lifecycleStatus) row.lifecycleStatus = parsed.lifecycleStatus;
    if (typeof parsed.retryCount === 'number') {
      row.attempts = Math.max(row.attempts, parsed.retryCount + 1);
    }

    const durationSeconds =
      parsed.durationSeconds ??
      (parsed.durationMinutes != null ? Math.round(parsed.durationMinutes * 60) : null);
    if (durationSeconds != null) row.durationSeconds = durationSeconds;

    if (input.kind === 'call-recording' && parsed.recordingUrl) {
      row.recordingReference = parsed.recordingUrl;
    }
    if (input.kind === 'call-summary' && parsed.summaryText) {
      row.summary = parsed.summaryText;
    }
    if (parsed.transcript) row.transcript = parsed.transcript;

    if (input.kind === 'call-result' || parsed.result) {
      const scored = mapEvaluationScores({
        result: parsed.result,
        criteria: screening.evaluationCriteria || [],
      });
      row.extractedVariables = {
        ...row.extractedVariables,
        ...scored.extractedVariables,
      };
      row.scoreBreakdown = { ...row.scoreBreakdown, ...scored.scoreBreakdown };
      if (scored.overallScore != null) row.overallScore = scored.overallScore;
      if (scored.recommendation) row.recommendation = scored.recommendation;
      if (parsed.summaryText) row.summary = parsed.summaryText;
      if (parsed.result && typeof parsed.result.summary === 'string') {
        row.summary = String(parsed.result.summary);
      }
    }

    const terminal = ['completed', 'no_answer', 'voicemail', 'busy', 'failed', 'cancelled'].includes(
      row.callStatus
    );
    if (terminal) {
      row.completedAt = row.completedAt || new Date();
      if (row.quotaReservationKey && row.quotaCommittedMinutes === 0) {
        try {
          const minutes = minutesFromDuration(row.durationSeconds, parsed.durationMinutes);
          if (minutes > 1) {
            const extraKey = `${row.quotaReservationKey}:extra:${minutes}`;
            await quotaService.reserveUsage({
              organizationId: String(screening.organizationId),
              metric: 'ai_voice_minutes',
              quantity: minutes - 1,
              idempotencyKey: extraKey,
              relatedEntityType: 'screening_candidate',
              relatedEntityId: String(row._id),
            });
            await quotaService.commitUsage({
              organizationId: String(screening.organizationId),
              metric: 'ai_voice_minutes',
              idempotencyKey: extraKey,
            });
          }
          await quotaService.commitUsage({
            organizationId: String(screening.organizationId),
            metric: 'ai_voice_minutes',
            idempotencyKey: row.quotaReservationKey,
          });
          row.quotaCommittedMinutes = minutes;
        } catch {
          // Keep webhook processing resilient if quota commit races.
        }
      }
    }

    await row.save();
    await refreshScreeningStats(String(screening._id));

    emitScreeningResultUpdated({
      organizationId: String(screening.organizationId),
      screeningId: String(screening._id),
      resultId: String(row._id),
      candidateId: String(row.candidateId),
      callStatus: row.callStatus,
      overallScore: row.overallScore,
      recommendation: row.recommendation,
      recruiterDecision: row.recruiterDecision,
    });

    // Huntlo 360: auto-transition when sourceModule is huntlo360
    if (screening.sourceModule === 'huntlo360' && screening.workflowId && terminal) {
      try {
        const { huntlo360Service } = await import('../huntlo-360/huntlo360.service.js');
        const eventName =
          row.callStatus === 'completed' &&
          row.overallScore != null &&
          row.recommendation !== 'reject'
            ? 'screening_pass'
            : row.callStatus === 'no_answer' || row.callStatus === 'voicemail'
              ? 'screening_unanswered'
              : 'screening_fail';
        await huntlo360Service.transition(
          String(screening.organizationId),
          null,
          String(screening.workflowId),
          {
            candidateId: String(row.candidateId),
            event: eventName,
            idempotencyKey: `hunar:${parsed.callId}:${eventName}`,
            screeningScore: row.overallScore ?? undefined,
          }
        );
      } catch {
        // Do not fail webhook if 360 transition rejects (already transitioned).
      }
    }

    if (event) {
      event.status = 'processed';
      event.processedAt = new Date();
      event.error = null;
      await event.save();
    }

    return {
      duplicate: false,
      status: 'processed',
      screeningId: String(screening._id),
      resultId: String(row._id),
      callId: parsed.callId,
      callStatus: row.callStatus,
    };
  } catch (error) {
    if (event) {
      event.status = 'failed';
      event.error = (error as Error).message;
      event.processedAt = new Date();
      await event.save();
    }
    throw error;
  }
}
