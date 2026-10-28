import { withVocallabsAuth } from './rylo.agents.js';
import {
  ryloGetCallConversationUrl,
  ryloGetCallDataUrl,
  ryloGetCallStatusUrl,
  ryloGetCallSummaryUrl,
  ryloGetVocallabsCallUrl,
} from './rylo.config.js';

/** Call reads keyed by the id Vocallabs sends on the post-call webhook. */
const CALL_READS: Array<{ label: string; url: (callId: string) => string }> = [
  { label: 'details', url: ryloGetVocallabsCallUrl },
  { label: 'conversation', url: ryloGetCallConversationUrl },
  { label: 'data', url: ryloGetCallDataUrl },
  { label: 'status', url: ryloGetCallStatusUrl },
  { label: 'summary', url: ryloGetCallSummaryUrl },
];

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

/**
 * Loads the call Vocallabs already created and prints each documented read.
 * A failed read is logged and does not stop the others.
 */
export type RyloCallReads = {
  details: unknown;
  conversation: unknown;
  data: unknown;
  status: unknown;
  summary: unknown;
};

export async function logRyloCall(callId: string): Promise<RyloCallReads> {
  const id = callId.trim();
  const empty: RyloCallReads = {
    details: null,
    conversation: null,
    data: null,
    status: null,
    summary: null,
  };
  if (!id) return empty;

  const results = await Promise.all(
    CALL_READS.map(async ({ label, url }) => {
      try {
        const response = await withVocallabsAuth((token) =>
          fetch(url(id), {
            method: 'GET',
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          })
        );
        const body = await readJson(response);
        console.info(
          `[vocallabs call ${label}]`,
          JSON.stringify({ callId: id, status: response.status, body }, null, 2)
        );
        return { label, body };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not read the call';
        console.info(`[vocallabs call ${label}]`, JSON.stringify({ callId: id, error: message }, null, 2));
        return { label, body: null };
      }
    })
  );

  const reads = { ...empty };
  for (const result of results) {
    if (result.label in reads) reads[result.label as keyof RyloCallReads] = result.body;
  }
  return reads;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readText(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function collectRecords(body: unknown): Record<string, unknown>[] {
  const records: Record<string, unknown>[] = [];
  const walk = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    const record = asRecord(value);
    if (!Object.keys(record).length) return;
    records.push(record);
    for (const child of Object.values(record)) {
      if (child && typeof child === 'object') walk(child);
    }
  };
  walk(body);
  return records;
}

export type RyloCallAnswer = { key: string; value: string };
export type RyloCallMessage = { role: string; content: string; createdAt: string };

export type RyloCallLink = {
  callId: string;
  queueId: string;
  status: string;
  campaignId: string;
  phone: string;
  summary: string;
  durationSeconds: number | null;
  recordingUrl: string;
  answers: RyloCallAnswer[];
  messages: RyloCallMessage[];
};

const HIDDEN_ANSWER_KEYS = new Set(['cut_the_call']);

function readArray(body: unknown, key: string): Record<string, unknown>[] {
  for (const record of collectRecords(body)) {
    const value = record[key];
    if (!Array.isArray(value)) continue;
    return value.map(asRecord).filter((item) => Object.keys(item).length > 0);
  }
  return [];
}

function readNumber(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function isCapturedAnswer(record: Record<string, unknown>): boolean {
  const key = readText(record, ['key']);
  const type = readText(record, ['type']).toLowerCase();
  if (!key || type === 'internal' || key.startsWith('ai_') || HIDDEN_ANSWER_KEYS.has(key)) return false;
  return Boolean(readText(record, ['value']));
}

function readAnswers(reads: RyloCallReads, details: Record<string, unknown>): RyloCallAnswer[] {
  const rows = readArray(reads.data, 'vocallabs_call_data');
  const source = rows.length ? rows : readArray(details, 'call_data');
  return source
    .filter(isCapturedAnswer)
    .map((row) => ({
      key: readText(row, ['key']).slice(0, 80),
      value: readText(row, ['value']).slice(0, 500),
      createdAt: readText(row, ['created_at', 'createdAt']),
    }))
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .map(({ key, value }) => ({ key, value }));
}

function readMessages(reads: RyloCallReads, details: Record<string, unknown>): RyloCallMessage[] {
  const rows = readArray(reads.conversation, 'vocallabs_call_message');
  const source = rows.length ? rows : readArray(details, 'call_messages');
  return source
    .map((row) => ({
      role: readText(row, ['role']).slice(0, 40),
      content: readText(row, ['content']).slice(0, 4000),
      createdAt: readText(row, ['created_at', 'createdAt']),
    }))
    .filter((row) => row.content)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

function asReads(value: unknown): RyloCallReads {
  const record = asRecord(value);
  if ('details' in record && 'conversation' in record) {
    return {
      details: record.details ?? null,
      conversation: record.conversation ?? null,
      data: record.data ?? null,
      status: record.status ?? null,
      summary: record.summary ?? null,
    };
  }
  return { details: value, conversation: null, data: null, status: null, summary: null };
}

/** Pulls the campaign, phone, summary, answers, and transcript off the call reads. */
export function readRyloCallLink(
  reads: RyloCallReads | unknown,
  fallback: { callId: string; queueId: string; status: string }
): RyloCallLink | null {
  const callReads = asReads(reads);
  const records = collectRecords(callReads.details);
  const call =
    records.find((record) => readText(record, ['campaign_id']) && (readText(record, ['phone_to', 'phone']) || asRecord(record.prospect).phone)) ||
    records.find((record) => readText(record, ['call_status', 'status']) && readText(record, ['phone_to', 'phone']));
  if (!call && !fallback.callId) return null;

  const prospect = asRecord(call?.prospect);
  const phone = readText(prospect, ['phone']) || readText(call ?? {}, ['phone_to', 'phone']);
  const campaignId = readText(call ?? {}, ['campaign_id']);
  const statusRecord = collectRecords(callReads.status).find((record) => readText(record, ['call_status', 'status']));
  const summaryRecord = collectRecords(callReads.summary).find((record) => readText(record, ['summary']));
  const status =
    readText(call ?? {}, ['call_status', 'status']) ||
    readText(statusRecord ?? {}, ['call_status', 'status']) ||
    fallback.status.trim();
  if (!campaignId || !phone || !status) return null;

  const details = call ?? {};
  return {
    callId: readText(details, ['id']) || fallback.callId.trim(),
    queueId: readText(details, ['call_queue_id', 'queue_id']) || fallback.queueId.trim(),
    status,
    campaignId,
    phone,
    summary: readText(summaryRecord ?? {}, ['summary']) || readText(details, ['summary']),
    durationSeconds: readNumber(details, 'duration'),
    recordingUrl: readText(details, ['recording_url', 'recordingUrl']),
    answers: readAnswers(callReads, details),
    messages: readMessages(callReads, details),
  };
}
