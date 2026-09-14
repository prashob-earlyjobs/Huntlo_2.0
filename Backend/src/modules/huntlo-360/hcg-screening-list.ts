/**
 * Huntlo 360 Screening tab — list voice attempts from HCG Hunar/Zyvka
 * collections for the workflow's linked outreach campaign.
 */
import mongoose from 'mongoose';

import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { HcgHunarCommunicationModel } from '../communication-gateway/models/hcg-hunar-communication.model.js';
import { HcgZyvkaCommunicationModel } from '../communication-gateway/models/hcg-zyvka-communication.model.js';
import {
  hcgHunarCallStatusValue,
  hcgHunarOverallAiStatus,
} from '../conversations/hcg-hunar-overlay.js';
import { formatHcgOverallAiStatus } from '../conversations/hcg-gmail-overlay.js';
import {
  hcgZyvkaCallStatusValue,
  hcgZyvkaOverallAiStatus,
} from '../conversations/hcg-zyvka-overlay.js';
import { ScreeningCandidateModel } from '../screening/screening-candidate.model.js';
import { ScreeningModel } from '../screening/screening.model.js';

export type WorkflowHcgScreeningRow = {
  id: string;
  candidateId: string | null;
  candidate: string;
  phone: string | null;
  provider: 'hunar' | 'zyvkay';
  callStatus: string;
  aiStatus: string | null;
  attempt: string;
  duration: string | null;
  score: number | null;
  outcome: string;
  summary: string | null;
  time: string;
  lastActivityAt: string | null;
  screeningResultId: string | null;
};

function normalizePhone(value?: string | null): string {
  return String(value || '').replace(/\D/g, '');
}

