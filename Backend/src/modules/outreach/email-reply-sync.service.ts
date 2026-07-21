/**
 * Syncs candidate email replies.
 * Gmail: Pub/Sub push (history.list) when GMAIL_PUBSUB_TOPIC is set; otherwise poll.
 * Outlook / Zoho / SMTP: still polled.
 */

import { getLogger } from '../../config/logger.js';
import { UserIntegrationModel } from '../integrations/user-integration.model.js';
import { integrationsService } from '../integrations/integration.service.js';
import { handleProviderWebhook } from '../conversations/provider-sync.js';
import type { MessageProvider } from '../conversations/conversation-message.model.js';
import {
  fetchGmailMessagesByIds,
  fetchRecentInboxReplies,
} from '../../providers/gmail/gmail.fetch.js';
import {
  isGmailPushConfigured,
  listGmailHistoryMessageIds,
  startGmailWatch,
} from '../../providers/gmail/gmail.watch.js';
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
import { OutreachEnrollmentModel } from './enrollment.model.js';
import { processQualificationAfterReply } from './qualification-qa.service.js';
import { ConversationMessageModel } from '../conversations/conversation-message.model.js';
import { ConversationThreadModel } from '../conversations/conversation-thread.model.js';
import { ReplyClassificationModel } from '../conversations/reply-classification.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';

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
  let skippedSelf = 0;
  let duplicates = 0;
  let unmatched = 0;
  const mailbox = extractEmailAddress(String(input.mailboxEmail || ''));

  for (const reply of input.replies) {
    if (!reply.from || !reply.providerMessageId) continue;
    const fromAddr = extractEmailAddress(reply.from);

    // Skip recruiter's own mailbox noise — unless that address is also a candidate
    // (common when testing outreach to yourself).
    if (mailbox && fromAddr === mailbox) {
      const selfCandidate = await SavedCandidateModel.findOne({
        organizationId: input.organizationId,
        deletedAt: null,
        email: { $regex: new RegExp(`^${fromAddr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      })
        .select('_id')
        .lean();
      if (!selfCandidate) {
        skippedSelf += 1;
        continue;
      }
    }

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
    duplicates += result.duplicates;
    if (!result.ingested && !result.duplicates) unmatched += 1;
  }

  if (synced > 0) {
    logger().info({ synced, unmatched, duplicates }, 'Email replies synced');
  }

  return synced;
}

async function syncGmailIntegration(input: {
  organizationId: string;
  integrationId: string;
  secrets: IntegrationSecrets;
  limit: number;
  /** When true, always poll (safety net). When false and push is on, use history if possible. */
  forcePoll?: boolean;
}): Promise<number> {
  const accessToken = await withFreshEmailToken(input.secrets, input.organizationId);
  if (!accessToken) {
    logger().warn(
      { organizationId: input.organizationId, integrationId: input.integrationId },
      'Gmail reply sync skipped — no access token'
    );
    return 0;
  }

  const config = (input.secrets.config || {}) as {
    gmailHistoryId?: string;
    gmailWatchExpiration?: string;
  };
  const storedHistoryId = String(config.gmailHistoryId || '').trim();
  const useHistory = !input.forcePoll && isGmailPushConfigured() && Boolean(storedHistoryId);

  let replies: InboxReplyItem[] = [];
  let nextHistoryId = storedHistoryId;

  if (useHistory) {
    try {
      const history = await listGmailHistoryMessageIds(accessToken, storedHistoryId);
      nextHistoryId = history.historyId || storedHistoryId;
      if (history.messageIds.length) {
        replies = await fetchGmailMessagesByIds(
          accessToken,
          history.messageIds.slice(0, input.limit)
        );
      }
      logger().debug(
        { fetched: replies.length, via: 'history' },
        'Gmail inbox sync'
      );
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      // history too old / invalid → fall back to poll once
      if (status === 404 || status === 400) {
        logger().info(
          { integrationId: input.integrationId },
          'Gmail history expired — falling back to poll'
        );
        replies = await fetchRecentInboxReplies(accessToken, {
          maxResults: input.limit,
          newerThanDays: 2,
        });
      } else {
        throw error;
      }
    }
  } else {
    replies = await fetchRecentInboxReplies(accessToken, {
      maxResults: input.limit,
      newerThanDays: 2,
    });
    logger().debug({ fetched: replies.length, via: 'poll' }, 'Gmail inbox sync');
  }

  const synced = await ingestReplies({
    provider: 'gmail',
    organizationId: input.organizationId,
    mailboxEmail: input.secrets.email,
    replies,
  });

  // Keep history cursor fresh when push is configured
  if (isGmailPushConfigured()) {
    const patch: Record<string, unknown> = {
      ...(input.secrets.config || {}),
    };
    if (nextHistoryId) patch.gmailHistoryId = nextHistoryId;
    // If we polled without a history id, start watch to seed one
    if (!storedHistoryId) {
      const watch = await startGmailWatch(accessToken).catch((error) => {
        logger().warn({ err: error, integrationId: input.integrationId }, 'Gmail watch start failed');
        return null;
      });
      if (watch?.historyId) {
        patch.gmailHistoryId = watch.historyId;
        if (watch.expiration) patch.gmailWatchExpiration = watch.expiration;
      }
    }
    await UserIntegrationModel.updateOne(
      { _id: input.integrationId },
      { $set: { config: patch, lastSyncAt: new Date() } }
    );
  }

  return synced;
}

/** Start/renew Gmail Pub/Sub watch and save historyId on the integration. */
export async function ensureGmailWatch(
  organizationId: string,
  integrationId: string
): Promise<boolean> {
  if (!isGmailPushConfigured()) return false;

  const secrets = await integrationsService.getDecryptedSecrets(organizationId, integrationId);
  if (!secrets || secrets.provider !== 'gmail') return false;

  const accessToken = await withFreshEmailToken(secrets, organizationId);
  if (!accessToken) return false;

  const watch = await startGmailWatch(accessToken);
  if (!watch?.historyId) return false;

  const prev = (secrets.config || {}) as Record<string, unknown>;
  await UserIntegrationModel.updateOne(
    { _id: integrationId },
    {
      $set: {
        config: {
          ...prev,
          gmailHistoryId: watch.historyId,
          gmailWatchExpiration: watch.expiration,
        },
      },
    }
  );
  logger().info({ integrationId, historyId: watch.historyId }, 'Gmail watch started');
  return true;
}

/** Called from Gmail Pub/Sub webhook — sync every connected mailbox for this email. */
export async function syncGmailRepliesForEmail(emailAddress: string): Promise<number> {
  const email = String(emailAddress || '').trim().toLowerCase();
  if (!email) return 0;

  const integrations = await UserIntegrationModel.find({
    provider: 'gmail',
    status: { $in: ['connected', 'needs_attention'] },
    $or: [
      { email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
      {
        providerAccountId: {
          $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
        },
      },
    ],
  })
    .select('_id organizationId')
    .limit(10)
    .lean();

  let synced = 0;
  for (const row of integrations) {
    try {
      synced += await syncOneIntegration({
        organizationId: String(row.organizationId),
        integrationId: String(row._id),
        limit: replySyncBatchSize(),
        fromPush: true,
      });
    } catch (error) {
      logger().warn(
        { err: error, integrationId: String(row._id), email },
        'Gmail push sync failed'
      );
    }
  }
  return synced;
}

/** Renew watches that expire within 24h (Gmail watch lasts ~7 days). */
export async function renewExpiringGmailWatches(): Promise<number> {
  if (!isGmailPushConfigured()) return 0;

  const soon = Date.now() + 24 * 60 * 60 * 1000;
  const integrations = await UserIntegrationModel.find({
    provider: 'gmail',
    status: { $in: ['connected', 'needs_attention'] },
  })
    .select('_id organizationId config')
    .limit(50)
    .lean();

  let renewed = 0;
  for (const row of integrations) {
    const exp = String((row.config as { gmailWatchExpiration?: string } | null)?.gmailWatchExpiration || '');
    const expMs = exp ? Number(exp) : 0;
    const needsRenew = !expMs || expMs <= soon || !(row.config as { gmailHistoryId?: string })?.gmailHistoryId;
    if (!needsRenew) continue;
    const ok = await ensureGmailWatch(String(row.organizationId), String(row._id)).catch(() => false);
    if (ok) renewed += 1;
  }
  return renewed;
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
  forceGmailPoll?: boolean;
  /** True when triggered by Pub/Sub — must run history sync. */
  fromPush?: boolean;
}): Promise<number> {
  const secrets = await integrationsService.getDecryptedSecrets(
    input.organizationId,
    input.integrationId
  );
  if (!secrets) return 0;

  if (secrets.provider === 'gmail') {
    // Minute cron skips Gmail when Pub/Sub push is live (webhook handles it).
    if (isGmailPushConfigured() && !input.forceGmailPoll && !input.fromPush) {
      const historyId = String(
        (secrets.config as { gmailHistoryId?: string } | null)?.gmailHistoryId || ''
      ).trim();
      if (historyId) return 0;
    }
    return syncGmailIntegration({
      ...input,
      secrets,
      forcePoll: Boolean(input.forceGmailPoll),
    });
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

  // Keep Gmail watches alive when push is enabled
  if (isGmailPushConfigured()) {
    await renewExpiringGmailWatches().catch((error) => {
      logger().warn({ err: error }, 'Gmail watch renew failed');
    });
  }

  let synced = 0;
  for (const orgId of orgIds.slice(0, 25)) {
    synced += await syncEmailRepliesForOrganization(String(orgId), batch);
  }

  if (synced > 0) {
    logger().info({ synced, orgs: orgIds.length }, 'Email reply sync done');
  } else {
    logger().debug({ orgs: orgIds.length }, 'Email reply sync done (nothing new)');
  }

  // Repair enrollments that already have a reply but never got a qualification
  // question (e.g. launched with aiReplyEnabled falsely compiled to false).
  const repaired = await repairMissedQualificationQuestions().catch((error) => {
    logger().warn({ err: error }, 'Missed qualification repair failed');
    return 0;
  });
  if (repaired > 0) {
    logger().info({ repaired }, 'Re-ran qualification Q&A for stuck enrollments');
  }

  return synced;
}

/**
 * Find enrollments that replied but never received a qualification question,
 * and drive processQualificationAfterReply from the latest inbound message.
 */
async function repairMissedQualificationQuestions(): Promise<number> {
  const running = await OutreachCampaignModel.find({
    deletedAt: null,
    status: { $in: ['running', 'paused'] },
    'channelConfig.email.enabled': true,
  })
    .limit(50)
    .exec();

  let repaired = 0;
  for (const campaign of running) {
    const enrollments = await OutreachEnrollmentModel.find({
      campaignId: campaign._id,
      status: { $nin: ['cancelled', 'opted_out', 'failed'] },
      $and: [
        {
          $or: [
            { 'replyState.hasReply': true },
            { status: 'replied' },
            { status: 'stopped', stopReason: 'candidate_replied' },
          ],
        },
        {
          // Never successfully sent a screening follow-up — includes "completed"
          // enrollments that only stored junk answers from engagement replies.
          $or: [
            { autoReplyCount: { $exists: false } },
            { autoReplyCount: null },
            { autoReplyCount: { $lte: 0 } },
          ],
        },
      ],
    })
      .limit(30)
      .exec();

    if (!enrollments.length) continue;

    for (const enrollment of enrollments) {
      const thread =
        (await ConversationThreadModel.findOne({
          organizationId: campaign.organizationId,
          enrollmentId: enrollment._id,
        })
          .sort({ updatedAt: -1 })
          .lean()) ||
        (await ConversationThreadModel.findOne({
          organizationId: campaign.organizationId,
          campaignId: campaign._id,
          candidateId: enrollment.candidateId,
        })
          .sort({ updatedAt: -1 })
          .lean());
      if (!thread) {
        logger().info(
          { enrollmentId: String(enrollment._id), campaignId: String(campaign._id) },
          'Qualification repair skipped — no thread'
        );
        continue;
      }

      const lastInbound = await ConversationMessageModel.findOne({
        threadId: thread._id,
        direction: 'inbound',
        channel: 'email',
      })
        .sort({ createdAt: -1 })
        .lean();
      if (!lastInbound?.bodyText) {
        logger().info(
          { enrollmentId: String(enrollment._id), threadId: String(thread._id) },
          'Qualification repair skipped — no inbound email'
        );
        continue;
      }

      // Only skip when we already sent a real screening (qualification) follow-up.
      // Campaign outreach is aiGenerated:true — must NOT block repair.
      const followUp = await ConversationMessageModel.findOne({
        threadId: thread._id,
        direction: 'outbound',
        channel: 'email',
        createdAt: { $gt: lastInbound.createdAt },
        messageType: 'qualification',
      })
        .select('_id messageType')
        .lean();
      if (followUp) {
        logger().info(
          {
            enrollmentId: String(enrollment._id),
            followUpId: String(followUp._id),
            messageType: followUp.messageType,
          },
          'Qualification repair skipped — screening follow-up already sent'
        );
        continue;
      }

      const classification = await ReplyClassificationModel.findOne({
        threadId: thread._id,
        messageId: lastInbound._id,
      })
        .sort({ createdAt: -1 })
        .lean();

      const interest = classification?.interest || 'interested';
      if (interest === 'opt_out' || interest === 'not_interested') continue;

      // Reset false auto-qualify so Q&A can run again.
      if (enrollment.qualificationState?.status === 'qualified') {
        enrollment.qualificationState = {
          status: 'in_progress',
          answers: enrollment.qualificationState?.answers || {},
        };
        await enrollment.save();
      }

      const result = await processQualificationAfterReply({
        organizationId: String(campaign.organizationId),
        campaign,
        enrollmentId: String(enrollment._id),
        threadId: String(thread._id),
        bodyText: String(lastInbound.bodyText),
        interest,
        intent: classification?.intent || 'provide_info',
        extractedVariables: (classification?.extractedVariables || {}) as Record<
          string,
          unknown
        >,
        preferredChannel: 'email',
      });

      logger().info(
        {
          enrollmentId: String(enrollment._id),
          campaignId: String(campaign._id),
          action: result.action,
          hasReply: enrollment.replyState?.hasReply,
        },
        'Repaired missed qualification after reply'
      );
      if (result.action.includes('asked') || result.action.startsWith('ask_failed')) {
        // Count successful asks; still surface ask_failed in logs above for debugging.
        if (result.action.includes('asked')) repaired += 1;
      }
    }
  }

  return repaired;
}
