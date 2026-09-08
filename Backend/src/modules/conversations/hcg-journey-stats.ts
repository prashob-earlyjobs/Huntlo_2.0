import mongoose from 'mongoose';

import { HcgGmailConversationModel } from '../communication-gateway/models/hcg-gmail-conversation.model.js';
import { HcgWhatsappConversationModel } from '../communication-gateway/models/hcg-whatsapp-conversation.model.js';
import { HcgHunarCommunicationModel } from '../communication-gateway/models/hcg-hunar-communication.model.js';
import { HcgZyvkaCommunicationModel } from '../communication-gateway/models/hcg-zyvka-communication.model.js';
import {
  hcgHunarCallStatusValue,
  hcgHunarOverallAiStatus,
} from './hcg-hunar-overlay.js';
import {
  hcgZyvkaCallStatusValue,
  hcgZyvkaOverallAiStatus,
} from './hcg-zyvka-overlay.js';

/**
 * Huntlo 360 Journey funnel buckets derived from HCG overallAIStatus.
 * Cumulative: Reply ≥ Qualification ≥ Screening ≥ Shortlist.
 */
export type HcgJourneyStats = {
  replied: number;
  qualified: number;
  screened: number;
  shortlisted: number;
};

const EMPTY: HcgJourneyStats = {
  replied: 0,
  qualified: 0,
  screened: 0,
  shortlisted: 0,
};

const AWAITING = new Set(['', 'awaiting_reply']);

/** Reached qualification Q&A (or later). `interested` alone stays Reply-only. */
const QUALIFICATION_REACHED = new Set([
  'in_qualification',
  'qualified',
  'not_qualified',
  'in_screening',
  'shortlisted',
  'rejected',
]);

/** Entered or finished screening. */
const SCREENING_REACHED = new Set(['in_screening', 'shortlisted', 'rejected']);

const SHORTLISTED = new Set(['shortlisted']);

function normalizeAiStatus(value?: string | null): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function campaignIdQuery(campaignId: string) {
  const ids = [campaignId];
  const objectIds = mongoose.Types.ObjectId.isValid(campaignId)
    ? [campaignId]
    : [];
  return {
    $or: [
      { campaignId: { $in: ids } },
      ...(objectIds.length > 0 ? [{ campaignId: { $in: objectIds } }] : []),
      { 'messages.campaignId': { $in: ids } },
    ],
  };
}

function campaignIdOf(doc: unknown): string {
  const row = doc as {
    campaignId?: unknown;
    messages?: Array<{ campaignId?: unknown }>;
  };
  const top = String(row.campaignId || '').trim();
  if (top) return top;
  return (
    (row.messages || [])
      .map((msg) => String(msg.campaignId || '').trim())
      .find(Boolean) || ''
  );
}

function accrueFromStatus(
  stats: HcgJourneyStats,
  statusRaw: string | null | undefined,
  repliedHint = false
) {
  const status = normalizeAiStatus(statusRaw);
  const replied = repliedHint || Boolean(status && !AWAITING.has(status));
  if (replied) stats.replied += 1;
  if (QUALIFICATION_REACHED.has(status)) stats.qualified += 1;
  if (SCREENING_REACHED.has(status)) stats.screened += 1;
  if (SHORTLISTED.has(status)) stats.shortlisted += 1;
}

function gmailReplied(doc: {
  overallAIStatus?: string | null;
  emailAddress?: string | null;
  messages?: Array<{ direction?: string; from?: string | null }>;
}): boolean {
  const status = normalizeAiStatus(doc.overallAIStatus);
  if (status && !AWAITING.has(status)) return true;
  const messages = doc.messages || [];
  if (messages.some((msg) => msg.direction === 'inbound')) return true;
  if (messages.length > 1) return true;
  return false;
}

function whatsappReplied(doc: {
  overallAIStatus?: string | null;
  messages?: Array<{ direction?: string }>;
}): boolean {
  const status = normalizeAiStatus(doc.overallAIStatus);
  if (status && !AWAITING.has(status)) return true;
  return (doc.messages || []).some((msg) => msg.direction === 'inbound');
}

