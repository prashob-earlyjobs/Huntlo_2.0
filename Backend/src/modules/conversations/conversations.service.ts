import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import { UserModel } from '../auth/user.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { OrganizationMemberModel } from '../organizations/member.model.js';
import { OutreachCampaignModel } from '../outreach/campaign.model.js';
import { OutreachEnrollmentModel } from '../outreach/enrollment.model.js';
import { JobModel } from '../jobs/job.model.js';
import { campaignsService } from '../outreach/campaigns.service.js';
import {
  buildCandidateMergeContext,
  mergeMessageTemplate,
} from '../outreach/variables.js';
import {
  isColdOutboundWhatsAppTemplate,
  renderWhatsAppTemplatePreview,
} from '../outreach/whatsapp-template-catalogue.js';
import {
  emitCampaignThreadUpdated,
  emitConversationMessageCreated,
  emitConversationQualificationUpdated,
} from '../../realtime/events.js';
import { recordAuditEvent } from '../../shared/audit/audit.service.js';
import {
  draftConversationReply,
} from '../../providers/gemini/gemini.conversations.js';
import {
  ConversationMessageModel,
  type ConversationMessageDocument,
} from './conversation-message.model.js';
import {
  ConversationThreadModel,
  type ConversationChannel,
  type ConversationThreadDocument,
  type ThreadQualificationStatus,
} from './conversation-thread.model.js';
import {
  ReplyClassificationModel,
  type InterestLabel,
} from './reply-classification.model.js';
import { classifyAndAttach } from './inbound-sync.service.js';
import type {
  aiDraftBodySchema,
  assignBodySchema,
  classifyBodySchema,
  listConversationsQuerySchema,
  listMessagesQuerySchema,
  noteBodySchema,
  qualificationAnswerBodySchema,
  replyBodySchema,
} from './conversations.validation.js';
import type { z } from 'zod';

type ListQuery = z.infer<typeof listConversationsQuerySchema>;
type ReplyInput = z.infer<typeof replyBodySchema>;
type NoteInput = z.infer<typeof noteBodySchema>;
type AssignInput = z.infer<typeof assignBodySchema>;
type AiDraftInput = z.infer<typeof aiDraftBodySchema>;
type ClassifyInput = z.infer<typeof classifyBodySchema>;
type QualAnswerInput = z.infer<typeof qualificationAnswerBodySchema>;
type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;

const CHANNEL_DISPLAY: Record<ConversationChannel, string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  ai_voice: 'AI Voice',
  note: 'System',
};

const INTEREST_TO_REPLY: Record<InterestLabel, string> = {
  interested: 'Interested',
  not_interested: 'Not interested',
  neutral: 'Replied',
  unclear: 'Replied',
  opt_out: 'Not interested',
};

const QUAL_DISPLAY: Record<ThreadQualificationStatus, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  qualified: 'Qualified',
  rejected: 'Rejected',
  handed_off: 'In progress',
  skipped: 'Pending',
};

function relativeTime(date: Date | null | undefined): string {
  if (!date) return '—';
  const mins = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

async function loadThread(organizationId: string, id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'INVALID_ID', 'Invalid conversation id.');
  }
  const thread = await ConversationThreadModel.findOne({ _id: id, organizationId });
  if (!thread) throw new AppError(404, 'CONVERSATION_NOT_FOUND', 'Conversation not found.');
  return thread;
}

