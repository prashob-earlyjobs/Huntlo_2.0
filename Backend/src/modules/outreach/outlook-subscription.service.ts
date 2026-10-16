/**
 * Create an Outlook inbox subscription when a mailbox connects, and renew it
 * from the email reply sync job before Graph expires it.
 */

import { randomBytes, timingSafeEqual } from 'node:crypto';

import { getLogger } from '../../config/logger.js';
import { UserIntegrationModel } from '../integrations/user-integration.model.js';
import { integrationsService } from '../integrations/integration.service.js';
import {
  createOutlookMailSubscription,
  deleteOutlookMailSubscription,
  isOutlookPushConfigured,
  renewOutlookMailSubscription,
} from '../../providers/outlook/outlook.subscription.js';
import { withFreshEmailToken } from './campaign-delivery.js';

const logger = () => getLogger().child({ component: 'outlook-subscription' });
const RENEW_WITHIN_MS = 24 * 60 * 60 * 1000;

type OutlookPushConfig = {
  outlookSubscriptionId?: string;
  outlookSubscriptionExpiration?: string;
  outlookWebhookSecret?: string;
};

function readPushConfig(config: unknown): OutlookPushConfig {
  const row = (config || {}) as OutlookPushConfig;
  return {
    outlookSubscriptionId: String(row.outlookSubscriptionId || '').trim(),
    outlookSubscriptionExpiration: String(row.outlookSubscriptionExpiration || '').trim(),
    outlookWebhookSecret: String(row.outlookWebhookSecret || '').trim(),
  };
}

function secretsMatch(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length === 0 || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

async function savePushConfig(
  integrationId: string,
  prev: Record<string, unknown>,
  next: OutlookPushConfig
): Promise<void> {
  await UserIntegrationModel.updateOne(
    { _id: integrationId },
    { $set: { config: { ...prev, ...next } } }
  );
}

/** Start or extend the inbox subscription for one connected Outlook mailbox. */
export async function ensureOutlookSubscription(
  organizationId: string,
  integrationId: string
): Promise<boolean> {
  if (!isOutlookPushConfigured()) return false;

  try {
    const secrets = await integrationsService.getDecryptedSecrets(organizationId, integrationId);
    if (!secrets || secrets.provider !== 'outlook') return false;

    const accessToken = await withFreshEmailToken(secrets, organizationId);
    if (!accessToken) {
      logger().warn({ integrationId }, 'Outlook subscription skipped — no access token');
      return false;
    }

    const prev = (secrets.config || {}) as Record<string, unknown>;
    const current = readPushConfig(prev);
    const clientState = current.outlookWebhookSecret || randomBytes(32).toString('base64url');

    let subscriptionId = current.outlookSubscriptionId;
    let expiration = '';

    if (subscriptionId) {
      const renewed = await renewOutlookMailSubscription({ accessToken, subscriptionId });
      if (renewed === 'missing') {
        subscriptionId = '';
      } else {
        subscriptionId = renewed.id;
        expiration = renewed.expirationDateTime;
      }
    }

    if (!subscriptionId) {
      const created = await createOutlookMailSubscription({ accessToken, clientState });
      subscriptionId = created.id;
      expiration = created.expirationDateTime;
    }

    await savePushConfig(integrationId, prev, {
      outlookSubscriptionId: subscriptionId,
      outlookSubscriptionExpiration: expiration,
      outlookWebhookSecret: clientState,
    });
    logger().info({ integrationId, subscriptionId, expiration }, 'Outlook inbox subscription saved');
    return true;
  } catch (error) {
    logger().warn({ err: error, integrationId }, 'Outlook subscription ensure failed');
    return false;
  }
}

/** Renew subscriptions that expire within 24 hours. Recreate when Graph returns 404. */
export async function renewExpiringOutlookSubscriptions(): Promise<number> {
  if (!isOutlookPushConfigured()) return 0;

  const soon = Date.now() + RENEW_WITHIN_MS;
  const integrations = await UserIntegrationModel.find({
    provider: 'outlook',
    status: { $in: ['connected', 'needs_attention'] },
  })
    .select('_id organizationId config')
    .limit(50)
    .lean();

  let renewed = 0;
  for (const row of integrations) {
    const current = readPushConfig(row.config);
    const expMs = current.outlookSubscriptionExpiration
      ? Date.parse(current.outlookSubscriptionExpiration)
      : 0;
    const needsRenew = !current.outlookSubscriptionId || !expMs || expMs <= soon;
    if (!needsRenew) continue;
    const ok = await ensureOutlookSubscription(String(row.organizationId), String(row._id));
    if (ok) renewed += 1;
  }
  return renewed;
}

export async function deleteOutlookSubscriptionForIntegration(input: {
  accessToken: string | null;
  config: Record<string, unknown> | null | undefined;
}): Promise<void> {
  const subscriptionId = readPushConfig(input.config).outlookSubscriptionId;
  if (!subscriptionId || !input.accessToken) return;
  await deleteOutlookMailSubscription({
    accessToken: input.accessToken,
    subscriptionId,
  }).catch((error) => {
    logger().warn({ err: error, subscriptionId }, 'Outlook subscription delete failed');
  });
}

type GraphNotification = {
  subscriptionId?: string;
  clientState?: string;
};

/** Verify clientState and pull the mailbox. Graph only sends the message id. */
export async function acceptOutlookGraphNotifications(value: unknown): Promise<void> {
  if (!Array.isArray(value) || value.length === 0) return;

  const seen = new Set<string>();
  for (const item of value) {
    const note = (item || {}) as GraphNotification;
    const subscriptionId = String(note.subscriptionId || '').trim();
    const clientState = String(note.clientState || '').trim();
    if (!subscriptionId || seen.has(subscriptionId)) continue;
    seen.add(subscriptionId);

    const row = await UserIntegrationModel.findOne({
      provider: 'outlook',
      status: { $in: ['connected', 'needs_attention'] },
      'config.outlookSubscriptionId': subscriptionId,
    })
      .select('_id organizationId config')
      .lean();
    if (!row) continue;

    const expected = readPushConfig(row.config).outlookWebhookSecret || '';
    if (!secretsMatch(expected, clientState)) {
      logger().warn({ subscriptionId }, 'Outlook notification clientState mismatch');
      continue;
    }

    const { syncOutlookMailboxFromPush } = await import('./email-reply-sync.service.js');
    await syncOutlookMailboxFromPush(String(row.organizationId), String(row._id)).catch(
      (error) => {
        logger().warn({ err: error, subscriptionId }, 'Outlook push sync failed');
      }
    );
  }
}
