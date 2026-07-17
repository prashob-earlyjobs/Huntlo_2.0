/**
 * Polls connected email providers for candidate replies and ingests them
 * through the shared conversations inbound pipeline.
 *
 * Gmail is implemented via the documented messages.list + messages.get APIs.
 * Outlook / Zoho / IMAP polling is intentionally deferred — those providers
 * can still push replies through /api/v1/webhooks/imap when available.
 */

import { getLogger } from '../../config/logger.js';
import { UserIntegrationModel } from '../integrations/user-integration.model.js';
import { integrationsService } from '../integrations/integration.service.js';
import { handleProviderWebhook } from '../conversations/provider-sync.js';
import { fetchRecentInboxReplies } from '../../providers/gmail/gmail.fetch.js';
import { withFreshEmailToken } from './campaign-delivery.js';
import { OutreachCampaignModel } from './campaign.model.js';

const logger = () => getLogger().child({ component: 'email-reply-sync' });

function replySyncBatchSize(limit?: number): number {
  const fromEnv = Number(process.env.OUTREACH_REPLY_SYNC_BATCH_SIZE || '');
  if (Number.isFinite(fromEnv) && fromEnv > 0) return Math.min(fromEnv, 50);
  if (typeof limit === 'number' && limit > 0) return Math.min(limit, 50);
  return 15;
}

function extractEmailAddress(raw: string): string {
  const match = raw.match(/<([^>]+)>/);
  return (match?.[1] || raw).trim().toLowerCase();
}

async function syncGmailIntegration(input: {
  organizationId: string;
  integrationId: string;
  limit: number;
}): Promise<number> {
  const secrets = await integrationsService.getDecryptedSecrets(
    input.organizationId,
    input.integrationId
  );
  if (!secrets || secrets.provider !== 'gmail') return 0;

  const accessToken = await withFreshEmailToken(secrets);
  if (!accessToken) {
    logger().warn(
      { organizationId: input.organizationId, integrationId: input.integrationId },
      'Gmail reply sync skipped — no access token'
    );
    return 0;
  }

  const replies = await fetchRecentInboxReplies(accessToken, {
    maxResults: input.limit,
    newerThanDays: 2,
  });

  let synced = 0;
  for (const reply of replies) {
    if (!reply.from || !reply.providerMessageId) continue;
    // Skip obvious outbound echoes (From matches the connected mailbox).
    const fromAddr = extractEmailAddress(reply.from);
    const mailbox = extractEmailAddress(String(secrets.email || ''));
    if (mailbox && fromAddr === mailbox) continue;

    const result = await handleProviderWebhook({
      provider: 'gmail',
      organizationId: input.organizationId,
      payload: {
        organizationId: input.organizationId,
        messages: [
          {
            organizationId: input.organizationId,
            providerMessageId: reply.providerMessageId,
            providerThreadId: reply.providerThreadId,
            from: reply.from,
            to: reply.to,
            subject: reply.subject,
            bodyText: reply.bodyText,
            bodyHtml: reply.bodyHtml,
            receivedAt: reply.receivedAt,
          },
        ],
      },
    });
    synced += result.ingested;
  }
  return synced;
}

/** Sync replies for one organisation's connected Gmail mailboxes used by active campaigns. */
export async function syncEmailRepliesForOrganization(
  organizationId: string,
  limit?: number
): Promise<number> {
  const batch = replySyncBatchSize(limit);

  const activeEmailCampaigns = await OutreachCampaignModel.countDocuments({
    organizationId,
    deletedAt: null,
    status: { $in: ['running', 'paused', 'scheduled'] },
    'channelConfig.email.enabled': true,
  });
  if (!activeEmailCampaigns) return 0;

  const integrations = await UserIntegrationModel.find({
    organizationId,
    provider: 'gmail',
    status: { $in: ['connected', 'needs_attention'] },
  })
    .select('_id')
    .limit(10)
    .lean();

  let synced = 0;
  for (const integration of integrations) {
    try {
      synced += await syncGmailIntegration({
        organizationId,
        integrationId: String(integration._id),
        limit: batch,
      });
    } catch (error) {
      logger().warn(
        {
          err: error,
          organizationId,
          integrationId: String(integration._id),
        },
        'Gmail reply sync failed for integration'
      );
    }
  }
  return synced;
}

/**
 * Sweep reply sync across organisations that have running email campaigns.
 * Used by the `outreach.sync_email_replies` background job.
 */
export async function syncEmailReplies(limit?: number): Promise<number> {
  const batch = replySyncBatchSize(limit);
  const orgIds = await OutreachCampaignModel.distinct('organizationId', {
    deletedAt: null,
    status: { $in: ['running', 'paused'] },
    'channelConfig.email.enabled': true,
  });

  let synced = 0;
  for (const orgId of orgIds.slice(0, 25)) {
    synced += await syncEmailRepliesForOrganization(String(orgId), batch);
  }

  logger().debug({ synced, orgs: orgIds.length }, 'email reply sync sweep completed');
  return synced;
}
