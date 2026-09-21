import mongoose from 'mongoose';

import { mapHunarCallStatus } from '../../providers/hunar/hunar.webhook.js';
import { type CandidatePipelineStatus } from '../outreach/enrollment-pipeline-status.js';
import {
  HcgHunarCommunicationModel,
  type HcgHunarCallRecording,
  type HcgHunarCallResult,
  type HcgHunarCallStatus,
  type HcgHunarCommunicationDocument,
} from '../communication-gateway/models/hcg-hunar-communication.model.js';
import { HcgZyvkaCommunicationModel } from '../communication-gateway/models/hcg-zyvka-communication.model.js';
import { formatHcgOverallAiStatus } from './hcg-gmail-overlay.js';

type HcgHunarLean = {
  _id?: unknown;
  agentId?: string;
  campaignId?: string | null;
  mobileNumber?: string;
  callId?: string | null;
  overallAIStatus?: string | null;
  overallAIDescription?: string | null;
  questions?: Array<{
    id?: string;
    question?: string;
    asked?: boolean;
    answer?: string;
    status?: string;
    description?: string;
  }> | null;
  call_status?: HcgHunarCallStatus | null;
  call_recording?: HcgHunarCallRecording | null;
  call_result?: HcgHunarCallResult | null;
  call_summary?: { summary?: string } | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type HcgHunarQuestionView = {
  id: string;
  question: string;
  asked: boolean;
  answer: string;
  status: string;
  description: string;
};

export type HcgHunarQuestionColumn = {
  id: string;
  title: string;
  prompt: string;
};

function normalizePhone(value?: string | null): string {
  return String(value || '').replace(/\D/g, '');
}

function campaignIdOf(doc: HcgHunarLean): string {
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

function callStatusOf(doc: HcgHunarLean): HcgHunarCallStatus {
  return asRecord(doc.call_status) || {};
}

function callRecordingOf(doc: HcgHunarLean): HcgHunarCallRecording {
  return asRecord(doc.call_recording) || {};
}

function callResultPayload(doc: HcgHunarLean): Record<string, unknown> {
  const wrapper = asRecord(doc.call_result);
  const nested = asRecord(wrapper?.result);
  return nested || {};
}

export function hcgHunarCallStatusValue(doc: HcgHunarLean | null | undefined): string {
  if (!doc) return '';
  return String(callStatusOf(doc).status || callStatusOf(doc).lifecycle_status || '')
    .trim()
    .toUpperCase();
}

function phoneMatches(doc: HcgHunarLean, phone: string): boolean {
  const want = normalizePhone(phone);
  if (!want) return false;
  const candidates = [
    normalizePhone(doc.mobileNumber),
    normalizePhone(callStatusOf(doc).to_number),
  ];
  return candidates.some((value) => value && (value === want || value.endsWith(want) || want.endsWith(value)));
}

function parseHunarDate(value?: string | Date | null): Date | null {
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

function formatDuration(status: HcgHunarCallStatus): string {
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

function storedOverallAiStatus(doc: HcgHunarLean): string {
  return String(doc.overallAIStatus || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

/** Prefer gateway-written overallAIStatus; fall back to call_result for older docs. */
export function hcgHunarOverallAiStatus(doc: HcgHunarLean): string {
  const stored = storedOverallAiStatus(doc);
  if (stored) return stored;
  return hcgHunarDerivedAiStatus(doc);
}

export function hcgHunarDerivedAiStatus(doc: HcgHunarLean): string {
  const status = hcgHunarCallStatusValue(doc);
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
  // Outreach voice completed without a clear score — keep in qualification, not screening.
  if (status === 'COMPLETED') return 'in_qualification';
  return 'awaiting_reply';
}

export function hcgHunarStatus(doc: HcgHunarLean): {
  replyStatus: string;
  pipelineStatus: CandidatePipelineStatus;
} {
  const status = hcgHunarOverallAiStatus(doc);
  const map: Record<string, { replyStatus: string; pipelineStatus: CandidatePipelineStatus }> = {
    awaiting_reply: {
      replyStatus: displayCallStatus(hcgHunarCallStatusValue(doc)) || 'Awaiting reply',
      pipelineStatus: 'Awaiting reply',
    },
    in_screening: { replyStatus: displayCallStatus(hcgHunarCallStatusValue(doc)), pipelineStatus: 'In screening' },
    interested: { replyStatus: 'Interested', pipelineStatus: 'Answered' },
    not_interested: { replyStatus: 'Not interested', pipelineStatus: 'Not interested' },
    in_qualification: { replyStatus: 'Replied', pipelineStatus: 'In qualification' },
    qualified: { replyStatus: 'Replied', pipelineStatus: 'Qualified' },
    not_qualified: { replyStatus: 'Replied', pipelineStatus: 'Not qualified' },
    shortlisted: { replyStatus: 'Replied', pipelineStatus: 'Shortlisted' },
    rejected: { replyStatus: 'Not interested', pipelineStatus: 'Rejected' },
  };
  if (status === 'awaiting_reply' && !hcgHunarCallStatusValue(doc)) {
    return { replyStatus: 'Awaiting reply', pipelineStatus: 'Awaiting reply' };
  }
  return map[status] || { replyStatus: displayCallStatus(hcgHunarCallStatusValue(doc)), pipelineStatus: 'In screening' };
}

export function hcgHunarLastPreview(doc: HcgHunarLean): {
  lastMessage: string;
  lastTime: string;
  lastAt: Date | null;
} {
  const status = callStatusOf(doc);
  const result = callResultPayload(doc);
  const summary =
    resultText(result, 'summary') ||
    String(doc.call_summary?.summary || '').trim() ||
    displayCallStatus(hcgHunarCallStatusValue(doc));
  const lastAt =
    parseHunarDate(status.ended_at) ||
    parseHunarDate(status.started_at) ||
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

export function mapHcgHunarQuestions(doc: HcgHunarLean): HcgHunarQuestionView[] {
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
  const rows: HcgHunarQuestionView[] = [];
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

const KEY_ANSWER_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'skills_and_tools', label: 'Skills and tools' },
  { key: 'interest_level', label: 'Interest level' },
  { key: 'final_outcome', label: 'Final outcome' },
  { key: 'candidate_status', label: 'Candidate status' },
  { key: 'notice_period', label: 'Notice period' },
  { key: 'expected_ctc', label: 'Expected CTC' },
  { key: 'ctc', label: 'Current CTC' },
  { key: 'location', label: 'Location' },
  { key: 'experience', label: 'Experience' },
  { key: 'relevant_experience', label: 'Relevant experience' },
  { key: 'education', label: 'Education' },
  { key: 'recent_project', label: 'Recent project' },
  { key: 'role_interest_confirmation', label: 'Role interest' },
];

function meaningfulResultText(value: string): boolean {
  return Boolean(value.trim()) && !isBlankAnswer(value);
}

function scoreFromHunarResult(result: Record<string, unknown>): number | null {
  const communication = Number(result.communication);
  if (Number.isFinite(communication) && communication > 0) {
    return Math.round(communication);
  }
  const eligibility = Number(resultText(result, 'eligibility_score'));
  if (!Number.isFinite(eligibility) || eligibility <= 0) return null;
  // eligibility_score is usually 1–5; map to ~20–100 for the result header.
  if (eligibility <= 5) return Math.round(eligibility * 20);
  return Math.round(eligibility);
}

function durationSecondsFromHunar(doc: HcgHunarLean): number | null {
  const status = callStatusOf(doc);
  const seconds = Number(status.duration_seconds);
  if (Number.isFinite(seconds) && seconds > 0) return Math.round(seconds);
  const minutes = Number(status.duration_minutes);
  if (Number.isFinite(minutes) && minutes > 0) return Math.round(minutes * 60);
  return null;
}

function recommendationFromHcgVoice(
  result: Record<string, unknown>,
  overallScore: number | null,
  minShortlistScore: number
): string | null {
  if (String(result.summary || '').trim().toUpperCase() === 'NOT ENGAGED') {
    return 'review';
  }
  const outcome = String(result.final_outcome || '').trim().toLowerCase();
  const interest = String(result.interest_level || result.interest || '')
    .trim()
    .toLowerCase();
  if (
    outcome.includes('not_interested') ||
    outcome.includes('not interested') ||
    interest.includes('not interested')
  ) {
    return 'reject';
  }
  if (overallScore != null) {
    if (overallScore >= minShortlistScore) return 'shortlist';
    if (overallScore < minShortlistScore - 15) return 'reject';
    return 'review';
  }
  return null;
}

function applyHcgVoiceDocToScreeningListItem(
  item: {
    callStatus: string;
    overallScore: number | null;
    recommendation: string | null;
    overallAIStatus: string | null;
    overallAIDescription: string | null;
    summary: string | null;
    durationSeconds: number | null;
    answeredBy: string | null;
    completedAt: string | null;
    lastActivity: string;
  },
  doc: HcgHunarLean,
  minShortlistScore: number
): void {
  const overlay = buildHcgHunarScreeningResultOverlay(doc);
  const rawStatus = hcgHunarCallStatusValue(doc);
  item.callStatus = mapHunarCallStatus(rawStatus, overlay.answeredBy || undefined);
  if (overlay.overallAIStatus) item.overallAIStatus = overlay.overallAIStatus;
  if (overlay.overallAIDescription) {
    item.overallAIDescription = overlay.overallAIDescription;
  }
  if (overlay.summary) item.summary = overlay.summary;
  if (overlay.overallScore != null) {
    item.overallScore = overlay.overallScore;
  }
  const recommendation = recommendationFromHcgVoice(
    callResultPayload(doc),
    overlay.overallScore,
    minShortlistScore
  );
  if (recommendation) item.recommendation = recommendation;
  if (overlay.durationSeconds != null && overlay.durationSeconds > 0) {
    item.durationSeconds = overlay.durationSeconds;
  }
  if (overlay.answeredBy) item.answeredBy = overlay.answeredBy;
  const preview = hcgHunarLastPreview(doc);
  if (preview.lastAt) {
    item.lastActivity = preview.lastAt.toISOString();
    if (item.callStatus === 'completed') {
      item.completedAt = preview.lastAt.toISOString();
    }
  }
}

/**
 * Prefer gateway voice truth on screening results list (status, score, recommendation, dates).
 * Reads `hcg_hunar_communications` first, then `hcg_zyvkay_communications`.
 */
export async function overlayHcgVoiceOnScreeningResultList(
  items: Array<{
    screeningId: string;
    candidateId: string;
    modality?: string;
    /** Extra campaign ids to match (e.g. linked outreach campaignId). */
    hcgCampaignIds?: string[];
    callStatus: string;
    overallScore: number | null;
    recommendation: string | null;
    overallAIStatus: string | null;
    overallAIDescription: string | null;
    summary: string | null;
    durationSeconds: number | null;
    answeredBy: string | null;
    completedAt: string | null;
    lastActivity: string;
  }>,
  phonesByCandidateId: Map<string, string>,
  minScoreByScreeningId: Map<string, number>
): Promise<void> {
  const voiceItems = items.filter((item) => String(item.modality || 'voice') !== 'video');
  if (voiceItems.length === 0) return;

  const screeningIds = [
    ...new Set(
      voiceItems
        .flatMap((item) => [
          String(item.screeningId || '').trim(),
          ...(item.hcgCampaignIds || []).map((id) => String(id || '').trim()),
        ])
        .filter(Boolean)
    ),
  ];
  if (screeningIds.length === 0) return;

  const [hunarDocs, zyvkaDocs] = (await Promise.all([
    HcgHunarCommunicationModel.find(campaignIdQuery(screeningIds)).lean(),
    HcgZyvkaCommunicationModel.find(campaignIdQuery(screeningIds)).lean(),
  ])) as [HcgHunarLean[], HcgHunarLean[]];

  for (const item of voiceItems) {
    const phone = phonesByCandidateId.get(String(item.candidateId)) || '';
    const screeningId = String(item.screeningId || '').trim();
    if (!phone || !screeningId) continue;

    const matchIds = new Set(
      [screeningId, ...(item.hcgCampaignIds || []).map((id) => String(id || '').trim())].filter(
        Boolean
      )
    );

    const hunar =
      hunarDocs.find((doc) => matchIds.has(campaignIdOf(doc)) && phoneMatches(doc, phone)) ||
      null;
    const zyvka =
      !hunar
        ? zyvkaDocs.find((doc) => matchIds.has(campaignIdOf(doc)) && phoneMatches(doc, phone)) ||
          null
        : null;
    const doc = hunar || zyvka;
    if (!doc) continue;

    applyHcgVoiceDocToScreeningListItem(
      item,
      doc,
      minScoreByScreeningId.get(screeningId) ?? 70
    );
  }
}

/** Flat overlay for screening result detail (status, summary, score, Q&A, etc.). */
export function buildHcgHunarScreeningResultOverlay(doc: HcgHunarLean): {
  overallAIStatus: string | null;
  overallAIDescription: string | null;
  summary: string | null;
  overallScore: number | null;
  durationSeconds: number | null;
  recordingReference: string | null;
  answeredBy: string | null;
  hcgQuestions: HcgHunarQuestionView[];
  strengths: string[];
  concerns: string[];
  keyAnswers: Array<{ question: string; answer: string }>;
  extractedVariables: Record<string, unknown>;
  triggeredKnockouts: string[];
} {
  const result = callResultPayload(doc);
  const status = callStatusOf(doc);
  const recordingUrl = String(callRecordingOf(doc).recording_url || '').trim();
  const callSummaryText = resultText(result, 'summary');
  const overallAIDescription = String(doc.overallAIDescription || '').trim();
  const eligibilityReason = resultText(result, 'eligibility_reason');

  const keyAnswers = KEY_ANSWER_FIELDS.flatMap(({ key, label }) => {
    const answer = resultText(result, key);
    return meaningfulResultText(answer) ? [{ question: label, answer }] : [];
  });

  const strengths: string[] = [];
  const skills = resultText(result, 'skills_and_tools');
  const interest = resultText(result, 'interest_level');
  const candidateStatus = resultText(result, 'candidate_status');
  if (meaningfulResultText(skills)) strengths.push(`Skills: ${skills}`);
  if (meaningfulResultText(interest)) strengths.push(`Interest: ${interest}`);
  if (meaningfulResultText(candidateStatus)) strengths.push(candidateStatus);

  const concerns: string[] = [];
  if (meaningfulResultText(eligibilityReason)) concerns.push(eligibilityReason);

  const triggeredKnockouts = Array.isArray(result.knockouts_triggered)
    ? result.knockouts_triggered.map((item) => String(item || '').trim()).filter(Boolean)
    : [];

  const skipExtracted = new Set([
    'summary',
    'candidate_questions',
    'knockouts_triggered',
    'eligibility_reason',
  ]);
  const extractedVariables: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(result)) {
    if (skipExtracted.has(key)) continue;
    if (Array.isArray(value)) {
      if (value.length > 0) extractedVariables[key] = value;
      continue;
    }
    const text = value == null ? '' : String(value).trim();
    if (meaningfulResultText(text)) extractedVariables[key] = text;
  }

  return {
    overallAIStatus: formatHcgOverallAiStatus(hcgHunarOverallAiStatus(doc)),
    overallAIDescription: overallAIDescription || null,
    summary: callSummaryText || overallAIDescription || null,
    overallScore: scoreFromHunarResult(result),
    durationSeconds: durationSecondsFromHunar(doc),
    recordingReference: recordingUrl || null,
    answeredBy: String(status.answered_by || '').trim() || null,
    hcgQuestions: mapHcgHunarQuestions(doc),
    strengths,
    concerns,
    keyAnswers,
    extractedVariables,
    triggeredKnockouts,
  };
}

function collectHcgHunarQuestionColumns(docs: HcgHunarLean[]): HcgHunarQuestionColumn[] {
  const seen = new Map<string, HcgHunarQuestionColumn>();
  for (const doc of docs) {
    for (const question of mapHcgHunarQuestions(doc)) {
      if (!question.id || seen.has(question.id)) continue;
      seen.set(question.id, {
        id: question.id,
        title: question.question,
        prompt: question.question,
      });
    }
  }
  return [...seen.values()];
}

export function hcgHunarToEvents(doc: HcgHunarLean) {
  const status = callStatusOf(doc);
  const recording = callRecordingOf(doc);
  const result = callResultPayload(doc);
  const preview = hcgHunarLastPreview(doc);
  const derived = hcgHunarOverallAiStatus(doc);
  const outcome =
    resultText(result, 'final_outcome') ||
    resultText(result, 'interest_level') ||
    displayCallStatus(hcgHunarCallStatusValue(doc));
  const highlights = [
    resultText(result, 'interest_level'),
    resultText(result, 'eligibility_reason'),
  ].filter((row) => row && !isBlankAnswer(row));

  return [
    {
      id: String(doc.callId || status.call_id || doc._id || 'hcg-hunar'),
      channel: 'AI Voice',
      author: 'ai' as const,
      authorName: 'Huntlo Voice AI',
      text: preview.lastMessage,
      time: preview.lastTime,
      delivery: hcgHunarCallStatusValue(doc) === 'FAILED' ? 'Failed' : 'Delivered',
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
      provider: 'hunar',
      deliveryStatus: hcgHunarCallStatusValue(doc) === 'FAILED' ? 'failed' : 'delivered',
      aiGenerated: true,
      overallAIStatus: formatHcgOverallAiStatus(derived),
    },
  ];
}

export async function findHcgHunarCommunication(
  campaignId: string | null | undefined,
  phone: string | null | undefined
): Promise<HcgHunarCommunicationDocument | null> {
  return findHcgHunarCommunicationByCampaignIds(
    campaignId ? [String(campaignId)] : [],
    phone
  );
}

/** Prefer the most recent HCG hunar doc across outreach + screening batch ids. */
export async function findHcgHunarCommunicationByCampaignIds(
  campaignIds: Array<string | null | undefined>,
  phone: string | null | undefined
): Promise<HcgHunarCommunicationDocument | null> {
  const ids = [
    ...new Set(campaignIds.map((id) => String(id || '').trim()).filter(Boolean)),
  ];
  const digits = normalizePhone(phone);
  if (!ids.length || !digits) return null;
  const docs = (await HcgHunarCommunicationModel.find(
    campaignIdQuery(ids)
  ).lean()) as HcgHunarLean[];
  const matches = docs.filter(
    (doc) => ids.includes(campaignIdOf(doc)) && phoneMatches(doc, digits)
  );
  if (!matches.length) return null;
  matches.sort((a, b) => {
    const left = a.updatedAt?.getTime?.() || 0;
    const right = b.updatedAt?.getTime?.() || 0;
    return right - left;
  });
  return (matches[0] as HcgHunarCommunicationDocument) || null;
}

export async function overlayHcgHunarOnListItems(
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

  const docs = (await HcgHunarCommunicationModel.find(
    campaignIdQuery(campaignIds)
  ).lean()) as HcgHunarLean[];
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
    const preview = hcgHunarLastPreview(doc);
    const status = hcgHunarStatus(doc);
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

export async function overlayHcgHunarOverallAiStatus(
  campaignId: string,
  items: Array<{
    phone?: string | null;
    overallAIStatus?: string | null;
    overallAIDescription?: string | null;
    gmailQuestions?: HcgHunarQuestionView[];
  }>
): Promise<HcgHunarQuestionColumn[]> {
  const cid = String(campaignId || '').trim();
  if (!cid) return [];
  const docs = (await HcgHunarCommunicationModel.find(
    campaignIdQuery([cid])
  ).lean()) as HcgHunarLean[];
  if (docs.length === 0) return [];

  for (const item of items) {
    const phone = normalizePhone(item.phone);
    if (!phone) continue;
    const doc = docs.find((row) => campaignIdOf(row) === cid && phoneMatches(row, phone));
    if (!doc) continue;
    if (item.overallAIStatus) continue;
    const label = formatHcgOverallAiStatus(hcgHunarOverallAiStatus(doc));
    if (label) item.overallAIStatus = label;
    const description =
      String(doc.overallAIDescription || '').trim() ||
      resultText(callResultPayload(doc), 'summary') ||
      resultText(callResultPayload(doc), 'eligibility_reason');
    item.overallAIDescription = description || null;
    item.gmailQuestions = mapHcgHunarQuestions(doc);
  }
  return collectHcgHunarQuestionColumns(docs);
}

export async function countHcgHunarOverviewStats(campaignId: string): Promise<{
  replies: number;
  interested: number;
  qualified: number;
}> {
  const cid = String(campaignId || '').trim();
  if (!cid) return { replies: 0, interested: 0, qualified: 0 };
  const docs = (await HcgHunarCommunicationModel.find(campaignIdQuery([cid])).lean()) as HcgHunarLean[];

  let replies = 0;
  let interested = 0;
  let qualified = 0;
  for (const doc of docs) {
    if (campaignIdOf(doc) && campaignIdOf(doc) !== cid) continue;
    const derived = hcgHunarOverallAiStatus(doc);
    const status = hcgHunarCallStatusValue(doc);
    if (status === 'COMPLETED' || callStatusOf(doc).answered_by === 'HUMAN') replies += 1;
    if (derived === 'interested' || derived === 'qualified') interested += 1;
    if (derived === 'qualified') qualified += 1;
  }
  return { replies, interested, qualified };
}
