import mongoose from 'mongoose';

import { type CandidatePipelineStatus } from '../outreach/enrollment-pipeline-status.js';
import {
  HcgWhatsappConversationModel,
  type HcgWhatsappConversationDocument,
  type HcgWhatsappConversationMessage,
} from '../communication-gateway/models/hcg-whatsapp-conversation.model.js';
import { formatHcgOverallAiStatus } from './hcg-gmail-overlay.js';

type HcgWhatsappConversationLean = {
  threadId?: string;
  phone?: string;
  campaignId?: string | null;
  overallAIStatus?: string | null;
  overallAIDescription?: string | null;
  messages?: HcgWhatsappConversationMessage[];
  questions?: Array<{
    id?: string;
    question?: string;
    asked?: boolean;
    answer?: string | null;
    status?: string;
    description?: string;
  }>;
  updatedAt?: Date;
};

export type HcgWhatsappQuestionView = {
  id: string;
  question: string;
  asked: boolean;
  answer: string;
  status: string;
  description: string;
};

export type HcgWhatsappQuestionColumn = {
  id: string;
  title: string;
  prompt: string;
};

function normalizePhone(value?: string | null): string {
  return String(value || '').replace(/\D/g, '');
}

function phonesIn(value?: string | null): string[] {
  const digits = normalizePhone(value);
  return digits ? [digits] : [];
}

function campaignIdOf(doc: HcgWhatsappConversationLean): string {
  return String(doc.campaignId || '').trim();
}

function messageText(msg: HcgWhatsappConversationMessage): string {
  return String(msg.body || msg.snippet || '').trim();
}

function messageDate(msg: HcgWhatsappConversationMessage): Date | null {
  const n = Number(msg.internalDate);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Date(n < 1e12 ? n * 1000 : n);
}

