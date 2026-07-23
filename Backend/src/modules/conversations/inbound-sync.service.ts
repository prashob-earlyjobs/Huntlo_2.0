import mongoose from 'mongoose';

import { getLogger } from '../../config/logger.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { OutreachCampaignModel } from '../outreach/campaign.model.js';
import { OutreachEnrollmentModel } from '../outreach/enrollment.model.js';
import type { OutreachEnrollmentDocument } from '../outreach/enrollment.model.js';
import { campaignsService, refreshCampaignStats } from '../outreach/campaigns.service.js';
import {
  emitCampaignThreadUpdated,
  emitConversationMessageCreated,
  emitConversationQualificationUpdated,
} from '../../realtime/events.js';
import { recordAuditEvent } from '../../shared/audit/audit.service.js';
import {
  classifyConversationReply,
  DEFAULT_CLASSIFY_CONFIDENCE_THRESHOLD,
  logEmailPipeline,
  setEmailPipelineLogContextId,
} from '../../providers/gemini/gemini.conversations.js';
import { stripEmailQuotedReply } from '../../providers/email/strip-quoted-reply.js';
import {
  ConversationMessageModel,
  type MessageProvider,
  type DeliveryStatus,
} from './conversation-message.model.js';
import {
  ConversationThreadModel,
  type ConversationChannel,
  type ConversationThreadDocument,
} from './conversation-thread.model.js';
import { ReplyClassificationModel } from './reply-classification.model.js';
import { processQualificationAfterReply } from '../outreach/qualification-qa.service.js';

export type NormalizedInboundMessage = {
  organizationId: string;
  provider: MessageProvider;
  channel: ConversationChannel;
  providerMessageId: string;
  providerThreadId?: string | null;
  /** Meta context.id — outbound wamid the user replied to (when present). */
  contextProviderMessageId?: string | null;
  from: string;
  to?: string | null;
  subject?: string | null;
  bodyText: string;
  bodyHtml?: string | null;
  receivedAt?: Date;
  deliveryStatus?: DeliveryStatus;
  campaignId?: string | null;
  enrollmentId?: string | null;
  candidateId?: string | null;
  /** When true, skip AI classify (tests / bulk). */
  skipClassify?: boolean;
};

/** Pull bare email from headers like `Jane Doe <jane@acme.com>`. */
function extractEmailAddress(raw: string | null | undefined): string {
  const value = String(raw || '').trim();
  if (!value) return '';
  const angle = value.match(/<([^>]+)>/);
  const candidate = (angle?.[1] || value).trim().toLowerCase();
  // Keep only a plausible email token if the header is noisy.
  const emailMatch = candidate.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  return (emailMatch?.[0] || candidate).toLowerCase();
}

function normalizeContact(value: string | null | undefined): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s()-]/g, '');
}

function looksLikeOptOut(text: string): boolean {
  return /\b(stop|unsubscribe|opt[-\s]?out|do not contact|remove me)\b/i.test(text);
}