function messageToEvent(
  msg: ConversationMessageDocument,
  authorName: string,
  mergeContext?: Record<string, string> | null,
  templateId?: string | null
) {
  const author =
    msg.messageType === 'note'
      ? 'recruiter'
      : msg.messageType === 'system'
        ? 'system'
        : msg.direction === 'inbound'
          ? 'candidate'
          : msg.aiGenerated
            ? 'ai'
            : 'recruiter';

  const deliveryMap: Record<string, string> = {
    sent: 'Sent',
    delivered: 'Delivered',
    read: 'Read',
    failed: 'Failed',
    bounced: 'Failed',
    queued: 'Sent',
  };

  let text = resolveDisplayBody(msg.bodyText, mergeContext, templateId);
  // Legacy outbound voice rows stored the full agent prompt — never show that in the inbox.
  if (
    msg.channel === 'ai_voice' &&
    msg.messageType !== 'voice_summary' &&
    isAgentPromptDump(text)
  ) {
    text = 'AI voice call started';
  }

  const voiceSummary =
    msg.messageType === 'voice_summary'
      ? parseVoiceSummaryMeta(msg.bodyHtml, text)
      : undefined;

  return {
    id: String(msg._id),
    channel: CHANNEL_DISPLAY[msg.channel] || 'System',
    author,
    authorName:
      msg.messageType === 'voice_summary' ? 'Huntlo Voice AI' : authorName,
    subject: msg.subject || undefined,
    text,
    time: relativeTime(msg.receivedAt || msg.sentAt || msg.createdAt),
    delivery: deliveryMap[msg.deliveryStatus] || undefined,
    error: msg.error?.message || undefined,
    attachments: (msg.attachments || []).map((a) => ({
      name: a.name,
      size: a.size || '',
    })),
    voiceSummary,
    sentAt: (msg.sentAt || msg.receivedAt || msg.createdAt).toISOString(),
    direction: msg.direction,
    messageType: msg.messageType,
    provider: msg.provider,
    deliveryStatus: msg.deliveryStatus,
    aiGenerated: msg.aiGenerated,
  };
}

function isAgentPromptDump(text: string): boolean {
  const raw = String(text || '');
  if (raw.length < 400) return false;
  return /Recruitment Screening Agent Prompt|#\s*Roshni|Call objective|jd_role_screening/i.test(
    raw
  );
}

function parseVoiceSummaryMeta(
  bodyHtml: string | null | undefined,
  bodyText: string
): {
  duration: string;
  outcome: string;
  highlights: string[];
  transcript?: string;
} {
  let duration = '—';
  let outcome = 'AI voice call';
  let highlights: string[] = [];
  try {
    const meta = bodyHtml ? (JSON.parse(bodyHtml) as Record<string, unknown>) : null;
    if (meta) {
      if (typeof meta.duration === 'string' && meta.duration.trim()) {
        duration = meta.duration.trim();
      }
      if (typeof meta.outcome === 'string' && meta.outcome.trim()) {
        outcome = meta.outcome.trim();
      }
      if (Array.isArray(meta.highlights)) {
        highlights = meta.highlights
          .map((h) => (typeof h === 'string' ? h.trim() : ''))
          .filter(Boolean)
          .slice(0, 8);
      }
    }
  } catch {
    // bodyHtml may be plain text in older rows
  }
  const transcript = String(bodyText || '').trim();
  return {
    duration,
    outcome,
    highlights,
    ...(transcript ? { transcript } : {}),
  };
}

/** Fill leftover WhatsApp {{1}}/{{2}} tokens for inbox display. */
function resolveDisplayBody(
  bodyText: string,
  mergeContext?: Record<string, string> | null,
  templateId?: string | null
): string {
  const raw = String(bodyText || '');
  if (!/\{\{\s*[0-9a-zA-Z_]+\s*\}\}/.test(raw)) return raw;
  const ctx = mergeContext || {};
  if (templateId && isColdOutboundWhatsAppTemplate(templateId)) {
    const preview = renderWhatsAppTemplatePreview(templateId, ctx);
    if (preview && !/\{\{\s*[0-9a-zA-Z_]+\s*\}\}/.test(preview)) return preview;
  }
  return mergeMessageTemplate(raw, ctx);
}