function sortedMessages(doc: HcgWhatsappConversationLean): HcgWhatsappConversationMessage[] {
  return [...(doc.messages || [])].sort((a, b) => {
    const left = messageDate(a)?.getTime() || 0;
    const right = messageDate(b)?.getTime() || 0;
    return left - right;
  });
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

function phoneMatches(left: string, right: string): boolean {
  if (!left || !right) return false;
  return left === right || left.endsWith(right) || right.endsWith(left);
}

function docTouchesPhone(doc: HcgWhatsappConversationLean, phone: string): boolean {
  const want = normalizePhone(phone);
  if (!want) return false;
  if (phonesIn(doc.phone).some((value) => phoneMatches(value, want))) return true;
  return (doc.messages || []).some(
    (msg) =>
      phonesIn(msg.to).some((value) => phoneMatches(value, want)) ||
      phonesIn(msg.from).some((value) => phoneMatches(value, want))
  );
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

const HCG_INTERESTED_STATUSES = new Set([
  'interested',
  'in_qualification',
  'qualified',
  'not_qualified',
  'in_screening',
  'shortlisted',
]);
const HCG_QUALIFIED_STATUSES = new Set(['qualified', 'shortlisted']);
const HCG_AWAITING_STATUSES = new Set(['', 'awaiting_reply']);
/** Finished screening only — not in_qualification, which the gateway may set on first outbound. */
const HCG_SEQUENCE_STOP_STATUSES = new Set([
  'qualified',
  'not_qualified',
  'not_interested',
  'shortlisted',
  'rejected',
]);

function normalizeAiStatus(value?: string | null): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function hcgConversationReplied(doc: HcgWhatsappConversationLean): boolean {
  const status = normalizeAiStatus(doc.overallAIStatus);
  if (status && !HCG_AWAITING_STATUSES.has(status)) return true;
  const messages = doc.messages || [];
  if (messages.some((msg) => msg.direction === 'inbound')) return true;
  return messages.length > 1;
}

/** True when a later sequence step should not send — candidate already replied or screening finished. */
export function hcgWhatsappShouldStopSequence(
  doc: HcgWhatsappConversationLean | HcgWhatsappConversationDocument | null | undefined
): boolean {
  if (!doc) return false;
  const lean = doc as HcgWhatsappConversationLean;
  const status = normalizeAiStatus(lean.overallAIStatus);
  if (HCG_SEQUENCE_STOP_STATUSES.has(status)) return true;
  return (lean.messages || []).some((msg) => msg.direction === 'inbound');
}

export function hcgWhatsappStatus(doc: HcgWhatsappConversationLean): {
  replyStatus: string;
  pipelineStatus: CandidatePipelineStatus;
} {
  const status = normalizeAiStatus(doc.overallAIStatus);
  const map: Record<string, { replyStatus: string; pipelineStatus: CandidatePipelineStatus }> = {
    awaiting_reply: { replyStatus: 'Awaiting reply', pipelineStatus: 'Awaiting reply' },
    interested: { replyStatus: 'Interested', pipelineStatus: 'Answered' },
    not_interested: { replyStatus: 'Not interested', pipelineStatus: 'Not interested' },
    in_qualification: { replyStatus: 'Replied', pipelineStatus: 'In qualification' },
    qualified: { replyStatus: 'Replied', pipelineStatus: 'Qualified' },
    not_qualified: { replyStatus: 'Replied', pipelineStatus: 'Not qualified' },
    in_screening: { replyStatus: 'Replied', pipelineStatus: 'In screening' },
    shortlisted: { replyStatus: 'Replied', pipelineStatus: 'Shortlisted' },
    rejected: { replyStatus: 'Not interested', pipelineStatus: 'Rejected' },
  };
  return map[status] || { replyStatus: 'Awaiting reply', pipelineStatus: 'Awaiting reply' };
}

export function hcgWhatsappLastPreview(doc: HcgWhatsappConversationLean): {
  lastMessage: string;
  lastTime: string;
  lastAt: Date | null;
} {
  const last = sortedMessages(doc).at(-1);
  if (!last) return { lastMessage: '', lastTime: '—', lastAt: null };
  const lastAt = messageDate(last) || doc.updatedAt || null;
  return {
    lastMessage: messageText(last).slice(0, 240),
    lastTime: relativeTime(lastAt),
    lastAt,
  };
}

export function hcgWhatsappMessagesToEvents(
  doc: HcgWhatsappConversationLean,
  candidateName: string
) {
  return sortedMessages(doc).map((msg, index) => {
    const inbound = msg.direction === 'inbound';
    const at = messageDate(msg);
    const text = messageText(msg);
    return {
      id: msg.messageId || `hcg-whatsapp-${index}`,
      channel: 'WhatsApp',
      author: inbound ? 'candidate' : 'recruiter',
      authorName: inbound ? candidateName : 'Recruiter',
      subject: undefined as string | undefined,
      text,
      html: undefined as string | undefined,
      time: relativeTime(at),
      delivery: inbound ? undefined : 'Sent',
      error: undefined,
      attachments: [],
      voiceSummary: undefined,
      sentAt: at?.toISOString(),
      direction: inbound ? ('inbound' as const) : ('outbound' as const),
      messageType: 'message',
      provider: 'whatsapp',
      deliveryStatus: 'sent',
      aiGenerated: false,
    };
  });
}

export async function countHcgWhatsappOverviewStats(campaignId: string): Promise<{
  replies: number;
  interested: number;
  qualified: number;
}> {
  const cid = String(campaignId || '').trim();
  if (!cid) return { replies: 0, interested: 0, qualified: 0 };
  const docs = (await HcgWhatsappConversationModel.find(
    campaignIdQuery([cid])
  ).lean()) as HcgWhatsappConversationLean[];

  let replies = 0;
  let interested = 0;
  let qualified = 0;
  for (const doc of docs) {
    const docCampaignId = campaignIdOf(doc);
    if (docCampaignId && docCampaignId !== cid) continue;
    const status = normalizeAiStatus(doc.overallAIStatus);
    if (hcgConversationReplied(doc)) replies += 1;
    if (HCG_INTERESTED_STATUSES.has(status)) interested += 1;
    if (HCG_QUALIFIED_STATUSES.has(status)) qualified += 1;
  }
  return { replies, interested, qualified };
}

export async function findHcgWhatsappConversation(
  campaignId: string | null | undefined,
  phone: string | null | undefined
): Promise<HcgWhatsappConversationDocument | null> {
  const cid = String(campaignId || '').trim();
  const em = normalizePhone(phone);
  if (!cid || !em) return null;
  const docs = (await HcgWhatsappConversationModel.find(
    campaignIdQuery([cid])
  ).lean()) as HcgWhatsappConversationLean[];
  const match = docs.find((doc) => campaignIdOf(doc) === cid && docTouchesPhone(doc, em));
  return (match as HcgWhatsappConversationDocument) || null;
}

export function hcgWhatsappThreadIdOf(
  doc: HcgWhatsappConversationDocument | HcgWhatsappConversationLean | null | undefined
): string | null {
  const id = String((doc as { threadId?: string } | null)?.threadId || '').trim();
  return id || null;
}

export async function waitForHcgWhatsappConversation(
  campaignId: string | null | undefined,
  phone: string | null | undefined,
  options?: { timeoutMs?: number; intervalMs?: number }
): Promise<HcgWhatsappConversationDocument | null> {
  const timeoutMs = options?.timeoutMs ?? 20_000;
  const intervalMs = options?.intervalMs ?? 1_000;
  const started = Date.now();
  let doc = await findHcgWhatsappConversation(campaignId, phone);
  while (!hcgWhatsappThreadIdOf(doc) && Date.now() - started < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    doc = await findHcgWhatsappConversation(campaignId, phone);
  }
  return doc;
}

export async function overlayHcgWhatsappOnListItems(
  items: Array<{
    campaignId?: string;
    phone?: string | null;
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

  const docs = (await HcgWhatsappConversationModel.find(
    campaignIdQuery(campaignIds)
  ).lean()) as HcgWhatsappConversationLean[];
  if (docs.length === 0) return;

  for (const item of items) {
    const phone = normalizePhone(item.phone);
    const campaignId = String(item.campaignId || '').trim();
    if (!phone || !campaignId) continue;
    const doc = docs.find(
      (row) => campaignIdOf(row) === campaignId && docTouchesPhone(row, phone)
    );
    if (!doc) continue;
    const preview = hcgWhatsappLastPreview(doc);
    if (preview.lastMessage) item.lastMessage = preview.lastMessage;
    if (preview.lastTime !== '—') item.lastTime = preview.lastTime;
    const status = hcgWhatsappStatus(doc);
    item.replyStatus = status.replyStatus;
    item.pipelineStatus = status.pipelineStatus;
    if (!item.overallAIDescription) {
      const description = String(doc.overallAIDescription || '').trim();
      if (description) item.overallAIDescription = description;
    }
  }
}

function mapHcgWhatsappQuestions(
  questions?: HcgWhatsappConversationLean['questions']
): HcgWhatsappQuestionView[] {
  return (questions || [])
    .map((raw, index) => {
      const question = String(raw?.question || '').trim();
      const id = String(raw?.id || '').trim() || (question ? `q-${index}` : '');
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

function collectHcgWhatsappQuestionColumns(
  docs: HcgWhatsappConversationLean[]
): HcgWhatsappQuestionColumn[] {
  const seen = new Map<string, HcgWhatsappQuestionColumn>();
  for (const doc of docs) {
    for (const question of mapHcgWhatsappQuestions(doc.questions)) {
      const id = question.id || question.question;
      if (!id || seen.has(id)) continue;
      const title = question.question || question.id;
      seen.set(id, { id, title, prompt: question.question || title });
    }
  }
  return [...seen.values()];
}

export async function overlayHcgWhatsappOverallAiStatus(
  campaignId: string,
  items: Array<{
    phone?: string | null;
    overallAIStatus?: string | null;
    overallAIDescription?: string | null;
    gmailQuestions?: HcgWhatsappQuestionView[];
  }>
): Promise<HcgWhatsappQuestionColumn[]> {
  const cid = String(campaignId || '').trim();
  if (!cid) return [];
  const docs = (await HcgWhatsappConversationModel.find(
    campaignIdQuery([cid])
  ).lean()) as HcgWhatsappConversationLean[];
  if (docs.length === 0) return [];

  for (const item of items) {
    const phone = normalizePhone(item.phone);
    if (!phone) continue;
    const doc = docs.find(
      (row) => campaignIdOf(row) === cid && docTouchesPhone(row, phone)
    );
    if (!doc) continue;
    if (item.overallAIStatus) continue;
    const label = formatHcgOverallAiStatus(doc.overallAIStatus);
    if (label) item.overallAIStatus = label;
    const description = String(doc.overallAIDescription || '').trim();
    item.overallAIDescription = description || null;
    item.gmailQuestions = mapHcgWhatsappQuestions(doc.questions);
  }
  return collectHcgWhatsappQuestionColumns(docs);
}
