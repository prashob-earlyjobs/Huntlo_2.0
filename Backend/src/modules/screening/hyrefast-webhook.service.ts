import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

import { getLogger } from '../../config/logger.js';
import { getHyrefastWebhookSecret } from '../../providers/hyrefast/hyrefast.config.js';
import { emitScreeningResultUpdated } from '../../realtime/events.js';
import { ScreeningCandidateModel } from './screening-candidate.model.js';
import { VoiceWebhookEventModel } from './voice-webhook-event.model.js';
import { refreshScreeningStats } from './screening.service.js';

const log = getLogger().child({ component: 'hyrefast-webhook' });

const MAX_SKEW_MS = 5 * 60 * 1000;

function headerValue(
  headers: Record<string, string | string[] | undefined>,
  name: string
): string {
  const raw = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(raw)) return String(raw[0] || '').trim();
  return String(raw || '').trim();
}

export function verifyHyrefastSignature(input: {
  rawBody: Buffer | null | undefined;
  headers: Record<string, string | string[] | undefined>;
}): { ok: boolean; reason?: string } {
  const secret = getHyrefastWebhookSecret();
  if (!secret) {
    // Allow ingest when secret is not configured (local/dev); staging/prod should set it.
    return { ok: true, reason: 'secret_not_configured' };
  }

  const timestamp = headerValue(input.headers, 'x-hyrefast-timestamp');
  const signature = headerValue(input.headers, 'x-hyrefast-signature');
  if (!timestamp || !signature) {
    return { ok: false, reason: 'missing_signature_headers' };
  }

  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > MAX_SKEW_MS) {
    return { ok: false, reason: 'stale_or_invalid_timestamp' };
  }

  const raw = input.rawBody;
  if (!raw || !Buffer.isBuffer(raw)) {
    return { ok: false, reason: 'missing_raw_body' };
  }

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${raw.toString('utf8')}`)
    .digest('hex');

  try {
    const expectedBuf = Buffer.from(expected, 'hex');
    const actualBuf = Buffer.from(signature, 'hex');
    if (
      expectedBuf.length !== actualBuf.length ||
      !timingSafeEqual(expectedBuf, actualBuf)
    ) {
      return { ok: false, reason: 'signature_mismatch' };
    }
  } catch {
    return { ok: false, reason: 'signature_parse_error' };
  }

  return { ok: true };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function pickId(...values: unknown[]): string {
  for (const value of values) {
    const id = String(value || '').trim();
    if (id) return id;
  }
  return '';
}

async function findCandidateByApplicationId(applicationId: string) {
  if (!applicationId) return null;
  return ScreeningCandidateModel.findOne({
    $or: [
      { providerRequestId: applicationId },
      { 'extractedVariables.hyrefastApplicationId': applicationId },
    ],
  });
}

/**
 * Process Hyrefast webhook events and update screening candidate call status.
 */
export async function processHyrefastWebhook(req: Request): Promise<{
  received: true;
  duplicate?: boolean;
  ignored?: boolean;
  updated?: boolean;
  event?: string;
  applicationId?: string;
}> {
  const verify = verifyHyrefastSignature({
    rawBody: req.rawBody,
    headers: req.headers as Record<string, string | string[] | undefined>,
  });
  if (!verify.ok) {
    const err = new Error(`Invalid Hyrefast webhook signature (${verify.reason})`);
    (err as Error & { statusCode?: number }).statusCode = 401;
    throw err;
  }
  if (verify.reason === 'secret_not_configured') {
    log.warn('HYREFAST_WEBHOOK_SECRET is not set; accepting unsigned webhook');
  }

  const body = asRecord(req.body);
  const event =
    String(body.event || '').trim() ||
    headerValue(
      req.headers as Record<string, string | string[] | undefined>,
      'x-hyrefast-event'
    );
  const eventId =
    pickId(body.id) ||
    `hyrefast:${event}:${pickId(asRecord(body.data).applicationId)}:${String(body.createdAt || '')}`;
  const data = asRecord(body.data);
  const applicationId = pickId(
    data.applicationId,
    data.application_id,
    data._id,
    data.id
  );

  const existing = await VoiceWebhookEventModel.findOne({
    provider: 'hyrefast',
    providerEventId: eventId,
  }).lean();
  if (existing?.status === 'processed' || existing?.status === 'duplicate') {
    return { received: true, duplicate: true, event, applicationId };
  }

  const eventRow = await VoiceWebhookEventModel.findOneAndUpdate(
    { provider: 'hyrefast', providerEventId: eventId },
    {
      $setOnInsert: {
        provider: 'hyrefast',
        providerEventId: eventId,
        payloadHash: eventId,
        kind: event || 'unknown',
        status: 'received',
        payload: body,
      },
    },
    { upsert: true, new: true }
  );

  if (!applicationId) {
    eventRow.status = 'ignored';
    eventRow.error = 'Missing applicationId';
    eventRow.processedAt = new Date();
    await eventRow.save();
    return { received: true, ignored: true, event };
  }

  const row = await findCandidateByApplicationId(applicationId);
  if (!row) {
    eventRow.status = 'ignored';
    eventRow.error = `No screening candidate for application ${applicationId}`;
    eventRow.processedAt = new Date();
    await eventRow.save();
    log.warn({ applicationId, event }, 'Hyrefast webhook: candidate not found');
    return { received: true, ignored: true, event, applicationId };
  }

  eventRow.organizationId = row.organizationId;
  eventRow.screeningId = row.screeningId;

  const eventKey = event.toLowerCase();
  let updated = false;

  if (
    eventKey === 'interview_completed' ||
    eventKey === 'interview.completed' ||
    eventKey.includes('completed')
  ) {
    const completedAtRaw = pickId(data.completedAt, data.completed_at, body.createdAt);
    const completedAt = completedAtRaw ? new Date(completedAtRaw) : new Date();
    row.callStatus = 'completed';
    row.providerStatus = 'interview_completed';
    row.completedAt = Number.isNaN(completedAt.getTime()) ? new Date() : completedAt;
    row.error = null;
    row.extractedVariables = {
      ...(row.extractedVariables || {}),
      hyrefastApplicationId: applicationId,
      hyrefastCandidateId: pickId(data.candidateId, data.candidate_id) || undefined,
      hyrefastJobId:
        pickId(data.jobId, data.job_id) ||
        String(
          (row.extractedVariables as { hyrefastJobId?: string } | null)?.hyrefastJobId ||
            ''
        ) ||
        undefined,
      hyrefastLastEventId: eventId,
      hyrefastLastEvent: event,
    };
    // Drop undefined keys introduced above
    for (const key of Object.keys(row.extractedVariables)) {
      if (row.extractedVariables[key] === undefined) {
        delete row.extractedVariables[key];
      }
    }
    await row.save();
    updated = true;
  } else if (
    eventKey === 'interview_started' ||
    eventKey === 'interview.started' ||
    eventKey.includes('started')
  ) {
    if (row.callStatus !== 'completed') {
      row.callStatus = 'in_progress';
      row.providerStatus = 'interview_started';
      row.extractedVariables = {
        ...(row.extractedVariables || {}),
        hyrefastApplicationId: applicationId,
        hyrefastLastEventId: eventId,
        hyrefastLastEvent: event,
      };
      await row.save();
      updated = true;
    }
  } else if (
    eventKey === 'interview_link_sent' ||
    eventKey.includes('link_sent')
  ) {
    if (row.callStatus === 'queued' || row.callStatus === 'failed') {
      row.callStatus = 'ringing';
      row.providerStatus = 'interview_invite_sent';
      row.extractedVariables = {
        ...(row.extractedVariables || {}),
        hyrefastApplicationId: applicationId,
        hyrefastLastEventId: eventId,
        hyrefastLastEvent: event,
      };
      await row.save();
      updated = true;
    }
  } else {
    eventRow.status = 'ignored';
    eventRow.error = `Unhandled event ${event}`;
    eventRow.processedAt = new Date();
    await eventRow.save();
    return { received: true, ignored: true, event, applicationId };
  }

  eventRow.status = updated ? 'processed' : 'ignored';
  eventRow.processedAt = new Date();
  eventRow.error = null;
  await eventRow.save();

  if (updated) {
    await refreshScreeningStats(String(row.screeningId));
    emitScreeningResultUpdated({
      organizationId: String(row.organizationId),
      screeningId: String(row.screeningId),
      resultId: String(row._id),
      candidateId: String(row.candidateId),
      callStatus: row.callStatus,
      overallScore: row.overallScore,
      recommendation: row.recommendation,
      recruiterDecision: row.recruiterDecision,
    });
  }

  return { received: true, updated, event, applicationId };
}
