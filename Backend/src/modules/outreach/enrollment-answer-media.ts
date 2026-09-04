import mongoose from 'mongoose';

import { ConversationMessageModel } from '../conversations/conversation-message.model.js';
import { ConversationThreadModel } from '../conversations/conversation-thread.model.js';

export type AnswerMediaMeta = {
  kind: string;
  name: string;
  mimeType: string | null;
  url: string;
  messageId: string;
  attachmentIndex: number;
};

function answerValue(entry: unknown): string {
  if (entry == null) return '';
  if (typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean') {
    return String(entry);
  }
  if (typeof entry === 'object' && entry !== null && 'value' in entry) {
    return String((entry as { value?: unknown }).value ?? '');
  }
  return String(entry);
}

function existingMedia(entry: unknown): AnswerMediaMeta | null {
  if (!entry || typeof entry !== 'object') return null;
  const media = (entry as { media?: Partial<AnswerMediaMeta> }).media;
  if (!media?.url) return null;
  return {
    kind: String(media.kind || 'file'),
    name: String(media.name || 'attachment'),
    mimeType: media.mimeType ? String(media.mimeType) : null,
    url: String(media.url),
    messageId: String(media.messageId || ''),
    attachmentIndex:
      typeof media.attachmentIndex === 'number' && Number.isFinite(media.attachmentIndex)
        ? media.attachmentIndex
        : 0,
  };
}

export function looksLikeMediaAnswer(value: string): boolean {
  const text = String(value || '').trim();
  if (!text) return false;
  return (
    /^\[image\]$/i.test(text) ||
    /^\[audio\]$/i.test(text) ||
    /^\[video\]$/i.test(text) ||
    /^\[document(?::[^\]]*)?\]$/i.test(text)
  );
}

export function attachmentApiUrl(messageId: string, index: number): string {
  return `/conversations/messages/${messageId}/attachments/${index}`;
}

export function buildAnswerMediaFromMessageAttachment(input: {
  messageId: string;
  attachmentIndex: number;
  attachment: {
    name?: string | null;
    url?: string | null;
    mimeType?: string | null;
    kind?: string | null;
  };
}): AnswerMediaMeta {
  const url =
    String(input.attachment.url || '').trim() ||
    attachmentApiUrl(input.messageId, input.attachmentIndex);
  return {
    kind: String(input.attachment.kind || 'file'),
    name: String(input.attachment.name || 'attachment'),
    mimeType: input.attachment.mimeType ? String(input.attachment.mimeType) : null,
    url: url.startsWith('/api/v1/') ? url.slice('/api/v1'.length) : url,
    messageId: input.messageId,
    attachmentIndex: input.attachmentIndex,
  };
}

function withMedia(entry: unknown, media: AnswerMediaMeta): Record<string, unknown> {
  if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
    return {
      ...(entry as Record<string, unknown>),
      value: answerValue(entry),
      media,
    };
  }
  return {
    value: answerValue(entry),
    source: 'candidate',
    media,
  };
}

function enrichAnswerBag(
  answers: Record<string, unknown> | null | undefined,
  pool: Array<{
    messageId: string;
    bodyText: string;
    attachments: Array<{
      name?: string | null;
      url?: string | null;
      mimeType?: string | null;
      kind?: string | null;
    }>;
  }>,
  usedMessageKeys: Set<string>
): Record<string, unknown> {
  const bag = { ...(answers || {}) };
  for (const [key, entry] of Object.entries(bag)) {
    if (existingMedia(entry)) continue;
    const value = answerValue(entry).trim();
    if (!looksLikeMediaAnswer(value)) continue;

    const match =
      pool.find((msg) => {
        const msgKey = `${msg.messageId}:0`;
        if (usedMessageKeys.has(msgKey)) return false;
        const body = String(msg.bodyText || '').trim();
        return body === value || looksLikeMediaAnswer(body);
      }) ||
      pool.find((msg) => !usedMessageKeys.has(`${msg.messageId}:0`));

    if (!match?.attachments?.length) continue;
    const attachment = match.attachments[0]!;
    const msgKey = `${match.messageId}:0`;
    usedMessageKeys.add(msgKey);
    bag[key] = withMedia(
      entry,
      buildAnswerMediaFromMessageAttachment({
        messageId: match.messageId,
        attachmentIndex: 0,
        attachment,
      })
    );
  }
  return bag;
}