async function findCandidate(input: NormalizedInboundMessage) {
  if (input.candidateId && mongoose.Types.ObjectId.isValid(input.candidateId)) {
    const byId = await SavedCandidateModel.findOne({
      _id: input.candidateId,
      organizationId: input.organizationId,
      deletedAt: null,
    }).lean();
    if (byId) return byId;
  }

  const emailFrom = extractEmailAddress(input.from);
  if (input.channel === 'email' || emailFrom.includes('@')) {
    if (!emailFrom.includes('@')) return null;
    // Case-insensitive exact match — avoid mangling `Name <email>` into a non-email key.
    return SavedCandidateModel.findOne({
      organizationId: input.organizationId,
      deletedAt: null,
      email: { $regex: new RegExp(`^${emailFrom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    }).lean();
  }

  const from = normalizeContact(input.from);
  if (!from) return null;

  const phoneDigits = from.replace(/\D/g, '');
  if (phoneDigits.length >= 8) {
    const candidates = await SavedCandidateModel.find({
      organizationId: input.organizationId,
      deletedAt: null,
      phone: { $ne: null },
    })
      .select('name email phone tags customFields currentTitle currentCompany location')
      .limit(500)
      .lean();
    return (
      candidates.find((c) => {
        const digits = String(c.phone || '').replace(/\D/g, '');
        return digits.endsWith(phoneDigits) || phoneDigits.endsWith(digits);
      }) || null
    );
  }
  return null;
}

type ChannelCapableCampaign = {
  _id: mongoose.Types.ObjectId;
  channelConfig?: {
    email?: { enabled?: boolean } | null;
    whatsapp?: { enabled?: boolean } | null;
  } | null;
  sequenceSteps?: Array<{ type?: string }> | null;
};

/** True when the campaign is configured to send/receive on this channel. */
export function campaignSupportsChannel(
  campaign: ChannelCapableCampaign | null | undefined,
  channel: ConversationChannel
): boolean {
  if (!campaign) return false;
  if (channel === 'whatsapp') {
    if (campaign.channelConfig?.whatsapp?.enabled === true) return true;
    return (campaign.sequenceSteps || []).some((s) => s.type === 'whatsapp');
  }
  if (channel === 'email') {
    if (campaign.channelConfig?.email?.enabled === true) return true;
    return (campaign.sequenceSteps || []).some(
      (s) => s.type === 'email' || s.type === 'scheduling_link'
    );
  }
  return true;
}

async function resolveEnrollment(
  organizationId: string,
  candidateId: string,
  campaignId?: string | null,
  enrollmentId?: string | null,
  channel?: ConversationChannel | null
) {
  const channelFilter =
    channel === 'email' || channel === 'whatsapp' ? channel : null;

  if (enrollmentId && mongoose.Types.ObjectId.isValid(enrollmentId)) {
    const enrollment = await OutreachEnrollmentModel.findOne({
      _id: enrollmentId,
      organizationId,
      candidateId,
    });
    if (enrollment) {
      if (!channelFilter) return enrollment;
      const campaign = await OutreachCampaignModel.findById(enrollment.campaignId)
        .select('channelConfig sequenceSteps')
        .lean();
      if (campaignSupportsChannel(campaign, channelFilter)) return enrollment;
      // Explicit id but wrong channel — fall through to a compatible enrollment.
    }
  }
  if (
    campaignId &&
    mongoose.Types.ObjectId.isValid(campaignId) &&
    channelFilter !== 'whatsapp'
  ) {
    if (channelFilter) {
      const campaign = await OutreachCampaignModel.findById(campaignId)
        .select('channelConfig sequenceSteps')
        .lean();
      if (!campaignSupportsChannel(campaign, channelFilter)) {
        // Stated campaign cannot accept this channel — try another enrollment.
      } else {
        return OutreachEnrollmentModel.findOne({
          organizationId,
          campaignId,
          candidateId,
          status: { $nin: ['completed', 'cancelled'] },
        }).sort({ updatedAt: -1 });
      }
    } else {
      return OutreachEnrollmentModel.findOne({
        organizationId,
        campaignId,
        candidateId,
        status: { $nin: ['completed', 'cancelled'] },
      }).sort({ updatedAt: -1 });
    }
  }

  // Include stopped — first reply often stops the enrollment (stopOnReply),
  // and follow-up messages must still attach to the same campaign thread.
  const enrollments = await OutreachEnrollmentModel.find({
    organizationId,
    candidateId,
    status: { $in: ['active', 'waiting', 'pending', 'replied', 'stopped'] },
  }).sort({ updatedAt: -1 });

  if (!channelFilter) {
    return enrollments[0] || null;
  }

  // WhatsApp: bind only to the latest outbound outreach for this candidate.
  // Never fall through to older stopped/replied enrollments by updatedAt.
  if (channelFilter === 'whatsapp') {
    return resolveLatestActiveWhatsAppOutreach(organizationId, candidateId);
  }

  if (!enrollments.length) return null;

  const campaigns = await OutreachCampaignModel.find({
    _id: { $in: enrollments.map((e) => e.campaignId) },
  })
    .select('channelConfig sequenceSteps')
    .lean();
  const supportedIds = new Set(
    campaigns
      .filter((c) => campaignSupportsChannel(c, channelFilter))
      .map((c) => String(c._id))
  );

  const byCampaign = enrollments.find((e) => supportedIds.has(String(e.campaignId)));
  if (byCampaign) return byCampaign;

  return null;
}

type LatestWhatsAppOutbound = {
  threadId: string;
  campaignId: string;
  enrollmentId: string | null;
  messageId: string;
  sentAt: Date | null;
};

const WHATSAPP_WRAPUP_BODY_RE =
  /shared your responses with our recruiting team/i;

function isWhatsAppWrapUpMessage(msg: {
  providerMessageId?: string | null;
  bodyText?: string | null;
  messageType?: string | null;
}): boolean {
  const providerId = String(msg.providerMessageId || '');
  if (providerId.startsWith('qualification-wrapup:')) return true;
  if (msg.messageType === 'qualification') return true;
  if (WHATSAPP_WRAPUP_BODY_RE.test(String(msg.bodyText || ''))) return true;
  return false;
}

/**
 * Most recent WhatsApp *outreach* outbound for this candidate (includes closed threads).
 * Excludes qualification questions and completion wrap-ups so replies bind to the
 * latest campaign send — not an older "recruiter will be in touch" note.
 */
async function findLatestWhatsAppOutboundForCandidate(
  organizationId: string,
  candidateId: string
): Promise<LatestWhatsAppOutbound | null> {
  const threads = await ConversationThreadModel.find({
    organizationId,
    candidateId,
    channels: 'whatsapp',
    campaignId: { $ne: null },
  })
    .select('_id campaignId enrollmentId')
    .lean();

  if (!threads.length) return null;

  const threadById = new Map(threads.map((t) => [String(t._id), t]));
  const recentOutbounds = await ConversationMessageModel.find({
    organizationId,
    threadId: { $in: threads.map((t) => t._id) },
    channel: 'whatsapp',
    direction: 'outbound',
    messageType: { $nin: ['qualification', 'note', 'system', 'voice_summary'] },
  })
    .sort({ sentAt: -1, createdAt: -1 })
    .select('threadId providerMessageId bodyText messageType sentAt createdAt')
    .limit(40)
    .lean();

  for (const msg of recentOutbounds) {
    if (isWhatsAppWrapUpMessage(msg)) continue;
    const thread = threadById.get(String(msg.threadId));
    if (!thread?.campaignId) continue;
    return {
      threadId: String(thread._id),
      campaignId: String(thread.campaignId),
      enrollmentId: thread.enrollmentId ? String(thread.enrollmentId) : null,
      messageId: String(msg._id),
      sentAt: msg.sentAt || msg.createdAt || null,
    };
  }

  return null;
}

async function isLatestWhatsAppOutboundOwner(
  organizationId: string,
  candidateId: string,
  threadId: string,
  campaignId: string | null | undefined
): Promise<boolean> {
  const latest = await findLatestWhatsAppOutboundForCandidate(
    organizationId,
    candidateId
  );
  if (!latest) return false;
  if (String(threadId) === latest.threadId) return true;
  if (campaignId && String(campaignId) === latest.campaignId) return true;
  return false;
}

/**
 * Latest WhatsApp outreach = enrollment that owns the newest WA campaign outbound
 * (any thread status). If that enrollment already finished qualification but a
 * newer live enrollment exists, prefer the live one. If no outbound exists, only
 * an active/pending/waiting enrollment whose campaign supports WhatsApp.
 */
async function resolveLatestActiveWhatsAppOutreach(
  organizationId: string,
  candidateId: string
) {
  const latest = await findLatestWhatsAppOutboundForCandidate(
    organizationId,
    candidateId
  );

  const loadEnrollment = async (id: string | null | undefined, campaignId?: string) => {
    if (id) {
      const byId = await OutreachEnrollmentModel.findOne({
        _id: id,
        organizationId,
        candidateId,
        status: { $ne: 'cancelled' },
      });
      if (byId) return byId;
    }
    if (!campaignId) return null;
    return OutreachEnrollmentModel.findOne({
      organizationId,
      candidateId,
      campaignId,
      status: { $ne: 'cancelled' },
    }).sort({ updatedAt: -1 });
  };

  const isTerminalEnrollment = (enrollment: {
    status?: string | null;
    qualificationState?: { status?: string | null } | null;
  }) => {
    const status = String(enrollment.status || '');
    const qual = String(enrollment.qualificationState?.status || '');
    return (
      ['completed', 'failed', 'opted_out'].includes(status) ||
      ['qualified', 'rejected'].includes(qual)
    );
  };

  if (latest) {
    const fromLatest = await loadEnrollment(latest.enrollmentId, latest.campaignId);
    if (fromLatest && !isTerminalEnrollment(fromLatest)) {
      return fromLatest;
    }

    // Latest outreach belongs to a finished enrollment — prefer a still-live
    // enrollment that has sent WhatsApp more recently, or any live WA enrollment.
    const liveEnrollments = await OutreachEnrollmentModel.find({
      organizationId,
      candidateId,
      status: { $in: ['active', 'pending', 'waiting', 'replied', 'stopped'] },
    }).sort({ updatedAt: -1 });

    if (liveEnrollments.length) {
      const campaigns = await OutreachCampaignModel.find({
        _id: { $in: liveEnrollments.map((e) => e.campaignId) },
      })
        .select('channelConfig sequenceSteps')
        .lean();
      const supportedIds = new Set(
        campaigns
          .filter((c) => campaignSupportsChannel(c, 'whatsapp'))
          .map((c) => String(c._id))
      );

      const liveSupported = liveEnrollments.filter(
        (e) => supportedIds.has(String(e.campaignId)) && !isTerminalEnrollment(e)
      );

      for (const live of liveSupported) {
        if (String(live.campaignId) === latest.campaignId) {
          // Same campaign finished qual — still the latest outreach owner; caller
          // will reset Q&A if a newer outreach was sent after completion.
          return fromLatest || live;
        }
      }

      // Different live campaign exists — if it has any WA outbound, compare times.
      for (const live of liveSupported) {
        const liveThread = await ConversationThreadModel.findOne({
          organizationId,
          candidateId,
          campaignId: live.campaignId,
          channels: 'whatsapp',
        })
          .select('_id')
          .lean();
        if (!liveThread) continue;
        const liveOutbound = await ConversationMessageModel.findOne({
          organizationId,
          threadId: liveThread._id,
          channel: 'whatsapp',
          direction: 'outbound',
          messageType: { $nin: ['qualification', 'note', 'system', 'voice_summary'] },
        })
          .sort({ sentAt: -1, createdAt: -1 })
          .select('providerMessageId bodyText messageType sentAt createdAt')
          .lean();
        if (!liveOutbound || isWhatsAppWrapUpMessage(liveOutbound)) continue;
        const liveAt = liveOutbound.sentAt || liveOutbound.createdAt;
        const latestAt = latest.sentAt;
        if (liveAt && latestAt && liveAt >= latestAt) {
          return live;
        }
        if (liveAt && !latestAt) return live;
      }

      // Live campaign with no outbound yet should not steal an older finished chat
      // unless there is no usable latest enrollment.
      if (!fromLatest && liveSupported[0]) return liveSupported[0];
    }

    if (fromLatest) return fromLatest;
  }

  // No WhatsApp outreach outbound yet — only currently running enrollments.
  const liveEnrollments = await OutreachEnrollmentModel.find({
    organizationId,
    candidateId,
    status: { $in: ['active', 'pending', 'waiting'] },
  }).sort({ updatedAt: -1 });

  if (!liveEnrollments.length) return null;

  const campaigns = await OutreachCampaignModel.find({
    _id: { $in: liveEnrollments.map((e) => e.campaignId) },
  })
    .select('channelConfig sequenceSteps')
    .lean();
  const supportedIds = new Set(
    campaigns
      .filter((c) => campaignSupportsChannel(c, 'whatsapp'))
      .map((c) => String(c._id))
  );

  return liveEnrollments.find((e) => supportedIds.has(String(e.campaignId))) || null;
}

/** Email and WhatsApp never share a timeline — separate outreaches in the inbox. */
function otherMessagingChannel(
  channel: ConversationChannel
): 'email' | 'whatsapp' | null {
  if (channel === 'email') return 'whatsapp';
  if (channel === 'whatsapp') return 'email';
  return null;
}

function messagingChannelThreadFilter(
  channel: ConversationChannel
): Record<string, unknown> {
  const other = otherMessagingChannel(channel);
  if (!other) return { channels: channel };
  return {
    $and: [{ channels: channel }, { channels: { $nin: [other] } }],
  };
}

async function findOrCreateThread(input: {
  organizationId: string;
  candidateId: string;
  campaignId: string | null;
  enrollmentId: string | null;
  jobId: string | null;
  channel: ConversationChannel;
  provider: MessageProvider;
  providerThreadId: string | null;
}): Promise<ConversationThreadDocument> {
  // Newer outreach deactivates prior open chats for this candidate (A → inactive when B sends).
  if (input.campaignId) {
    const { conversationsService } = await import('./conversations.service.js');
    await conversationsService.closePriorThreadsForCandidate({
      organizationId: input.organizationId,
      candidateId: input.candidateId,
      keepCampaignId: input.campaignId,
    });
  }

  // WhatsApp must belong to a campaign outreach — never reuse orphan phone-only threads.
  if (input.channel === 'whatsapp' && input.campaignId) {
    const existingForCampaign = await ConversationThreadModel.findOne({
      organizationId: input.organizationId,
      candidateId: input.candidateId,
      campaignId: input.campaignId,
      ...messagingChannelThreadFilter(input.channel),
    }).sort({ updatedAt: -1 });

    if (existingForCampaign) {
      if (existingForCampaign.status === 'closed') {
        const ownsLatestOutbound = await isLatestWhatsAppOutboundOwner(
          input.organizationId,
          input.candidateId,
          String(existingForCampaign._id),
          input.campaignId
        );
        const liveEnrollment = await OutreachEnrollmentModel.exists({
          organizationId: input.organizationId,
          candidateId: input.candidateId,
          campaignId: input.campaignId,
          status: { $in: ['active', 'pending', 'waiting'] },
        });
        const mayReopen = ownsLatestOutbound || Boolean(liveEnrollment);
        if (!mayReopen) {
          getLogger()
            .child({ component: 'inbound-sync' })
            .info(
              {
                threadId: String(existingForCampaign._id),
                campaignId: input.campaignId,
                candidateId: input.candidateId,
              },
              'WhatsApp inbound skipped reopen of idle prior-campaign thread'
            );
          throw Object.assign(
            new Error('WhatsApp inbound requires the latest outreach campaign'),
            { code: 'WHATSAPP_NO_ACTIVE_OUTREACH' }
          );
        }
        existingForCampaign.status = 'replied';
        existingForCampaign.automationStatus = 'active';
      }
      if (input.providerThreadId) {
        const has = existingForCampaign.providerThreadIds.some(
          (p) =>
            p.provider === input.provider && p.threadId === input.providerThreadId
        );
        if (!has) {
          existingForCampaign.providerThreadIds.push({
            provider: input.provider,
            threadId: input.providerThreadId,
          });
        }
      }
      if (!existingForCampaign.channels.includes(input.channel)) {
        existingForCampaign.channels.push(input.channel);
      }
      if (input.enrollmentId) {
        existingForCampaign.enrollmentId = new mongoose.Types.ObjectId(
          input.enrollmentId
        );
      }
      if (input.jobId) {
        existingForCampaign.jobId = new mongoose.Types.ObjectId(input.jobId);
      }
      await existingForCampaign.save();
      return existingForCampaign;
    }

    return ConversationThreadModel.create({
      organizationId: input.organizationId,
      candidateId: input.candidateId,
      campaignId: input.campaignId,
      enrollmentId: input.enrollmentId,
      jobId: input.jobId,
      channels: [input.channel],
      status: 'replied',
      unreadCount: 0,
      qualificationStatus: 'pending',
      automationStatus: 'active',
      providerThreadIds: input.providerThreadId
        ? [{ provider: input.provider, threadId: input.providerThreadId }]
        : [],
    });
  }

  if (input.providerThreadId) {
    // WhatsApp uses the sender phone as providerThreadId — not unique across
    // campaigns. Only reuse a thread for the SAME campaign (+ channel).
    const byProviderCandidates = await ConversationThreadModel.find({
      organizationId: input.organizationId,
      providerThreadIds: {
        $elemMatch: { provider: input.provider, threadId: input.providerThreadId },
      },
      status: { $nin: ['closed', 'opted_out'] },
      ...(input.campaignId
        ? { campaignId: input.campaignId }
        : { candidateId: input.candidateId }),
      ...messagingChannelThreadFilter(input.channel),
    })
      .sort({ updatedAt: -1 })
      .limit(20);

    for (const byProvider of byProviderCandidates) {
      // Without a campaign id, never attach WhatsApp by phone alone — that merges outreaches.
      if (!input.campaignId && input.channel === 'whatsapp') {
        continue;
      }
      if (input.campaignId) {
        // Enrollment already channel-filtered; trust this campaign thread.
      } else if (byProvider.campaignId) {
        const campaign = await OutreachCampaignModel.findById(byProvider.campaignId)
          .select('channelConfig sequenceSteps')
          .lean();
        if (!campaignSupportsChannel(campaign, input.channel)) {
          continue;
        }
      }
      if (!byProvider.channels.includes(input.channel)) {
        byProvider.channels.push(input.channel);
      }
      if (input.enrollmentId) {
        byProvider.enrollmentId = new mongoose.Types.ObjectId(input.enrollmentId);
      }
      if (input.jobId) {
        byProvider.jobId = new mongoose.Types.ObjectId(input.jobId);
      }
      await byProvider.save();
      return byProvider;
    }
  }

  const existing = input.campaignId
    ? await ConversationThreadModel.findOne({
        organizationId: input.organizationId,
        candidateId: input.candidateId,
        campaignId: input.campaignId,
        ...messagingChannelThreadFilter(input.channel),
      }).sort({ updatedAt: -1 })
    : input.channel === 'whatsapp'
      ? null // never reuse orphan WhatsApp threads with no campaign
      : await ConversationThreadModel.findOne({
          organizationId: input.organizationId,
          candidateId: input.candidateId,
          campaignId: null,
          ...messagingChannelThreadFilter(input.channel),
        }).sort({ updatedAt: -1 });

  if (existing) {
    // Same campaign+channel thread was closed when a later outreach ran; reopen
    // only when this thread still owns the latest WhatsApp outbound (or non-WA).
    if (existing.status === 'closed') {
      if (input.channel === 'whatsapp') {
        const mayReopen = await isLatestWhatsAppOutboundOwner(
          input.organizationId,
          input.candidateId,
          String(existing._id),
          input.campaignId ||
            (existing.campaignId ? String(existing.campaignId) : null)
        );
        if (!mayReopen) {
          getLogger()
            .child({ component: 'inbound-sync' })
            .info(
              {
                threadId: String(existing._id),
                campaignId: input.campaignId,
                candidateId: input.candidateId,
              },
              'WhatsApp inbound skipped reopen of idle thread'
            );
          throw Object.assign(
            new Error('WhatsApp inbound requires the latest outreach campaign'),
            { code: 'WHATSAPP_NO_ACTIVE_OUTREACH' }
          );
        }
      }
      existing.status = 'replied';
      existing.automationStatus = 'active';
    }
    if (input.providerThreadId) {
      const has = existing.providerThreadIds.some(
        (p) => p.provider === input.provider && p.threadId === input.providerThreadId
      );
      if (!has) {
        existing.providerThreadIds.push({
          provider: input.provider,
          threadId: input.providerThreadId,
        });
      }
    }
    if (!existing.channels.includes(input.channel)) {
      existing.channels.push(input.channel);
    }
    if (input.enrollmentId) {
      existing.enrollmentId = new mongoose.Types.ObjectId(input.enrollmentId);
    }
    if (input.jobId) {
      existing.jobId = new mongoose.Types.ObjectId(input.jobId);
    }
    await existing.save();
    return existing;
  }

  // WhatsApp without a campaign cannot form a valid outreach chat.
  if (input.channel === 'whatsapp' && !input.campaignId) {
    throw Object.assign(new Error('WhatsApp inbound requires an active outreach campaign'), {
      code: 'WHATSAPP_NO_ACTIVE_OUTREACH',
    });
  }

  return ConversationThreadModel.create({
    organizationId: input.organizationId,
    candidateId: input.candidateId,
    campaignId: input.campaignId,
    enrollmentId: input.enrollmentId,
    jobId: input.jobId,
    channels: [input.channel],
    status: 'replied',
    unreadCount: 0,
    qualificationStatus: 'pending',
    automationStatus: 'active',
    providerThreadIds: input.providerThreadId
      ? [{ provider: input.provider, threadId: input.providerThreadId }]
      : [],
  });
}

async function notifyCandidateReply(input: {
  organizationId: string;
  threadId: string;
  campaignId: string | null;
  candidateName: string;
  channelLabel: string;
  preview: string;
  assignedUserId: string | null;
}) {
  let userId = input.assignedUserId;
  if (!userId && input.campaignId) {
    const campaign = await OutreachCampaignModel.findById(input.campaignId)
      .select('ownerUserId')
      .lean();
    userId = campaign?.ownerUserId ? String(campaign.ownerUserId) : null;
  }
  if (!userId) return;

  const { notificationsService } = await import('../notifications/notifications.service.js');
  await notificationsService.create({
    organizationId: input.organizationId,
    userId,
    type: 'candidate_reply',
    severity: 'success',
    title: `${input.candidateName} replied`,
    message: `${input.channelLabel}: ${input.preview}`,
    relatedEntityType: 'conversation',
    relatedEntityId: input.threadId,
    actionUrl: '/dashboard/conversations',
  });
}

/**
 * Idempotent inbound message ingestion used by webhooks + email poll sync.
 */
export async function ingestInboundMessage(input: NormalizedInboundMessage): Promise<{
  duplicate: boolean;
  threadId: string | null;
  messageId: string | null;
}> {
  if (!input.providerMessageId?.trim()) {
    return { duplicate: false, threadId: null, messageId: null };
  }

  // Keep only the new reply text for email (drop Gmail/Outlook quote chains).
  if (input.channel === 'email') {
    input = {
      ...input,
      bodyText: stripEmailQuotedReply(input.bodyText) || input.bodyText,
    };
  }

  const existing = await ConversationMessageModel.findOne({
    organizationId: input.organizationId,
    provider: input.provider,
    providerMessageId: input.providerMessageId,
  }).lean();
  if (existing) {
    return {
      duplicate: true,
      threadId: String(existing.threadId),
      messageId: String(existing._id),
    };
  }

  const candidate = await findCandidate(input);
  if (!candidate) {
    getLogger()
      .child({ component: 'inbound-sync' })
      .warn(
        {
          from: input.from,
          channel: input.channel,
          provider: input.provider,
          organizationId: input.organizationId,
          subject: input.subject,
        },
        'Inbound message unmatched — no candidate for sender'
      );
    await recordAuditEvent({
      action: 'conversation.inbound.unmatched',
      module: 'conversations',
      organizationId: input.organizationId,
      metadata: {
        provider: input.provider,
        from: input.from,
        providerMessageId: input.providerMessageId,
      },
    });
    return { duplicate: false, threadId: null, messageId: null };
  }

  const enrollment = await resolveEnrollment(
    input.organizationId,
    String(candidate._id),
    input.campaignId,
    input.enrollmentId,
    input.channel
  );

  let campaignId = enrollment ? String(enrollment.campaignId) : null;
  let enrollmentId = enrollment ? String(enrollment._id) : null;

  // Only keep an explicit campaignId from the webhook when it supports this channel.
  // WhatsApp: never attach to a stated campaign that is not the latest outbound owner.
  if (!campaignId && input.campaignId) {
    if (input.channel === 'whatsapp') {
      const latest = await findLatestWhatsAppOutboundForCandidate(
        input.organizationId,
        String(candidate._id)
      );
      if (latest && latest.campaignId === input.campaignId) {
        campaignId = input.campaignId;
      }
    } else {
      const stated = await OutreachCampaignModel.findById(input.campaignId)
        .select('channelConfig sequenceSteps')
        .lean();
      // In this branch channel is never WhatsApp (handled above).
      // Email must be supported by the campaign; other channels keep the stated id.
      if (
        input.channel !== 'email' ||
        campaignSupportsChannel(stated, input.channel)
      ) {
        campaignId = input.campaignId;
      }
    }
  }

  if (input.channel === 'whatsapp' && !campaignId) {
    getLogger()
      .child({ component: 'inbound-sync' })
      .warn(
        {
          from: input.from,
          organizationId: input.organizationId,
          candidateId: String(candidate._id),
        },
        'WhatsApp inbound skipped — no latest/active outreach for candidate'
      );
    return { duplicate: false, threadId: null, messageId: null };
  }

  let latestWhatsAppOutbound: LatestWhatsAppOutbound | null = null;
  if (input.channel === 'whatsapp') {
    latestWhatsAppOutbound = await findLatestWhatsAppOutboundForCandidate(
      input.organizationId,
      String(candidate._id)
    );
    getLogger()
      .child({ component: 'inbound-sync' })
      .info(
        {
          from: input.from,
          candidateId: String(candidate._id),
          campaignId,
          enrollmentId,
          latestOutboundThreadId: latestWhatsAppOutbound?.threadId || null,
          latestOutboundCampaignId: latestWhatsAppOutbound?.campaignId || null,
          latestOutboundMessageId: latestWhatsAppOutbound?.messageId || null,
        },
        'WhatsApp inbound bound to campaign'
      );
  }

  let jobId: string | null = null;
  if (campaignId) {
    const campaign = await OutreachCampaignModel.findById(campaignId)
      .select('jobId sequenceSteps')
      .lean();
    jobId = campaign?.jobId ? String(campaign.jobId) : null;
  }

  let thread;
  try {
    // Pin WhatsApp replies to the exact thread that owns the latest outreach send.
    if (
      input.channel === 'whatsapp' &&
      latestWhatsAppOutbound &&
      campaignId &&
      latestWhatsAppOutbound.campaignId === campaignId
    ) {
      const pinned = await ConversationThreadModel.findById(
        latestWhatsAppOutbound.threadId
      );
      if (pinned) {
        if (pinned.status === 'closed' || pinned.status === 'opted_out') {
          pinned.status = 'replied';
          pinned.automationStatus = 'active';
        }
        if (enrollmentId) {
          pinned.enrollmentId = new mongoose.Types.ObjectId(enrollmentId);
        }
        if (input.providerThreadId) {
          const has = pinned.providerThreadIds.some(
            (p) =>
              p.provider === input.provider &&
              p.threadId === input.providerThreadId
          );
          if (!has) {
            pinned.providerThreadIds.push({
              provider: input.provider,
              threadId: input.providerThreadId,
            });
          }
        }
        await pinned.save();
        thread = pinned;
      }
    }

    if (!thread) {
      thread = await findOrCreateThread({
        organizationId: input.organizationId,
        candidateId: String(candidate._id),
        campaignId,
        enrollmentId,
        jobId,
        channel: input.channel,
        provider: input.provider,
        providerThreadId: input.providerThreadId || null,
      });
    }
  } catch (error) {
    if ((error as { code?: string }).code === 'WHATSAPP_NO_ACTIVE_OUTREACH') {
      getLogger()
        .child({ component: 'inbound-sync' })
        .warn(
          { from: input.from, candidateId: String(candidate._id) },
          'WhatsApp inbound skipped — no active outreach thread'
        );
      return { duplicate: false, threadId: null, messageId: null };
    }
    throw error;
  }

  if (input.channel === 'whatsapp') {
    getLogger()
      .child({ component: 'inbound-sync' })
      .info(
        {
          from: input.from,
          candidateId: String(candidate._id),
          campaignId,
          enrollmentId,
          threadId: String(thread._id),
          threadStatus: thread.status,
          pinnedToLatestOutbound: Boolean(
            latestWhatsAppOutbound &&
              String(thread._id) === latestWhatsAppOutbound.threadId
          ),
        },
        'WhatsApp inbound attached to thread'
      );
  }

  // Prefer IDs from the resolved thread only when that campaign supports this
  // inbound channel — never inherit an email-only enrollment onto a WA reply.
  if (!enrollmentId && thread.enrollmentId && thread.campaignId) {
    const threadCampaign = await OutreachCampaignModel.findById(thread.campaignId)
      .select('channelConfig sequenceSteps')
      .lean();
    if (
      (input.channel !== 'email' && input.channel !== 'whatsapp') ||
      campaignSupportsChannel(threadCampaign, input.channel)
    ) {
      enrollmentId = String(thread.enrollmentId);
      if (!campaignId) campaignId = String(thread.campaignId);
    }
  } else if (!campaignId && thread.campaignId) {
    const threadCampaign = await OutreachCampaignModel.findById(thread.campaignId)
      .select('channelConfig sequenceSteps')
      .lean();
    if (
      (input.channel !== 'email' && input.channel !== 'whatsapp') ||
      campaignSupportsChannel(threadCampaign, input.channel)
    ) {
      campaignId = String(thread.campaignId);
    }
  }
  const receivedAt = input.receivedAt || new Date();
  let message;
  try {
    message = await ConversationMessageModel.create({
      organizationId: input.organizationId,
      threadId: thread._id,
      provider: input.provider,
      channel: input.channel,
      direction: 'inbound',
      sender: input.from,
      recipient: input.to || null,
      subject: input.subject || null,
      bodyText: input.bodyText,
      bodyHtml: input.bodyHtml || null,
      providerMessageId: input.providerMessageId,
      providerThreadId: input.providerThreadId || null,
      deliveryStatus: input.deliveryStatus || 'delivered',
      messageType: 'message',
      aiGenerated: false,
      receivedAt,
      sentAt: null,
    });
  } catch (error) {
    // Unique index race → treat as duplicate webhook
    if ((error as { code?: number }).code === 11000) {
      const dup = await ConversationMessageModel.findOne({
        organizationId: input.organizationId,
        provider: input.provider,
        providerMessageId: input.providerMessageId,
      }).lean();
      return {
        duplicate: true,
        threadId: dup ? String(dup.threadId) : String(thread._id),
        messageId: dup ? String(dup._id) : null,
      };
    }
    throw error;
  }

  thread.unreadCount = (thread.unreadCount || 0) + 1;
  thread.lastMessageAt = receivedAt;
  thread.lastCandidateMessageAt = receivedAt;
  thread.lastMessagePreview = input.bodyText.slice(0, 240);
  thread.status = looksLikeOptOut(input.bodyText) ? 'opted_out' : 'replied';
  if (!thread.channels.includes(input.channel)) thread.channels.push(input.channel);
  await thread.save();

  const replyChannel: 'email' | 'whatsapp' | null =
    input.channel === 'email' || input.channel === 'whatsapp' ? input.channel : null;
  let skipClassify = Boolean(input.skipClassify);
  let lockedWinner = false;

  const applyWinnerLock = async (
    target: OutreachEnrollmentDocument
  ): Promise<{ lateLosing: boolean }> => {
    const existingWinner = target.replyState?.channel ?? null;
    const lateLosing = Boolean(
      existingWinner && replyChannel && existingWinner !== replyChannel
    );

    if (lateLosing) {
      const winnerLabel = existingWinner === 'whatsapp' ? 'WhatsApp' : 'Email';
      await ConversationMessageModel.create({
        organizationId: input.organizationId,
        threadId: thread._id,
        provider: 'system',
        channel: 'note',
        direction: 'internal',
        bodyText: `Reply received on inactive channel. Active conversation is on ${winnerLabel}.`,
        providerMessageId: `sys-late-${String(thread._id)}-${Date.now()}`,
        deliveryStatus: 'delivered',
        messageType: 'system',
        sentAt: receivedAt,
      });
      thread.automationStatus = 'stopped';
      if (thread.status !== 'opted_out') thread.status = 'closed';
      await thread.save();
      skipClassify = true;
      return { lateLosing: true };
    }

    const isFirstWinner = !existingWinner && Boolean(replyChannel);
    target.replyState = {
      hasReply: true,
      disposition: looksLikeOptOut(input.bodyText)
        ? 'opt_out'
        : target.replyState?.disposition || null,
      repliedAt: target.replyState?.repliedAt || receivedAt,
      channel: existingWinner || replyChannel,
    };
    target.status = looksLikeOptOut(input.bodyText) ? 'opted_out' : 'replied';
    if (looksLikeOptOut(input.bodyText)) {
      target.contactAvailability = {
        ...target.contactAvailability,
        optedOut: true,
      };
      target.stopReason = 'candidate_opted_out';
    }
    await target.save();

    const campaign = await OutreachCampaignModel.findById(target.campaignId);
    const currentStep = campaign?.sequenceSteps?.[target.currentStepIndex];
    const shouldStop =
      looksLikeOptOut(input.bodyText) ||
      isFirstWinner ||
      (currentStep?.stopOnReply !== false && thread.automationStatus === 'active');

    if (shouldStop) {
      await campaignsService.stopEnrollment(
        String(target._id),
        looksLikeOptOut(input.bodyText) ? 'candidate_opted_out' : 'candidate_replied'
      );
      thread.automationStatus = 'stopped';
      await thread.save();
    }

    if (isFirstWinner && replyChannel && target.campaignId) {
      const { conversationsService } = await import('./conversations.service.js');
      await conversationsService.orphanSiblingThreads({
        organizationId: input.organizationId,
        candidateId: String(candidate._id),
        campaignId: String(target.campaignId),
        keepThreadId: String(thread._id),
        winnerChannel: replyChannel,
      });
      lockedWinner = true;
    }

    return { lateLosing: false };
  };

  if (enrollment) {
    await applyWinnerLock(enrollment);
  } else if (enrollmentId) {
    // Thread was already linked; still mark reply + stop on the linked enrollment.
    const linked = await OutreachEnrollmentModel.findById(enrollmentId);
    if (linked) {
      await applyWinnerLock(linked);
    }
  }

  emitConversationMessageCreated({
    organizationId: input.organizationId,
    threadId: String(thread._id),
    messageId: String(message._id),
    campaignId,
    candidateId: String(candidate._id),
    direction: 'inbound',
    channel: input.channel,
  });
  emitCampaignThreadUpdated({
    organizationId: input.organizationId,
    campaignId,
    threadId: String(thread._id),
    status: thread.status,
    unreadCount: thread.unreadCount,
    qualificationStatus: thread.qualificationStatus,
  });

  const channelLabel =
    input.channel === 'whatsapp'
      ? 'WhatsApp'
      : input.channel === 'email'
        ? 'Email'
        : input.channel;
  const preview = input.bodyText.trim().slice(0, 120) || 'New message';
  void notifyCandidateReply({
    organizationId: input.organizationId,
    threadId: String(thread._id),
    campaignId,
    candidateName: candidate.name || 'Candidate',
    channelLabel: lockedWinner
      ? channelLabel
      : skipClassify
        ? `${channelLabel} (inactive)`
        : channelLabel,
    preview,
    assignedUserId: thread.assignedUserId ? String(thread.assignedUserId) : null,
  }).catch(() => undefined);

  if (!skipClassify) {
    await classifyAndAttach({
      organizationId: input.organizationId,
      threadId: String(thread._id),
      messageId: String(message._id),
      bodyText: input.bodyText,
      subject: input.subject,
      campaignId,
      enrollmentId,
      channel: replyChannel,
    });
  }

  return {
    duplicate: false,
    threadId: String(thread._id),
    messageId: String(message._id),
  };
}

export async function classifyAndAttach(input: {
  organizationId: string;
  threadId: string;
  messageId: string;
  bodyText: string;
  subject?: string | null;
  campaignId?: string | null;
  enrollmentId?: string | null;
  userId?: string | null;
  channel?: 'email' | 'whatsapp' | null;
}) {
  const threadDoc = await ConversationThreadModel.findById(input.threadId)
    .select('campaignId enrollmentId channels')
    .lean();
  let campaignId =
    input.campaignId || (threadDoc?.campaignId ? String(threadDoc.campaignId) : null);
  let enrollmentId =
    input.enrollmentId ||
    (threadDoc?.enrollmentId ? String(threadDoc.enrollmentId) : null);
  const channel: 'email' | 'whatsapp' | null =
    input.channel ||
    (threadDoc?.channels?.includes('email')
      ? 'email'
      : threadDoc?.channels?.includes('whatsapp')
        ? 'whatsapp'
        : null);

  // Never drive outreach qualification on a campaign that does not use this channel
  // (e.g. WhatsApp reply matched to an email-only enrollment via the thread).
  if ((channel === 'email' || channel === 'whatsapp') && campaignId) {
    const linkedCampaign = await OutreachCampaignModel.findById(campaignId)
      .select('channelConfig sequenceSteps')
      .lean();
    if (!campaignSupportsChannel(linkedCampaign, channel)) {
      getLogger()
        .child({ component: 'inbound-sync' })
        .info(
          {
            threadId: input.threadId,
            campaignId,
            enrollmentId,
            channel,
          },
          'Skipping campaign link — campaign does not support inbound channel'
        );
      campaignId = null;
      enrollmentId = null;
    }
  }

  const pipelineLogId = enrollmentId || input.threadId;
  setEmailPipelineLogContextId(pipelineLogId);
  try {
  if (channel === 'email') {
    await logEmailPipeline({ id: pipelineLogId, task: 'message received' });
  }

  const prior = await ConversationMessageModel.find({ threadId: input.threadId })
    .sort({ createdAt: -1 })
    .limit(8)
    .select('direction bodyText')
    .lean();

  let questions: Array<{ id: string; prompt: string }> = [];
  if (campaignId) {
    const campaign = await OutreachCampaignModel.findById(campaignId)
      .select('qualificationConfig')
      .lean();
    questions = (campaign?.qualificationConfig?.questions || []).map((q) => ({
      id: q.id,
      prompt: q.prompt,
    }));
  }

  const result = await classifyConversationReply({
    bodyText: input.bodyText,
    subject: input.subject,
    priorMessages: prior.map((m) => ({
      direction: m.direction,
      bodyText: m.bodyText,
    })),
    qualificationQuestions: questions,
  });

  const existing = await ReplyClassificationModel.findOne({ messageId: input.messageId });
  const doc =
    existing ||
    (await ReplyClassificationModel.create({
      organizationId: input.organizationId,
      threadId: input.threadId,
      messageId: input.messageId,
      interest: result.interest,
      intent: result.intent,
      extractedVariables: result.extractedVariables,
      confidence: result.confidence,
      model: result.model,
      suggestedQualificationStatus: result.suggestedQualificationStatus,
      audit: [
        {
          action: 'ai.classified',
          at: new Date(),
          userId: input.userId || null,
          detail: result.summary,
        },
      ],
    }));

  if (existing) {
    existing.interest = result.interest;
    existing.intent = result.intent;
    existing.extractedVariables = result.extractedVariables;
    existing.confidence = result.confidence;
    (existing as unknown as { model: string }).model = result.model;
    existing.suggestedQualificationStatus = result.suggestedQualificationStatus;
    existing.audit.push({
      action: 'ai.reclassified',
      at: new Date(),
      userId: input.userId ? new mongoose.Types.ObjectId(input.userId) : null,
      detail: result.summary,
    });
    await existing.save();
  }

  const thread = await ConversationThreadModel.findById(input.threadId);
  if (thread) {
    // AI may progress to in_progress / suggest handoff — never final qualified/rejected.
    if (thread.qualificationStatus === 'pending' || thread.qualificationStatus === 'in_progress') {
      if (result.suggestedQualificationStatus === 'handed_off' && result.confidence >= DEFAULT_CLASSIFY_CONFIDENCE_THRESHOLD) {
        thread.qualificationStatus = 'handed_off';
        thread.status = 'handed_off';
      } else if (result.interest !== 'unclear') {
        thread.qualificationStatus = 'in_progress';
      }
      await thread.save();
      emitConversationQualificationUpdated({
        organizationId: input.organizationId,
        threadId: input.threadId,
        qualificationStatus: thread.qualificationStatus,
        interest: result.interest,
        source: 'ai',
      });
    }

    if (result.interest === 'opt_out' || result.intent === 'opt_out') {
      thread.status = 'opted_out';
      thread.automationStatus = 'stopped';
      await thread.save();
      if (enrollmentId) {
        await campaignsService.stopEnrollment(enrollmentId, 'candidate_opted_out');
      }
    }
  }

  if (enrollmentId) {
    const enrollment = await OutreachEnrollmentModel.findById(enrollmentId);
    if (enrollment) {
      const qualSentAlready = await ConversationMessageModel.exists({
        threadId: input.threadId,
        direction: 'outbound',
        messageType: 'qualification',
      });
      if (
        Object.keys(result.extractedVariables).length &&
        !(channel === 'email' && qualSentAlready)
      ) {
        enrollment.qualificationState = {
          status:
            enrollment.qualificationState.status === 'pending'
              ? 'in_progress'
              : enrollment.qualificationState.status,
          answers: {
            ...enrollment.qualificationState.answers,
            ...result.extractedVariables,
          },
        };
      }
      enrollment.replyState = {
        hasReply: true,
        disposition: result.interest,
        repliedAt: enrollment.replyState.repliedAt || new Date(),
        channel:
          enrollment.replyState.channel ||
          (channel === 'email' || channel === 'whatsapp' ? channel : null),
      };
      await enrollment.save();
      await refreshCampaignStats(String(enrollment.campaignId)).catch(() => undefined);
      if (!campaignId) campaignId = String(enrollment.campaignId);
    }
  }

  // Drive qualification Q&A (ask next question / knockout / qualify).
  // Skip when this inbound is on a losing/orphaned channel after winner lock.
  const winnerChannel =
    enrollmentId
      ? (
          await OutreachEnrollmentModel.findById(enrollmentId)
            .select('replyState.channel')
            .lean()
        )?.replyState?.channel
      : null;
  const isLosingChannel =
    Boolean(winnerChannel) &&
    Boolean(channel) &&
    winnerChannel !== channel;

  if (enrollmentId && campaignId && !isLosingChannel) {
    try {
      const campaign = await OutreachCampaignModel.findById(campaignId);
      if (campaign) {
        const qa = await processQualificationAfterReply({
          organizationId: input.organizationId,
          campaign,
          enrollmentId,
          threadId: input.threadId,
          bodyText: input.bodyText,
          interest: result.interest,
          intent: result.intent,
          extractedVariables: result.extractedVariables as Record<string, unknown>,
          preferredChannel:
            (winnerChannel || channel) === 'whatsapp' ? 'whatsapp' : 'email',
        });
        getLogger()
          .child({ component: 'inbound-sync' })
          .info(
            {
              enrollmentId,
              campaignId,
              action: qa.action,
              interest: result.interest,
              channel,
            },
            'Qualification Q&A after reply'
          );
        await logEmailPipeline({
          id: enrollmentId || undefined,
          task: 'qualification Q&A',
          detail: `${qa.action} · ${result.interest}/${result.intent}`,
        });
        if (qa.action.startsWith('ask_failed')) {
          getLogger()
            .child({ component: 'inbound-sync' })
            .warn(
              {
                enrollmentId,
                campaignId,
                action: qa.action,
              },
              'Qualification question send failed after classify'
            );
        }
      } else {
        await logEmailPipeline({
          id: enrollmentId || undefined,
          task: 'qualification Q&A skipped',
          detail: 'campaign not found',
        });
      }
    } catch (error) {
      getLogger()
        .child({ component: 'inbound-sync' })
        .warn({ err: error, enrollmentId }, 'Qualification Q&A failed');
      await logEmailPipeline({
        id: enrollmentId || undefined,
        task: 'qualification Q&A failed',
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  } else {
    await logEmailPipeline({
      id: enrollmentId || input.threadId,
      task: 'qualification Q&A skipped',
      detail: 'no enrollment or campaign',
    });
    getLogger()
      .child({ component: 'inbound-sync' })
      .warn(
        {
          enrollmentId,
          campaignId,
          threadId: input.threadId,
        },
        'Qualification Q&A skipped — missing enrollment or campaign on thread'
      );
  }

  // Huntlo 360 orchestration hook (no-op when campaign is not a 360 workflow)
  try {
    const { huntlo360Service } = await import('../huntlo-360/huntlo360.service.js');
    const threadFor360 = await ConversationThreadModel.findById(input.threadId)
      .select('candidateId')
      .lean();
    if (threadFor360) {
      await huntlo360Service.onConversationSignal({
        organizationId: input.organizationId,
        campaignId: campaignId || null,
        candidateId: String(threadFor360.candidateId),
        enrollmentId,
        interest: result.interest,
        optedOut: result.interest === 'opt_out' || result.intent === 'opt_out',
      });
    }
  } catch {
    // Never break inbound classify on orchestration errors
  }

  return doc;
  } finally {
    setEmailPipelineLogContextId(undefined);
  }
}

export async function updateDeliveryStatus(input: {
  organizationId: string;
  provider: MessageProvider;
  providerMessageId: string;
  deliveryStatus: DeliveryStatus;
  error?: { code: string; message: string } | null;
}) {
  const message = await ConversationMessageModel.findOneAndUpdate(
    {
      organizationId: input.organizationId,
      provider: input.provider,
      providerMessageId: input.providerMessageId,
    },
    {
      $set: {
        deliveryStatus: input.deliveryStatus,
        error: input.error || null,
      },
    },
    { new: true }
  );
  return message;
}