async function toDisplayConversation(thread: ConversationThreadDocument) {
  const [candidate, campaign, job, assignee, latestClass, messages, notes] =
    await Promise.all([
      SavedCandidateModel.findById(thread.candidateId)
        .select('name email phone currentTitle currentCompany location headline')
        .lean(),
      thread.campaignId
        ? OutreachCampaignModel.findById(thread.campaignId).select('name sequenceSteps').lean()
        : null,
      thread.jobId ? JobModel.findById(thread.jobId).select('title').lean() : null,
      thread.assignedUserId
        ? UserModel.findById(thread.assignedUserId).select('firstName lastName').lean()
        : null,
      ReplyClassificationModel.findOne({ threadId: thread._id }).sort({ createdAt: -1 }).lean(),
      ConversationMessageModel.find({
        threadId: thread._id,
        messageType: { $ne: 'note' },
      })
        .sort({ createdAt: 1 })
        .limit(200),
      ConversationMessageModel.find({
        threadId: thread._id,
        messageType: 'note',
      })
        .sort({ createdAt: -1 })
        .limit(50),
    ]);

  const enrollment = thread.enrollmentId
    ? await OutreachEnrollmentModel.findById(thread.enrollmentId).lean()
    : null;

  const interest = (latestClass?.recruiterOverride?.interest ||
    latestClass?.interest ||
    null) as InterestLabel | null;

  let replyStatus = 'Awaiting reply';
  if (thread.status === 'opted_out') replyStatus = 'Not interested';
  else if (interest) replyStatus = INTEREST_TO_REPLY[interest];
  else if (thread.lastCandidateMessageAt) replyStatus = 'Replied';

  const stepIndex = enrollment?.currentStepIndex ?? 0;
  const totalSteps = campaign?.sequenceSteps?.length || 0;
  const sequenceStep =
    totalSteps > 0 ? `Step ${Math.min(stepIndex + 1, totalSteps)} of ${totalSteps}` : '—';

  const ownerName = assignee
    ? `${assignee.firstName} ${assignee.lastName}`.trim()
    : 'Unassigned';

  const mergeContext = buildCandidateMergeContext(candidate, {
    jobTitle: job?.title || null,
  });
  const openingTemplateId =
    campaign?.sequenceSteps?.find((s) => s.type === 'whatsapp' && s.templateId)?.templateId ||
    campaign?.sequenceSteps?.find((s) => s.templateId)?.templateId ||
    null;

  const events = await Promise.all(
    messages.map(async (msg) => {
      let authorName = candidate?.name || 'Candidate';
      if (msg.direction !== 'inbound') {
        if (msg.aiGenerated) authorName = 'Huntlo AI';
        else if (msg.createdByUserId) {
          const u = await UserModel.findById(msg.createdByUserId)
            .select('firstName lastName')
            .lean();
          authorName = u ? `${u.firstName} ${u.lastName}`.trim() : 'Recruiter';
        } else authorName = 'Recruiter';
      }
      if (msg.messageType === 'system') authorName = 'System';
      return messageToEvent(msg, authorName, mergeContext, openingTemplateId);
    })
  );

  const noteViews = await Promise.all(
    notes.map(async (n) => {
      let author = 'Recruiter';
      if (n.createdByUserId) {
        const u = await UserModel.findById(n.createdByUserId)
          .select('firstName lastName')
          .lean();
        if (u) author = `${u.firstName} ${u.lastName}`.trim();
      }
      return {
        id: String(n._id),
        author,
        text: n.bodyText,
        time: relativeTime(n.createdAt),
      };
    })
  );

  const headlineParts = [
    candidate?.currentTitle || candidate?.headline,
    candidate?.currentCompany,
  ].filter(Boolean);

  return {
    id: String(thread._id),
    candidateId: String(thread.candidateId),
    candidateName: candidate?.name || 'Unknown candidate',
    headline: headlineParts.join(' · ') || 'Candidate',
    location: candidate?.location || '',
    channels: thread.channels
      .filter((c) => c !== 'note')
      .map((c) => CHANNEL_DISPLAY[c])
      .filter(Boolean),
    campaignId: thread.campaignId ? String(thread.campaignId) : '',
    campaignName: campaign?.name || '—',
    jobId: thread.jobId ? String(thread.jobId) : null,
    jobTitle: job?.title || null,
    lastMessage: thread.lastMessagePreview || '',
    lastTime: relativeTime(thread.lastMessageAt),
    unread: (thread.unreadCount || 0) > 0,
    unreadCount: thread.unreadCount || 0,
    replyStatus,
    qualification: QUAL_DISPLAY[thread.qualificationStatus] || 'Pending',
    qualificationStatus: thread.qualificationStatus,
    screeningStatus: enrollment?.screeningState?.status || 'not_started',
    sequenceStep,
    nextAction:
      thread.automationStatus === 'stopped'
        ? 'Automation stopped'
        : thread.status === 'handed_off'
          ? 'Recruiter handoff'
          : 'Continue conversation',
    email: candidate?.email || null,
    phone: candidate?.phone || null,
    notes: noteViews,
    events,
    status: thread.status,
    automationStatus: thread.automationStatus,
    assignedUserId: thread.assignedUserId ? String(thread.assignedUserId) : null,
    assignedUserName: ownerName,
    enrollmentId: thread.enrollmentId ? String(thread.enrollmentId) : null,
    lastClassification: latestClass
      ? {
          interest: latestClass.recruiterOverride?.interest || latestClass.interest,
          intent: latestClass.recruiterOverride?.intent || latestClass.intent,
          confidence: latestClass.confidence,
          model: latestClass.model,
          extractedVariables: latestClass.extractedVariables,
          recruiterReviewedAt: latestClass.recruiterReviewedAt?.toISOString() || null,
          suggestedQualificationStatus: latestClass.suggestedQualificationStatus,
        }
      : null,
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
  };
}

