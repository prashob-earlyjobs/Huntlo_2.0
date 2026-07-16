/**
 * Dodo webhook verify — ported from EJHunterLanding dodoWebhookService.js.
 * Uses standardwebhooks with webhook-id / webhook-signature / webhook-timestamp.
 */

import { Webhook } from 'standardwebhooks';

import { getDodoConfig } from './dodo.client.js';

export function verifyAndParseDodoWebhook(
  rawBody: Buffer | string,
  headers: Record<string, string | string[] | undefined>
): Record<string, unknown> {
  const { webhookSecret } = getDodoConfig();
  if (!webhookSecret) {
    throw Object.assign(new Error('Dodo webhook secret is not configured'), {
      code: 'DODO_WEBHOOK_NOT_CONFIGURED',
      statusCode: 503,
    });
  }

  const webhookId = headers['webhook-id'] || headers['Webhook-Id'];
  const signature = headers['webhook-signature'] || headers['Webhook-Signature'];
  const timestamp = headers['webhook-timestamp'] || headers['Webhook-Timestamp'];

  if (!webhookId || !signature || !timestamp) {
    throw Object.assign(new Error('Missing webhook signature headers'), {
      code: 'INVALID_WEBHOOK_HEADERS',
      statusCode: 400,
    });
  }

  const wh = new Webhook(webhookSecret);
  const payloadStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody || '');
  wh.verify(payloadStr, {
    'webhook-id': String(webhookId),
    'webhook-signature': String(signature),
    'webhook-timestamp': String(timestamp),
  });

  return JSON.parse(payloadStr) as Record<string, unknown>;
}
