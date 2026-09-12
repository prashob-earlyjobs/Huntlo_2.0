import mongoose from 'mongoose';

import { type CandidatePipelineStatus } from '../outreach/enrollment-pipeline-status.js';
import {
  HcgZohoConversationModel,
  type HcgZohoConversationDocument,
  type HcgZohoConversationMessage,
} from '../communication-gateway/models/hcg-zoho-conversation.model.js';
import { formatHcgOverallAiStatus } from './hcg-gmail-overlay.js';

type HcgZohoConversationLean = {
  threadId?: string;
  emailAddress?: string;
  accountId?: string | null;
  dataCenter?: string | null;
  providerThreadId?: string | null;
  campaignId?: string | null;
  overallAIStatus?: string | null;
  overallAIDescription?: string | null;
  subject?: string | null;
  messages?: HcgZohoConversationMessage[];
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

export type HcgZohoQuestionView = {
  id: string;
  question: string;
  asked: boolean;
  answer: string;
  status: string;
  description: string;
};

export type HcgZohoQuestionColumn = {
  id: string;
  title: string;
  prompt: string;
};

function normalizeEmail(email?: string | null): string {
  return String(email || '').trim().toLowerCase();
}

function emailsIn(value?: string | null): string[] {
  const raw = String(value || '');
  const found = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  const extra = normalizeEmail(raw);
  return [...new Set([...found.map(normalizeEmail), extra].filter((item) => item.includes('@')))];
}

function campaignIdOf(doc: HcgZohoConversationLean): string {
  const top = String(doc.campaignId || '').trim();
  if (top) return top;
  return '';
}

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function htmlToFormattedText(value: string): string {
  return String(value || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function stripQuotedHtml(html: string): string {
  return String(html || '')
    .replace(/<div[^>]*class="[^"]*gmail_quote[^"]*"[\s\S]*$/i, '')
    .replace(/<blockquote[\s\S]*$/i, '')
    .trim();
}

function messageHtml(msg: HcgZohoConversationMessage): string {
  const html = String(msg.html || '').trim();
  if (html) return html;
  const body = String(msg.body || '').trim();
  if (body && looksLikeHtml(body)) return body;
  return '';
}

function messageText(msg: HcgZohoConversationMessage): string {
  const html = messageHtml(msg);
  if (html) return htmlToFormattedText(html);
  const raw = String(msg.body || msg.snippet || '').trim();
  return raw ? htmlToFormattedText(raw) : '';
}

function messageDate(msg: HcgZohoConversationMessage): Date | null {
  const n = Number(msg.internalDate);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Date(n < 1e12 ? n * 1000 : n);
}

function sortedMessages(doc: HcgZohoConversationLean): HcgZohoConversationMessage[] {
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

function docTouchesEmail(doc: HcgZohoConversationLean, email: string): boolean {
  if (emailsIn(doc.emailAddress).includes(email)) return true;
  return (doc.messages || []).some(
    (msg) => emailsIn(msg.to).includes(email) || emailsIn(msg.from).includes(email)
  );
}

function normalizeAiStatus(value?: string | null): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

export function hcgZohoStatus(doc: HcgZohoConversationLean): {
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

export function hcgZohoLastPreview(doc: HcgZohoConversationLean): {
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

export function hcgZohoMessagesToEvents(
  doc: HcgZohoConversationLean,
  candidateName: string
) {
  return sortedMessages(doc).map((msg, index) => {
    const inbound = msg.direction === 'inbound';
    const at = messageDate(msg);
    const html = messageHtml(msg);
    const strippedHtml = inbound ? stripQuotedHtml(html) : html;
    const text = strippedHtml ? htmlToFormattedText(strippedHtml) : messageText(msg);
    return {
      id: msg.messageId || `hcg-zoho-${index}`,
      channel: 'Email',
      author: inbound ? 'candidate' : 'recruiter',
      authorName: inbound ? candidateName : String(msg.from || 'Recruiter'),
      subject: msg.subject || undefined,
      text,
      html: strippedHtml || undefined,
      time: relativeTime(at),
      delivery: inbound ? undefined : 'Sent',
      error: undefined,
      attachments: [],
      voiceSummary: undefined,
      sentAt: at?.toISOString(),
      direction: inbound ? ('inbound' as const) : ('outbound' as const),
      messageType: 'message',
      provider: 'zoho-mail',
      deliveryStatus: 'sent',
      aiGenerated: false,
    };
  });
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

const HCG_SEQUENCE_STOP_STATUSES = new Set([
  'qualified',
  'not_qualified',
  'not_interested',
  'shortlisted',
  'rejected',
]);

export function hcgZohoShouldStopSequence(
  doc: HcgZohoConversationLean | HcgZohoConversationDocument | null | undefined
): boolean {
  if (!doc) return false;
  const lean = doc as HcgZohoConversationLean;
  const status = normalizeAiStatus(lean.overallAIStatus);
  if (HCG_SEQUENCE_STOP_STATUSES.has(status)) return true;
  const mailbox = normalizeEmail(lean.emailAddress);
  const messages = lean.messages || [];
  if (messages.some((msg) => msg.direction === 'inbound')) return true;
  return messages.some((msg) => {
    const from = emailsIn(msg.from);
    return from.length > 0 && mailbox && !from.includes(mailbox);
  });
}

export async function findHcgZohoConversation(
  campaignId: string | null | undefined,
  email: string | null | undefined
): Promise<HcgZohoConversationDocument | null> {
  const cid = String(campaignId || '').trim();
  const em = normalizeEmail(email);
  if (!cid || !em) return null;
  const docs = (await HcgZohoConversationModel.find(
    campaignIdQuery([cid])
  ).lean()) as HcgZohoConversationLean[];
  const match = docs.find((doc) => campaignIdOf(doc) === cid && docTouchesEmail(doc, em));
  return (match as HcgZohoConversationDocument) || null;
}

export function hcgZohoThreadIdOf(
  doc: HcgZohoConversationDocument | HcgZohoConversationLean | null | undefined
): string | null {
  const id = String(
    (doc as { providerThreadId?: string; threadId?: string } | null)?.providerThreadId ||
      (doc as { threadId?: string } | null)?.threadId ||
      ''
  ).trim();
  return id || null;
}

export async function overlayHcgZohoOnListItems(
  items: Array<{
    campaignId?: string;
    email?: string | null;
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

  const docs = (await HcgZohoConversationModel.find(
    campaignIdQuery(campaignIds)
  ).lean()) as HcgZohoConversationLean[];
  if (docs.length === 0) return;

  for (const item of items) {
    const email = normalizeEmail(item.email);
    const campaignId = String(item.campaignId || '').trim();
    if (!email || !campaignId) continue;
    const doc = docs.find(
      (row) => campaignIdOf(row) === campaignId && docTouchesEmail(row, email)
    );
    if (!doc) continue;
    const preview = hcgZohoLastPreview(doc);
    if (preview.lastMessage) item.lastMessage = preview.lastMessage;
    if (preview.lastTime !== '—') item.lastTime = preview.lastTime;
    const status = hcgZohoStatus(doc);
    item.replyStatus = status.replyStatus;
    item.pipelineStatus = status.pipelineStatus;
    const description = String(doc.overallAIDescription || '').trim();
    if (description) item.overallAIDescription = description;
  }
}

function mapHcgZohoQuestions(
  questions?: HcgZohoConversationLean['questions']
): HcgZohoQuestionView[] {
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

function collectHcgZohoQuestionColumns(
  docs: HcgZohoConversationLean[]
): HcgZohoQuestionColumn[] {
  const seen = new Map<string, HcgZohoQuestionColumn>();
  for (const doc of docs) {
    for (const question of mapHcgZohoQuestions(doc.questions)) {
      const id = question.id || question.question;
      if (!id || seen.has(id)) continue;
      const title = question.question || question.id;
      seen.set(id, { id, title, prompt: question.question || title });
    }
  }
  return [...seen.values()];
}

export async function overlayHcgZohoOverallAiStatus(
  campaignId: string,
  items: Array<{
    email?: string | null;
    overallAIStatus?: string | null;
    overallAIDescription?: string | null;
    gmailQuestions?: HcgZohoQuestionView[];
  }>
): Promise<HcgZohoQuestionColumn[]> {
  const cid = String(campaignId || '').trim();
  if (!cid) return [];
  const docs = (await HcgZohoConversationModel.find(
    campaignIdQuery([cid])
  ).lean()) as HcgZohoConversationLean[];
  if (docs.length === 0) return [];

  for (const item of items) {
    const email = normalizeEmail(item.email);
    if (!email) continue;
    const doc = docs.find(
      (row) => campaignIdOf(row) === cid && docTouchesEmail(row, email)
    );
    if (!doc) continue;
    const label = formatHcgOverallAiStatus(doc.overallAIStatus);
    if (label) item.overallAIStatus = label;
    const description = String(doc.overallAIDescription || '').trim();
    item.overallAIDescription = description || null;
    item.gmailQuestions = mapHcgZohoQuestions(doc.questions);
  }
  return collectHcgZohoQuestionColumns(docs);
}

export async function countHcgZohoOverviewStats(campaignId: string): Promise<{
  replies: number;
  interested: number;
  qualified: number;
}> {
  const cid = String(campaignId || '').trim();
  if (!cid) return { replies: 0, interested: 0, qualified: 0 };
  const docs = (await HcgZohoConversationModel.find(
    campaignIdQuery([cid])
  ).lean()) as HcgZohoConversationLean[];

  const interestedStatuses = new Set([
    'interested',
    'in_qualification',
    'qualified',
    'not_qualified',
    'in_screening',
    'shortlisted',
  ]);
  const qualifiedStatuses = new Set(['qualified', 'shortlisted']);
  const awaiting = new Set(['', 'awaiting_reply']);

  let replies = 0;
  let interested = 0;
  let qualified = 0;
  for (const doc of docs) {
    if (campaignIdOf(doc) && campaignIdOf(doc) !== cid) continue;
    const status = normalizeAiStatus(doc.overallAIStatus);
    const replied =
      (status && !awaiting.has(status)) ||
      (doc.messages || []).some((msg) => msg.direction === 'inbound');
    if (replied) replies += 1;
    if (interestedStatuses.has(status)) interested += 1;
    if (qualifiedStatuses.has(status)) qualified += 1;
  }
  return { replies, interested, qualified };
}