function phoneKey(value?: string | null): string {
  const digits = normalizePhone(value);
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function callStatusRecord(doc: { call_status?: unknown }): Record<string, unknown> {
  return asRecord(doc.call_status) || {};
}

function callResultPayload(doc: { call_result?: unknown }): Record<string, unknown> {
  const wrapper = asRecord(doc.call_result);
  return asRecord(wrapper?.result) || {};
}

function resultText(result: Record<string, unknown>, key: string): string {
  const value = result[key];
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function parseDate(value?: string | Date | null): Date | null {
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

function formatDuration(status: Record<string, unknown>): string | null {
  const seconds = Number(status.duration_seconds);
  if (Number.isFinite(seconds) && seconds > 0) {
    const mins = Math.floor(seconds / 60);
    const rest = Math.round(seconds % 60);
    return `${mins}m ${String(rest).padStart(2, '0')}s`;
  }
  const minutes = Number(status.duration_minutes);
  if (Number.isFinite(minutes) && minutes > 0) return `${minutes.toFixed(1)} min`;
  return null;
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
    CANCELED: 'Cancelled',
    CANCELLED: 'Cancelled',
  };
  return map[key] || (key ? key.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : '—');
}

function scoreFromResult(result: Record<string, unknown>): number | null {
  for (const key of ['eligibility_score', 'overall_score', 'score', 'communication']) {
    const n = Number(result[key]);
    if (Number.isFinite(n)) {
      // eligibility_score is often 1–5; scale to 0–100 for UI consistency when ≤5
      if (key === 'eligibility_score' && n > 0 && n <= 5) return Math.round((n / 5) * 100);
      return Math.round(n);
    }
  }
  return null;
}

function outcomeFromAiStatus(aiStatus: string, callStatus: string): string {
  const status = String(aiStatus || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  if (status === 'shortlisted') return 'Shortlisted';
  if (status === 'rejected' || status === 'not_qualified') return 'Rejected';
  if (status === 'qualified') return 'Qualified';
  if (status === 'in_screening') return 'In screening';
  if (callStatus === 'NO_ANSWER' || callStatus === 'BUSY') return 'Unanswered — retry pending';
  if (callStatus === 'FAILED') return 'Call failed';
  if (callStatus === 'COMPLETED') return 'Completed';
  if (callStatus) return displayCallStatus(callStatus);
  return 'Awaiting call';
}

function campaignIdQuery(campaignIds: string[]) {
  const ids = [...new Set(campaignIds.map((id) => String(id || '').trim()).filter(Boolean))];
  if (!ids.length) return null;
  const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  return {
    $or: [
      { campaignId: { $in: ids } },
      ...(objectIds.length > 0 ? [{ campaignId: { $in: objectIds } }] : []),
    ],
  };
}

type HcgVoiceDoc = {
  _id?: unknown;
  mobileNumber?: string | null;
  overallAIStatus?: string | null;
  overallAIDescription?: string | null;
  call_status?: unknown;
  call_result?: unknown;
  call_summary?: { summary?: string } | null;
  calleeName?: string | null;
  updatedAt?: Date;
  createdAt?: Date;
  provider: 'hunar' | 'zyvkay';
};

function hcgActivityAt(doc: HcgVoiceDoc): number {
  const status = callStatusRecord(doc);
  const at =
    parseDate(status.ended_at as string | null) ||
    parseDate(status.started_at as string | null) ||
    doc.updatedAt ||
    doc.createdAt ||
    null;
  return at ? at.getTime() : 0;
}

function pickBestHcgDoc(docs: HcgVoiceDoc[]): HcgVoiceDoc | null {
  if (!docs.length) return null;
  return [...docs].sort((a, b) => hcgActivityAt(b) - hcgActivityAt(a))[0] || null;
}

function rowFromHcg(input: {
  doc: HcgVoiceDoc;
  candidateId: string | null;
  candidateName: string;
  phone: string | null;
  screening?: {
    _id: unknown;
    overallScore?: number | null;
    recommendation?: string | null;
    callStatus?: string | null;
  } | null;
}): WorkflowHcgScreeningRow {
  const { doc, candidateId, candidateName, phone, screening } = input;
  const statusRec = callStatusRecord(doc);
  const result = callResultPayload(doc);
  const callStatusRaw =
    doc.provider === 'hunar'
      ? hcgHunarCallStatusValue(doc as never)
      : hcgZyvkaCallStatusValue(doc as never);
  const aiRaw =
    doc.provider === 'hunar'
      ? hcgHunarOverallAiStatus(doc as never)
      : hcgZyvkaOverallAiStatus(doc as never);
  const aiLabel = formatHcgOverallAiStatus(aiRaw);
  const lastAt =
    parseDate(statusRec.ended_at as string | null) ||
    parseDate(statusRec.started_at as string | null) ||
    doc.updatedAt ||
    doc.createdAt ||
    null;
  const score =
    (typeof screening?.overallScore === 'number' ? screening.overallScore : null) ??
    scoreFromResult(result);
  const summary =
    String(doc.overallAIDescription || '').trim() ||
    resultText(result, 'summary') ||
    resultText(result, 'eligibility_reason') ||
    null;

  return {
    id: String(doc._id),
    candidateId,
    candidate: candidateName,
    phone,
    provider: doc.provider,
    callStatus: displayCallStatus(callStatusRaw),
    aiStatus: aiLabel,
    attempt: callStatusRaw ? 'Voice attempt' : 'Queued',
    duration: formatDuration(statusRec),
    score,
    outcome:
      screening?.recommendation === 'shortlist'
        ? 'Shortlisted'
        : screening?.recommendation === 'reject'
          ? 'Rejected'
          : outcomeFromAiStatus(aiRaw, callStatusRaw),
    summary,
    time: relativeTime(lastAt),
    lastActivityAt: lastAt?.toISOString() || null,
    screeningResultId: screening ? String(screening._id) : null,
  };
}

export async function listWorkflowScreeningFromHcg(input: {
  organizationId: string;
  workflowId: string;
  campaignId: string | null;
}): Promise<WorkflowHcgScreeningRow[]> {
  // Gateway /messages/send stores Screening._id as campaign_id for voice dials.
  // Also include the linked Outreach campaignId for any docs keyed that way.
  const screenings = await ScreeningModel.find({
    organizationId: input.organizationId,
    workflowId: input.workflowId,
    deletedAt: null,
  })
    .select('_id')
    .lean();

  const hcgCampaignIds = [
    ...screenings.map((row) => String(row._id)),
    ...(input.campaignId ? [String(input.campaignId)] : []),
  ];
  const query = campaignIdQuery(hcgCampaignIds);

  const [hunarDocs, zyvkaDocs, screeningRows] = await Promise.all([
    query ? HcgHunarCommunicationModel.find(query).lean() : Promise.resolve([]),
    query ? HcgZyvkaCommunicationModel.find(query).lean() : Promise.resolve([]),
    ScreeningCandidateModel.find({
      organizationId: input.organizationId,
      workflowId: input.workflowId,
    })
      .select('_id candidateId overallScore recommendation callStatus updatedAt')
      .sort({ updatedAt: -1 })
      .lean(),
  ]);

  // One ScreeningCandidate row per candidate (latest wins).
  const screeningByCandidate = new Map<string, (typeof screeningRows)[number]>();
  for (const row of screeningRows) {
    const key = String(row.candidateId);
    if (!screeningByCandidate.has(key)) screeningByCandidate.set(key, row);
  }
  const uniqueScreeningRows = [...screeningByCandidate.values()];

  const candidates = uniqueScreeningRows.length
    ? await SavedCandidateModel.find({
        _id: { $in: uniqueScreeningRows.map((row) => row.candidateId) },
        organizationId: input.organizationId,
      })
        .select('_id name phone')
        .lean()
    : [];
  const candidateById = new Map(candidates.map((c) => [String(c._id), c]));

  const hcgDocs: HcgVoiceDoc[] = [
    ...(hunarDocs as HcgVoiceDoc[]).map((doc) => ({ ...doc, provider: 'hunar' as const })),
    ...(zyvkaDocs as HcgVoiceDoc[]).map((doc) => ({ ...doc, provider: 'zyvkay' as const })),
  ];

  // Index HCG by last-10 phone digits; keep the most recent doc per phone.
  const hcgByPhone = new Map<string, HcgVoiceDoc[]>();
  for (const doc of hcgDocs) {
    const key = phoneKey(doc.mobileNumber);
    if (!key) continue;
    const list = hcgByPhone.get(key) || [];
    list.push(doc);
    hcgByPhone.set(key, list);
  }
  const bestHcgByPhone = new Map<string, HcgVoiceDoc>();
  for (const [key, docs] of hcgByPhone) {
    const best = pickBestHcgDoc(docs);
    if (best) bestHcgByPhone.set(key, best);
  }

  const rows: WorkflowHcgScreeningRow[] = [];
  const usedPhones = new Set<string>();

  // Primary: one row per enrolled screening candidate, enriched from HCG.
  for (const row of uniqueScreeningRows) {
    const candidate = candidateById.get(String(row.candidateId));
    const phone = candidate?.phone || null;
    const key = phoneKey(phone);
    const hcg = key ? bestHcgByPhone.get(key) || null : null;
    if (key) usedPhones.add(key);

    if (hcg) {
      rows.push(
        rowFromHcg({
          doc: hcg,
          candidateId: String(row.candidateId),
          candidateName: candidate?.name || 'Unknown',
          phone,
          screening: row,
        })
      );
      continue;
    }

    const callStatus = String(row.callStatus || 'queued');
    rows.push({
      id: String(row._id),
      candidateId: String(row.candidateId),
      candidate: candidate?.name || 'Unknown',
      phone,
      provider: 'hunar',
      callStatus: displayCallStatus(callStatus.toUpperCase()),
      aiStatus: null,
      attempt: 'Voice attempt',
      duration: null,
      score: typeof row.overallScore === 'number' ? row.overallScore : null,
      outcome:
        row.recommendation === 'shortlist'
          ? 'Shortlisted'
          : row.recommendation === 'reject'
            ? 'Rejected'
            : displayCallStatus(callStatus.toUpperCase()),
      summary: null,
      time: relativeTime(row.updatedAt as Date | undefined),
      lastActivityAt: row.updatedAt
        ? new Date(row.updatedAt as Date).toISOString()
        : null,
      screeningResultId: String(row._id),
    });
  }

  // Orphan HCG docs (same campaign/screening ids) with no matching ScreeningCandidate.
  for (const [key, doc] of bestHcgByPhone) {
    if (usedPhones.has(key)) continue;
    rows.push(
      rowFromHcg({
        doc,
        candidateId: null,
        candidateName:
          String(doc.calleeName || '').trim() || String(doc.mobileNumber || '').trim() || 'Unknown',
        phone: String(doc.mobileNumber || '').trim() || null,
        screening: null,
      })
    );
  }

  rows.sort((a, b) => {
    const left = a.lastActivityAt ? Date.parse(a.lastActivityAt) : 0;
    const right = b.lastActivityAt ? Date.parse(b.lastActivityAt) : 0;
    return right - left;
  });

  return rows;
}