export const conversationsService = {
  async list(organizationId: string, query: ListQuery) {
    const filter: Record<string, unknown> = { organizationId };
    if (query.status) filter.status = query.status;
    if (query.qualificationStatus) filter.qualificationStatus = query.qualificationStatus;
    if (query.campaignId) filter.campaignId = query.campaignId;
    if (query.candidateId) filter.candidateId = query.candidateId;
    if (query.jobId) filter.jobId = query.jobId;
    if (query.assignedUserId) filter.assignedUserId = query.assignedUserId;
    if (query.unreadOnly) filter.unreadCount = { $gt: 0 };
    if (query.channel) filter.channels = query.channel;

    const skip = (query.page - 1) * query.limit;
    let threads = await ConversationThreadModel.find(filter)
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(query.limit);

    if (query.q) {
      const q = query.q.toLowerCase();
      const candidateIds = await SavedCandidateModel.find({
        organizationId,
        name: { $regex: query.q, $options: 'i' },
      })
        .select('_id')
        .lean();
      const idSet = new Set(candidateIds.map((c) => String(c._id)));
      threads = threads.filter(
        (t) =>
          idSet.has(String(t.candidateId)) ||
          (t.lastMessagePreview || '').toLowerCase().includes(q)
      );
    }

    const total = await ConversationThreadModel.countDocuments(filter);
    const items = await Promise.all(threads.map((t) => toDisplayConversation(t)));

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async get(organizationId: string, id: string) {
    const thread = await loadThread(organizationId, id);
    return toDisplayConversation(thread);
  },

  async listMessages(organizationId: string, id: string, query: ListMessagesQuery) {
    await loadThread(organizationId, id);
    const skip = (query.page - 1) * query.limit;
    const [docs, total] = await Promise.all([
      ConversationMessageModel.find({ organizationId, threadId: id })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(query.limit),
      ConversationMessageModel.countDocuments({ organizationId, threadId: id }),
    ]);

    return {
      items: docs.map((msg) => ({
        id: String(msg._id),
        provider: msg.provider,
        channel: msg.channel,
        direction: msg.direction,
        sender: msg.sender,
        recipient: msg.recipient,
        subject: msg.subject,
        bodyText: msg.bodyText,
        bodyHtml: msg.bodyHtml,
        deliveryStatus: msg.deliveryStatus,
        messageType: msg.messageType,
        aiGenerated: msg.aiGenerated,
        attachments: msg.attachments,
        sentAt: msg.sentAt?.toISOString() || null,
        receivedAt: msg.receivedAt?.toISOString() || null,
        createdAt: msg.createdAt.toISOString(),
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async reply(organizationId: string, userId: string, id: string, input: ReplyInput) {
    const thread = await loadThread(organizationId, id);
    const channel = (input.channel ||
      thread.channels.find((c) => c !== 'note') ||
      'email') as ConversationChannel;

    const now = new Date();
    const message = await ConversationMessageModel.create({
      organizationId,
      threadId: thread._id,
      provider: 'recruiter',
      channel,
      direction: 'outbound',
      sender: null,
      recipient: null,
      subject: input.subject || null,
      bodyText: input.text,
      bodyHtml: input.html || null,
      providerMessageId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      providerThreadId: null,
      deliveryStatus: 'sent',
      messageType: 'message',
      aiGenerated: false,
      sentAt: now,
      createdByUserId: userId,
    });

    thread.lastMessageAt = now;
    thread.lastRecruiterMessageAt = now;
    thread.lastMessagePreview = input.text.slice(0, 240);
    thread.unreadCount = 0;
    if (thread.status === 'replied' || thread.status === 'awaiting_reply') {
      thread.status = 'awaiting_reply';
    }
    if (!thread.channels.includes(channel)) thread.channels.push(channel);
    await thread.save();

    emitConversationMessageCreated({
      organizationId,
      threadId: id,
      messageId: String(message._id),
      campaignId: thread.campaignId ? String(thread.campaignId) : null,
      candidateId: String(thread.candidateId),
      direction: 'outbound',
      channel,
    });
    emitCampaignThreadUpdated({
      organizationId,
      campaignId: thread.campaignId ? String(thread.campaignId) : null,
      threadId: id,
      status: thread.status,
      unreadCount: thread.unreadCount,
      qualificationStatus: thread.qualificationStatus,
    });

    return toDisplayConversation(thread);
  },

  async addNote(organizationId: string, userId: string, id: string, input: NoteInput) {
    const thread = await loadThread(organizationId, id);
    const now = new Date();
    await ConversationMessageModel.create({
      organizationId,
      threadId: thread._id,
      provider: 'recruiter',
      channel: 'note',
      direction: 'internal',
      sender: null,
      recipient: null,
      subject: null,
      bodyText: input.text,
      bodyHtml: null,
      providerMessageId: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      deliveryStatus: 'delivered',
      messageType: 'note',
      aiGenerated: false,
      sentAt: now,
      createdByUserId: userId,
    });
    if (!thread.channels.includes('note')) {
      thread.channels.push('note');
      await thread.save();
    }
    return toDisplayConversation(thread);
  },

  async assign(organizationId: string, userId: string, id: string, input: AssignInput) {
    const thread = await loadThread(organizationId, id);
    if (input.assignedUserId) {
      const member = await OrganizationMemberModel.findOne({
        organizationId,
        userId: input.assignedUserId,
        status: 'active',
      }).lean();
      if (!member) {
        throw new AppError(400, 'ASSIGNEE_INVALID', 'Assignee is not an active org member.');
      }
      thread.assignedUserId = new mongoose.Types.ObjectId(input.assignedUserId);
    } else {
      thread.assignedUserId = null;
    }
    await thread.save();
    await recordAuditEvent({
      action: 'conversation.assigned',
      module: 'conversations',
      organizationId,
      userId,
      metadata: { threadId: id, assignedUserId: input.assignedUserId },
    });
    return toDisplayConversation(thread);
  },

  async markRead(organizationId: string, id: string) {
    const thread = await loadThread(organizationId, id);
    thread.unreadCount = 0;
    await thread.save();
    emitCampaignThreadUpdated({
      organizationId,
      campaignId: thread.campaignId ? String(thread.campaignId) : null,
      threadId: id,
      status: thread.status,
      unreadCount: 0,
      qualificationStatus: thread.qualificationStatus,
    });
    return toDisplayConversation(thread);
  },

  async markUnread(organizationId: string, id: string) {
    const thread = await loadThread(organizationId, id);
    thread.unreadCount = Math.max(1, thread.unreadCount || 0);
    await thread.save();
    return toDisplayConversation(thread);
  },

  async stopAutomation(organizationId: string, userId: string, id: string) {
    const thread = await loadThread(organizationId, id);
    thread.automationStatus = 'stopped';
    await thread.save();
    if (thread.enrollmentId) {
      await campaignsService.stopEnrollment(
        String(thread.enrollmentId),
        'recruiter_stopped'
      );
    }
    await ConversationMessageModel.create({
      organizationId,
      threadId: thread._id,
      provider: 'system',
      channel: 'note',
      direction: 'internal',
      bodyText: 'Sequence automation stopped by recruiter.',
      providerMessageId: `sys-stop-${Date.now()}`,
      deliveryStatus: 'delivered',
      messageType: 'system',
      sentAt: new Date(),
      createdByUserId: userId,
    });
    emitCampaignThreadUpdated({
      organizationId,
      campaignId: thread.campaignId ? String(thread.campaignId) : null,
      threadId: id,
      status: thread.status,
      unreadCount: thread.unreadCount,
      qualificationStatus: thread.qualificationStatus,
    });
    return toDisplayConversation(thread);
  },

  async resumeAutomation(organizationId: string, userId: string, id: string) {
    const thread = await loadThread(organizationId, id);
    thread.automationStatus = 'active';
    if (thread.status === 'handed_off') thread.status = 'open';
    await thread.save();

    if (thread.enrollmentId) {
      const enrollment = await OutreachEnrollmentModel.findById(thread.enrollmentId);
      if (
        enrollment &&
        enrollment.stopReason === 'recruiter_stopped' &&
        ['stopped', 'waiting'].includes(enrollment.status)
      ) {
        enrollment.status = 'active';
        enrollment.stopReason = null;
        enrollment.nextActionAt = new Date();
        await enrollment.save();
      }
    }

    await ConversationMessageModel.create({
      organizationId,
      threadId: thread._id,
      provider: 'system',
      channel: 'note',
      direction: 'internal',
      bodyText: 'Sequence automation resumed by recruiter.',
      providerMessageId: `sys-resume-${Date.now()}`,
      deliveryStatus: 'delivered',
      messageType: 'system',
      sentAt: new Date(),
      createdByUserId: userId,
    });
    return toDisplayConversation(thread);
  },

  async aiDraft(organizationId: string, id: string, input: AiDraftInput) {
    const thread = await loadThread(organizationId, id);
    const candidate = await SavedCandidateModel.findById(thread.candidateId)
      .select('name')
      .lean();
    const job = thread.jobId
      ? await JobModel.findById(thread.jobId)
          .select(
            'title descriptionHtml locations workplaceType requirements requiredSkills salaryMin salaryMax salaryCurrency salaryVisibility'
          )
          .lean()
      : null;
    const lastInbound = await ConversationMessageModel.findOne({
      threadId: thread._id,
      direction: 'inbound',
    })
      .sort({ createdAt: -1 })
      .lean();

    const description = String(job?.descriptionHtml || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const draft = await draftConversationReply({
      tone: input.tone,
      channel: input.channel,
      candidateName: candidate?.name,
      jobTitle: job?.title || null,
      jobDescription: description || null,
      lastCandidateMessage: lastInbound?.bodyText || null,
      instructions: input.instructions,
    });

    return draft;
  },

  async classify(organizationId: string, userId: string, id: string, input: ClassifyInput) {
    const thread = await loadThread(organizationId, id);

    if (input.override) {
      // Human override path — may set final qualification statuses.
      const messageId =
        input.messageId ||
        (
          await ConversationMessageModel.findOne({
            threadId: thread._id,
            direction: 'inbound',
          })
            .sort({ createdAt: -1 })
            .select('_id')
            .lean()
        )?._id;

      if (!messageId) {
        throw new AppError(400, 'NO_MESSAGE', 'No inbound message to classify.');
      }

      let classification = await ReplyClassificationModel.findOne({ messageId });
      if (!classification) {
        classification = await ReplyClassificationModel.create({
          organizationId,
          threadId: thread._id,
          messageId,
          interest: input.override.interest || 'unclear',
          intent: input.override.intent || 'other',
          extractedVariables: {},
          confidence: 1,
          model: 'recruiter-override',
          audit: [],
        });
      }

      classification.recruiterReviewedAt = new Date();
      classification.recruiterOverride = {
        interest: input.override.interest || null,
        intent: input.override.intent || null,
        qualificationStatus: input.override.qualificationStatus || null,
        note: input.override.note || null,
        userId: new mongoose.Types.ObjectId(userId),
        at: new Date(),
      };
      if (input.override.interest) classification.interest = input.override.interest;
      if (input.override.intent) classification.intent = input.override.intent;
      classification.audit.push({
        action: 'recruiter.override',
        at: new Date(),
        userId: new mongoose.Types.ObjectId(userId),
        detail: input.override.note || 'Human override applied',
      });
      await classification.save();

      if (input.override.qualificationStatus) {
        thread.qualificationStatus = input.override.qualificationStatus;
        if (input.override.qualificationStatus === 'qualified') {
          thread.status = 'closed';
        } else if (input.override.qualificationStatus === 'rejected') {
          thread.status = 'closed';
          if (thread.enrollmentId) {
            await campaignsService.stopEnrollment(
              String(thread.enrollmentId),
              'qualification_rejected'
            );
          }
        } else if (input.override.qualificationStatus === 'handed_off') {
          thread.status = 'handed_off';
        }
        await thread.save();
        emitConversationQualificationUpdated({
          organizationId,
          threadId: id,
          qualificationStatus: thread.qualificationStatus,
          interest: classification.interest,
          source: 'recruiter',
        });
      }

      await recordAuditEvent({
        action: 'conversation.classification.override',
        module: 'conversations',
        organizationId,
        userId,
        metadata: { threadId: id, override: input.override },
      });

      return {
        classification: {
          interest: classification.interest,
          intent: classification.intent,
          confidence: classification.confidence,
          model: classification.model,
          recruiterReviewedAt: classification.recruiterReviewedAt?.toISOString() || null,
          override: classification.recruiterOverride,
        },
        conversation: await toDisplayConversation(thread),
      };
    }

    const message = input.messageId
      ? await ConversationMessageModel.findOne({
          _id: input.messageId,
          threadId: thread._id,
          organizationId,
        })
      : await ConversationMessageModel.findOne({
          threadId: thread._id,
          direction: 'inbound',
        }).sort({ createdAt: -1 });

    if (!message) {
      throw new AppError(400, 'NO_MESSAGE', 'No inbound message to classify.');
    }

    const classification = await classifyAndAttach({
      organizationId,
      threadId: id,
      messageId: String(message._id),
      bodyText: message.bodyText,
      subject: message.subject,
      campaignId: thread.campaignId ? String(thread.campaignId) : null,
      enrollmentId: thread.enrollmentId ? String(thread.enrollmentId) : null,
      userId,
    });

    const refreshed = await loadThread(organizationId, id);
    return {
      classification: {
        interest: classification.interest,
        intent: classification.intent,
        confidence: classification.confidence,
        model: classification.model,
        extractedVariables: classification.extractedVariables,
        suggestedQualificationStatus: classification.suggestedQualificationStatus,
        recruiterReviewedAt: null,
      },
      conversation: await toDisplayConversation(refreshed),
    };
  },

  async qualificationAnswer(
    organizationId: string,
    userId: string,
    id: string,
    input: QualAnswerInput
  ) {
    const thread = await loadThread(organizationId, id);
    if (!thread.enrollmentId) {
      throw new AppError(400, 'NO_ENROLLMENT', 'Thread has no campaign enrollment.');
    }
    const enrollment = await OutreachEnrollmentModel.findById(thread.enrollmentId);
    if (!enrollment) {
      throw new AppError(404, 'ENROLLMENT_NOT_FOUND', 'Enrollment not found.');
    }

    enrollment.qualificationState = {
      status: 'in_progress',
      answers: {
        ...enrollment.qualificationState.answers,
        [input.questionId]: {
          value: input.answer,
          source: input.source,
          at: new Date().toISOString(),
          byUserId: userId,
        },
      },
    };
    await enrollment.save();

    if (thread.qualificationStatus === 'pending') {
      thread.qualificationStatus = 'in_progress';
      await thread.save();
    }

    if (thread.campaignId) {
      const campaign = await OutreachCampaignModel.findById(thread.campaignId);
      const required = campaign?.qualificationConfig?.questions || [];
      const current = required.find((q) => q.id === input.questionId);
      if (current) {
        const { evaluateKnockout } = await import(
          '../outreach/qualification-qa.service.js'
        );
        const knockout = evaluateKnockout(
          {
            id: current.id,
            prompt: current.prompt,
            answerType: current.answerType,
            knockout: current.knockout,
            knockoutCondition: current.knockoutCondition,
          },
          input.answer
        );
        if (knockout === 'fail') {
          enrollment.qualificationState = {
            status: 'rejected',
            answers: enrollment.qualificationState.answers,
          };
          await enrollment.save();
          thread.qualificationStatus = 'rejected';
          thread.status = 'closed';
          await thread.save();
        } else if (
          input.source === 'recruiter' &&
          required.length > 0 &&
          campaign?.qualificationConfig?.enabled
        ) {
          const answered = required.every(
            (q) => enrollment.qualificationState.answers[q.id] !== undefined
          );
          if (answered) {
            const handoff = String(
              campaign.qualificationConfig.takeoverCondition || ''
            ).includes('After qualification');
            enrollment.qualificationState = {
              status: handoff ? 'in_progress' : 'qualified',
              answers: enrollment.qualificationState.answers,
            };
            if (campaign.qualificationConfig.autoScreening && !handoff) {
              enrollment.screeningState = {
                ...enrollment.screeningState,
                status: 'scheduled',
              };
            }
            await enrollment.save();
            thread.qualificationStatus = handoff ? 'handed_off' : 'qualified';
            thread.status = 'handed_off';
            await thread.save();
          }
        }
      }
    }

    emitConversationQualificationUpdated({
      organizationId,
      threadId: id,
      qualificationStatus: thread.qualificationStatus,
      source: input.source === 'ai' ? 'ai' : 'recruiter',
    });

    await recordAuditEvent({
      action: 'conversation.qualification.answer',
      module: 'conversations',
      organizationId,
      userId,
      metadata: {
        threadId: id,
        questionId: input.questionId,
        source: input.source,
      },
    });

    return toDisplayConversation(thread);
  },

  /** Ensure a thread exists for an enrollment (outbound send hook). */
  async ensureThreadForEnrollment(input: {
    organizationId: string;
    candidateId: string;
    campaignId: string;
    enrollmentId: string;
    jobId?: string | null;
    channel: ConversationChannel;
  }) {
    let thread = await ConversationThreadModel.findOne({
      organizationId: input.organizationId,
      candidateId: input.candidateId,
      campaignId: input.campaignId,
    });
    if (thread) return thread;
    return ConversationThreadModel.create({
      organizationId: input.organizationId,
      candidateId: input.candidateId,
      campaignId: input.campaignId,
      enrollmentId: input.enrollmentId,
      jobId: input.jobId || null,
      channels: [input.channel],
      status: 'awaiting_reply',
      unreadCount: 0,
      qualificationStatus: 'pending',
      automationStatus: 'active',
    });
  },
};
