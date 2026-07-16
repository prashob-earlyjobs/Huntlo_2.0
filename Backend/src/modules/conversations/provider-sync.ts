import type { Request } from 'express';

import { UserIntegrationModel } from '../integrations/user-integration.model.js';
import {
  ingestInboundMessage,
  updateDeliveryStatus,
  type NormalizedInboundMessage,
} from './inbound-sync.service.js';
import type { MessageProvider } from './conversation-message.model.js';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function webhookIdempotencyKey(provider: string, rawId: string): string {
  return `${provider}:${rawId}`;
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
      const orgHint = String(value.organizationId || '');
      const inbound = Array.isArray(value.messages) ? value.messages : [];
      for (const msg of inbound) {
        const m = asRecord(msg);
        const text =
          String(asRecord(m.text).body || '') ||
          String(asRecord(m.button).text || '') ||
          String(asRecord(m.interactive).button_reply
            ? asRecord(asRecord(m.interactive).button_reply).title
            : '') ||
          '[whatsapp message]';
        const id = String(m.id || '');
        if (!id) continue;
        messages.push({
          organizationId: orgHint,
          provider: 'meta-whatsapp',
          channel: 'whatsapp',
          providerMessageId: webhookIdempotencyKey('meta-whatsapp', id),
          providerThreadId: String(m.from || ''),
          from: String(m.from || ''),
          to: null,
          bodyText: text,
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
  return {
    organizationId: item.organizationId,
    provider: item.provider,
    channel: 'email',
    providerMessageId: webhookIdempotencyKey(item.provider, item.providerMessageId),
    providerThreadId: item.providerThreadId || null,
    from: item.from,
    to: item.to || null,
    subject: item.subject || null,
    bodyText: item.bodyText,
    bodyHtml: item.bodyHtml || null,
    receivedAt: item.receivedAt || new Date(),
  };
}

export async function resolveOrganizationForWhatsAppPhone(
  phoneNumberIdOrDisplay: string
): Promise<string | null> {
  const integration = await UserIntegrationModel.findOne({
    provider: { $in: ['meta-whatsapp', 'gupshup', 'huntlo-whatsapp'] },
    status: { $in: ['connected', 'needs_attention'] },
    $or: [
      { 'config.metaPhoneNumberId': phoneNumberIdOrDisplay },
      { phone: phoneNumberIdOrDisplay },
      { email: phoneNumberIdOrDisplay },
    ],
  })
    .select('organizationId')
    .lean();
  return integration ? String(integration.organizationId) : null;
}

export async function handleProviderWebhook(input: {
  provider: MessageProvider;
  organizationId?: string | null;
  payload: unknown;
  req?: Request;
}): Promise<{ ingested: number; duplicates: number; statuses: number }> {
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

  let ingested = 0;
  let duplicates = 0;
  for (const message of messages) {
    let organizationId = message.organizationId || input.organizationId || '';
    if (!organizationId && message.from) {
      organizationId =
        (await resolveOrganizationForWhatsAppPhone(message.from)) || '';
    }
    if (!organizationId || !message.providerMessageId || !message.from) continue;
    const result = await ingestInboundMessage({
      ...message,
      organizationId,
    });
    if (result.duplicate) duplicates += 1;
    else if (result.messageId) ingested += 1;
  }

  let statusUpdates = 0;
  for (const status of statuses) {
    const organizationId = input.organizationId;
    if (!organizationId) continue;
    const updated = await updateDeliveryStatus({
      organizationId,
      provider: input.provider,
      providerMessageId: status.providerMessageId,
      deliveryStatus: status.deliveryStatus,
    });
    if (updated) statusUpdates += 1;
  }

  return { ingested, duplicates, statuses: statusUpdates };
}
