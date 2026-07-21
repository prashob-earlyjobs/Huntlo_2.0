import type { WebhookProvider } from './webhook-event.model.js';
import { hashWebhookRawBody } from './webhook-event.model.js';

export function extractEventMeta(input: {
  provider: WebhookProvider;
  body: Record<string, unknown>;
  rawBody: Buffer;
  query?: Record<string, unknown>;
  headers?: Record<string, string | string[] | undefined>;
}): { providerEventId: string; eventType: string } {
  const hash = hashWebhookRawBody(input.rawBody);
  const shortHash = hash.slice(0, 24);

  switch (input.provider) {
    case 'meta': {
      const entry = Array.isArray(input.body.entry) ? input.body.entry[0] : null;
      const changes =
        entry && typeof entry === 'object' && Array.isArray((entry as { changes?: unknown }).changes)
          ? (entry as { changes: Array<{ field?: string; value?: { messages?: Array<{ id?: string }> } }> }).changes
          : [];
      const messageId = changes[0]?.value?.messages?.[0]?.id;
      const eventType = String(changes[0]?.field || input.body.object || 'meta.event');
      return {
        providerEventId: String(messageId || `${eventType}:${shortHash}`),
        eventType,
      };
    }
    case 'gupshup': {
      const payload =
        input.body.payload && typeof input.body.payload === 'object'
          ? (input.body.payload as Record<string, unknown>)
          : input.body;
      const id = String(
        payload.id || payload.messageId || input.body.gsId || `gupshup:${shortHash}`
      );
      return {
        providerEventId: id,
        eventType: String(input.body.type || payload.type || 'gupshup.message'),
      };
    }
    case 'hunar': {
      const kind = String(input.query?.kind || input.body.kind || 'call-status');
      const callId = String(
        input.body.call_id ||
          input.body.callId ||
          (input.body.data as { call_id?: string } | undefined)?.call_id ||
          shortHash
      );
      return {
        providerEventId: `hunar:${kind}:${callId}`,
        eventType: kind,
      };
    }
    case 'calendly': {
      const payload =
        input.body.payload && typeof input.body.payload === 'object'
          ? (input.body.payload as Record<string, unknown>)
          : input.body;
      const eventUri = String(
        (payload.scheduled_event as { uri?: string } | undefined)?.uri ||
          payload.event ||
          ''
      );
      const inviteeUri = String(
        (payload.invitee as { uri?: string } | undefined)?.uri || payload.invitee || ''
      );
      const created = String(payload.created_at || '');
      return {
        providerEventId: `${inviteeUri || 'invitee'}:${eventUri || shortHash}:${created || shortHash}`,
        eventType: String(input.body.event || payload.event || 'calendly.invitee'),
      };
    }
    case 'razorpay': {
      const eventName = String(input.body.event || 'razorpay.event');
      const payload =
        input.body.payload && typeof input.body.payload === 'object'
          ? (input.body.payload as Record<string, unknown>)
          : {};
      const payment = (
        payload.payment && typeof payload.payment === 'object'
          ? (payload.payment as { entity?: { id?: string } }).entity
          : null
      ) as { id?: string } | null;
      const refund = (
        payload.refund && typeof payload.refund === 'object'
          ? (payload.refund as { entity?: { id?: string } }).entity
          : null
      ) as { id?: string } | null;
      return {
        providerEventId: String(
          input.body.id || `${eventName}:${payment?.id || refund?.id || shortHash}`
        ),
        eventType: eventName,
      };
    }
    case 'dodo': {
      const type = String(input.body.type || 'dodo.event');
      const headers = input.headers || {};
      const webhookId = Array.isArray(headers['webhook-id'])
        ? headers['webhook-id'][0]
        : headers['webhook-id'];
      return {
        providerEventId: String(
          webhookId || input.body.webhook_id || input.body.id || `${type}:${shortHash}`
        ),
        eventType: type,
      };
    }
    case 'gmail': {
      const message =
        input.body.message && typeof input.body.message === 'object'
          ? (input.body.message as { messageId?: string; message_id?: string })
          : null;
      const messageId = String(message?.messageId || message?.message_id || shortHash);
      return {
        providerEventId: `gmail-push:${messageId}`,
        eventType: 'gmail.mailbox.change',
      };
    }
    default:
      return { providerEventId: shortHash, eventType: 'unknown' };
  }
}
