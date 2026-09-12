import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';
import type { Readable } from 'node:stream';

import { getLogger } from '../../config/logger.js';
import { AppError } from '../../shared/errors/app-error.js';
import { escapeRegex } from '../../shared/validation/regex.js';
import {
  isGcsMediaStorageEnabled,
  openWhatsAppMediaGcsStream,
} from '../../providers/gcs/gcs.storage.js';
import {
  getWhatsAppInboundMediaDir,
  resolveWhatsAppInboundMediaPath,
} from '../../providers/meta-whatsapp/meta.media.js';
import { UserModel } from '../auth/user.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { lookupProfilePictures } from '../candidates/pool.service.js';
import { OrganizationMemberModel } from '../organizations/member.model.js';
import {
  mapModeToCampaignType,
  OutreachCampaignModel,
} from '../outreach/campaign.model.js';
import { deriveEnrollmentPipelineStatus } from '../outreach/enrollment-pipeline-status.js';
import { OutreachEnrollmentModel } from '../outreach/enrollment.model.js';
import { enrollQualifiedCandidateInCampaignScreening } from '../outreach/outreach-auto-screening.service.js';
import { JobModel } from '../jobs/job.model.js';
import { campaignsService } from '../outreach/campaigns.service.js';
import { hydrateCandidateMergeFields } from '../outreach/candidate-merge-hydrate.js';
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
import { stripEmailQuotedReply } from '../../providers/email/strip-quoted-reply.js';
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
import {
  findHcgGmailConversation,
  hcgGmailLastPreview,
  hcgGmailMessagesToEvents,
  hcgGmailStatus,
  overlayHcgGmailOnListItems,
} from './hcg-gmail-overlay.js';
import {
  findHcgZohoConversation,
  hcgZohoLastPreview,
  hcgZohoMessagesToEvents,
  hcgZohoStatus,
  overlayHcgZohoOnListItems,
} from './hcg-zoho-overlay.js';
import { resolveCampaignEmailVendor } from './campaign-email-vendor.js';
import {
  findHcgWhatsappConversation,
  hcgWhatsappLastPreview,
  hcgWhatsappMessagesToEvents,
  hcgWhatsappStatus,
  overlayHcgWhatsappOnListItems,
} from './hcg-whatsapp-overlay.js';
import {
  findHcgHunarCommunication,
  findHcgHunarCommunicationByCampaignIds,
  hcgHunarLastPreview,
  hcgHunarOverallAiStatus,
  hcgHunarStatus,
  hcgHunarToEvents,
  overlayHcgHunarOnListItems,
} from './hcg-hunar-overlay.js';
import {
  findHcgZyvkaCommunication,
  findHcgZyvkaCommunicationByCampaignIds,
  hcgZyvkaLastPreview,
  hcgZyvkaOverallAiStatus,
  hcgZyvkaStatus,
  hcgZyvkaToEvents,
  overlayHcgZyvkaOnListItems,
} from './hcg-zyvka-overlay.js';
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
  interested: 'Answered',
  not_interested: 'Not interested',
  neutral: 'Answered',
  unclear: 'Answered',
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
  // Inbound email replies often include the full Gmail/Outlook quote chain —
  // show only the candidate's new text in the conversation bubble.
  if (msg.channel === 'email' && msg.direction === 'inbound') {
    text = stripEmailQuotedReply(text);
  }
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
      url: a.url || null,
      mimeType: a.mimeType || null,
      kind: a.kind || null,
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

/**
 * HCG Email/WhatsApp overlays replace channel history from the gateway DB.
 * Keep local-only rows (system notices, notes, interview invites) so they still
 * appear alongside gateway text + screening recordings.
 */
function isSchedulingInviteText(text: string | null | undefined): boolean {
  return /scheduling link|book a time using this scheduling|calendly\.com|schedule your (next )?interview/i.test(
    String(text || '')
  );
}

function shouldKeepLocalEventAlongsideHcg(
  event: {
    channel?: string;
    provider?: string | null;
    messageType?: string | null;
    text?: string | null;
  },
  hcgChannel: 'Email' | 'WhatsApp'
): boolean {
  if (event.channel !== hcgChannel) return true;
  if (event.provider === 'system') return true;
  if (
    event.messageType === 'system' ||
    event.messageType === 'note' ||
    event.messageType === 'qualification'
  ) {
    return true;
  }
  return false;
}

/** Collapse duplicate interview-invite bubbles (local + HCG / synthetic). */
function dedupeSchedulingInviteEvents<
  T extends {
    id: string;
    text?: string | null;
    provider?: string | null;
    direction?: string | null;
    sentAt?: string | null;
  },
>(events: T[]): T[] {
  const inviteIndexes: number[] = [];
  for (let i = 0; i < events.length; i += 1) {
    const event = events[i]!;
    if (event.direction === 'inbound') continue;
    if (isSchedulingInviteText(event.text)) inviteIndexes.push(i);
  }
  if (inviteIndexes.length <= 1) return events;

  let keepIdx = inviteIndexes[inviteIndexes.length - 1]!;
  for (const i of inviteIndexes) {
    const event = events[i]!;
    const text = String(event.text || '');
    const hasLink = /https?:\/\//i.test(text) || /calendly\.com/i.test(text);
    if (event.provider === 'system' && hasLink) {
      keepIdx = i;
      break;
    }
    if (event.provider === 'system') keepIdx = i;
    else if (hasLink && events[keepIdx]?.provider !== 'system') keepIdx = i;
  }

  const drop = new Set(inviteIndexes.filter((i) => i !== keepIdx));
  return events.filter((_, i) => !drop.has(i));
}

function mergeSchedulingInviteIntoEvents<
  T extends {
    id: string;
    channel: string;
    text?: string | null;
    sentAt?: string | null;
    provider?: string | null;
    direction?: string | null;
  },
