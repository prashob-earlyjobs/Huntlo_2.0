/**
 * Microsoft Graph change-notification ingress.
 * Mounted at both /api/v1/webhooks/outlook and /api/v1/public/webhooks/outlook.
 * Graph's handshake is a POST with ?validationToken= and an empty body; the
 * response must be that token as text/plain or subscription create is rejected.
 */

import type { Request, Response } from 'express';

import { handleProviderWebhook } from '../conversations/provider-sync.js';

function validationTokenFromQuery(value: unknown): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return String(raw || '').trim();
}

function notificationValue(req: Request): unknown {
  const body = req.body;
  if (body && typeof body === 'object' && !Buffer.isBuffer(body)) {
    return (body as { value?: unknown }).value;
  }
  const raw = req.rawBody;
  if (!raw || raw.length === 0) return undefined;
  try {
    const parsed = JSON.parse(raw.toString('utf8')) as { value?: unknown };
    return parsed.value;
  } catch {
    return undefined;
  }
}

export async function handleOutlookWebhook(req: Request, res: Response): Promise<void> {
  const validationToken = validationTokenFromQuery(req.query.validationToken);
  if (validationToken) {
    console.log('[outlook] Graph validation handshake', {
      path: req.originalUrl,
      tokenLength: validationToken.length,
    });
    res.status(200).type('text/plain').send(validationToken);
    return;
  }

  const notes = notificationValue(req);
  if (Array.isArray(notes)) {
    console.log('[outlook] Graph notification received', {
      path: req.originalUrl,
      count: notes.length,
      subscriptionIds: notes
        .map((item) => String((item as { subscriptionId?: string } | null)?.subscriptionId || '').trim())
        .filter(Boolean),
    });
    res.status(202).json({ success: true });
    const { acceptOutlookGraphNotifications } = await import(
      './outlook-subscription.service.js'
    );
    void acceptOutlookGraphNotifications(notes).catch(() => undefined);
    return;
  }

  const organizationId =
    (req.headers['x-organization-id'] as string | undefined) ||
    (req.query.organizationId as string | undefined) ||
    null;
  const result = await handleProviderWebhook({
    provider: 'outlook',
    organizationId,
    payload: req.body,
    req,
  });
  res.status(200).json({ success: true, data: result });
}
