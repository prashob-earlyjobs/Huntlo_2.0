/**
 * Polls connected email providers for candidate replies and ingests them
 * through the shared conversations inbound pipeline.
 *
 * Supported:
 *  - Gmail (API poll)
 *  - Outlook (Microsoft Graph poll)
 *  - Zoho Mail OAuth (API poll)
 *  - Zoho SMTP / custom SMTP (IMAP poll when host is configured or inferable)
 */

import { getLogger } from '../../config/logger.js';
import { UserIntegrationModel } from '../integrations/user-integration.model.js';
import { integrationsService } from '../integrations/integration.service.js';
import { handleProviderWebhook } from '../conversations/provider-sync.js';
import type { MessageProvider } from '../conversations/conversation-message.model.js';
import { fetchRecentInboxReplies } from '../../providers/gmail/gmail.fetch.js';
import { fetchRecentOutlookInboxReplies } from '../../providers/outlook/outlook.fetch.js';
import {
  fetchRecentZohoInboxReplies,
  resolveZohoAccountId,
} from '../../providers/zoho/zoho.fetch.js';
import {
  fetchRecentImapInboxReplies,
  resolveImapConfig,
} from '../../providers/smtp/imap.fetch.js';
import type { InboxReplyItem } from '../../providers/email/inbox-reply.js';
import { withFreshEmailToken, type IntegrationSecrets } from './campaign-delivery.js';
import { OutreachCampaignModel } from './campaign.model.js';

const logger = () => getLogger().child({ component: 'email-reply-sync' });

const EMAIL_SYNC_PROVIDERS = ['gmail', 'outlook', 'zoho-mail', 'smtp'] as const;

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

async function ingestReplies(input: {
  provider: MessageProvider;
  organizationId: string;
  mailboxEmail: string | null | undefined;
  replies: InboxReplyItem[];
}): Promise<number> {
  let synced = 0;
  const mailbox = extractEmailAddress(String(input.mailboxEmail || ''));

  for (const reply of input.replies) {
    if (!reply.from || !reply.providerMessageId) continue;
    const fromAddr = extractEmailAddress(reply.from);
    if (mailbox && fromAddr === mailbox) continue;

    const result = await handleProviderWebhook({
      provider: input.provider,
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

async function syncGmailIntegration(input: {
  organizationId: string;
  integrationId: string;
  secrets: IntegrationSecrets;
  limit: number;
}): Promise<number> {
  const accessToken = await withFreshEmailToken(input.secrets, input.organizationId);
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
  return ingestReplies({
    provider: 'gmail',
    organizationId: input.organizationId,
    mailboxEmail: input.secrets.email,
    replies,
  });
}

async function syncOutlookIntegration(input: {
  organizationId: string;
  integrationId: string;
  secrets: IntegrationSecrets;
  limit: number;
}): Promise<number> {
  const accessToken = await withFreshEmailToken(input.secrets, input.organizationId);
  if (!accessToken) {
    logger().warn(
      { organizationId: input.organizationId, integrationId: input.integrationId },
      'Outlook reply sync skipped — no access token'
    );
    return 0;
  }

  const replies = await fetchRecentOutlookInboxReplies(accessToken, {
    maxResults: input.limit,
    newerThanDays: 2,
  });
  return ingestReplies({
    provider: 'outlook',
    organizationId: input.organizationId,
    mailboxEmail: input.secrets.email,
    replies,
  });
}

async function syncZohoOAuthIntegration(input: {
  organizationId: string;
  integrationId: string;
  secrets: IntegrationSecrets;
  limit: number;
}): Promise<number> {
  const accessToken = await withFreshEmailToken(input.secrets, input.organizationId);
  if (!accessToken) {
    logger().warn(
      { organizationId: input.organizationId, integrationId: input.integrationId },
      'Zoho reply sync skipped — no access token'
    );
    return 0;
  }

  const config = (input.secrets.config || {}) as {
    zohoDataCenter?: string;
    zohoAccountId?: string;
  };
  let accountId = String(config.zohoAccountId || input.secrets.providerAccountId || '').trim();
  let mailbox = input.secrets.email;
  if (!accountId) {
    const resolved = await resolveZohoAccountId(accessToken, config.zohoDataCenter, mailbox);
    accountId = resolved.accountId;
    mailbox = mailbox || resolved.email;
  }
  if (!accountId) return 0;

  const replies = await fetchRecentZohoInboxReplies(accessToken, {
    accountId,
    dataCenter: config.zohoDataCenter,
    maxResults: input.limit,
    newerThanDays: 2,
  });
  return ingestReplies({
    provider: 'zoho-mail',
    organizationId: input.organizationId,
    mailboxEmail: mailbox,
    replies,
  });
}

async function syncImapIntegration(input: {
  organizationId: string;
  integrationId: string;
  provider: 'smtp' | 'zoho-mail';
  secrets: IntegrationSecrets;
  limit: number;
}): Promise<number> {
  const config = (input.secrets.config || {}) as {
    smtpHost?: string;
    smtpSecurity?: string;
    imapHost?: string;
    imapPort?: number | string;
    zohoDataCenter?: string;
  };
  const username = String(
    input.secrets.accessToken ||
      (input.secrets.credentials as { username?: string } | null)?.username ||
      input.secrets.email ||
      ''
  );
  const password = String(input.secrets.refreshToken || '');
  const imap = resolveImapConfig({
    imapHost: config.imapHost,
    imapPort: config.imapPort,
    smtpHost: config.smtpHost,
    smtpSecurity: config.smtpSecurity,
    username,
    password,
  });
  if (!imap) {
    logger().warn(
      { organizationId: input.organizationId, integrationId: input.integrationId },
      'IMAP reply sync skipped — missing host/credentials'
    );
    return 0;
  }

  const replies = await fetchRecentImapInboxReplies(imap, {
    maxResults: input.limit,
    newerThanDays: 2,
  });
  return ingestReplies({
    provider: input.provider,
    organizationId: input.organizationId,
    mailboxEmail: input.secrets.email,
    replies,
  });
}

async function syncOneIntegration(input: {
  organizationId: string;
  integrationId: string;
  limit: number;
}): Promise<number> {
  const secrets = await integrationsService.getDecryptedSecrets(
    input.organizationId,
    input.integrationId
  );
  if (!secrets) return 0;

  if (secrets.provider === 'gmail') {
    return syncGmailIntegration({ ...input, secrets });
  }
  if (secrets.provider === 'outlook') {
    return syncOutlookIntegration({ ...input, secrets });
  }
  if (secrets.provider === 'zoho-mail') {
    const mode = String(
      (secrets.config as { zohoAuthMode?: string } | null)?.zohoAuthMode || 'oauth'
    ).toLowerCase();
    if (mode === 'smtp') {
      return syncImapIntegration({ ...input, provider: 'zoho-mail', secrets });
    }
    return syncZohoOAuthIntegration({ ...input, secrets });
  }
  if (secrets.provider === 'smtp') {
    return syncImapIntegration({ ...input, provider: 'smtp', secrets });
  }
  return 0;
}

/** Sync replies for one organisation's connected email mailboxes used by active campaigns. */
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
    provider: { $in: [...EMAIL_SYNC_PROVIDERS] },
    status: { $in: ['connected', 'needs_attention'] },
  })
    .select('_id provider')
    .limit(20)
    .lean();

  let synced = 0;
  for (const integration of integrations) {
    try {
      synced += await syncOneIntegration({
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
          provider: integration.provider,
        },
        'Email reply sync failed for integration'
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