>(
  events: T[],
  input: {
    bookingUrl?: string | null;
    status?: string | null;
    preferredChannel: 'Email' | 'WhatsApp';
  }
): T[] {
  const bookingUrl = String(input.bookingUrl || '').trim();
  if (!bookingUrl) return dedupeSchedulingInviteEvents(events);
  if (input.status && !['link_sent', 'booked'].includes(String(input.status))) {
    return dedupeSchedulingInviteEvents(events);
  }
  const already = events.some((event) => {
    if (event.direction === 'inbound') return false;
    const text = String(event.text || '');
    return text.includes(bookingUrl) || isSchedulingInviteText(text);
  });
  if (already) return dedupeSchedulingInviteEvents(events);

  const sentAt = new Date();
  const inviteEvent = {
    id: `scheduling-invite-${bookingUrl.slice(-16)}`,
    channel: input.preferredChannel,
    author: 'recruiter',
    authorName: 'Recruiter',
    subject: undefined,
    text: `Please book a time using this scheduling link: ${bookingUrl}`,
    time: relativeTime(sentAt),
    delivery: 'Sent',
    error: undefined,
    attachments: [],
    voiceSummary: undefined,
    sentAt: sentAt.toISOString(),
    direction: 'outbound' as const,
    messageType: 'message',
    provider: 'system',
    deliveryStatus: 'sent',
    aiGenerated: false,
  } as unknown as T;

  return dedupeSchedulingInviteEvents(
    [...events, inviteEvent].sort((a, b) => {
      const left = a.sentAt ? Date.parse(String(a.sentAt)) : 0;
      const right = b.sentAt ? Date.parse(String(b.sentAt)) : 0;
      return left - right;
    })
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
  recordingUrl?: string | null;
  screeningId?: string | null;
  resultId?: string | null;
} {
  let duration = '—';
  let outcome = 'AI voice call';
  let highlights: string[] = [];
  let recordingUrl: string | null = null;
  let screeningId: string | null = null;
  let resultId: string | null = null;
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
      if (typeof meta.recordingUrl === 'string' && meta.recordingUrl.trim()) {
        recordingUrl = meta.recordingUrl.trim();
      } else if (
        typeof meta.recording_url === 'string' &&
        meta.recording_url.trim()
      ) {
        recordingUrl = meta.recording_url.trim();
      }
      if (typeof meta.screeningId === 'string' && meta.screeningId.trim()) {
        screeningId = meta.screeningId.trim();
      }
      if (typeof meta.resultId === 'string' && meta.resultId.trim()) {
        resultId = meta.resultId.trim();
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
    ...(recordingUrl ? { recordingUrl } : {}),
    ...(screeningId ? { screeningId } : {}),
    ...(resultId ? { resultId } : {}),
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
  return mergeMessageTemplate(raw, ctx, { unresolved: 'blank' });
}

async function toDisplayConversation(thread: ConversationThreadDocument) {
  const enrollmentEarly = thread.enrollmentId
    ? await OutreachEnrollmentModel.findById(thread.enrollmentId)
        .select('screeningState candidateId')
        .lean()
    : null;

  // Backfill screening voice summary/recording onto this outreach chat when available.
  if (enrollmentEarly?.screeningState?.screeningId) {
    try {
      const { ScreeningCandidateModel } = await import(
        '../screening/screening-candidate.model.js'
      );
      const { ScreeningModel } = await import('../screening/screening.model.js');
      const {
        syncScreeningCandidateToConversation,
        syncEnrollmentScreeningDecision,
      } = await import('../screening/screening-conversation-sync.js');
      const screeningId = String(enrollmentEarly.screeningState.screeningId);
      const [screening, row] = await Promise.all([
        ScreeningModel.findById(screeningId)
          .select('_id organizationId campaignId jobId name')
          .lean(),
        ScreeningCandidateModel.findOne({
          screeningId,
          candidateId: thread.candidateId,
        }),
      ]);
      if (screening && row) {
        await syncScreeningCandidateToConversation({
          row,
          screening,
        });
        await syncEnrollmentScreeningDecision({
          organizationId: String(row.organizationId),
          candidateId: String(row.candidateId),
          enrollmentId: row.enrollmentId ? String(row.enrollmentId) : String(enrollmentEarly._id),
          screeningId,
          recommendation: row.recommendation,
          recruiterDecision: row.recruiterDecision,
        });
      }
    } catch {
      // Never block conversation load on screening sync.
    }
  }

  const [candidate, campaign, job, assignee, latestClass, messages, notes] =
    await Promise.all([
      SavedCandidateModel.findById(thread.candidateId)
        .select('name email phone currentTitle currentCompany location headline profilePictureUrl externalCandidateId organizationId')
        .lean(),
      thread.campaignId
        ? OutreachCampaignModel.findById(thread.campaignId)
            .select(
              'name campaignType mode sequenceSteps qualificationConfig.autoScreening sourceModule'
            )
            .lean()
        : null,
      thread.jobId ? JobModel.findById(thread.jobId).select('title locations').lean() : null,
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

  const hydratedCandidate = await hydrateCandidateMergeFields(
    String(thread.organizationId),
    candidate
  );
  const jobLocation = (job?.locations || [])
    .map((value) => String(value || '').trim())
    .find(Boolean);
  const mergeContext = buildCandidateMergeContext(hydratedCandidate, {
    jobTitle: job?.title || null,
    location: jobLocation || hydratedCandidate?.location || null,
  });
  const openingTemplateId =
    campaign?.sequenceSteps?.find((s) => s.type === 'whatsapp' && s.templateId)?.templateId ||
    campaign?.sequenceSteps?.find((s) => s.templateId)?.templateId ||
    null;

  let events = await Promise.all(
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
    hydratedCandidate?.currentTitle || hydratedCandidate?.headline,
    hydratedCandidate?.currentCompany,
  ].filter(Boolean);

  const autoScreening = Boolean(campaign?.qualificationConfig?.autoScreening);
  let pipelineStatus = deriveEnrollmentPipelineStatus(enrollment, {
    autoScreening,
    threadQualificationStatus: thread.qualificationStatus,
  });
  const qualificationReason =
    enrollment?.qualificationState?.reason ||
    latestClass?.recruiterOverride?.note ||
    null;

  let avatarUrl = candidate?.profilePictureUrl?.trim() || null;
  if (!avatarUrl && candidate?.externalCandidateId) {
    const pics = await lookupProfilePictures(String(thread.organizationId), [
      {
        id: String(candidate._id),
        profilePictureUrl: candidate.profilePictureUrl ?? null,
        externalCandidateId: candidate.externalCandidateId,
      },
    ]);
    avatarUrl = pics.get(String(candidate._id)) ?? null;
  }

  let lastMessage = thread.lastMessagePreview || '';
  let lastTime = relativeTime(thread.lastMessageAt);
  let overallAIDescription: string | null = null;
  const emailVendor = await resolveCampaignEmailVendor(
    thread.campaignId ? String(thread.campaignId) : null
  );
  const hcgGmail =
    emailVendor === 'zoho-mail'
      ? null
      : await findHcgGmailConversation(
          thread.campaignId ? String(thread.campaignId) : null,
          candidate?.email || null
        );
  const hcgZoho =
    emailVendor === 'gmail'
      ? null
      : emailVendor === 'zoho-mail' || !hcgGmail?.messages?.length
        ? await findHcgZohoConversation(
            thread.campaignId ? String(thread.campaignId) : null,
            candidate?.email || null
          )
        : null;
  const hcgEmail = hcgZoho?.messages?.length
    ? { kind: 'zoho' as const, doc: hcgZoho }
    : hcgGmail?.messages?.length
      ? { kind: 'gmail' as const, doc: hcgGmail }
      : null;
  const hcgWa = await findHcgWhatsappConversation(
    thread.campaignId ? String(thread.campaignId) : null,
    candidate?.phone || null
  );
  if (hcgEmail) {
    const emailEvents =
      hcgEmail.kind === 'zoho'
        ? hcgZohoMessagesToEvents(hcgEmail.doc, candidate?.name || 'Candidate')
        : hcgGmailMessagesToEvents(hcgEmail.doc, candidate?.name || 'Candidate');
    const otherEvents = events.filter((event) =>
      shouldKeepLocalEventAlongsideHcg(event, 'Email')
    );
    events = [...otherEvents, ...emailEvents].sort((a, b) => {
      const left = a.sentAt ? Date.parse(String(a.sentAt)) : 0;
      const right = b.sentAt ? Date.parse(String(b.sentAt)) : 0;
      return left - right;
    }) as typeof events;
    const status =
      hcgEmail.kind === 'zoho'
        ? hcgZohoStatus(hcgEmail.doc)
        : hcgGmailStatus(hcgEmail.doc);
    replyStatus = status.replyStatus;
    pipelineStatus = status.pipelineStatus;
    const preview =
      hcgEmail.kind === 'zoho'
        ? hcgZohoLastPreview(hcgEmail.doc)
        : hcgGmailLastPreview(hcgEmail.doc);
    if (preview.lastMessage) lastMessage = preview.lastMessage;
    if (preview.lastTime !== '—') lastTime = preview.lastTime;
    overallAIDescription =
      String(hcgEmail.doc.overallAIDescription || '').trim() || null;
    if (thread.campaignId && candidate?.email && hcgEmail.doc.overallAIStatus) {
      const source = hcgEmail.kind === 'zoho' ? 'zoho' : 'gmail';
      void import('../huntlo-360/hcg-qualification-transition.js')
        .then(({ applyHuntlo360FromHcgOverallAiStatus }) =>
          applyHuntlo360FromHcgOverallAiStatus({
            campaignId: String(thread.campaignId),
            overallAiStatus: String(hcgEmail.doc.overallAIStatus),
            email: String(candidate.email),
            source,
          })
        )
        .catch((error) => {
          getLogger()
            .child({ component: 'conversations' })
            .warn(
              { err: error, campaignId: String(thread.campaignId), source },
              'Huntlo 360 HCG qualification catch-up from email thread view failed'
            );
        });
    }
  } else if (hcgWa?.messages?.length) {
      const waEvents = hcgWhatsappMessagesToEvents(hcgWa, candidate?.name || 'Candidate');
      const otherEvents = events.filter((event) =>
        shouldKeepLocalEventAlongsideHcg(event, 'WhatsApp')
      );
      events = [...otherEvents, ...waEvents].sort((a, b) => {
        const left = a.sentAt ? Date.parse(String(a.sentAt)) : 0;
        const right = b.sentAt ? Date.parse(String(b.sentAt)) : 0;
        return left - right;
      }) as typeof events;
      const status = hcgWhatsappStatus(hcgWa);
      replyStatus = status.replyStatus;
      pipelineStatus = status.pipelineStatus;
      const preview = hcgWhatsappLastPreview(hcgWa);
      if (preview.lastMessage) lastMessage = preview.lastMessage;
      if (preview.lastTime !== '—') lastTime = preview.lastTime;
      overallAIDescription = String(hcgWa.overallAIDescription || '').trim() || null;
      if (thread.campaignId && candidate?.phone && hcgWa.overallAIStatus) {
        void import('../huntlo-360/hcg-qualification-transition.js')
          .then(({ applyHuntlo360FromHcgOverallAiStatus }) =>
            applyHuntlo360FromHcgOverallAiStatus({
              campaignId: String(thread.campaignId),
              overallAiStatus: String(hcgWa.overallAIStatus),
              phone: String(candidate.phone),
              source: 'whatsapp',
            })
          )
          .catch((error) => {
            getLogger()
              .child({ component: 'conversations' })
              .warn(
                { err: error, campaignId: String(thread.campaignId) },
                'Huntlo 360 HCG qualification catch-up from WhatsApp thread view failed'
              );
          });
      }
  }

  const hcgVoiceCampaignIds: string[] = [];
  if (thread.campaignId) {
    hcgVoiceCampaignIds.push(String(thread.campaignId));
    // Only for Huntlo 360: screening dials store Screening._id as gateway campaign_id.
    // Normal outreach campaigns keep the prior lookup (outreach campaignId only).
    const isHuntlo360 = campaign?.sourceModule === 'huntlo360';
    if (isHuntlo360) {
      try {
        const { ScreeningModel } = await import('../screening/screening.model.js');
        const linked = await ScreeningModel.find({
          campaignId: thread.campaignId,
          deletedAt: null,
          $or: [{ sourceModule: 'huntlo360' }, { workflowId: { $ne: null } }],
        })
          .select('_id')
          .lean();
        for (const row of linked) hcgVoiceCampaignIds.push(String(row._id));
      } catch {
        // ignore — fall back to outreach campaign id only
      }
      if (enrollmentEarly?.screeningState?.screeningId) {
        hcgVoiceCampaignIds.push(String(enrollmentEarly.screeningState.screeningId));
      }
    }
  }

  const hcgHunar = await findHcgHunarCommunicationByCampaignIds(
    hcgVoiceCampaignIds,
    candidate?.phone || null
  );
  const hcgZyvka = hcgHunar
    ? null
    : await findHcgZyvkaCommunicationByCampaignIds(
        hcgVoiceCampaignIds,
        candidate?.phone || null
      );
  const hcgVoice = hcgHunar || hcgZyvka;
  if (hcgVoice) {
    const voiceEvents = hcgHunar ? hcgHunarToEvents(hcgHunar) : hcgZyvkaToEvents(hcgZyvka!);
    const otherEvents = events.filter((event) => event.channel !== 'AI Voice');
    events = [...otherEvents, ...voiceEvents].sort((a, b) => {
      const left = a.sentAt ? Date.parse(String(a.sentAt)) : 0;
      const right = b.sentAt ? Date.parse(String(b.sentAt)) : 0;
      return left - right;
    }) as typeof events;
    if (!hcg?.messages?.length && !hcgWa?.messages?.length) {
      const status = hcgHunar ? hcgHunarStatus(hcgHunar) : hcgZyvkaStatus(hcgZyvka!);
      replyStatus = status.replyStatus;
      pipelineStatus = status.pipelineStatus;
      const preview = hcgHunar ? hcgHunarLastPreview(hcgHunar) : hcgZyvkaLastPreview(hcgZyvka!);
      if (preview.lastMessage) lastMessage = preview.lastMessage;
      if (preview.lastTime !== '—') lastTime = preview.lastTime;
      const description = String(hcgVoice.overallAIDescription || '').trim();
      const result = (hcgVoice.call_result as { result?: { summary?: string } } | undefined)?.result;
      overallAIDescription = description || String(result?.summary || '').trim() || overallAIDescription;
    }
    if (thread.campaignId && candidate?.phone) {
      const overallAiStatus = hcgHunar
        ? hcgHunarOverallAiStatus(hcgHunar)
        : hcgZyvkaOverallAiStatus(hcgZyvka!);
      void import('../outreach/post-qualification-hcg.js')
        .then(({ startPostQualificationWhatsAppFromHcgVoice }) =>
          startPostQualificationWhatsAppFromHcgVoice({
            campaignId: String(thread.campaignId),
            phone: String(candidate.phone),
            overallAiStatus,
            source: hcgHunar ? 'hunar' : 'zyvkay',
          })
        )
        .catch((error) => {
          getLogger()
            .child({ component: 'conversations' })
            .warn(
              { err: error, campaignId: String(thread.campaignId) },
              'Post-qualification WhatsApp catch-up from thread view failed'
            );
        });
      void import('../huntlo-360/hcg-qualification-transition.js')
        .then(({ applyHuntlo360FromHcgOverallAiStatus }) =>
          applyHuntlo360FromHcgOverallAiStatus({
            campaignId: String(thread.campaignId),
            overallAiStatus,
            phone: String(candidate.phone),
            source: hcgHunar ? 'hunar' : 'zyvkay',
          })
        )
        .catch((error) => {
          getLogger()
            .child({ component: 'conversations' })
            .warn(
              { err: error, campaignId: String(thread.campaignId) },
              'Huntlo 360 HCG qualification catch-up from voice thread view failed'
            );
        });
    }
  }

  const preferredInviteChannel: 'Email' | 'WhatsApp' = thread.channels.includes(
    'whatsapp'
  )
    ? 'WhatsApp'
    : 'Email';
  events = mergeSchedulingInviteIntoEvents(events, {
    bookingUrl: enrollment?.schedulingState?.bookingUrl,
    status: enrollment?.schedulingState?.status,
    preferredChannel: preferredInviteChannel,
  }) as typeof events;

  return {
    id: String(thread._id),
    candidateId: String(thread.candidateId),
    candidateName: candidate?.name || 'Unknown candidate',
    avatarUrl,
    headline: headlineParts.join(' · ') || 'Candidate',
    location: candidate?.location || '',
    channels: thread.channels
      .filter((c) => c !== 'note')
      .map((c) => CHANNEL_DISPLAY[c])
      .filter(Boolean),
    campaignId: thread.campaignId ? String(thread.campaignId) : '',
    campaignName: campaign?.name || '—',
    campaignType: campaign
      ? campaign.campaignType || mapModeToCampaignType(campaign.mode)
      : 'single_channel',
    jobId: thread.jobId ? String(thread.jobId) : null,
    jobTitle: job?.title || null,
    lastMessage,
    lastTime,
    unread: (thread.unreadCount || 0) > 0,
    unreadCount: thread.unreadCount || 0,
    replyStatus,
    pipelineStatus,
    qualification: QUAL_DISPLAY[thread.qualificationStatus] || 'Pending',
    qualificationStatus: thread.qualificationStatus,
    qualificationReason,
    overallAIDescription,
    screeningStatus: enrollment?.screeningState?.status || 'not_started',
    screeningId: enrollment?.screeningState?.screeningId ?? null,
    screeningDecision: enrollment?.screeningState?.decision ?? null,
    autoScreening,
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

/** Inbox rows — preview only. Open a thread to load messages via get/markRead. */
async function toListConversation(thread: ConversationThreadDocument) {
  const [candidate, campaign, job, enrollment] = await Promise.all([
    SavedCandidateModel.findById(thread.candidateId)
      .select(
        'name email phone currentTitle currentCompany location headline profilePictureUrl'
      )
      .lean(),
    thread.campaignId
      ? OutreachCampaignModel.findById(thread.campaignId)
          .select('name campaignType mode sequenceSteps qualificationConfig.autoScreening')
          .lean()
      : null,
    thread.jobId ? JobModel.findById(thread.jobId).select('title').lean() : null,
    thread.enrollmentId ? OutreachEnrollmentModel.findById(thread.enrollmentId).lean() : null,
  ]);

  const headlineParts = [
    candidate?.currentTitle || candidate?.headline,
    candidate?.currentCompany,
  ].filter(Boolean);
  const autoScreening = Boolean(campaign?.qualificationConfig?.autoScreening);
  const pipelineStatus = deriveEnrollmentPipelineStatus(enrollment, {
    autoScreening,
    threadQualificationStatus: thread.qualificationStatus,
  });
  const stepIndex = enrollment?.currentStepIndex ?? 0;
  const totalSteps = campaign?.sequenceSteps?.length || 0;

  let replyStatus = 'Awaiting reply';
  if (thread.status === 'opted_out') replyStatus = 'Not interested';
  else if (thread.lastCandidateMessageAt) replyStatus = 'Replied';

  return {
    id: String(thread._id),
    candidateId: String(thread.candidateId),
    candidateName: candidate?.name || 'Unknown candidate',
    avatarUrl: candidate?.profilePictureUrl?.trim() || null,
    headline: headlineParts.join(' · ') || 'Candidate',
    location: candidate?.location || '',
    channels: thread.channels
      .filter((c) => c !== 'note')
      .map((c) => CHANNEL_DISPLAY[c])
      .filter(Boolean),
    campaignId: thread.campaignId ? String(thread.campaignId) : '',
    campaignName: campaign?.name || '—',
    campaignType: campaign
      ? campaign.campaignType || mapModeToCampaignType(campaign.mode)
      : 'single_channel',
    jobId: thread.jobId ? String(thread.jobId) : null,
    jobTitle: job?.title || null,
    lastMessage: thread.lastMessagePreview || '',
    lastTime: relativeTime(thread.lastMessageAt),
    unread: (thread.unreadCount || 0) > 0,
    unreadCount: thread.unreadCount || 0,
    replyStatus,
    pipelineStatus,
    qualification: QUAL_DISPLAY[thread.qualificationStatus] || 'Pending',
    qualificationStatus: thread.qualificationStatus,
    qualificationReason: enrollment?.qualificationState?.reason || null,
    overallAIDescription: null as string | null,
    screeningStatus: enrollment?.screeningState?.status || 'not_started',
    screeningId: enrollment?.screeningState?.screeningId ?? null,
    screeningDecision: enrollment?.screeningState?.decision ?? null,
    autoScreening,
    sequenceStep: totalSteps > 0 ? `Step ${Math.min(stepIndex + 1, totalSteps)} of ${totalSteps}` : '—',
    nextAction:
      thread.automationStatus === 'stopped'
        ? 'Automation stopped'
        : thread.status === 'handed_off'
          ? 'Recruiter handoff'
          : 'Continue conversation',
    email: candidate?.email || null,
    phone: candidate?.phone || null,
    notes: [],
    events: [],
    status: thread.status,
    automationStatus: thread.automationStatus,
    assignedUserId: thread.assignedUserId ? String(thread.assignedUserId) : null,
    assignedUserName: 'Unassigned',
    enrollmentId: thread.enrollmentId ? String(thread.enrollmentId) : null,
    lastClassification: null,
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
    else if (query.candidateIds?.length) filter.candidateId = { $in: query.candidateIds };
    if (query.jobId) filter.jobId = query.jobId;
    if (query.assignedUserId) filter.assignedUserId = query.assignedUserId;
    if (query.unreadOnly) filter.unreadCount = { $gt: 0 };
    if (query.channel) filter.channels = query.channel;

    const q = String(query.q || '').trim();
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      const named = await SavedCandidateModel.find({ organizationId, name: rx })
        .select('_id')
        .lean();
      filter.$or = [
        { lastMessagePreview: rx },
        { candidateId: { $in: named.map((row) => row._id) } },
      ];
    }

    const skip = (query.page - 1) * query.limit;
    const [threads, total] = await Promise.all([
      ConversationThreadModel.find(filter)
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .skip(skip)
        .limit(query.limit),
      ConversationThreadModel.countDocuments(filter),
    ]);
    const items = await Promise.all(threads.map((thread) => toListConversation(thread)));
    await overlayHcgGmailOnListItems(items);
    await overlayHcgZohoOnListItems(items);
    await overlayHcgWhatsappOnListItems(items);
    await overlayHcgHunarOnListItems(items);
    await overlayHcgZyvkaOnListItems(items);

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
    const thread = await loadThread(organizationId, id);
    const candidate = await SavedCandidateModel.findById(thread.candidateId)
      .select('name email phone')
      .lean();
    const emailVendor = await resolveCampaignEmailVendor(
      thread.campaignId ? String(thread.campaignId) : null
    );
    const hcgGmail =
      emailVendor === 'zoho-mail'
        ? null
        : await findHcgGmailConversation(
            thread.campaignId ? String(thread.campaignId) : null,
            candidate?.email || null
          );
    const hcgZoho =
      emailVendor === 'gmail'
        ? null
        : emailVendor === 'zoho-mail' || !hcgGmail?.messages?.length
          ? await findHcgZohoConversation(
              thread.campaignId ? String(thread.campaignId) : null,
              candidate?.email || null
            )
          : null;
    const hcgEmail = hcgZoho?.messages?.length
      ? { kind: 'zoho' as const, doc: hcgZoho }
      : hcgGmail?.messages?.length
        ? { kind: 'gmail' as const, doc: hcgGmail }
        : null;
    if (hcgEmail) {
      const events =
        hcgEmail.kind === 'zoho'
          ? hcgZohoMessagesToEvents(hcgEmail.doc, candidate?.name || 'Candidate')
          : hcgGmailMessagesToEvents(hcgEmail.doc, candidate?.name || 'Candidate');
      const items = events.map((event, index) => ({
        id: event.id || `hcg-${index}`,
        provider: (hcgEmail.kind === 'zoho' ? 'zoho-mail' : 'gmail') as
          | 'zoho-mail'
          | 'gmail',
        channel: 'email' as const,
        direction: event.direction,
        sender: event.authorName,
        recipient: event.direction === 'inbound' ? 'You' : candidate?.email || null,
        subject: event.subject,
        bodyText: event.text,
        bodyHtml: undefined as string | undefined,
        deliveryStatus: 'delivered' as const,
        messageType: 'message' as const,
        aiGenerated: false,
        attachments: [] as unknown[],
        sentAt: event.sentAt || null,
        receivedAt: event.direction === 'inbound' ? event.sentAt || null : null,
        createdAt: event.sentAt || new Date().toISOString(),
      }));
      return {
        items,
        pagination: {
          page: 1,
          limit: items.length,
          total: items.length,
          totalPages: 1,
        },
      };
    }

    const hcgWa = await findHcgWhatsappConversation(
      thread.campaignId ? String(thread.campaignId) : null,
      candidate?.phone || null
    );
    if (hcgWa?.messages?.length) {
      const events = hcgWhatsappMessagesToEvents(hcgWa, candidate?.name || 'Candidate');
      const items = events.map((event, index) => ({
        id: event.id || `hcg-wa-${index}`,
        provider: 'whatsapp' as const,
        channel: 'whatsapp' as const,
        direction: event.direction,
        sender: event.authorName,
        recipient: event.direction === 'inbound' ? 'You' : candidate?.phone || null,
        subject: event.subject,
        bodyText: event.text,
        bodyHtml: undefined as string | undefined,
        deliveryStatus: 'delivered' as const,
        messageType: 'message' as const,
        aiGenerated: false,
        attachments: event.attachments || [],
        sentAt: event.sentAt || null,
        receivedAt: event.direction === 'inbound' ? event.sentAt || null : null,
        createdAt: event.sentAt || new Date().toISOString(),
      }));
      return {
        items,
        pagination: {
          page: 1,
          limit: items.length,
          total: items.length,
          totalPages: 1,
        },
      };
    }

    const voiceCampaignIds: string[] = [];
    if (thread.campaignId) {
      voiceCampaignIds.push(String(thread.campaignId));
      const campaignMeta = await OutreachCampaignModel.findById(thread.campaignId)
        .select('sourceModule')
        .lean();
      // Huntlo 360 only — normal campaigns keep outreach campaignId lookup unchanged.
      if (campaignMeta?.sourceModule === 'huntlo360') {
        try {
          const { ScreeningModel } = await import('../screening/screening.model.js');
          const linked = await ScreeningModel.find({
            campaignId: thread.campaignId,
            deletedAt: null,
            $or: [{ sourceModule: 'huntlo360' }, { workflowId: { $ne: null } }],
          })
            .select('_id')
            .lean();
          for (const row of linked) voiceCampaignIds.push(String(row._id));
        } catch {
          // ignore
        }
      }
    }

    const hcgHunar = await findHcgHunarCommunicationByCampaignIds(
      voiceCampaignIds,
      candidate?.phone || null
    );
    if (hcgHunar) {
      const events = hcgHunarToEvents(hcgHunar);
      const items = events.map((event, index) => ({
        id: event.id || `hcg-hunar-${index}`,
        provider: 'hunar' as const,
        channel: 'ai_voice' as const,
        direction: event.direction,
        sender: event.authorName,
        recipient: candidate?.phone || null,
        subject: null,
        bodyText: event.text,
        bodyHtml: JSON.stringify(event.voiceSummary || {}),
        deliveryStatus: event.deliveryStatus,
        messageType: 'voice_summary' as const,
        aiGenerated: true,
        attachments: [] as unknown[],
        sentAt: event.sentAt || null,
        receivedAt: null,
        createdAt: event.sentAt || new Date().toISOString(),
      }));
      return {
        items,
        pagination: {
          page: 1,
          limit: items.length,
          total: items.length,
          totalPages: 1,
        },
      };
    }

    const hcgZyvka = await findHcgZyvkaCommunicationByCampaignIds(
      voiceCampaignIds,
      candidate?.phone || null
    );
    if (hcgZyvka) {
      const events = hcgZyvkaToEvents(hcgZyvka);
      const items = events.map((event, index) => ({
        id: event.id || `hcg-zyvka-${index}`,
        provider: 'zyastra' as const,
        channel: 'ai_voice' as const,
        direction: event.direction,
        sender: event.authorName,
        recipient: candidate?.phone || null,
        subject: null,
        bodyText: event.text,
        bodyHtml: JSON.stringify(event.voiceSummary || {}),
        deliveryStatus: event.deliveryStatus,
        messageType: 'voice_summary' as const,
        aiGenerated: true,
        attachments: [] as unknown[],
        sentAt: event.sentAt || null,
        receivedAt: null,
        createdAt: event.sentAt || new Date().toISOString(),
      }));
      return {
        items,
        pagination: {
          page: 1,
          limit: items.length,
          total: items.length,
          totalPages: 1,
        },
      };
    }

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

  async getMessageAttachment(
    organizationId: string,
    messageId: string,
    index: number
  ): Promise<{
    mimeType: string;
    fileName: string;
    source: 'gcs' | 'local';
    stream?: Readable;
    absolutePath?: string;
  }> {
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid message id.');
    }
    if (!Number.isInteger(index) || index < 0) {
      throw new AppError(400, 'INVALID_ATTACHMENT_INDEX', 'Invalid attachment index.');
    }

    const message = await ConversationMessageModel.findOne({
      _id: messageId,
      organizationId,
    }).lean();
    if (!message) {
      throw new AppError(404, 'MESSAGE_NOT_FOUND', 'Message not found.');
    }

    const attachment = message.attachments?.[index];
    if (!attachment) {
      throw new AppError(404, 'ATTACHMENT_NOT_FOUND', 'Attachment not found.');
    }

    const mediaId = String(attachment.mediaId || '').trim();
    let storageKey = String(attachment.storageKey || '').trim().replace(/\\/g, '/');
    let mimeType = String(attachment.mimeType || 'application/octet-stream');
    let fileName = String(attachment.name || `attachment-${index}`);

    const openStored = async (key: string) => {
      const relativeKey = String(key || '').trim().replace(/\\/g, '/');
      if (!relativeKey) return null;
      if (isGcsMediaStorageEnabled()) {
        try {
          const gcs = await openWhatsAppMediaGcsStream({ relativeKey });
          if (gcs) {
            return {
              source: 'gcs' as const,
              stream: gcs.stream,
              mimeType: gcs.mimeType || mimeType,
              fileName,
            };
          }
          getLogger()
            .child({ component: 'whatsapp-inbound-media' })
            .warn({ messageId, relativeKey }, 'WhatsApp media not found in GCS');
        } catch (error) {
          getLogger()
            .child({ component: 'whatsapp-inbound-media' })
            .warn({ err: error, messageId, relativeKey }, 'GCS media open failed');
        }
      }

      const absolutePath = resolveWhatsAppInboundMediaPath(relativeKey);
      const mediaRoot = path.resolve(getWhatsAppInboundMediaDir());
      const resolved = path.resolve(absolutePath);
      if (!resolved.startsWith(mediaRoot + path.sep) && resolved !== mediaRoot) {
        throw new AppError(400, 'INVALID_ATTACHMENT_PATH', 'Invalid attachment path.');
      }
      if (!fs.existsSync(resolved)) return null;
      return {
        source: 'local' as const,
        absolutePath: resolved,
        mimeType,
        fileName,
      };
    };

    const stored = await openStored(storageKey);
    if (stored) return stored;

    if (mediaId) {
      try {
        const { rehydrateWhatsAppMediaAtIndex } = await import('./provider-sync.js');
        const restored = await rehydrateWhatsAppMediaAtIndex({
          organizationId,
          messageId,
          index,
          phoneNumberId: message.recipient,
          attachment: {
            name: attachment.name,
            kind: attachment.kind,
            mediaId,
            mimeType: attachment.mimeType,
            size: attachment.size,
          },
        });
        if (restored?.storageKey) {
          const nextAttachments = [...(message.attachments || [])];
          nextAttachments[index] = {
            ...attachment,
            ...restored,
          };
          await ConversationMessageModel.updateOne(
            { _id: messageId, organizationId },
            { $set: { attachments: nextAttachments } }
          );
          storageKey = String(restored.storageKey).replace(/\\/g, '/');
          mimeType = String(restored.mimeType || mimeType);
          fileName = String(restored.name || fileName);
          const retried = await openStored(storageKey);
          if (retried) return retried;
        }
      } catch (error) {
        getLogger()
          .child({ component: 'whatsapp-inbound-media' })
          .warn(
            { err: error, messageId, mediaId },
            'Failed to rehydrate missing WhatsApp media from Meta'
          );
      }
    }

    if (!storageKey) {
      throw new AppError(404, 'ATTACHMENT_UNAVAILABLE', 'Attachment file is not available.');
    }
    throw new AppError(404, 'ATTACHMENT_FILE_MISSING', 'Attachment file is missing.');
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
    const threadMessages = await ConversationMessageModel.find({
      threadId: thread._id,
      direction: { $in: ['inbound', 'outbound'] },
    })
      .sort({ createdAt: 1 })
      .select('direction bodyText')
      .lean();

    const conversation = threadMessages.map((m) => ({
      direction: (m.direction === 'inbound' ? 'inbound' : 'outbound') as
        | 'inbound'
        | 'outbound',
      bodyText: String(m.bodyText || ''),
    }));
    const lastInbound = [...conversation].reverse().find((m) => m.direction === 'inbound');

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
      conversation,
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
      channel:
        message.channel === 'email' || message.channel === 'whatsapp'
          ? message.channel
          : null,
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
            reason: `Knockout on ${current.id}: ${current.knockoutCondition || 'failed'}`,
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
              reason: handoff
                ? 'All qualification questions were answered. Recruiter takeover is enabled.'
                : 'All qualification questions were answered successfully.',
            };
            if (campaign.qualificationConfig.autoScreening && !handoff) {
              try {
                const { screeningId } = await enrollQualifiedCandidateInCampaignScreening({
                  campaign,
                  enrollment,
                });
                enrollment.screeningState = {
                  status: 'scheduled',
                  screeningId,
                  decision: null,
                };
              } catch {
                enrollment.screeningState = {
                  ...enrollment.screeningState,
                  status: 'scheduled',
                  screeningId: enrollment.screeningState?.screeningId ?? null,
                  decision: enrollment.screeningState?.decision ?? null,
                };
              }
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

  /** Close older open threads for this candidate so each outreach starts fresh. */
  async closePriorThreadsForCandidate(input: {
    organizationId: string;
    candidateId: string;
    keepCampaignId: string;
  }): Promise<number> {
    const prior = await ConversationThreadModel.find({
      organizationId: input.organizationId,
      candidateId: input.candidateId,
      campaignId: { $ne: input.keepCampaignId },
      status: { $nin: ['closed', 'opted_out'] },
    });
    if (!prior.length) return 0;

    const now = new Date();
    for (const thread of prior) {
      thread.status = 'closed';
      thread.automationStatus = 'stopped';
      thread.lastMessageAt = thread.lastMessageAt || now;
      thread.lastMessagePreview = 'Idle — newer outreach started';
      await thread.save();
      emitCampaignThreadUpdated({
        organizationId: input.organizationId,
        campaignId: thread.campaignId ? String(thread.campaignId) : null,
        threadId: String(thread._id),
        status: thread.status,
        unreadCount: thread.unreadCount || 0,
        qualificationStatus: thread.qualificationStatus,
      });
    }
    return prior.length;
  },

  /**
   * After first multi-channel reply, close sibling email/whatsapp threads so
   * only the winner channel stays active for Q&A.
   */
  async orphanSiblingThreads(input: {
    organizationId: string;
    candidateId: string;
    campaignId: string;
    keepThreadId: string;
    winnerChannel: 'email' | 'whatsapp';
  }): Promise<number> {
    const winnerLabel = input.winnerChannel === 'whatsapp' ? 'WhatsApp' : 'Email';
    const siblings = await ConversationThreadModel.find({
      organizationId: input.organizationId,
      candidateId: input.candidateId,
      campaignId: input.campaignId,
      _id: { $ne: input.keepThreadId },
      status: { $nin: ['closed', 'opted_out'] },
      channels: { $in: ['email', 'whatsapp'] },
    });
    if (!siblings.length) return 0;

    const now = new Date();
    for (const sibling of siblings) {
      sibling.status = 'closed';
      sibling.automationStatus = 'stopped';
      sibling.lastMessageAt = sibling.lastMessageAt || now;
      sibling.lastMessagePreview = `Superseded — continued on ${winnerLabel}`;
      await sibling.save();

      await ConversationMessageModel.create({
        organizationId: input.organizationId,
        threadId: sibling._id,
        provider: 'system',
        channel: 'note',
        direction: 'internal',
        bodyText: `This channel is no longer active. Conversation continued on ${winnerLabel}.`,
        providerMessageId: `sys-orphan-${String(sibling._id)}-${Date.now()}`,
        deliveryStatus: 'delivered',
        messageType: 'system',
        sentAt: now,
      });

      emitCampaignThreadUpdated({
        organizationId: input.organizationId,
        campaignId: input.campaignId,
        threadId: String(sibling._id),
        status: sibling.status,
        unreadCount: sibling.unreadCount || 0,
        qualificationStatus: sibling.qualificationStatus,
      });
    }
    return siblings.length;
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
    // Newer outreach deactivates prior open chats for this candidate.
    await this.closePriorThreadsForCandidate({
      organizationId: input.organizationId,
      candidateId: input.candidateId,
      keepCampaignId: input.campaignId,
    });

    // Email and WhatsApp are separate inbox threads — never merge channels.
    const otherChannel =
      input.channel === 'email'
        ? 'whatsapp'
        : input.channel === 'whatsapp'
          ? 'email'
          : null;
    const channelFilter =
      otherChannel == null
        ? { channels: input.channel }
        : {
            $and: [
              { channels: input.channel },
              { channels: { $nin: [otherChannel] } },
            ],
          };

    let thread = await ConversationThreadModel.findOne({
      organizationId: input.organizationId,
      candidateId: input.candidateId,
      campaignId: input.campaignId,
      ...channelFilter,
    }).sort({ updatedAt: -1 });

    if (thread) {
      // Re-open this campaign+channel thread if a prior run left it closed.
      if (thread.status === 'closed') {
        thread.status = 'awaiting_reply';
        thread.automationStatus = 'active';
        thread.enrollmentId = new mongoose.Types.ObjectId(input.enrollmentId);
        if (input.jobId) {
          thread.jobId = new mongoose.Types.ObjectId(input.jobId);
        }
        await thread.save();
      } else if (
        input.enrollmentId &&
        String(thread.enrollmentId || '') !== input.enrollmentId
      ) {
        thread.enrollmentId = new mongoose.Types.ObjectId(input.enrollmentId);
        if (input.jobId) {
          thread.jobId = new mongoose.Types.ObjectId(input.jobId);
        }
        await thread.save();
      }
      return thread;
    }
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
