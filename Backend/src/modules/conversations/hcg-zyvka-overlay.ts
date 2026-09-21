import mongoose from 'mongoose';

import { type CandidatePipelineStatus } from '../outreach/enrollment-pipeline-status.js';
import {
  HcgZyvkaCommunicationModel,
  type HcgZyvkaCallRecording,
  type HcgZyvkaCallResult,
  type HcgZyvkaCallStatus,
  type HcgZyvkaCommunicationDocument,
  type HcgZyvkaQuestion,
} from '../communication-gateway/models/hcg-zyvka-communication.model.js';
import { formatHcgOverallAiStatus } from './hcg-gmail-overlay.js';

type HcgZyvkaLean = {
  _id?: unknown;
  campaignId?: string | null;
  mobileNumber?: string;
  calleeName?: string | null;
  callId?: string | null;
  prompt?: string | null;
  overallAIStatus?: string | null;
  overallAIDescription?: string | null;
  call_status?: HcgZyvkaCallStatus | null;
  call_recording?: HcgZyvkaCallRecording | null;
  call_result?: HcgZyvkaCallResult | null;
  call_summary?: { summary?: string } | null;
  questions?: HcgZyvkaQuestion[] | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type HcgZyvkaQuestionView = {
  id: string;
  question: string;
  asked: boolean;
  answer: string;
  status: string;
  description: string;
};

export type HcgZyvkaQuestionColumn = {
  id: string;
  title: string;
  prompt: string;
};

function normalizePhone(value?: string | null): string {
  return String(value || '').replace(/\D/g, '');
}

function campaignIdOf(doc: HcgZyvkaLean): string {
  return String(doc.campaignId || '').trim();
}

function campaignIdQuery(campaignIds: string[]) {
  const ids = [...new Set(campaignIds.map((id) => String(id || '').trim()).filter(Boolean))];
  const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  return {
    $or: [
      { campaignId: { $in: ids } },
      ...(objectIds.length > 0 ? [{ campaignId: { $in: objectIds } }] : []),
    ],
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function callStatusOf(doc: HcgZyvkaLean): HcgZyvkaCallStatus {
  return asRecord(doc.call_status) || {};
}

function callRecordingOf(doc: HcgZyvkaLean): HcgZyvkaCallRecording {
  return asRecord(doc.call_recording) || {};
}

function callResultPayload(doc: HcgZyvkaLean): Record<string, unknown> {
  const wrapper = asRecord(doc.call_result);
  const nested = asRecord(wrapper?.result);
  return nested || {};
}

export function hcgZyvkaCallStatusValue(doc: HcgZyvkaLean | null | undefined): string {
  if (!doc) return '';
  return String(callStatusOf(doc).status || callStatusOf(doc).lifecycle_status || '')
    .trim()
    .toUpperCase();
}

function phoneMatches(doc: HcgZyvkaLean, phone: string): boolean {
  const want = normalizePhone(phone);
  if (!want) return false;
  const candidates = [
    normalizePhone(doc.mobileNumber),
    normalizePhone(callStatusOf(doc).to_number),
  ];
  return candidates.some((value) => value && (value === want || value.endsWith(want) || want.endsWith(value)));
}

function parseZyvkaDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? new Date(parsed) : null;
}

function relativeTime(date: Date | null | undefined): string {
  if (!date) return '—';
  const mins = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatDuration(status: HcgZyvkaCallStatus): string {
  const seconds = Number(status.duration_seconds);
  if (Number.isFinite(seconds) && seconds > 0) {
    const mins = Math.floor(seconds / 60);
    const rest = Math.round(seconds % 60);
    return `${mins}:${String(rest).padStart(2, '0')}`;
  }
  const minutes = Number(status.duration_minutes);
  if (Number.isFinite(minutes) && minutes > 0) return `${minutes.toFixed(1)} min`;
  return '—';
}

function displayCallStatus(status: string): string {
  const key = status.trim().toUpperCase();
  const map: Record<string, string> = {
    QUEUED: 'Queued',
    INITIATED: 'Calling',
    RINGING: 'Ringing',
    IN_PROGRESS: 'In progress',
    ONGOING: 'In progress',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    NO_ANSWER: 'No answer',
    BUSY: 'Busy',
    CANCELED: 'Canceled',
    CANCELLED: 'Canceled',
    VOICEMAIL: 'Voicemail',
  };
  return map[key] || (key ? key.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : 'Calling');
}

function resultText(result: Record<string, unknown>, key: string): string {
  const value = result[key];
  if (value == null) return '';
  if (Array.isArray(value)) return value.map((row) => String(row || '').trim()).filter(Boolean).join(', ');
  return String(value).trim();
}

function isBlankAnswer(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return !normalized || normalized === 'not mentioned' || normalized === 'n/a';
}

function storedOverallAiStatus(doc: HcgZyvkaLean): string {
  return String(doc.overallAIStatus || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

export function hcgZyvkaOverallAiStatus(doc: HcgZyvkaLean): string {
  const stored = storedOverallAiStatus(doc);
  if (stored) return stored;
  return hcgZyvkaDerivedAiStatus(doc);
}

export function hcgZyvkaDerivedAiStatus(doc: HcgZyvkaLean): string {
  const status = hcgZyvkaCallStatusValue(doc);
  const result = callResultPayload(doc);
  const interest = resultText(result, 'interest_level').toLowerCase();
  const outcome = resultText(result, 'final_outcome').toLowerCase();
  const score = Number(resultText(result, 'eligibility_score'));

  if (['FAILED', 'NO_ANSWER', 'BUSY', 'CANCELED', 'CANCELLED'].includes(status)) {
    return 'awaiting_reply';
  }
  if (['QUEUED', 'INITIATED', 'RINGING', 'IN_PROGRESS', 'ONGOING', ''].includes(status)) {
    return status ? 'in_screening' : 'awaiting_reply';
  }
  if (interest.includes('not interested') || outcome.includes('not interested')) {
    return 'not_interested';
  }
  if (Number.isFinite(score) && score >= 4) return 'qualified';
  if (Number.isFinite(score) && score > 0 && score <= 2) return 'not_qualified';
  if (interest.includes('interested') || outcome.includes('interested')) return 'interested';
  if (status === 'COMPLETED') return 'in_qualification';
  return 'awaiting_reply';
}

export function hcgZyvkaStatus(doc: HcgZyvkaLean): {
  replyStatus: string;
  pipelineStatus: CandidatePipelineStatus;
} {
  const status = hcgZyvkaOverallAiStatus(doc);
  const map: Record<string, { replyStatus: string; pipelineStatus: CandidatePipelineStatus }> = {
    awaiting_reply: {
      replyStatus: displayCallStatus(hcgZyvkaCallStatusValue(doc)) || 'Awaiting reply',
      pipelineStatus: 'Awaiting reply',
    },
    in_screening: { replyStatus: displayCallStatus(hcgZyvkaCallStatusValue(doc)), pipelineStatus: 'In screening' },
    interested: { replyStatus: 'Interested', pipelineStatus: 'Answered' },
    not_interested: { replyStatus: 'Not interested', pipelineStatus: 'Not interested' },
    in_qualification: { replyStatus: 'Replied', pipelineStatus: 'In qualification' },
    qualified: { replyStatus: 'Replied', pipelineStatus: 'Qualified' },
    not_qualified: { replyStatus: 'Replied', pipelineStatus: 'Not qualified' },
    shortlisted: { replyStatus: 'Replied', pipelineStatus: 'Shortlisted' },
    rejected: { replyStatus: 'Not interested', pipelineStatus: 'Rejected' },
  };
  if (status === 'awaiting_reply' && !hcgZyvkaCallStatusValue(doc)) {
    return { replyStatus: 'Awaiting reply', pipelineStatus: 'Awaiting reply' };
  }
  return map[status] || { replyStatus: displayCallStatus(hcgZyvkaCallStatusValue(doc)), pipelineStatus: 'In screening' };
}

export function hcgZyvkaLastPreview(doc: HcgZyvkaLean): {
  lastMessage: string;
  lastTime: string;
  lastAt: Date | null;
} {
  const status = callStatusOf(doc);
  const result = callResultPayload(doc);
  const summary =
    String(doc.overallAIDescription || '').trim() ||
    resultText(result, 'summary') ||
    String(doc.call_summary?.summary || '').trim() ||
    displayCallStatus(hcgZyvkaCallStatusValue(doc));
  const lastAt =
    parseZyvkaDate(status.ended_at) ||
    parseZyvkaDate(status.started_at) ||
    doc.updatedAt ||
    doc.createdAt ||
    null;
  return {
    lastMessage: summary.slice(0, 240),
    lastTime: relativeTime(lastAt),
    lastAt,
  };
}

function questionLabel(key: string, index: number): string {
  const numbered = key.match(/^q_(\d+)_answer$/i);
  if (numbered) return `Question ${numbered[1]}`;
  const labels: Record<string, string> = {
    notice_period: 'Notice period',
    expected_ctc: 'Expected CTC',
    ctc: 'Current CTC',
    location: 'Location',
    experience: 'Experience',
    relevant_experience: 'Relevant experience',
    education: 'Education',
    role_interest_confirmation: 'Role interest',
  };
  return labels[key] || `Question ${index + 1}`;
}

export function mapHcgZyvkaQuestions(doc: HcgZyvkaLean): HcgZyvkaQuestionView[] {
  const stored = Array.isArray(doc.questions) ? doc.questions : [];
  if (stored.length > 0) {
    return stored
      .map((raw, index) => {
        const question = String(raw?.question || '').trim();
        const id = String(raw?.id || '').trim() || (question ? `q-${index + 1}` : '');
        return {
          id,
          question,
          asked: Boolean(raw?.asked),
          answer: raw?.answer == null ? '' : String(raw.answer).trim(),
          status: String(raw?.status || 'unanswered').trim() || 'unanswered',
          description: String(raw?.description || '').trim(),
        };
      })
      .filter((row) => row.id || row.question);
  }

  const result = callResultPayload(doc);
  const rows: HcgZyvkaQuestionView[] = [];
  const qKeys = Object.keys(result)
    .filter((key) => /^q_\d+_answer$/i.test(key))
    .sort((a, b) => Number(a.match(/\d+/)?.[0] || 0) - Number(b.match(/\d+/)?.[0] || 0));
  const fallbackKeys = [
    'notice_period',
    'expected_ctc',
    'ctc',
    'location',
    'experience',
    'relevant_experience',
    'education',
    'role_interest_confirmation',
  ];
  const keys = qKeys.length > 0 ? qKeys : fallbackKeys.filter((key) => key in result);

  for (const [index, key] of keys.entries()) {
    const answer = resultText(result, key);
    const numbered = key.match(/^q_(\d+)_answer$/i);
    const id = numbered ? `q-${numbered[1]}` : key;
    rows.push({
      id,
      question: questionLabel(key, index),
      asked: true,
      answer,
      status: isBlankAnswer(answer) ? 'unanswered' : 'passed',
      description: '',
    });
  }
  return rows.filter((row) => row.id);
}

function collectHcgZyvkaQuestionColumns(docs: HcgZyvkaLean[]): HcgZyvkaQuestionColumn[] {
  const seen = new Map<string, HcgZyvkaQuestionColumn>();
  for (const doc of docs) {
    for (const question of mapHcgZyvkaQuestions(doc)) {
      const id = question.id || question.question;
      if (!id || seen.has(id)) continue;
      seen.set(id, {
        id,
        title: question.question || question.id,
        prompt: question.question || question.id,
      });
    }
  }
  return [...seen.values()];
}

export function hcgZyvkaToEvents(doc: HcgZyvkaLean) {
  const status = callStatusOf(doc);
  const recording = callRecordingOf(doc);
  const result = callResultPayload(doc);
  const preview = hcgZyvkaLastPreview(doc);
  const derived = hcgZyvkaOverallAiStatus(doc);
  const outcome =
    resultText(result, 'final_outcome') ||
    resultText(result, 'interest_level') ||
    displayCallStatus(hcgZyvkaCallStatusValue(doc));
  const highlights = [
    resultText(result, 'interest_level'),
    resultText(result, 'eligibility_reason'),
  ].filter((row) => row && !isBlankAnswer(row));

  return [
    {
      id: String(doc.callId || status.call_id || doc._id || 'hcg-zyvka'),
      channel: 'AI Voice',
      author: 'ai' as const,
      authorName: 'Huntlo Voice AI',
      text: preview.lastMessage,
      time: preview.lastTime,
      delivery: hcgZyvkaCallStatusValue(doc) === 'FAILED' ? 'Failed' : 'Delivered',
      error: undefined,
      attachments: [],
      voiceSummary: {
        duration: formatDuration(status),
        outcome,
        highlights,
        recordingUrl: String(recording.recording_url || '').trim() || null,
        screeningId: null,
        resultId: null,
      },
      sentAt: preview.lastAt?.toISOString(),
      direction: 'outbound' as const,
      messageType: 'voice_summary',
      provider: 'zyastra',
      deliveryStatus: hcgZyvkaCallStatusValue(doc) === 'FAILED' ? 'failed' : 'delivered',
      aiGenerated: true,
      overallAIStatus: formatHcgOverallAiStatus(derived),
    },
  ];
}

export async function findHcgZyvkaCommunication(
  campaignId: string | null | undefined,
  phone: string | null | undefined
): Promise<HcgZyvkaCommunicationDocument | null> {
  return findHcgZyvkaCommunicationByCampaignIds(
    campaignId ? [String(campaignId)] : [],
    phone
  );
}

/** Prefer the most recent HCG zyvka doc across outreach + screening batch ids. */
export async function findHcgZyvkaCommunicationByCampaignIds(
  campaignIds: Array<string | null | undefined>,
  phone: string | null | undefined
): Promise<HcgZyvkaCommunicationDocument | null> {
  const ids = [
    ...new Set(campaignIds.map((id) => String(id || '').trim()).filter(Boolean)),
  ];
  const digits = normalizePhone(phone);
  if (!ids.length || !digits) return null;
  const docs = (await HcgZyvkaCommunicationModel.find(
    campaignIdQuery(ids)
  ).lean()) as HcgZyvkaLean[];
  const matches = docs.filter(
    (doc) => ids.includes(campaignIdOf(doc)) && phoneMatches(doc, digits)
  );
  if (!matches.length) return null;
  matches.sort((a, b) => {
    const left = a.updatedAt?.getTime?.() || 0;
    const right = b.updatedAt?.getTime?.() || 0;
    return right - left;
  });
  return (matches[0] as HcgZyvkaCommunicationDocument) || null;
}

export async function overlayHcgZyvkaOnListItems(
  items: Array<{
    campaignId?: string;
    phone?: string | null;
    channels?: string[];
    lastMessage?: string;
    lastTime?: string;
    replyStatus?: string;
    pipelineStatus?: string;
    overallAIDescription?: string | null;
  }>
): Promise<void> {
  const campaignIds = [
    ...new Set(items.map((item) => String(item.campaignId || '').trim()).filter(Boolean)),
  ];
  if (campaignIds.length === 0) return;

  const docs = (await HcgZyvkaCommunicationModel.find(
    campaignIdQuery(campaignIds)
  ).lean()) as HcgZyvkaLean[];
  if (docs.length === 0) return;

  for (const item of items) {
    const phone = normalizePhone(item.phone);
    const campaignId = String(item.campaignId || '').trim();
    if (!phone || !campaignId) continue;
    const doc = docs.find((row) => campaignIdOf(row) === campaignId && phoneMatches(row, phone));
    if (!doc) continue;

    const hasChatChannel = (item.channels || []).some(
      (channel) => channel === 'Email' || channel === 'WhatsApp'
    );
    const preview = hcgZyvkaLastPreview(doc);
    const status = hcgZyvkaStatus(doc);
    const description =
      String(doc.overallAIDescription || '').trim() ||
      resultText(callResultPayload(doc), 'summary') ||
      resultText(callResultPayload(doc), 'eligibility_reason');

    if (!hasChatChannel || !item.lastMessage || /^AI voice call started/i.test(item.lastMessage)) {
      if (preview.lastMessage) item.lastMessage = preview.lastMessage;
      if (preview.lastTime !== '—') item.lastTime = preview.lastTime;
      item.replyStatus = status.replyStatus;
      item.pipelineStatus = status.pipelineStatus;
    }
    if (!item.overallAIDescription && description) item.overallAIDescription = description;
  }
}

export async function overlayHcgZyvkaOverallAiStatus(
  campaignId: string,
  items: Array<{
    phone?: string | null;
    overallAIStatus?: string | null;
    overallAIDescription?: string | null;
    gmailQuestions?: HcgZyvkaQuestionView[];
  }>
): Promise<HcgZyvkaQuestionColumn[]> {
  const cid = String(campaignId || '').trim();
  if (!cid) return [];
  const docs = (await HcgZyvkaCommunicationModel.find(
    campaignIdQuery([cid])
  ).lean()) as HcgZyvkaLean[];
  if (docs.length === 0) return [];

  for (const item of items) {
    const phone = normalizePhone(item.phone);
    if (!phone) continue;
    const doc = docs.find((row) => campaignIdOf(row) === cid && phoneMatches(row, phone));
    if (!doc) continue;
    if (item.overallAIStatus) continue;
    const label = formatHcgOverallAiStatus(hcgZyvkaOverallAiStatus(doc));
    if (label) item.overallAIStatus = label;
    const description =
      String(doc.overallAIDescription || '').trim() ||
      resultText(callResultPayload(doc), 'summary') ||
      resultText(callResultPayload(doc), 'eligibility_reason');
    item.overallAIDescription = description || null;
    item.gmailQuestions = mapHcgZyvkaQuestions(doc);
  }
  return collectHcgZyvkaQuestionColumns(docs);
}

export async function countHcgZyvkaOverviewStats(campaignId: string): Promise<{
  replies: number;
  interested: number;
  qualified: number;
}> {
  const cid = String(campaignId || '').trim();
  if (!cid) return { replies: 0, interested: 0, qualified: 0 };
  const docs = (await HcgZyvkaCommunicationModel.find(campaignIdQuery([cid])).lean()) as HcgZyvkaLean[];

  let replies = 0;
  let interested = 0;
  let qualified = 0;
  for (const doc of docs) {
    if (campaignIdOf(doc) && campaignIdOf(doc) !== cid) continue;
    const derived = hcgZyvkaOverallAiStatus(doc);
    const status = hcgZyvkaCallStatusValue(doc);
    if (status === 'COMPLETED' || callStatusOf(doc).answered_by === 'HUMAN') replies += 1;
    if (derived === 'interested' || derived === 'qualified') interested += 1;
    if (derived === 'qualified') qualified += 1;
  }
  return { replies, interested, qualified };
}
