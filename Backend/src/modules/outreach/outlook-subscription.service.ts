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
  getOutlookMailSubscription,
  getOutlookNotificationUrl,
  isOutlookPushConfigured,
  outlookNotificationUrlsMatch,
  renewOutlookMailSubscription,
} from '../../providers/outlook/outlook.subscription.js';
import { withFreshEmailToken } from './campaign-delivery.js';

const logger = () => getLogger().child({ component: 'outlook-subscription' });
const RENEW_WITHIN_MS = 24 * 60 * 60 * 1000;
/** Avoid hammering Graph when the notification URL is still unreachable. */
const RETRY_AFTER_MS = 15 * 60 * 1000;

type OutlookPushConfig = {
  outlookSubscriptionId?: string;
  outlookSubscriptionExpiration?: string;
  outlookWebhookSecret?: string;
  outlookNotificationUrl?: string;
  outlookSubscriptionAttemptAt?: string;
};

function readPushConfig(config: unknown): OutlookPushConfig {
  const row = (config || {}) as OutlookPushConfig;
  return {
    outlookSubscriptionId: String(row.outlookSubscriptionId || '').trim(),
    outlookSubscriptionExpiration: String(row.outlookSubscriptionExpiration || '').trim(),
    outlookWebhookSecret: String(row.outlookWebhookSecret || '').trim(),
    outlookNotificationUrl: String(row.outlookNotificationUrl || '').trim(),
    outlookSubscriptionAttemptAt: String(row.outlookSubscriptionAttemptAt || '').trim(),
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
  const notificationUrl = getOutlookNotificationUrl();
  if (!isOutlookPushConfigured()) {
    console.log('[outlook] subscription skipped — notification URL is not public HTTPS', {
      organizationId,
      integrationId,
      notificationUrl: notificationUrl || '(empty)',
    });
    return false;
  }

  console.log('[outlook] ensuring inbox subscription', {
    organizationId,
    integrationId,
    notificationUrl,
  });

  try {
    const secrets = await integrationsService.getDecryptedSecrets(organizationId, integrationId);
    if (!secrets || secrets.provider !== 'outlook') {
      console.log('[outlook] subscription skipped — integration is not Outlook', {
        organizationId,
        integrationId,
        provider: secrets?.provider || '(missing)',
      });
      return false;
    }

    const accessToken = await withFreshEmailToken(secrets, organizationId);
    if (!accessToken) {
      console.log('[outlook] subscription skipped — no access token', { integrationId });
      logger().warn({ integrationId }, 'Outlook subscription skipped — no access token');
      return false;
    }

    const prev = (secrets.config || {}) as Record<string, unknown>;
    const current = readPushConfig(prev);
    const clientState = current.outlookWebhookSecret || randomBytes(32).toString('base64url');

    let subscriptionId = current.outlookSubscriptionId;
    let expiration = '';

    if (subscriptionId) {
      const existing = await getOutlookMailSubscription({ accessToken, subscriptionId });
      const urlDrifted =
        existing !== 'missing' &&
        Boolean(existing.notificationUrl) &&
        !outlookNotificationUrlsMatch(existing.notificationUrl, notificationUrl);

      // Graph PATCH cannot change notificationUrl. Create the replacement
      // first so a failed handshake leaves the previous subscription in place.
      if (urlDrifted && existing !== 'missing') {
        console.log('[outlook] notification URL changed — replacing subscription', {
          integrationId,
          subscriptionId,
          previousUrl: existing.notificationUrl,
          notificationUrl,
        });
        const created = await createOutlookMailSubscription({ accessToken, clientState });
        await deleteOutlookMailSubscription({
          accessToken,
          subscriptionId,
        }).catch((error) => {
          logger().warn(
            { err: error, integrationId, subscriptionId },
            'Outlook subscription replace delete failed'
          );
        });
        subscriptionId = created.id;
        expiration = created.expirationDateTime;
      } else if (existing === 'missing') {
        console.log('[outlook] stored subscription is gone — will create a new one', {
          integrationId,
          subscriptionId,
        });
        subscriptionId = '';
      } else {
        const renewed = await renewOutlookMailSubscription({ accessToken, subscriptionId });
        if (renewed === 'missing') {
          subscriptionId = '';
        } else {
          subscriptionId = renewed.id;
          expiration = renewed.expirationDateTime;
        }
      }
    }

    if (!subscriptionId) {
      console.log('[outlook] no live subscription — creating one', {
        integrationId,
        notificationUrl,
      });
      const created = await createOutlookMailSubscription({ accessToken, clientState });
      subscriptionId = created.id;
      expiration = created.expirationDateTime;
    }

    const prevClean = { ...prev };
    delete prevClean.outlookSubscriptionAttemptAt;
    await savePushConfig(integrationId, prevClean, {
      outlookSubscriptionId: subscriptionId,
      outlookSubscriptionExpiration: expiration,
      outlookWebhookSecret: clientState,
      outlookNotificationUrl: notificationUrl,
    });
    console.log('[outlook] inbox subscription saved', {
      integrationId,
      subscriptionId,
      expiration,
      notificationUrl,
    });
    logger().info({ integrationId, subscriptionId, expiration }, 'Outlook inbox subscription saved');
    return true;
  } catch (error) {
    console.log('[outlook] subscription ensure failed', {
      integrationId,
      notificationUrl,
      message: error instanceof Error ? error.message : String(error),
    });
    logger().warn({ err: error, integrationId }, 'Outlook subscription ensure failed');
    await UserIntegrationModel.updateOne(
      { _id: integrationId },
      { $set: { 'config.outlookSubscriptionAttemptAt': new Date().toISOString() } }
    ).catch(() => undefined);
    return false;
  }
}

/** Renew subscriptions that expire within 24 hours. Recreate when Graph returns 404. */
export async function renewExpiringOutlookSubscriptions(): Promise<number> {
  if (!isOutlookPushConfigured()) {
    console.log('[outlook] renew sweep skipped — notification URL is not public HTTPS', {
      notificationUrl: getOutlookNotificationUrl() || '(empty)',
    });
    return 0;
  }

  const soon = new Date(Date.now() + RENEW_WITHIN_MS).toISOString();
  const notificationUrl = getOutlookNotificationUrl();
  const retryBefore = new Date(Date.now() - RETRY_AFTER_MS).toISOString();
  // Select mailboxes that actually need work. A plain limit(50) kept renewing
  // the same healthy rows and never reached the accounts Graph had dropped.
  const integrations = await UserIntegrationModel.find({
    provider: 'outlook',
    status: { $in: ['connected', 'needs_attention'] },
    $and: [
      {
        $or: [
          { 'config.outlookSubscriptionAttemptAt': { $exists: false } },
          { 'config.outlookSubscriptionAttemptAt': { $in: [null, ''] } },
          { 'config.outlookSubscriptionAttemptAt': { $lte: retryBefore } },
        ],
      },
      {
        $or: [
          { 'config.outlookSubscriptionId': { $exists: false } },
          { 'config.outlookSubscriptionId': { $in: [null, ''] } },
          { 'config.outlookSubscriptionExpiration': { $exists: false } },
          { 'config.outlookSubscriptionExpiration': { $in: [null, ''] } },
          { 'config.outlookSubscriptionExpiration': { $lte: soon } },
          {
            'config.outlookNotificationUrl': {
              $exists: true,
              $nin: ['', notificationUrl],
            },
          },
        ],
      },
    ],
  })
    .select('_id organizationId')
    .sort({ 'config.outlookSubscriptionExpiration': 1 })
    .limit(50)
    .lean();

  console.log('[outlook] renew sweep', {
    candidates: integrations.length,
    notificationUrl,
  });

  let renewed = 0;
  for (const row of integrations) {
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
