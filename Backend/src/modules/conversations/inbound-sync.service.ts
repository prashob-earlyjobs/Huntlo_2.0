import mongoose from 'mongoose';

import { getLogger } from '../../config/logger.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { OutreachCampaignModel } from '../outreach/campaign.model.js';
import { OutreachEnrollmentModel } from '../outreach/enrollment.model.js';
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
} from '../../providers/gemini/gemini.conversations.js';
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

async function resolveEnrollment(
  organizationId: string,
  candidateId: string,
  campaignId?: string | null,
  enrollmentId?: string | null
) {
  if (enrollmentId && mongoose.Types.ObjectId.isValid(enrollmentId)) {
    const enrollment = await OutreachEnrollmentModel.findOne({
      _id: enrollmentId,
      organizationId,
      candidateId,
    });
    if (enrollment) return enrollment;
  }
  if (campaignId && mongoose.Types.ObjectId.isValid(campaignId)) {
    return OutreachEnrollmentModel.findOne({
      organizationId,
      campaignId,
      candidateId,
      status: { $nin: ['completed', 'cancelled'] },
    }).sort({ updatedAt: -1 });
  }
  // Include stopped — first reply often stops the enrollment (stopOnReply),
  // and follow-up emails must still attach to the same campaign thread.
  return OutreachEnrollmentModel.findOne({
    organizationId,
    candidateId,
    status: { $in: ['active', 'waiting', 'pending', 'replied', 'stopped'] },
  }).sort({ updatedAt: -1 });
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
  if (input.providerThreadId) {
    const byProvider = await ConversationThreadModel.findOne({
      organizationId: input.organizationId,
      providerThreadIds: {
        $elemMatch: { provider: input.provider, threadId: input.providerThreadId },
      },
    });
    if (byProvider) return byProvider;
  }

  const existing = await ConversationThreadModel.findOne({
    organizationId: input.organizationId,
    candidateId: input.candidateId,
    campaignId: input.campaignId,
  }).sort({ updatedAt: -1 });

  if (existing) {
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
    if (!existing.enrollmentId && input.enrollmentId) {
      existing.enrollmentId = new mongoose.Types.ObjectId(input.enrollmentId);
    }
    await existing.save();
    return existing;
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
    input.enrollmentId
  );

  let campaignId = enrollment ? String(enrollment.campaignId) : input.campaignId || null;
  let jobId: string | null = null;
  if (campaignId) {
    const campaign = await OutreachCampaignModel.findById(campaignId)
      .select('jobId sequenceSteps')
      .lean();
    jobId = campaign?.jobId ? String(campaign.jobId) : null;
  }

  const thread = await findOrCreateThread({
    organizationId: input.organizationId,
    candidateId: String(candidate._id),
    campaignId,
    enrollmentId: enrollment ? String(enrollment._id) : null,
    jobId,
    channel: input.channel,
    provider: input.provider,
    providerThreadId: input.providerThreadId || null,
  });

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

  if (enrollment) {
    enrollment.replyState = {
      hasReply: true,
      disposition: looksLikeOptOut(input.bodyText) ? 'opt_out' : enrollment.replyState?.disposition || null,
      repliedAt: receivedAt,
    };
    enrollment.status = looksLikeOptOut(input.bodyText) ? 'opted_out' : 'replied';
    if (looksLikeOptOut(input.bodyText)) {
      enrollment.contactAvailability = {
        ...enrollment.contactAvailability,
        optedOut: true,
      };
      enrollment.stopReason = 'candidate_opted_out';
    }
    await enrollment.save();

    const campaign = await OutreachCampaignModel.findById(enrollment.campaignId);
    const currentStep = campaign?.sequenceSteps?.[enrollment.currentStepIndex];
    const shouldStop =
      looksLikeOptOut(input.bodyText) ||
      (currentStep?.stopOnReply !== false && thread.automationStatus === 'active');

    if (shouldStop) {
      await campaignsService.stopEnrollment(
        String(enrollment._id),
        looksLikeOptOut(input.bodyText) ? 'candidate_opted_out' : 'candidate_replied'
      );
      thread.automationStatus = 'stopped';
      await thread.save();
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

  if (!input.skipClassify) {
    await classifyAndAttach({
      organizationId: input.organizationId,
      threadId: String(thread._id),
      messageId: String(message._id),
      bodyText: input.bodyText,
      subject: input.subject,
      campaignId,
      enrollmentId: enrollment ? String(enrollment._id) : null,
      channel: input.channel === 'email' || input.channel === 'whatsapp' ? input.channel : null,
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
  const prior = await ConversationMessageModel.find({ threadId: input.threadId })
    .sort({ createdAt: -1 })
    .limit(8)
    .select('direction bodyText')
    .lean();

  let questions: Array<{ id: string; prompt: string }> = [];
  if (input.campaignId) {
    const campaign = await OutreachCampaignModel.findById(input.campaignId)
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
      if (input.enrollmentId) {
        await campaignsService.stopEnrollment(input.enrollmentId, 'candidate_opted_out');
      }
    }
  }

  if (input.enrollmentId) {
    const enrollment = await OutreachEnrollmentModel.findById(input.enrollmentId);
    if (enrollment) {
      if (Object.keys(result.extractedVariables).length) {
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
      };
      await enrollment.save();
      await refreshCampaignStats(String(enrollment.campaignId)).catch(() => undefined);
    }
  }

  // Drive qualification Q&A (ask next question / knockout / qualify).
  if (input.enrollmentId && input.campaignId) {
    try {
      const campaign = await OutreachCampaignModel.findById(input.campaignId);
      if (campaign) {
        await processQualificationAfterReply({
          organizationId: input.organizationId,
          campaign,
          enrollmentId: input.enrollmentId,
          threadId: input.threadId,
          bodyText: input.bodyText,
          interest: result.interest,
          intent: result.intent,
          extractedVariables: result.extractedVariables as Record<string, unknown>,
          preferredChannel: input.channel || null,
        });
      }
    } catch (error) {
      getLogger()
        .child({ component: 'inbound-sync' })
        .warn({ err: error, enrollmentId: input.enrollmentId }, 'Qualification Q&A failed');
    }
  }

  // Huntlo 360 orchestration hook (no-op when campaign is not a 360 workflow)
  try {
    const { huntlo360Service } = await import('../huntlo-360/huntlo360.service.js');
    const threadDoc = await ConversationThreadModel.findById(input.threadId)
      .select('candidateId')
      .lean();
    if (threadDoc) {
      await huntlo360Service.onConversationSignal({
        organizationId: input.organizationId,
        campaignId: input.campaignId || null,
        candidateId: String(threadDoc.candidateId),
        enrollmentId: input.enrollmentId,
        interest: result.interest,
        optedOut: result.interest === 'opt_out' || result.intent === 'opt_out',
      });
    }
  } catch {
    // Never break inbound classify on orchestration errors
  }

  return doc;
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
