import type { Request } from 'express';

import { getLogger } from '../../config/logger.js';
import { getHuntloWhatsAppCredentials } from '../../providers/meta-whatsapp/meta.config.js';
import {
  downloadMetaWhatsAppMedia,
  saveWhatsAppInboundMediaFile,
} from '../../providers/meta-whatsapp/meta.media.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { UserIntegrationModel } from '../integrations/user-integration.model.js';
import { OutreachEnrollmentModel } from '../outreach/enrollment.model.js';
import {
  ingestInboundMessage,
  updateDeliveryStatus,
  type NormalizedInboundAttachment,
  type NormalizedInboundMessage,
} from './inbound-sync.service.js';
import { ConversationMessageModel } from './conversation-message.model.js';
import { ConversationThreadModel } from './conversation-thread.model.js';
import type { MessageProvider } from './conversation-message.model.js';
import {
  WEBHOOK_ROUTE_ENV_HEADER,
} from '../webhooks/webhook-route-env.js';
import { shouldProcessWhatsAppInboundForThisEnv } from '../webhooks/whatsapp-outbound-route.service.js';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function webhookIdempotencyKey(provider: string, rawId: string): string {
  return `${provider}:${rawId}`;
}

function phoneDigits(value: string | null | undefined): string {
  return String(value || '').replace(/\D/g, '');
}

