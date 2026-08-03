/**
 * Zyastra voice webhook → existing outreach / screening ledger processors.
 * Adapts call.completed / call.failed into Hunar-shaped payloads so scoring
 * and quota commit paths stay unchanged.
 */

import mongoose from 'mongoose';

import { getLogger } from '../../config/logger.js';
import {
  parseZyastraWebhookPayload,
  verifyZyastraWebhookAuthenticity,
  type ParsedZyastraWebhook,
} from '../../providers/zyastra/index.js';
import type { HunarWebhookKind } from '../../providers/hunar/hunar.webhook.js';
import { AppError } from '../../shared/errors/app-error.js';
import { processHunarWebhook } from '../screening/webhook.service.js';
import { VoiceCallModel } from './voice-call.model.js';
import { processCampaignVoiceWebhook } from './voice-webhook.service.js';

const log = () => getLogger().child({ component: 'zyastra-voice-webhook' });

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

function headerValue(
  headers: Record<string, string | string[] | undefined>,
  name: string
): string | undefined {
  const raw = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

function mapZyastraStatus(event: string, status: string): string {
  const ev = String(event || '').toLowerCase();
  const st = String(status || '').trim().toUpperCase();
  if (ev === 'call.failed' || st.includes('FAIL')) return 'FAILED';
  if (st.includes('NO_ANSWER') || st.includes('UNANSWERED')) return 'NO_ANSWER';
  if (st.includes('BUSY')) return 'BUSY';
  if (st.includes('CANCEL')) return 'CANCELLED';
  if (st.includes('VOICEMAIL') || st.includes('MACHINE')) return 'COMPLETED';
  if (ev === 'call.completed' || st.includes('COMPLETE') || st === 'DONE') return 'COMPLETED';
  return st || 'COMPLETED';
}

/** Build one or more Hunar-shaped webhook bodies from a single Zyastra event. */
export function zyastraToHunarWebhookBodies(
  parsed: ParsedZyastraWebhook
): Array<{ kind: HunarWebhookKind; body: Record<string, unknown> }> {
  const status = mapZyastraStatus(String(parsed.event), parsed.status);
  const base: Record<string, unknown> = {
    call_id: parsed.callId,
    request_id: parsed.callReferenceId || parsed.callId,
    to_number: parsed.phoneNumber,
    status,
    duration_seconds: parsed.durationSeconds,
    event_type: parsed.event,
  };

  const bodies: Array<{ kind: HunarWebhookKind; body: Record<string, unknown> }> = [
    { kind: 'call-status', body: { ...base } },
  ];

  const isTerminalSuccess =
    String(parsed.event).toLowerCase() === 'call.completed' || status === 'COMPLETED';
  const isFailed =
    String(parsed.event).toLowerCase() === 'call.failed' || status === 'FAILED';

  if (isTerminalSuccess) {
    const result: Record<string, unknown> = {
      ...parsed.variables,
    };
    if (parsed.summary) result.summary = parsed.summary;
    if (parsed.transcript) result.transcript = parsed.transcript;

    bodies.push({
      kind: 'call-result',
      body: {
        ...base,
        status: 'COMPLETED',
        result,
        transcript: parsed.transcript,
        summary: parsed.summary,
      },
    });

    if (parsed.recordingUrl) {
      bodies.push({
        kind: 'call-recording',
        body: {
          ...base,
          recording_url: parsed.recordingUrl,
        },
      });
    }

    if (parsed.summary || parsed.transcript) {
      bodies.push({
        kind: 'call-summary',
        body: {
          ...base,
          summary: parsed.summary,
          transcript: parsed.transcript,
        },
      });
    }
  } else if (isFailed) {
    bodies[0]!.body = {
      ...base,
      status: 'FAILED',
      result: parsed.variables,
      summary: parsed.summary || undefined,
    };
  }

  return bodies;
}

async function resolveIdsFromLedger(callId: string): Promise<{
  campaignId: string | null;
  screeningId: string | null;
}> {
  if (!callId) return { campaignId: null, screeningId: null };
  const row = await VoiceCallModel.findOne({ callId }).sort({ updatedAt: -1 }).lean();
  if (!row) return { campaignId: null, screeningId: null };
  return {
    campaignId: row.campaignId ? String(row.campaignId) : null,
    screeningId: row.screeningId ? String(row.screeningId) : null,
  };
}

export async function processZyastraVoiceWebhook(input: {
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
  rawBody?: Buffer | string | null;
  alreadyVerified?: boolean;
}) {
  const rawBody =
    typeof input.rawBody === 'string'
      ? input.rawBody
      : Buffer.isBuffer(input.rawBody)
        ? input.rawBody.toString('utf8')
        : JSON.stringify(input.body ?? {});

  if (!input.alreadyVerified) {
    const auth = verifyZyastraWebhookAuthenticity({
      rawBody,
      signatureHeader: headerValue(input.headers, 'x-zyastra-signature'),
    });
    if (!auth.ok) {
      throw new AppError(401, 'WEBHOOK_UNAUTHORIZED', auth.reason || 'Unauthorized webhook');
    }
  }

  const parsed = parseZyastraWebhookPayload(input.body);
  if (!parsed.callId) {
    throw new AppError(400, 'CALL_ID_REQUIRED', 'callId is required');
  }

  let screeningId = asString(parsed.metadata.screeningId) || null;
  let campaignId = asString(parsed.metadata.campaignId) || null;

  if (!screeningId && !campaignId) {
    const fromLedger = await resolveIdsFromLedger(parsed.callId);
    screeningId = fromLedger.screeningId;
    campaignId = fromLedger.campaignId;
  }

  if (campaignId && !mongoose.Types.ObjectId.isValid(campaignId)) {
    throw new AppError(400, 'INVALID_CAMPAIGN_ID', 'Valid campaignId is required');
  }
  if (screeningId && !mongoose.Types.ObjectId.isValid(screeningId)) {
    throw new AppError(400, 'INVALID_SCREENING_ID', 'Valid screeningId is required');
  }
  if (!campaignId && !screeningId) {
    throw new AppError(
      400,
      'VOICE_WEBHOOK_ENTITY_REQUIRED',
      'Zyastra webhook metadata must include campaignId or screeningId'
    );
  }

  const bodies = zyastraToHunarWebhookBodies(parsed);
  const results: unknown[] = [];

  for (const item of bodies) {
    if (campaignId && !screeningId) {
      const result = await processCampaignVoiceWebhook({
        kind: item.kind,
        campaignId,
        body: item.body,
        headers: input.headers,
        rawBody,
        alreadyVerified: true,
      });
      results.push(result);
    } else {
      const result = await processHunarWebhook({
        kind: item.kind,
        screeningId,
        body: item.body,
        headers: input.headers,
        rawBody,
        alreadyVerified: true,
      });
      results.push(result);
    }
  }

  // Ensure VoiceCall provider is marked zyastra when we have a ledger row.
  await VoiceCallModel.updateOne(
    { callId: parsed.callId },
    { $set: { provider: 'zyastra' } }
  ).catch(() => undefined);

  log().info(
    {
      event: parsed.event,
      callId: parsed.callId,
      campaignId,
      screeningId,
      steps: bodies.map((b) => b.kind),
    },
    'Zyastra voice webhook applied'
  );

  return {
    duplicate: false,
    status: 'processed',
    event: parsed.event,
    callId: parsed.callId,
    campaignId,
    screeningId,
    results,
  };
}