function mergeMax(a: HcgJourneyStats, b: HcgJourneyStats): HcgJourneyStats {
  return {
    replied: Math.max(a.replied, b.replied),
    qualified: Math.max(a.qualified, b.qualified),
    screened: Math.max(a.screened, b.screened),
    shortlisted: Math.max(a.shortlisted, b.shortlisted),
  };
}

async function countGmail(campaignId: string): Promise<HcgJourneyStats> {
  const stats = { ...EMPTY };
  const docs = await HcgGmailConversationModel.find(campaignIdQuery(campaignId)).lean();
  for (const doc of docs) {
    if (campaignIdOf(doc) && campaignIdOf(doc) !== campaignId) continue;
    accrueFromStatus(stats, doc.overallAIStatus, gmailReplied(doc));
  }
  return stats;
}

async function countWhatsapp(campaignId: string): Promise<HcgJourneyStats> {
  const stats = { ...EMPTY };
  const docs = await HcgWhatsappConversationModel.find({
    $or: [
      { campaignId },
      ...(mongoose.Types.ObjectId.isValid(campaignId)
        ? [{ campaignId: new mongoose.Types.ObjectId(campaignId) }]
        : []),
    ],
  }).lean();
  for (const doc of docs) {
    if (campaignIdOf(doc) && campaignIdOf(doc) !== campaignId) continue;
    accrueFromStatus(stats, doc.overallAIStatus, whatsappReplied(doc));
  }
  return stats;
}

async function countHunar(campaignId: string): Promise<HcgJourneyStats> {
  const stats = { ...EMPTY };
  const docs = await HcgHunarCommunicationModel.find({
    $or: [
      { campaignId },
      ...(mongoose.Types.ObjectId.isValid(campaignId)
        ? [{ campaignId: new mongoose.Types.ObjectId(campaignId) }]
        : []),
    ],
  }).lean();
  for (const doc of docs) {
    if (String(doc.campaignId || '') && String(doc.campaignId) !== campaignId) continue;
    const status = hcgHunarOverallAiStatus(doc);
    const callStatus = hcgHunarCallStatusValue(doc);
    const replied =
      callStatus === 'COMPLETED' || Boolean(status && !AWAITING.has(status));
    accrueFromStatus(stats, status, replied);
  }
  return stats;
}

async function countZyvka(campaignId: string): Promise<HcgJourneyStats> {
  const stats = { ...EMPTY };
  const docs = await HcgZyvkaCommunicationModel.find({
    $or: [
      { campaignId },
      ...(mongoose.Types.ObjectId.isValid(campaignId)
        ? [{ campaignId: new mongoose.Types.ObjectId(campaignId) }]
        : []),
    ],
  }).lean();
  for (const doc of docs) {
    if (String(doc.campaignId || '') && String(doc.campaignId) !== campaignId) continue;
    const status = hcgZyvkaOverallAiStatus(doc);
    const callStatus = hcgZyvkaCallStatusValue(doc);
    const replied =
      callStatus === 'COMPLETED' || Boolean(status && !AWAITING.has(status));
    accrueFromStatus(stats, status, replied);
  }
  return stats;
}

/**
 * Aggregate Journey funnel counts from all HCG collections for a campaign.
 * Uses Math.max across channels (same pattern as campaign overview KPIs).
 */
export async function countHcgJourneyStats(campaignId: string): Promise<HcgJourneyStats> {
  const cid = String(campaignId || '').trim();
  if (!cid) return { ...EMPTY };

  const [gmail, whatsapp, hunar, zyvka] = await Promise.all([
    countGmail(cid),
    countWhatsapp(cid),
    countHunar(cid),
    countZyvka(cid),
  ]);

  return [gmail, whatsapp, hunar, zyvka].reduce(mergeMax, { ...EMPTY });
}