function phonesMatch(a: string, b: string): boolean {
  if (!a || !b || a.length < 8 || b.length < 8) return false;
  return a.endsWith(b) || b.endsWith(a);
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extractMetaMediaFields(m: Record<string, unknown>): {
  bodyText: string;
  attachments: NormalizedInboundAttachment[];
} {
  const type = String(m.type || '').toLowerCase();
  const textBody = String(asRecord(m.text).body || '').trim();
  const buttonText = String(asRecord(m.button).text || '').trim();
  const interactiveTitle = String(
    asRecord(m.interactive).button_reply
      ? asRecord(asRecord(m.interactive).button_reply).title
      : asRecord(m.interactive).list_reply
        ? asRecord(asRecord(m.interactive).list_reply).title
        : ''
  ).trim();

  if (type === 'image' || asRecord(m.image).id) {
    const image = asRecord(m.image);
    const caption = String(image.caption || '').trim();
    const mediaId = String(image.id || '').trim();
    return {
      bodyText: caption || textBody || '[Image]',
      attachments: mediaId
        ? [
            {
              kind: 'image',
              name: caption || 'image',
              mediaId,
              mimeType: String(image.mime_type || 'image/jpeg'),
              caption: caption || null,
            },
          ]
        : [],
    };
  }

  if (type === 'audio' || asRecord(m.audio).id) {
    const audio = asRecord(m.audio);
    const mediaId = String(audio.id || '').trim();
    return {
      bodyText: textBody || '[Audio]',
      attachments: mediaId
        ? [
            {
              kind: 'audio',
              name: 'voice-note',
              mediaId,
              mimeType: String(audio.mime_type || 'audio/ogg'),
            },
          ]
        : [],
    };
  }

  if (type === 'document' || asRecord(m.document).id) {
    const document = asRecord(m.document);
    const mediaId = String(document.id || '').trim();
    const fileName = String(document.filename || document.file_name || 'document').trim();
    const caption = String(document.caption || '').trim();
    return {
      bodyText: caption || textBody || `[Document: ${fileName}]`,
      attachments: mediaId
        ? [
            {
              kind: 'document',
              name: fileName || 'document',
              mediaId,
              mimeType: String(document.mime_type || 'application/octet-stream'),
              caption: caption || null,
            },
          ]
        : [],
    };
  }

  if (type === 'video' || asRecord(m.video).id) {
    const video = asRecord(m.video);
    const mediaId = String(video.id || '').trim();
    const caption = String(video.caption || '').trim();
    return {
      bodyText: caption || textBody || '[Video]',
      attachments: mediaId
        ? [
            {
              kind: 'video',
              name: caption || 'video',
              mediaId,
              mimeType: String(video.mime_type || 'video/mp4'),
              caption: caption || null,
            },
          ]
        : [],
    };
  }

  return {
    bodyText: textBody || buttonText || interactiveTitle || '[whatsapp message]',
    attachments: [],
  };
}

async function resolveMetaAccessTokenForOrg(input: {
  organizationId: string;
  phoneNumberId?: string | null;
}): Promise<string | null> {
  const phoneNumberId = String(input.phoneNumberId || '').trim();
  const huntlo = getHuntloWhatsAppCredentials();
  if (huntlo?.accessToken && (!phoneNumberId || huntlo.phoneNumberId === phoneNumberId)) {
    return huntlo.accessToken;
  }

  const { decryptSecret } = await import('../integrations/credentials.js');
  const integration = await UserIntegrationModel.findOne({
    organizationId: input.organizationId,
    provider: { $in: ['meta-whatsapp', 'huntlo-whatsapp'] },
    status: { $in: ['connected', 'needs_attention'] },
    ...(phoneNumberId
      ? {
          $or: [
            { 'config.metaPhoneNumberId': phoneNumberId },
            { 'config.phoneNumberId': phoneNumberId },
          ],
        }
      : {}),
  })
    .select('encryptedAccessToken provider')
    .sort({ updatedAt: -1 })
    .lean();

  if (integration) {
    if (String(integration.provider) === 'huntlo-whatsapp' && huntlo?.accessToken) {
      return huntlo.accessToken;
    }
    const token = decryptSecret(
      (integration as { encryptedAccessToken?: Parameters<typeof decryptSecret>[0] })
        .encryptedAccessToken
    );
    if (token) return token;
  }

  return huntlo?.accessToken || null;
}

export async function hydrateInboundWhatsAppMedia(input: {
  organizationId: string;
  messageId: string;
  phoneNumberId?: string | null;
  attachments: NormalizedInboundAttachment[];
}): Promise<
  Array<{
    name: string;
    url: string | null;
    size: string | null;
    mimeType: string | null;
    kind: string | null;
    storageKey: string | null;
    mediaId: string | null;
  }>
> {
  if (!input.attachments.length) return [];
  const accessToken = await resolveMetaAccessTokenForOrg({
    organizationId: input.organizationId,
    phoneNumberId: input.phoneNumberId,
  });
  if (!accessToken) {
    return input.attachments.map((a) => ({
      name: a.name,
      url: null,
      size: a.size || null,
      mimeType: a.mimeType || null,
      kind: a.kind,
      storageKey: null,
      mediaId: a.mediaId || null,
    }));
  }

  const out: Array<{
    name: string;
    url: string | null;
    size: string | null;
    mimeType: string | null;
    kind: string | null;
    storageKey: string | null;
    mediaId: string | null;
  }> = [];

  for (let index = 0; index < input.attachments.length; index += 1) {
    const attachment = input.attachments[index]!;
    const mediaId = String(attachment.mediaId || '').trim();
    if (!mediaId) {
      out.push({
        name: attachment.name,
        url: null,
        size: attachment.size || null,
        mimeType: attachment.mimeType || null,
        kind: attachment.kind,
        storageKey: null,
        mediaId: null,
      });
      continue;
    }
    try {
      const downloaded = await downloadMetaWhatsAppMedia({ mediaId, accessToken });
      const saved = await saveWhatsAppInboundMediaFile({
        organizationId: input.organizationId,
        messageId: input.messageId,
        index,
        buffer: downloaded.buffer,
        mimeType: downloaded.mimeType || attachment.mimeType || 'application/octet-stream',
        fileName: attachment.name,
      });
      out.push({
        name: attachment.name,
        url: `/conversations/messages/${input.messageId}/attachments/${index}`,
        size: formatBytes(downloaded.fileSize),
        mimeType: downloaded.mimeType || attachment.mimeType || null,
        kind: attachment.kind,
        storageKey: saved.relativeKey,
        mediaId,
      });
    } catch (error) {
      getLogger()
        .child({ component: 'whatsapp-inbound-media' })
        .warn(
          { err: error, mediaId, messageId: input.messageId },
          'Failed to download inbound WhatsApp media'
        );
      out.push({
        name: attachment.name,
        url: null,
        size: attachment.size || null,
        mimeType: attachment.mimeType || null,
        kind: attachment.kind,
        storageKey: null,
        mediaId,
      });
    }
  }
  return out;
}

/**
 * Parse Meta WhatsApp Cloud API webhook payloads into normalized inbound messages.
 */
export function parseMetaWhatsAppWebhook(payload: unknown): {
  messages: NormalizedInboundMessage[];
  statuses: Array<{
    providerMessageId: string;
    deliveryStatus: 'sent' | 'delivered' | 'read' | 'failed';
  }>;
} {
  const body = asRecord(payload);
  const entries = Array.isArray(body.entry) ? body.entry : [];
  const messages: NormalizedInboundMessage[] = [];
  const statuses: Array<{
    providerMessageId: string;
    deliveryStatus: 'sent' | 'delivered' | 'read' | 'failed';
  }> = [];

  for (const entry of entries) {
    const changes = Array.isArray(asRecord(entry).changes)
      ? (asRecord(entry).changes as unknown[])
      : [];
    for (const change of changes) {
      const value = asRecord(asRecord(change).value);
      const metadata = asRecord(value.metadata);
      // Business WhatsApp line that received the inbound — used for org lookup.
      const phoneNumberId = String(
        metadata.phone_number_id || value.phone_number_id || ''
      ).trim();
      const displayPhone = String(metadata.display_phone_number || '').trim();
      const orgHint = String(value.organizationId || '');
      const inbound = Array.isArray(value.messages) ? value.messages : [];
      for (const msg of inbound) {
        const m = asRecord(msg);
        const extracted = extractMetaMediaFields(m);
        const id = String(m.id || '');
        if (!id) continue;
        const contextId = String(asRecord(m.context).id || '').trim() || null;
        messages.push({
          organizationId: orgHint,
          provider: 'meta-whatsapp',
          channel: 'whatsapp',
          providerMessageId: webhookIdempotencyKey('meta-whatsapp', id),
          providerThreadId: String(m.from || ''),
          contextProviderMessageId: contextId,
          from: String(m.from || ''),
          to: phoneNumberId || displayPhone || null,
          bodyText: extracted.bodyText,
          attachments: extracted.attachments,
          receivedAt: m.timestamp
            ? new Date(Number(m.timestamp) * 1000)
            : new Date(),
        });
      }
      const statusRows = Array.isArray(value.statuses) ? value.statuses : [];
      for (const row of statusRows) {
        const s = asRecord(row);
        const id = String(s.id || '');
        const status = String(s.status || '');
        if (!id) continue;
        const mapped =
          status === 'read'
            ? 'read'
            : status === 'delivered'
              ? 'delivered'
              : status === 'failed'
                ? 'failed'
                : 'sent';
        statuses.push({
          providerMessageId: webhookIdempotencyKey('meta-whatsapp', id),
          deliveryStatus: mapped,
        });
      }
    }
  }
  return { messages, statuses };
}

export function parseGupshupWebhook(payload: unknown): {
  messages: NormalizedInboundMessage[];
  statuses: Array<{
    providerMessageId: string;
    deliveryStatus: 'sent' | 'delivered' | 'read' | 'failed';
  }>;
} {
  const body = asRecord(payload);
  const payloadType = String(body.type || body.eventType || '');
  const messages: NormalizedInboundMessage[] = [];
  const statuses: Array<{
    providerMessageId: string;
    deliveryStatus: 'sent' | 'delivered' | 'read' | 'failed';
  }> = [];

  if (payloadType.toLowerCase().includes('message') || body.text || body.message) {
    const id = String(body.messageId || body.id || body.gsId || '');
    const from = String(body.mobile || body.from || body.source || '');
    const text = String(
      body.text || asRecord(body.payload).text || asRecord(body.message).text || ''
    );
    if (id && from) {
      messages.push({
        organizationId: String(body.organizationId || ''),
        provider: 'gupshup',
        channel: 'whatsapp',
        providerMessageId: webhookIdempotencyKey('gupshup', id),
        providerThreadId: from,
        from,
        bodyText: text || '[whatsapp message]',
        receivedAt: new Date(),
      });
    }
  }

  if (body.status || body.eventType) {
    const id = String(body.messageId || body.id || '');
    const status = String(body.status || body.eventType || '').toLowerCase();
    if (id) {
      statuses.push({
        providerMessageId: webhookIdempotencyKey('gupshup', id),
        deliveryStatus: status.includes('read')
          ? 'read'
          : status.includes('deliver')
            ? 'delivered'
            : status.includes('fail')
              ? 'failed'
              : 'sent',
      });
    }
  }

  return { messages, statuses };
}

/** Email provider webhook / poll item shape. */
export type EmailReplyItem = {
  organizationId: string;
  provider: Extract<MessageProvider, 'gmail' | 'outlook' | 'zoho-mail' | 'smtp' | 'imap'>;
  providerMessageId: string;
  providerThreadId?: string | null;
  from: string;
  to?: string | null;
  subject?: string | null;
  bodyText: string;
  bodyHtml?: string | null;
  receivedAt?: Date;
};

export function normalizeEmailReply(item: EmailReplyItem): NormalizedInboundMessage {
  const fromEmail = (() => {
    const raw = String(item.from || '').trim();
    const angle = raw.match(/<([^>]+)>/);
    const candidate = (angle?.[1] || raw).trim();
    const match = candidate.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
    return match?.[0] || candidate;
  })();
  return {
    organizationId: item.organizationId,
    provider: item.provider,
    channel: 'email',
    providerMessageId: webhookIdempotencyKey(item.provider, item.providerMessageId),
    providerThreadId: item.providerThreadId || null,
    from: fromEmail || item.from,
    to: item.to || null,
    subject: item.subject || null,
    bodyText: item.bodyText,
    bodyHtml: item.bodyHtml || null,
    receivedAt: item.receivedAt || new Date(),
  };
}

/**
 * Resolve org from the business WhatsApp line (Meta phone_number_id).
 * Only exact integration config matches — never pick a random org's Huntlo WA.
 */
export async function resolveOrganizationForWhatsAppPhone(
  phoneNumberIdOrDisplay: string
): Promise<string | null> {
  const key = String(phoneNumberIdOrDisplay || '').trim();
  if (!key) return null;

  const integration = await UserIntegrationModel.findOne({
    provider: { $in: ['meta-whatsapp', 'gupshup', 'huntlo-whatsapp'] },
    status: { $in: ['connected', 'needs_attention'] },
    $or: [
      { 'config.metaPhoneNumberId': key },
      { 'config.phoneNumberId': key },
      { phone: key },
      { email: key },
    ],
  })
    .select('organizationId')
    .sort({ updatedAt: -1 })
    .lean();
  if (integration) return String(integration.organizationId);

  // Shared Huntlo WA line (env): optional explicit org override for single-tenant.
  const huntlo = getHuntloWhatsAppCredentials();
  if (huntlo?.phoneNumberId && huntlo.phoneNumberId === key) {
    const envOrg = String(process.env.HUNTLO_WHATSAPP_ORGANIZATION_ID || '').trim();
    if (envOrg) return envOrg;
  }

  return null;
}

/**
 * Resolve org from the candidate phone. When the same number exists in multiple
 * orgs, prefer the one with the most recent open WhatsApp / outreach activity.
 */
async function resolveOrganizationBySenderPhone(
  fromPhone: string
): Promise<string | null> {
  const digits = phoneDigits(fromPhone);
  if (digits.length < 8) return null;

  const candidates = await SavedCandidateModel.find({
    deletedAt: null,
    phone: { $ne: null },
  })
    .select('_id organizationId phone')
    .limit(800)
    .lean();

  const matches = candidates.filter((c) =>
    phonesMatch(digits, phoneDigits(String(c.phone || '')))
  );
  if (!matches.length) return null;
  const primary = matches[0]!;
  if (matches.length === 1) return String(primary.organizationId);

  const candidateIds = matches.map((c) => c._id);

  const recentThread = await ConversationThreadModel.findOne({
    candidateId: { $in: candidateIds },
    channels: 'whatsapp',
    status: { $nin: ['closed', 'opted_out'] },
  })
    .select('organizationId')
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .lean();
  if (recentThread) return String(recentThread.organizationId);

  const anyThread = await ConversationThreadModel.findOne({
    candidateId: { $in: candidateIds },
  })
    .select('organizationId')
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .lean();
  if (anyThread) return String(anyThread.organizationId);

  const enrollment = await OutreachEnrollmentModel.findOne({
    candidateId: { $in: candidateIds },
    status: { $in: ['active', 'waiting', 'pending', 'replied', 'stopped'] },
  })
    .select('organizationId')
    .sort({ updatedAt: -1 })
    .lean();
  if (enrollment) return String(enrollment.organizationId);

  return String(primary.organizationId);
}

async function resolveInboundWhatsAppOrganization(message: {
  organizationId?: string | null;
  from?: string | null;
  to?: string | null;
}): Promise<string | null> {
  if (message.organizationId) return String(message.organizationId);

  const huntlo = getHuntloWhatsAppCredentials();
  const toKey = String(message.to || '').trim();
  const isSharedHuntloLine = Boolean(
    huntlo?.phoneNumberId && toKey && huntlo.phoneNumberId === toKey
  );

  // Shared Huntlo Cloud line is used by many orgs — never pick a random
  // huntlo-whatsapp integration. Resolve by sender candidate (or env pin).
  if (isSharedHuntloLine) {
    const envOrg = String(process.env.HUNTLO_WHATSAPP_ORGANIZATION_ID || '').trim();
    if (envOrg) return envOrg;
    if (message.from) {
      const bySender = await resolveOrganizationBySenderPhone(message.from);
      if (bySender) return bySender;
    }
    return null;
  }

  // Customer-owned Meta / Gupshup line: match integration by phone_number_id.
  if (toKey) {
    const byLine = await resolveOrganizationForWhatsAppPhone(toKey);
    if (byLine) return byLine;
  }

  if (message.from) {
    return resolveOrganizationBySenderPhone(message.from);
  }

  return null;
}

export async function handleProviderWebhook(input: {
  provider: MessageProvider;
  organizationId?: string | null;
  payload: unknown;
  req?: Request;
  /** Optional fan-out header override (x-huntlo-webhook-route-env). */
  routeEnvHeader?: string | null;
}): Promise<{ ingested: number; duplicates: number; statuses: number; skippedRoute: number }> {
  let messages: NormalizedInboundMessage[] = [];
  let statuses: Array<{
    providerMessageId: string;
    deliveryStatus: 'sent' | 'delivered' | 'read' | 'failed';
  }> = [];

  if (input.provider === 'meta-whatsapp') {
    const parsed = parseMetaWhatsAppWebhook(input.payload);
    messages = parsed.messages;
    statuses = parsed.statuses;
  } else if (input.provider === 'gupshup') {
    const parsed = parseGupshupWebhook(input.payload);
    messages = parsed.messages;
    statuses = parsed.statuses;
  } else if (
    input.provider === 'gmail' ||
    input.provider === 'outlook' ||
    input.provider === 'zoho-mail' ||
    input.provider === 'smtp' ||
    input.provider === 'imap'
  ) {
    const body = asRecord(input.payload);
    const rows = Array.isArray(body.messages)
      ? body.messages
      : body.providerMessageId
        ? [body]
        : [];
    messages = rows.map((row) => {
      const r = asRecord(row);
      return normalizeEmailReply({
        organizationId: String(
          r.organizationId || input.organizationId || body.organizationId || ''
        ),
        provider: input.provider as EmailReplyItem['provider'],
        providerMessageId: String(r.providerMessageId || r.id || ''),
        providerThreadId: r.providerThreadId ? String(r.providerThreadId) : null,
        from: String(r.from || r.sender || ''),
        to: r.to ? String(r.to) : null,
        subject: r.subject ? String(r.subject) : null,
        bodyText: String(r.bodyText || r.text || r.body || ''),
        bodyHtml: r.bodyHtml ? String(r.bodyHtml) : null,
        receivedAt: r.receivedAt ? new Date(String(r.receivedAt)) : new Date(),
      });
    });
  }

  const headerRouteEnv =
    String(input.routeEnvHeader || '').trim() ||
    (input.req
      ? String(
          input.req.header(WEBHOOK_ROUTE_ENV_HEADER) ||
            input.req.headers[WEBHOOK_ROUTE_ENV_HEADER] ||
            ''
        ).trim()
      : '') ||
    null;

  const logger = getLogger().child({ component: 'provider-sync', provider: input.provider });
  let ingested = 0;
  let duplicates = 0;
  let skippedRoute = 0;
  for (const message of messages) {
    if (message.channel === 'whatsapp' || input.provider === 'meta-whatsapp' || input.provider === 'gupshup') {
      const gate = await shouldProcessWhatsAppInboundForThisEnv({
        fromPhone: message.from,
        contextProviderMessageId: message.contextProviderMessageId,
        headerRouteEnv,
      });
      if (!gate.process) {
        skippedRoute += 1;
        logger.info(
          {
            from: message.from,
            myEnv: gate.myEnv,
            routeEnv: gate.routeEnv,
            reason: gate.reason,
            contextProviderMessageId: message.contextProviderMessageId || null,
            providerMessageId: message.providerMessageId,
          },
          'Skipping inbound WhatsApp — owned by another deploy env'
        );
        continue;
      }
    }

    let organizationId =
      message.organizationId || input.organizationId || '';
    if (!organizationId && (message.channel === 'whatsapp' || input.provider === 'meta-whatsapp' || input.provider === 'gupshup')) {
      organizationId = (await resolveInboundWhatsAppOrganization({
        organizationId: message.organizationId || input.organizationId,
        from: message.from,
        to: message.to,
      })) || '';
    } else if (!organizationId && message.to) {
      organizationId =
        (await resolveOrganizationForWhatsAppPhone(message.to)) || '';
    }
    if (!organizationId && message.from) {
      organizationId = (await resolveOrganizationBySenderPhone(message.from)) || '';
    }
    if (!organizationId || !message.providerMessageId || !message.from) {
      logger.warn(
        {
          from: message.from,
          to: message.to,
          providerMessageId: message.providerMessageId,
          hasOrg: Boolean(organizationId),
        },
        'Skipping inbound WhatsApp — could not resolve organization or sender'
      );
      continue;
    }
    const result = await ingestInboundMessage({
      ...message,
      organizationId,
    });
    if (result.duplicate) {
      duplicates += 1;
      logger.info(
        {
          from: message.from,
          organizationId,
          threadId: result.threadId,
          messageId: result.messageId,
          providerMessageId: message.providerMessageId,
        },
        'Inbound WhatsApp duplicate (already stored)'
      );
    } else if (result.messageId) {
      ingested += 1;
      logger.info(
        {
          from: message.from,
          organizationId,
          threadId: result.threadId,
          messageId: result.messageId,
          providerMessageId: message.providerMessageId,
          bodyPreview: message.bodyText.slice(0, 80),
        },
        'Inbound WhatsApp message stored'
      );
    } else {
      logger.warn(
        {
          from: message.from,
          organizationId,
          providerMessageId: message.providerMessageId,
        },
        'Inbound WhatsApp ingested without message (likely unmatched candidate)'
      );
    }
  }

  let statusUpdates = 0;
  let statusOrganizationId = input.organizationId || '';
  if (!statusOrganizationId && messages[0]) {
    statusOrganizationId =
      (await resolveInboundWhatsAppOrganization({
        from: messages[0].from,
        to: messages[0].to,
      })) || '';
  }
  if (!statusOrganizationId && messages[0]?.to) {
    statusOrganizationId =
      (await resolveOrganizationForWhatsAppPhone(messages[0].to)) || '';
  }
  for (const status of statuses) {
    if (!statusOrganizationId) continue;
    const updated = await updateDeliveryStatus({
      organizationId: statusOrganizationId,
      provider: input.provider,
      providerMessageId: status.providerMessageId,
      deliveryStatus: status.deliveryStatus,
    });
    if (updated) statusUpdates += 1;
  }

  return { ingested, duplicates, statuses: statusUpdates, skippedRoute };
}