/**
 * Attach WhatsApp inbound media URLs onto enrollment answer bags for report UI.
 * Response-only enrichment — does not persist.
 */
export async function enrichEnrollmentRowsWithAnswerMedia<T extends {
  _id: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  qualificationState?: {
    answers?: Record<string, unknown>;
    [key: string]: unknown;
  } | null;
  hiringFlowState?: {
    answers?: Record<string, unknown>;
    [key: string]: unknown;
  } | null;
}>(input: {
  organizationId: string;
  campaignId: string;
  rows: T[];
}): Promise<T[]> {
  if (input.rows.length === 0) return input.rows;

  const enrollmentIds = input.rows.map((r) => r._id);
  const candidateIds = input.rows.map((r) => r.candidateId);
  const orgOid = new mongoose.Types.ObjectId(input.organizationId);
  const campaignOid = new mongoose.Types.ObjectId(input.campaignId);

  const threads = await ConversationThreadModel.find({
    organizationId: orgOid,
    $or: [
      { enrollmentId: { $in: enrollmentIds } },
      { campaignId: campaignOid, candidateId: { $in: candidateIds } },
    ],
  })
    .select('_id enrollmentId candidateId')
    .lean();

  if (threads.length === 0) return input.rows;

  const threadIds = threads.map((t) => t._id);
  const messages = await ConversationMessageModel.find({
    organizationId: orgOid,
    threadId: { $in: threadIds },
    direction: 'inbound',
    'attachments.0': { $exists: true },
  })
    .select('_id threadId bodyText attachments receivedAt createdAt')
    .sort({ receivedAt: 1, createdAt: 1 })
    .lean();

  if (messages.length === 0) return input.rows;

  const threadToEnrollment = new Map<string, string>();
  const candidateToEnrollment = new Map<string, string>();
  for (const row of input.rows) {
    candidateToEnrollment.set(String(row.candidateId), String(row._id));
  }
  for (const thread of threads) {
    const enrollmentId = thread.enrollmentId
      ? String(thread.enrollmentId)
      : candidateToEnrollment.get(String(thread.candidateId));
    if (enrollmentId) {
      threadToEnrollment.set(String(thread._id), enrollmentId);
    }
  }

  const mediaByEnrollment = new Map<
    string,
    Array<{
      messageId: string;
      bodyText: string;
      attachments: Array<{
        name?: string | null;
        url?: string | null;
        mimeType?: string | null;
        kind?: string | null;
      }>;
    }>
  >();

  for (const msg of messages) {
    const enrollmentId = threadToEnrollment.get(String(msg.threadId));
    if (!enrollmentId) continue;
    const list = mediaByEnrollment.get(enrollmentId) || [];
    list.push({
      messageId: String(msg._id),
      bodyText: String(msg.bodyText || ''),
      attachments: (msg.attachments || []).map((a) => ({
        name: a.name,
        url: a.url,
        mimeType: a.mimeType,
        kind: a.kind,
      })),
    });
    mediaByEnrollment.set(enrollmentId, list);
  }

  return input.rows.map((row) => {
    const pool = mediaByEnrollment.get(String(row._id)) || [];
    if (pool.length === 0) return row;
    const used = new Set<string>();
    const qualificationState = row.qualificationState
      ? {
          ...row.qualificationState,
          answers: enrichAnswerBag(row.qualificationState.answers, pool, used),
        }
      : row.qualificationState;
    const hiringFlowState = row.hiringFlowState
      ? {
          ...row.hiringFlowState,
          answers: enrichAnswerBag(row.hiringFlowState.answers, pool, used),
        }
      : row.hiringFlowState;
    return {
      ...row,
      qualificationState,
      hiringFlowState,
    };
  });
}
