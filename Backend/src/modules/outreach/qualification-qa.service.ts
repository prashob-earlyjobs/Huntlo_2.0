/**
 * End-to-end qualification Q&A after a candidate replies to outreach.
 * Asks screening questions (one-by-one on WhatsApp; on email, all predefined
 * questions after interest, then batched follow-ups for missed answers),
 * then qualifies / hands off with a thank-you wrap-up email, or optionally
 * flags screening.
 */

import mongoose from 'mongoose';

import { getLogger } from '../../config/logger.js';
import {
  answerCandidateQuestionFromJd,
  assessQualificationComplete,
  composeQualificationEmailBatch,
  composeQualificationMessage,
  evaluateScreeningAnswer,
  logEmailPipeline,
} from '../../providers/gemini/gemini.conversations.js';
import { generateQualificationQuestions } from '../../providers/gemini/gemini.outreach.js';
import { ConversationMessageModel } from '../conversations/conversation-message.model.js';
import {
  ConversationThreadModel,
  type ConversationChannel,
} from '../conversations/conversation-thread.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { sendAdHocMessage } from './campaign-delivery.js';
import {
  OutreachCampaignModel,
  type OutreachCampaignDocument,
} from './campaign.model.js';
import {
  OutreachEnrollmentModel,
  type OutreachEnrollmentDocument,
} from './enrollment.model.js';
import { recordCampaignActivity } from './campaign-activity.model.js';
import { enrollQualifiedCandidateInCampaignScreening } from './outreach-auto-screening.service.js';
import { loadOutreachJobContext, formatOutreachJobContextForPrompt } from './job-context.js';
import {
  emitCampaignThreadUpdated,
  emitConversationMessageCreated,
  emitConversationQualificationUpdated,
  emitOutreachEnrollmentUpdated,
} from '../../realtime/events.js';

const log = () => getLogger().child({ component: 'qualification-qa' });

async function emitOutboundConversationRealtime(input: {
  organizationId: string;
  threadId: string;
  messageId: string;
  channel: string;
}): Promise<void> {
  const thread = await ConversationThreadModel.findById(input.threadId)
    .select('campaignId candidateId status unreadCount qualificationStatus')
    .lean();
  if (!thread) return;

  const campaignId = thread.campaignId ? String(thread.campaignId) : null;

  emitConversationMessageCreated({
    organizationId: input.organizationId,
    threadId: input.threadId,
    messageId: input.messageId,
    campaignId,
    candidateId: String(thread.candidateId),
    direction: 'outbound',
    channel: input.channel,
  });
  emitCampaignThreadUpdated({
    organizationId: input.organizationId,
    campaignId,
    threadId: input.threadId,
    status: thread.status,
    unreadCount: thread.unreadCount ?? 0,
    qualificationStatus: thread.qualificationStatus,
  });
}

function replySubject(original: string | null | undefined, fallback: string): string {
  const base = String(original || '').trim() || fallback;
  return /^re\s*:/i.test(base) ? base : `Re: ${base}`;
}

/**
 * Resolve Gmail/SMTP threading fields from prior email messages on this conversation.
 * Without providerThreadId + RFC In-Reply-To, follow-ups land as brand-new inbox threads.
 */
async function resolveEmailReplyContext(
  threadId: string,
  fallbackSubject: string
): Promise<{
  subject: string;
  providerThreadId: string | null;
  inReplyTo: string | null;
  references: string | null;
  gmailMessageIdHint: string | null;
}> {
  const [thread, recentEmails] = await Promise.all([
    ConversationThreadModel.findById(threadId)
      .select('providerThreadIds')
      .lean(),
    ConversationMessageModel.find({
      threadId,
      channel: 'email',
      deliveryStatus: { $ne: 'failed' },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('subject providerMessageId providerThreadId direction createdAt')
      .lean(),
  ]);

  const lastAny = recentEmails[0] || null;
  const lastInbound = recentEmails.find((m) => m.direction === 'inbound') || null;
  const firstOutbound =
    [...recentEmails].reverse().find((m) => m.direction === 'outbound') || null;

  // Prefer the original outreach subject so every follow-up stays `Re: <original>`.
  const subjectAnchor = firstOutbound || lastInbound || lastAny;
  const fromThread =
    thread?.providerThreadIds?.find((p) => p.provider === 'gmail')?.threadId ||
    thread?.providerThreadIds?.[0]?.threadId ||
    null;

  const providerThreadId =
    recentEmails.map((m) => m.providerThreadId).find((id) => Boolean(id)) ||
    fromThread ||
    null;

  // Prefer the most recent message as the In-Reply-To target.
  const anchor = lastAny;
  const rfcId = String(anchor?.providerMessageId || '');
  const inReplyTo = rfcId.startsWith('<') && rfcId.includes('@') ? rfcId : null;

  // Always pass a Gmail API message id hint so we can fetch RFC Message-ID + threadId.
  let gmailMessageIdHint: string | null = null;
  for (const msg of recentEmails) {
    const pid = String(msg.providerMessageId || '').trim();
    if (pid && !pid.startsWith('<') && !pid.includes(':')) {
      gmailMessageIdHint = pid;
      break;
    }
  }

  return {
    subject: replySubject(subjectAnchor?.subject, fallbackSubject),
    providerThreadId: providerThreadId ? String(providerThreadId) : null,
    inReplyTo,
    references: inReplyTo,
    gmailMessageIdHint,
  };
}

export type QualificationQuestion = {
  id: string;
  prompt: string;
  answerType: string;
  knockout?: boolean;
  knockoutCondition?: string | null;
};

export type QualificationConfig = {
  enabled: boolean;
  questions: QualificationQuestion[];
  aiReplyEnabled?: boolean;
  takeoverCondition?: string | null;
  autoScreening?: boolean;
};

function answerValue(entry: unknown): string {
  if (entry == null) return '';
  if (typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean') {
    return String(entry);
  }
  if (typeof entry === 'object' && entry !== null && 'value' in entry) {
    return String((entry as { value?: unknown }).value ?? '');
  }
  return String(entry);
}

export function normalizeAnswerRecord(
  value: unknown,
  source: 'ai' | 'candidate' | 'recruiter',
  byUserId?: string | null
) {
  return {
    value: answerValue(value),
    source,
    at: new Date().toISOString(),
    ...(byUserId ? { byUserId } : {}),
  };
}

/** Evaluate knockout rules. Returns fail only when clearly matched. */
export function evaluateKnockout(
  question: QualificationQuestion,
  rawAnswer: unknown
): 'pass' | 'fail' | 'unknown' {
  if (!question.knockout) return 'pass';
  const condition = String(question.knockoutCondition || '').toLowerCase();
  const raw = answerValue(rawAnswer).trim().toLowerCase();
  if (!raw) return 'unknown';

  const type = String(question.answerType || '').toLowerCase();
  const isYesNo = type.includes('yes') || type.includes('no') || type === 'boolean';
  const isNumber = type.includes('number') || type.includes('days');

  if (isYesNo) {
    const isNo = /^(n|no|false|0|nah|nope)$/i.test(raw);
    const isYes = /^(y|yes|true|1|yeah|yep)$/i.test(raw);
    if (condition.includes('reject if no') || condition.includes('if no')) {
      return isNo ? 'fail' : isYes ? 'pass' : 'unknown';
    }
    if (condition.includes('reject if yes') || condition.includes('if yes')) {
      return isYes ? 'fail' : isNo ? 'pass' : 'unknown';
    }
    // Default knockout Yes/No: "No" fails.
    return isNo ? 'fail' : isYes ? 'pass' : 'unknown';
  }

  if (isNumber) {
    const num = Number.parseFloat(raw.replace(/[^\d.-]/g, ''));
    if (!Number.isFinite(num)) return 'unknown';
    const moreThan = condition.match(/more than\s+(\d+)/);
    const lessThan = condition.match(/less than\s+(\d+)/);
    const atLeast = condition.match(/(?:at least|>=)\s*(\d+)/);
    const atMost = condition.match(/(?:at most|<=|max)\s*(\d+)/);
    if (moreThan && num > Number(moreThan[1])) return 'fail';
    if (lessThan && num < Number(lessThan[1])) return 'fail';
    if (atLeast && num < Number(atLeast[1])) return 'fail';
    if (atMost && num > Number(atMost[1])) return 'fail';
    if (moreThan || lessThan || atLeast || atMost) return 'pass';
    return 'unknown';
  }

  return 'unknown';
}

export function nextQuestionIndex(enrollment: OutreachEnrollmentDocument): number {
  const idx = enrollment.replyQuestionIndex;
  return typeof idx === 'number' && idx >= 0 ? idx : -1;
}

export function unansweredQuestions(
  config: QualificationConfig,
  enrollment: OutreachEnrollmentDocument
): QualificationQuestion[] {
  const answers = enrollment.qualificationState?.answers || {};
  return (config.questions || []).filter((q) => {
    const existing = answers[q.id];
    return !existing || !answerValue(existing).trim();
  });
}

function campaignChannelEnabled(
  campaign: OutreachCampaignDocument,
  channel: 'email' | 'whatsapp'
): boolean {
  if (channel === 'whatsapp') {
    if (campaign.channelConfig?.whatsapp?.enabled === true) return true;
    return (campaign.sequenceSteps || []).some((s) => s.type === 'whatsapp');
  }
  if (campaign.channelConfig?.email?.enabled === true) return true;
  return (campaign.sequenceSteps || []).some(
    (s) => s.type === 'email' || s.type === 'scheduling_link'
  );
}

function pickOutboundChannel(
  threadChannels: string[] | undefined,
  campaign: OutreachCampaignDocument,
  preferred?: 'email' | 'whatsapp' | null
): 'email' | 'whatsapp' | null {
  if (preferred === 'email' || preferred === 'whatsapp') {
    if (campaignChannelEnabled(campaign, preferred)) return preferred;
  }
  const last = [...(threadChannels || [])]
    .reverse()
    .find(
      (c): c is 'email' | 'whatsapp' =>
        (c === 'email' || c === 'whatsapp') && campaignChannelEnabled(campaign, c)
    );
  if (last) return last;
  if (campaignChannelEnabled(campaign, 'email')) return 'email';
  if (campaignChannelEnabled(campaign, 'whatsapp')) return 'whatsapp';
  return null;
}

/** Email is default for screening; WhatsApp only when preferred AND campaign enables it. */
function resolveScreeningChannel(
  _threadChannels: string[] | undefined,
  campaign: OutreachCampaignDocument,
  preferred?: 'email' | 'whatsapp' | null
): 'email' | 'whatsapp' {
  return preferWhatsAppScreening(preferred, campaign) ? 'whatsapp' : 'email';
}

function preferWhatsAppScreening(
  preferred?: 'email' | 'whatsapp' | null,
  campaign?: OutreachCampaignDocument | null
): boolean {
  if (preferred !== 'whatsapp') return false;
  if (!campaign) return true;
  return campaignChannelEnabled(campaign, 'whatsapp');
}

async function qualificationEmailWasBatched(threadId: string): Promise<boolean> {
  const msgs = await ConversationMessageModel.find({
    threadId,
    direction: 'outbound',
    messageType: 'qualification',
    channel: 'email',
  })
    .sort({ createdAt: -1 })
    .limit(8)
    .select('bodyText')
    .lean();
  return msgs.some((m) => (m.bodyText?.match(/^\s*\d+\.\s+/gm)?.length ?? 0) >= 2);
}

async function persistOutboundQuestion(input: {
  organizationId: string;
  threadId: string;
  channel: ConversationChannel;
  body: string;
  subject?: string | null;
  provider: string;
  providerMessageId?: string;
  providerThreadId?: string | null;
  to: string;
}) {
  const message = await ConversationMessageModel.create({
    organizationId: new mongoose.Types.ObjectId(input.organizationId),
    threadId: new mongoose.Types.ObjectId(input.threadId),
    provider: input.provider || 'system',
    channel: input.channel,
    direction: 'outbound',
    sender: null,
    recipient: input.to,
    subject: input.subject ?? null,
    bodyText: input.body,
    bodyHtml: null,
    providerMessageId:
      input.providerMessageId || `qualification:${input.threadId}:${Date.now()}`,
    providerThreadId: input.providerThreadId || null,
    deliveryStatus: 'sent',
    messageType: 'qualification',
    aiGenerated: true,
    sentAt: new Date(),
  });

  const threadUpdate: Record<string, unknown> = {
    $set: {
      lastMessageAt: new Date(),
      lastRecruiterMessageAt: new Date(),
      lastMessagePreview: input.body.slice(0, 240),
      status: 'awaiting_reply',
      qualificationStatus: 'in_progress',
    },
    $addToSet: { channels: input.channel } as Record<string, unknown>,
  };
  if (input.providerThreadId && input.provider) {
    (threadUpdate.$addToSet as Record<string, unknown>).providerThreadIds = {
      provider: input.provider,
      threadId: input.providerThreadId,
    };
  }

  await ConversationThreadModel.updateOne({ _id: input.threadId }, threadUpdate);

  await emitOutboundConversationRealtime({
    organizationId: input.organizationId,
    threadId: input.threadId,
    messageId: String(message._id),
    channel: input.channel,
  });
}

export type QualificationEmailBatchKind = 'initial' | 'missed';

export async function sendQualificationQuestion(input: {
  campaign: OutreachCampaignDocument;
  enrollment: OutreachEnrollmentDocument;
  threadId: string;
  question: QualificationQuestion;
  questionIndex: number;
  preferredChannel?: 'email' | 'whatsapp' | null;
  /** Full campaign question list. */
  allQuestions?: QualificationQuestion[];
  /** Email: exact questions to include in this message (Gemini-formatted batch). */
  batchQuestions?: QualificationQuestion[];
  batchKind?: QualificationEmailBatchKind;
}): Promise<{ sent: boolean; error?: string }> {
  const { campaign, enrollment, question } = input;
  const organizationId = String(campaign.organizationId);
  const userId = String(campaign.ownerUserId);

  const thread = await ConversationThreadModel.findById(input.threadId);
  if (!thread) return { sent: false, error: 'Thread not found' };

  const candidate = await SavedCandidateModel.findOne({
    _id: enrollment.candidateId,
    organizationId: campaign.organizationId,
    deletedAt: null,
  })
    .select('email phone name')
    .lean();

  const allQuestions =
    input.allQuestions ||
    (Array.isArray(campaign.qualificationConfig?.questions)
      ? (campaign.qualificationConfig.questions as QualificationQuestion[])
      : [question]);

  const answersState = enrollment.qualificationState?.answers || {};
  const preferWhatsApp = preferWhatsAppScreening(input.preferredChannel, campaign);

  /** Email with 2+ campaign questions must never use single-question compose on first outreach. */
  const shouldSendEmailBatch =
    !preferWhatsApp &&
    allQuestions.length >= 2 &&
    ((input.batchQuestions?.length ?? 0) >= 2 ||
      input.batchKind === 'initial' ||
      (input.questionIndex === 0 && input.batchKind !== 'missed') ||
      (input.batchKind === 'missed' && (input.batchQuestions?.length ?? 0) >= 2));

  let channel: 'email' | 'whatsapp' | null = shouldSendEmailBatch
    ? campaignChannelEnabled(campaign, 'email')
      ? 'email'
      : null
    : input.batchQuestions?.length
      ? campaignChannelEnabled(campaign, 'email')
        ? 'email'
        : null
      : pickOutboundChannel(
          thread.channels as string[] | undefined,
          campaign,
          preferWhatsApp ? 'whatsapp' : 'email'
        );
  if (!channel) return { sent: false, error: 'No email/WhatsApp channel available' };

  let questionsForMessage: QualificationQuestion[] = [question];
  if (shouldSendEmailBatch) {
    questionsForMessage =
      (input.batchQuestions?.length ?? 0) >= 2 ? input.batchQuestions! : allQuestions;
  } else if (input.batchQuestions?.length) {
    questionsForMessage = input.batchQuestions;
  }

  const effectiveBatchKind =
    input.batchKind ?? (input.questionIndex === 0 ? 'initial' : 'missed');
  const useBatchComposer =
    channel === 'email' && questionsForMessage.length >= 2;
  const useEmailBatch = useBatchComposer;

  const leadQuestion = questionsForMessage[0]!;
  const batchKind = effectiveBatchKind;

  const to =
    channel === 'whatsapp'
      ? String(candidate?.phone || '').trim()
      : String(candidate?.email || '').trim();
  if (!to) {
    return {
      sent: false,
      error: channel === 'whatsapp' ? 'Missing phone' : 'Missing email',
    };
  }

  const firstName = String(candidate?.name || 'there').trim().split(/\s+/)[0] || 'there';
  const templateIntro =
    batchKind === 'initial'
      ? `Thanks for getting back, ${firstName}! A few quick questions to move forward:\n\n`
      : `Thanks for your reply, ${firstName}! Still need a few details:\n\n`;
  let body = useEmailBatch
    ? `${templateIntro}Could you reply with answers to these?\n\n${questionsForMessage
        .map((q, i) => `${i + 1}. ${q.prompt}`)
        .join('\n')}`
    : `${templateIntro}${leadQuestion.prompt}`;

  log().info(
    {
      enrollmentId: String(enrollment._id),
      questionId: leadQuestion.id,
      questionIndex: input.questionIndex,
      batchCount: useBatchComposer ? questionsForMessage.length : 1,
      channel,
      to,
    },
    useBatchComposer ? 'Sending qualification questions (email batch)' : 'Sending qualification question'
  );

  if (channel === 'email') {
    // Compose with Gemini; never block the send if AI is slow/unavailable.
    try {
      const [recentMessages, job] = await Promise.all([
        ConversationMessageModel.find({
          threadId: input.threadId,
          channel: { $in: ['email', 'whatsapp'] },
          messageType: { $ne: 'note' },
        })
          .sort({ createdAt: -1 })
          .limit(8)
          .select('direction bodyText')
          .lean(),
        loadOutreachJobContext(campaign.jobId ? String(campaign.jobId) : null),
      ]);
      const conversation = [...recentMessages].reverse().map((m) => ({
        direction: (m.direction === 'inbound' ? 'inbound' : 'outbound') as
          | 'inbound'
          | 'outbound',
        bodyText: String(m.bodyText || ''),
      }));
      const latestReply =
        recentMessages.find((m) => m.direction === 'inbound')?.bodyText || null;

      const answeredSoFar = allQuestions
        .filter((q) => answerValue(answersState[q.id]).trim())
        .map((q) => ({
          question: q.prompt,
          answer: answerValue(answersState[q.id]),
        }));

      const composed = useBatchComposer
        ? await composeQualificationEmailBatch({
            candidateName: candidate?.name,
            jobTitle: job.title,
            campaignName: campaign.name,
            channel,
            latestReply,
            conversation,
            answeredSoFar,
            nextQuestionPrompts: questionsForMessage.map((q) => q.prompt),
            questionIndex: input.questionIndex,
            batchKind,
          })
        : await composeQualificationMessage({
            candidateName: candidate?.name,
            jobTitle: job.title,
            campaignName: campaign.name,
            channel,
            latestReply,
            conversation,
            answeredSoFar,
            nextQuestionPrompt: leadQuestion.prompt,
            questionIndex: input.questionIndex,
          });
      if (
        !useBatchComposer &&
        channel === 'email' &&
        allQuestions.length >= 2 &&
        input.questionIndex === 0
      ) {
        log().error(
          {
            enrollmentId: String(enrollment._id),
            allQuestionCount: allQuestions.length,
            batchQuestions: input.batchQuestions?.length ?? 0,
            preferredChannel: input.preferredChannel,
          },
          'BUG: single-question compose used for multi-question email initial — check batch flags'
        );
      }
      if (composed.body?.trim()) body = composed.body;
      log().info(
        {
          enrollmentId: String(enrollment._id),
          questionId: leadQuestion.id,
          batchCount: useBatchComposer ? questionsForMessage.length : 1,
          model: composed.model,
        },
        useBatchComposer
          ? 'Composed batched qualification email via Gemini'
          : 'Composed qualification email via Gemini'
      );
    } catch (error) {
      log().warn(
        { err: error, enrollmentId: String(enrollment._id), questionId: leadQuestion.id },
        'Gemini compose failed — using template body'
      );
    }
  }

  let emailReply: {
    subject: string;
    providerThreadId?: string | null;
    inReplyTo?: string | null;
    references?: string | null;
    gmailMessageIdHint?: string | null;
  } | null = null;
  if (channel === 'email') {
    try {
      emailReply = await resolveEmailReplyContext(
        input.threadId,
        campaign.name || 'your application'
      );
    } catch (error) {
      log().warn(
        { err: error, enrollmentId: String(enrollment._id) },
        'Email reply threading context failed — sending without thread headers'
      );
      emailReply = {
        subject: `Re: ${campaign.name || 'your application'}`,
      };
    }
  }

  try {
    const sent = await sendAdHocMessage({
      organizationId,
      userId,
      channel,
      to,
      subject: channel === 'email' ? emailReply!.subject : null,
      body,
      senderEmail: campaign.channelConfig?.email?.senderEmail,
      integrationId:
        channel === 'email'
          ? campaign.channelConfig?.email?.integrationId
          : campaign.channelConfig?.whatsapp?.integrationId,
      providerThreadId: emailReply?.providerThreadId,
      inReplyTo: emailReply?.inReplyTo,
      references: emailReply?.references,
      gmailMessageIdHint: emailReply?.gmailMessageIdHint,
    });

    await persistOutboundQuestion({
      organizationId,
      threadId: input.threadId,
      channel,
      body,
      subject: channel === 'email' ? emailReply!.subject : null,
      provider: sent.provider,
      providerMessageId: sent.providerMessageId,
      providerThreadId: sent.providerThreadId || emailReply?.providerThreadId,
      to,
    });

    enrollment.replyQuestionIndex = input.batchQuestions?.length
      ? 0
      : input.questionIndex;
    enrollment.autoReplyCount = (enrollment.autoReplyCount || 0) + 1;
    enrollment.qualificationState = {
      status: 'in_progress',
      answers: enrollment.qualificationState?.answers || {},
    };
    enrollment.lastActionAt = new Date();
    await enrollment.save();

    await recordCampaignActivity({
      organizationId,
      campaignId: String(campaign._id),
      enrollmentId: String(enrollment._id),
      type: 'enrollment.qualification_question_sent',
      title: useEmailBatch
        ? `Asked qualification questions ${input.questionIndex + 1}–${input.questionIndex + questionsForMessage.length} (email)`
        : `Asked qualification question ${input.questionIndex + 1}`,
      metadata: {
        questionId: leadQuestion.id,
        questionIds: questionsForMessage.map((q) => q.id),
        channel,
        batched: useEmailBatch,
      },
    }).catch(() => undefined);

    if (channel === 'email') {
      await logEmailPipeline({
        id: String(enrollment._id),
        task: 'message sent',
        detail: useEmailBatch
          ? `batch q${input.questionIndex + 1}–${input.questionIndex + questionsForMessage.length}`
          : `q${input.questionIndex + 1}`,
      });
    }

    return { sent: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send question';
    log().warn(
      { err: error, enrollmentId: String(enrollment._id), questionId: question.id },
      'Failed to send qualification question'
    );
    return { sent: false, error: message };
  }
}

async function jobContextBlockForCampaign(
  campaign: OutreachCampaignDocument
): Promise<string> {
  const ctx = await loadOutreachJobContext(
    campaign.jobId ? String(campaign.jobId) : null
  );
  return formatOutreachJobContextForPrompt(ctx, campaign.name || null);
}

function screeningAnswersForAssessment(
  questions: QualificationQuestion[],
  enrollment: OutreachEnrollmentDocument
) {
  const answers = enrollment.qualificationState?.answers || {};
  return questions.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    answerType: q.answerType,
    knockout: Boolean(q.knockout),
    knockoutCondition: q.knockoutCondition ?? null,
    answer: answerValue(answers[q.id]),
  }));
}

/** All questions answered — Gemini final pass with JD, then qualify or reject. */
async function completeQualificationWhenAllAnswered(input: {
  campaign: OutreachCampaignDocument;
  enrollment: OutreachEnrollmentDocument;
  threadId: string;
  questions: QualificationQuestion[];
  config: QualificationConfig;
  conversation: Array<{ direction: 'inbound' | 'outbound'; bodyText: string }>;
  channel: 'email' | 'whatsapp';
}): Promise<{ action: string } | null> {
  if (openScreeningQuestions(input.questions, input.enrollment).length > 0) {
    return null;
  }

  const jobContext = await jobContextBlockForCampaign(input.campaign);
  const assessment = await assessQualificationComplete({
    jobContext,
    campaignName: input.campaign.name || null,
    questions: screeningAnswersForAssessment(input.questions, input.enrollment),
    conversation: input.conversation,
    channel: input.channel,
  });

  log().info(
    {
      enrollmentId: String(input.enrollment._id),
      outcome: assessment.outcome,
      reason: assessment.reason,
      failedQuestionId: assessment.failedQuestionId,
      model: assessment.model,
    },
    'Gemini qualification assessment (complete)'
  );

  if (assessment.outcome === 'rejected') {
    await completeQualification({
      campaign: input.campaign,
      enrollment: input.enrollment,
      threadId: input.threadId,
      status: 'rejected',
      reason:
        assessment.reason ||
        `Screening failed${assessment.failedQuestionId ? ` (${assessment.failedQuestionId})` : ''}`,
    });
    return { action: 'rejected_assessment' };
  }

  await completeQualification({
    campaign: input.campaign,
    enrollment: input.enrollment,
    threadId: input.threadId,
    status: 'qualified',
    reason: shouldHandOffAfterQuestions(input.config)
      ? input.config.takeoverCondition || 'Recruiter takeover after qualification'
      : undefined,
  });
  return { action: 'qualified' };
}

async function loadRecentConversation(
  threadId: string
): Promise<Array<{ direction: 'inbound' | 'outbound'; bodyText: string }>> {
  const recentMessages = await ConversationMessageModel.find({
    threadId,
    channel: { $in: ['email', 'whatsapp'] },
    messageType: { $ne: 'note' },
  })
    .sort({ createdAt: -1 })
    .limit(8)
    .select('direction bodyText')
    .lean();
  return [...recentMessages].reverse().map((m) => ({
    direction: (m.direction === 'inbound' ? 'inbound' : 'outbound') as 'inbound' | 'outbound',
    bodyText: String(m.bodyText || ''),
  }));
}

function openScreeningQuestions(
  questions: QualificationQuestion[],
  enrollment: OutreachEnrollmentDocument
): QualificationQuestion[] {
  const answers = enrollment.qualificationState?.answers || {};
  return questions.filter((q) => !answerValue(answers[q.id]).trim());
}

async function processEmailQualificationReply(input: {
  campaign: OutreachCampaignDocument;
  enrollment: OutreachEnrollmentDocument;
  enrollmentId: string;
  threadId: string;
  questions: QualificationQuestion[];
  config: QualificationConfig;
  bodyText: string;
  conversation: Array<{ direction: 'inbound' | 'outbound'; bodyText: string }>;
  extractedVariables?: Record<string, unknown>;
  intent?: string | null;
  preferredChannel?: 'email' | 'whatsapp' | null;
}): Promise<{ action: string }> {
  const { campaign, enrollment, questions, config } = input;
  let anyCandidateQuestion = false;
  const jobContext = await jobContextBlockForCampaign(campaign);
  const allQuestionSummaries = questions.map((q) => ({ id: q.id, prompt: q.prompt }));

  // Classifier often extracts all numbered answers in one pass — apply before per-question Gemini eval.
  if (input.extractedVariables && Object.keys(input.extractedVariables).length > 0) {
    const answers = { ...(enrollment.qualificationState?.answers || {}) };
    for (const q of questions) {
      const raw = input.extractedVariables[q.id];
      if (raw == null || !String(raw).trim()) continue;
      answers[q.id] = normalizeAnswerRecord(raw, 'ai');
    }
    enrollment.qualificationState = { status: 'in_progress', answers };
    await enrollment.save();

    const doneEarly = await completeQualificationWhenAllAnswered({
      campaign,
      enrollment,
      threadId: input.threadId,
      questions,
      config,
      conversation: input.conversation,
      channel: 'email',
    });
    if (doneEarly) return doneEarly;
  }

  for (const q of openScreeningQuestions(questions, enrollment)) {
    const evaluation = await evaluateScreeningAnswer({
      question: {
        id: q.id,
        prompt: q.prompt,
        answerType: q.answerType,
        knockout: q.knockout,
        knockoutCondition: q.knockoutCondition,
      },
      candidateReply: input.bodyText,
      conversation: input.conversation,
      extractedVariables: input.extractedVariables,
      intent: input.intent,
      channel: 'email',
      jobContext,
      campaignName: campaign.name || null,
      allQuestions: allQuestionSummaries,
    });

    log().info(
      {
        enrollmentId: input.enrollmentId,
        questionId: q.id,
        answersQuestion: evaluation.answersQuestion,
        isNotAnAnswer: evaluation.isNotAnAnswer,
        isCandidateQuestion: evaluation.isCandidateQuestion,
        knockout: evaluation.knockout,
        reason: evaluation.reason,
        model: evaluation.model,
      },
      'Gemini screening answer evaluation'
    );

    if (!evaluation.answersQuestion) {
      if (evaluation.isCandidateQuestion) anyCandidateQuestion = true;
      continue;
    }

    const value =
      (evaluation.answerValue && evaluation.answerValue.trim()) ||
      input.bodyText.trim();

    enrollment.qualificationState = {
      status: 'in_progress',
      answers: {
        ...enrollment.qualificationState?.answers,
        [q.id]: normalizeAnswerRecord(value, 'candidate'),
      },
    };

    const knockout = evaluation.knockout;
    if (knockout === 'fail') {
      await enrollment.save();
      await completeQualification({
        campaign,
        enrollment,
        threadId: input.threadId,
        status: 'rejected',
        reason: `Knockout on ${q.id}: ${q.knockoutCondition || 'failed'}`,
      });
      return { action: 'rejected_knockout' };
    }
  }

  enrollment.lastActionAt = new Date();
  await enrollment.save();

  const finalized = await completeQualificationWhenAllAnswered({
    campaign,
    enrollment,
    threadId: input.threadId,
    questions,
    config,
    conversation: input.conversation,
    channel: 'email',
  });
  if (finalized) return finalized;

  const missed = openScreeningQuestions(questions, enrollment);

  if (anyCandidateQuestion) {
    const jdWhileWaiting = await maybeAnswerCandidateQuestion({
      campaign,
      enrollment,
      threadId: input.threadId,
      bodyText: input.bodyText,
      intent: input.intent,
      preferredChannel: 'email',
    });
    if (jdWhileWaiting.handedOff) {
      return { action: 'answered_and_handed_off' };
    }
  }

  const firstMissedIdx = questions.findIndex((q) => q.id === missed[0]!.id);
  enrollment.replyQuestionIndex = firstMissedIdx >= 0 ? firstMissedIdx : 0;
  await enrollment.save();

  if (missed.length >= 2) {
    const result = await sendQualificationQuestion({
      campaign,
      enrollment,
      threadId: input.threadId,
      question: missed[0]!,
      questionIndex: firstMissedIdx >= 0 ? firstMissedIdx : 0,
      preferredChannel: 'email',
      allQuestions: questions,
      batchQuestions: missed,
      batchKind: 'missed',
    });
    return {
      action: result.sent ? 'asked_missed_batch' : `ask_failed:${result.error}`,
    };
  }

  const one = missed[0]!;
  const result = await sendQualificationQuestion({
    campaign,
    enrollment,
    threadId: input.threadId,
    question: one,
    questionIndex: firstMissedIdx >= 0 ? firstMissedIdx : 0,
    preferredChannel: input.preferredChannel,
    allQuestions: questions,
  });
  return {
    action: result.sent ? 'asked_missed_one' : `ask_failed:${result.error}`,
  };
}

function shouldSendQualificationWrapUp(campaign: OutreachCampaignDocument): boolean {
  // Always close the qualification thread with a thank-you wrap-up when the
  // candidate finishes answering. Auto-screening / Calendly can still run after.
  void campaign;
  return true;
}

/**
 * After all screening answers are in, send a short thank-you wrap-up so the
 * candidate knows a recruiter will follow up. Skipped on knockout rejection.
 */
async function sendQualificationCompletionWrapUp(input: {
  campaign: OutreachCampaignDocument;
  enrollment: OutreachEnrollmentDocument;
  threadId: string;
  status: 'qualified' | 'handed_off';
}): Promise<void> {
  const { campaign, enrollment } = input;
  const organizationId = String(campaign.organizationId);
  const userId = String(campaign.ownerUserId);

  const thread = await ConversationThreadModel.findById(input.threadId)
    .select('channels qualificationStatus')
    .lean();
  if (!thread) return;

  const lastOutreach = await ConversationMessageModel.findOne({
    threadId: input.threadId,
    direction: 'outbound',
    channel: { $in: ['email', 'whatsapp'] },
    messageType: { $nin: ['qualification', 'note', 'system', 'voice_summary'] },
    bodyText: {
      $not: /shared your responses with our recruiting team/i,
    },
  })
    .sort({ createdAt: -1 })
    .select('createdAt')
    .lean();

  const wrapUpOr = [
    { providerMessageId: { $regex: /^qualification-wrapup:/ } },
    {
      bodyText: {
        $regex: /shared your responses with our recruiting team/i,
      },
    },
  ];

  // Block duplicates on this thread after the latest outreach.
  const alreadySentOnThread = await ConversationMessageModel.exists({
    threadId: input.threadId,
    direction: 'outbound',
    $or: wrapUpOr,
    ...(lastOutreach?.createdAt
      ? { createdAt: { $gt: lastOutreach.createdAt } }
      : {}),
  });
  if (alreadySentOnThread) return;

  // Never spam the same candidate again within 24h across their threads.
  const candidateThreadIds = await ConversationThreadModel.find({
    organizationId: campaign.organizationId,
    candidateId: enrollment.candidateId,
  })
    .select('_id')
    .lean();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const alreadySentRecently = await ConversationMessageModel.exists({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    threadId: { $in: candidateThreadIds.map((t) => t._id) },
    direction: 'outbound',
    createdAt: { $gte: dayAgo },
    $or: wrapUpOr,
  });
  if (alreadySentRecently) {
    log().info(
      {
        enrollmentId: String(enrollment._id),
        threadId: input.threadId,
      },
      'Skipping qualification wrap-up — already sent to this candidate recently'
    );
    return;
  }

  const candidate = await SavedCandidateModel.findOne({
    _id: enrollment.candidateId,
    organizationId: campaign.organizationId,
    deletedAt: null,
  })
    .select('email phone name')
    .lean();

  // Prefer email for the wrap-up (matches single-channel email screening).
  const channel =
    pickOutboundChannel(thread.channels as string[] | undefined, campaign, 'email') ||
    pickOutboundChannel(thread.channels as string[] | undefined, campaign, 'whatsapp');
  if (!channel) return;

  const to =
    channel === 'whatsapp'
      ? String(candidate?.phone || '').trim()
      : String(candidate?.email || '').trim();
  if (!to) return;

  const firstName =
    String(candidate?.name || 'there').trim().split(/\s+/)[0] || 'there';
  const config = (campaign.qualificationConfig || {}) as QualificationConfig;
  const nextStep =
    config.autoScreening
      ? `Our team may give you a quick screening call next — please keep an eye on your phone.`
      : campaign.schedulingConfig?.enabled
        ? `A recruiter will share next steps for scheduling shortly.`
        : `A recruiter will be in touch with you soon.`;
  const body =
    `Hi ${firstName},\n\n` +
    `We've shared your responses with our recruiting team. ${nextStep}\n\n` +
    `We appreciate your interest!\n\n` +
    `Best regards`;

  let emailReply: {
    subject: string;
    providerThreadId?: string | null;
    inReplyTo?: string | null;
    references?: string | null;
    gmailMessageIdHint?: string | null;
  } | null = null;
  if (channel === 'email') {
    try {
      emailReply = await resolveEmailReplyContext(
        input.threadId,
        campaign.name || 'your application'
      );
    } catch (error) {
      log().warn(
        { err: error, enrollmentId: String(enrollment._id) },
        'Wrap-up email threading context failed — sending without thread headers'
      );
      emailReply = { subject: `Re: ${campaign.name || 'your application'}` };
    }
  }

  try {
    const sent = await sendAdHocMessage({
      organizationId,
      userId,
      channel,
      to,
      subject: channel === 'email' ? emailReply!.subject : null,
      body,
      senderEmail: campaign.channelConfig?.email?.senderEmail,
      integrationId:
        channel === 'email'
          ? campaign.channelConfig?.email?.integrationId
          : campaign.channelConfig?.whatsapp?.integrationId,
      providerThreadId: emailReply?.providerThreadId,
      inReplyTo: emailReply?.inReplyTo,
      references: emailReply?.references,
      gmailMessageIdHint: emailReply?.gmailMessageIdHint,
    });

    const message = await ConversationMessageModel.create({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      threadId: new mongoose.Types.ObjectId(input.threadId),
      provider: sent.provider || 'system',
      channel,
      direction: 'outbound',
      sender: null,
      recipient: to,
      subject: channel === 'email' ? emailReply?.subject ?? null : null,
      bodyText: body,
      bodyHtml: null,
      providerMessageId:
        sent.providerMessageId || `qualification-wrapup:${input.threadId}:${Date.now()}`,
      providerThreadId: sent.providerThreadId || emailReply?.providerThreadId || null,
      deliveryStatus: 'sent',
      messageType: 'message',
      aiGenerated: true,
      sentAt: new Date(),
    });

    await ConversationThreadModel.updateOne(
      { _id: input.threadId },
      {
        $set: {
          lastMessageAt: new Date(),
          lastRecruiterMessageAt: new Date(),
          lastMessagePreview: body.slice(0, 240),
        },
      }
    );

    await emitOutboundConversationRealtime({
      organizationId,
      threadId: input.threadId,
      messageId: String(message._id),
      channel,
    });

    enrollment.autoReplyCount = (enrollment.autoReplyCount || 0) + 1;

    await logEmailPipeline({
      task: 'qualification wrap-up sent',
      detail: `status=${input.status} channel=${channel}`,
    }).catch(() => undefined);

    log().info(
      {
        enrollmentId: String(enrollment._id),
        campaignId: String(campaign._id),
        status: input.status,
        channel,
      },
      'Sent qualification completion wrap-up'
    );
  } catch (error) {
    log().warn(
      { err: error, enrollmentId: String(enrollment._id), status: input.status },
      'Qualification wrap-up send failed — continuing completion'
    );
  }
}

async function completeQualification(input: {
  campaign: OutreachCampaignDocument;
  enrollment: OutreachEnrollmentDocument;
  threadId: string;
  status: 'qualified' | 'rejected' | 'handed_off';
  reason?: string;
}) {
  const { campaign, enrollment, status } = input;
  const organizationId = String(campaign.organizationId);

  if (
    (status === 'qualified' || status === 'handed_off') &&
    shouldSendQualificationWrapUp(campaign)
  ) {
    await sendQualificationCompletionWrapUp({
      campaign,
      enrollment,
      threadId: input.threadId,
      status,
    });
  }

  if (status === 'qualified' || status === 'rejected') {
    enrollment.qualificationState = {
      status,
      answers: enrollment.qualificationState?.answers || {},
    };
  } else {
    enrollment.qualificationState = {
      status: 'in_progress',
      answers: enrollment.qualificationState?.answers || {},
    };
  }
  enrollment.lastActionAt = new Date();
  await enrollment.save();

  const thread = await ConversationThreadModel.findById(input.threadId);
  if (thread) {
    if (status === 'qualified') {
      thread.qualificationStatus = 'qualified';
      thread.status = 'handed_off';
      thread.automationStatus = 'stopped';
    } else if (status === 'rejected') {
      thread.qualificationStatus = 'rejected';
      thread.status = 'closed';
      thread.automationStatus = 'stopped';
    } else {
      thread.qualificationStatus = 'handed_off';
      thread.status = 'handed_off';
      thread.automationStatus = 'stopped';
    }
    await thread.save();

    emitConversationQualificationUpdated({
      organizationId,
      threadId: input.threadId,
      qualificationStatus: thread.qualificationStatus,
      source: 'ai',
    });
    emitCampaignThreadUpdated({
      organizationId,
      campaignId: thread.campaignId ? String(thread.campaignId) : null,
      threadId: input.threadId,
      status: thread.status,
      unreadCount: thread.unreadCount ?? 0,
      qualificationStatus: thread.qualificationStatus,
    });
  }

  if (status === 'qualified') {
    await OutreachCampaignModel.updateOne(
      { _id: campaign._id },
      { $inc: { 'stats.qualified': 1 } }
    );
    campaign.stats.qualified = (campaign.stats.qualified || 0) + 1;
    campaign.markModified('stats');
  }

  const config = campaign.qualificationConfig as QualificationConfig;
  if (status === 'qualified' && config.autoScreening) {
    try {
      const { screeningId } = await enrollQualifiedCandidateInCampaignScreening({
        campaign,
        enrollment,
      });
      enrollment.screeningState = {
        status: 'scheduled',
        screeningId,
      };
      await enrollment.save();
      emitOutreachEnrollmentUpdated({
        organizationId,
        campaignId: String(campaign._id),
        candidateId: String(enrollment.candidateId),
        enrollmentId: String(enrollment._id),
        status: enrollment.status,
        currentStepIndex: enrollment.currentStepIndex,
        nextSendAt: enrollment.nextActionAt?.toISOString() ?? null,
      });
    } catch (error) {
      log().warn(
        { err: error, enrollmentId: String(enrollment._id), campaignId: String(campaign._id) },
        'Auto enroll in campaign screening failed — marking scheduled without screening id'
      );
      enrollment.screeningState = {
        ...enrollment.screeningState,
        status: 'scheduled',
        screeningId: enrollment.screeningState?.screeningId ?? null,
      };
      await enrollment.save();
    }
  }

  await recordCampaignActivity({
    organizationId,
    campaignId: String(campaign._id),
    enrollmentId: String(enrollment._id),
    type:
      status === 'qualified'
        ? 'enrollment.qualified'
        : status === 'rejected'
          ? 'enrollment.rejected'
          : 'enrollment.handed_off',
    title:
      status === 'qualified'
        ? 'Candidate qualified'
        : status === 'rejected'
          ? 'Candidate rejected (knockout)'
          : 'Conversation handed to recruiter',
    metadata: { reason: input.reason || null },
  }).catch(() => undefined);
}

function shouldHandOffAfterQuestions(config: QualificationConfig): boolean {
  const takeover = String(config.takeoverCondition || '');
  return takeover.includes('After qualification');
}

/**
 * Detect whether the candidate is asking us something (vs answering).
 * Used only to decide whether to answer from the JD — screening answer
 * acceptance is always decided by Gemini via evaluateScreeningAnswer.
 */
function looksLikeCandidateQuestion(bodyText: string, intent?: string | null): boolean {
  const text = bodyText.trim();
  if (!text) return false;
  if (/\?/.test(text)) return true;
  if (intent === 'ask_question') return true;
  return false;
}

async function persistOutboundAiReply(input: {
  organizationId: string;
  threadId: string;
  channel: ConversationChannel;
  body: string;
  subject?: string | null;
  provider: string;
  providerMessageId?: string;
  providerThreadId?: string | null;
  to: string;
}) {
  const message = await ConversationMessageModel.create({
    organizationId: new mongoose.Types.ObjectId(input.organizationId),
    threadId: new mongoose.Types.ObjectId(input.threadId),
    provider: input.provider || 'system',
    channel: input.channel,
    direction: 'outbound',
    sender: null,
    recipient: input.to,
    subject: input.subject ?? null,
    bodyText: input.body,
    bodyHtml: null,
    providerMessageId:
      input.providerMessageId || `ai-reply:${input.threadId}:${Date.now()}`,
    providerThreadId: input.providerThreadId || null,
    deliveryStatus: 'sent',
    messageType: 'message',
    aiGenerated: true,
    sentAt: new Date(),
  });

  const addToSet: Record<string, unknown> = { channels: input.channel };
  if (input.providerThreadId && input.provider) {
    addToSet.providerThreadIds = {
      provider: input.provider,
      threadId: input.providerThreadId,
    };
  }

  await ConversationThreadModel.updateOne(
    { _id: input.threadId },
    {
      $set: {
        lastMessageAt: new Date(),
        lastRecruiterMessageAt: new Date(),
        lastMessagePreview: input.body.slice(0, 240),
        status: 'awaiting_reply',
      },
      $addToSet: addToSet,
    }
  );

  await emitOutboundConversationRealtime({
    organizationId: input.organizationId,
    threadId: input.threadId,
    messageId: String(message._id),
    channel: input.channel,
  });
}

async function ensureJdQualificationQuestions(
  campaign: OutreachCampaignDocument
): Promise<QualificationQuestion[]> {
  const existing = Array.isArray(campaign.qualificationConfig?.questions)
    ? campaign.qualificationConfig.questions
    : [];
  if (existing.length > 0) {
    return existing.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      answerType: q.answerType,
      knockout: q.knockout,
      knockoutCondition: q.knockoutCondition,
    }));
  }

  const job = await loadOutreachJobContext(
    campaign.jobId ? String(campaign.jobId) : null
  );
  if (!job.title && !job.description) return [];

  const draft = await generateQualificationQuestions({
    jobTitle: job.title || undefined,
    jobDescription: job.description || undefined,
    locations: job.locations,
    workplaceType: job.workplaceType,
    requirements: job.requirements,
    requiredSkills: job.requiredSkills,
    experienceRange: job.experienceRange,
    salaryRange: job.salaryRange,
    instructions: 'Generate from the linked job description for outreach qualification.',
  });

  const questions = draft.questions.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    answerType: q.answerType,
    knockout: q.knockout,
    knockoutCondition: q.knockoutCondition ?? null,
  }));

  campaign.qualificationConfig = {
    ...campaign.qualificationConfig,
    enabled: campaign.qualificationConfig?.enabled ?? true,
    aiReplyEnabled: campaign.qualificationConfig?.aiReplyEnabled ?? true,
    questions,
  };
  await campaign.save().catch(() => undefined);
  return questions;
}

async function maybeAnswerCandidateQuestion(input: {
  campaign: OutreachCampaignDocument;
  enrollment: OutreachEnrollmentDocument;
  threadId: string;
  bodyText: string;
  intent?: string | null;
  preferredChannel?: 'email' | 'whatsapp' | null;
}): Promise<{ answered: boolean; handedOff: boolean; error?: string }> {
  if (!looksLikeCandidateQuestion(input.bodyText, input.intent)) {
    return { answered: false, handedOff: false };
  }

  const config = input.campaign.qualificationConfig as QualificationConfig;
  const takeover = String(config.takeoverCondition || '');
  const job = await loadOutreachJobContext(
    input.campaign.jobId ? String(input.campaign.jobId) : null
  );
  const candidate = await SavedCandidateModel.findOne({
    _id: input.enrollment.candidateId,
    organizationId: input.campaign.organizationId,
    deletedAt: null,
  })
    .select('email phone name')
    .lean();

  const thread = await ConversationThreadModel.findById(input.threadId);
  if (!thread) return { answered: false, handedOff: false, error: 'Thread not found' };

  const channel = pickOutboundChannel(
    thread.channels as string[] | undefined,
    input.campaign,
    input.preferredChannel
  );
  if (!channel) return { answered: false, handedOff: false, error: 'No channel' };

  const to =
    channel === 'whatsapp'
      ? String(candidate?.phone || '').trim()
      : String(candidate?.email || '').trim();
  if (!to) return { answered: false, handedOff: false, error: 'Missing contact' };

  const answer = await answerCandidateQuestionFromJd({
    candidateName: candidate?.name,
    jobTitle: job.title,
    jobDescription: job.description,
    locations: job.locations,
    workplaceType: job.workplaceType,
    requirements: job.requirements,
    requiredSkills: job.requiredSkills,
    salaryRange: job.salaryRange,
    candidateQuestion: input.bodyText,
    channel,
  });

  const handoffForCompensation =
    answer.compensationRelated && takeover.includes('compensation');
  const handoffCantAnswer =
    !answer.canAnswer && takeover.includes("can't answer");

  const emailReply =
    channel === 'email'
      ? await resolveEmailReplyContext(
          input.threadId,
          job.title || input.campaign.name || 'your application'
        )
      : null;

  try {
    const sent = await sendAdHocMessage({
      organizationId: String(input.campaign.organizationId),
      userId: String(input.campaign.ownerUserId),
      channel,
      to,
      subject: channel === 'email' ? emailReply!.subject : null,
      body: answer.body,
      senderEmail: input.campaign.channelConfig?.email?.senderEmail,
      integrationId:
        channel === 'email'
          ? input.campaign.channelConfig?.email?.integrationId
          : input.campaign.channelConfig?.whatsapp?.integrationId,
      providerThreadId: emailReply?.providerThreadId,
      inReplyTo: emailReply?.inReplyTo,
      references: emailReply?.references,
      gmailMessageIdHint: emailReply?.gmailMessageIdHint,
    });

    await persistOutboundAiReply({
      organizationId: String(input.campaign.organizationId),
      threadId: input.threadId,
      channel,
      body: answer.body,
      subject: channel === 'email' ? emailReply!.subject : null,
      provider: sent.provider,
      providerMessageId: sent.providerMessageId,
      providerThreadId: sent.providerThreadId || emailReply?.providerThreadId,
      to,
    });

    input.enrollment.autoReplyCount = (input.enrollment.autoReplyCount || 0) + 1;
    await input.enrollment.save();

    await recordCampaignActivity({
      organizationId: String(input.campaign.organizationId),
      campaignId: String(input.campaign._id),
      enrollmentId: String(input.enrollment._id),
      type: 'enrollment.ai_reply',
      title: 'AI answered candidate question from JD',
      metadata: {
        canAnswer: answer.canAnswer,
        compensationRelated: answer.compensationRelated,
        model: answer.model,
      },
    }).catch(() => undefined);
  } catch (error) {
    return {
      answered: false,
      handedOff: false,
      error: error instanceof Error ? error.message : 'AI reply send failed',
    };
  }

  if (handoffForCompensation || handoffCantAnswer) {
    await completeQualification({
      campaign: input.campaign,
      enrollment: input.enrollment,
      threadId: input.threadId,
      status: 'handed_off',
      reason: handoffCantAnswer
        ? "AI couldn't answer from JD — recruiter takeover"
        : 'Compensation question — recruiter takeover',
    });
    return { answered: true, handedOff: true };
  }

  return { answered: true, handedOff: false };
}

/**
 * Drive qualification Q&A after an inbound reply has been classified.
 */
export async function processQualificationAfterReply(input: {
  organizationId: string;
  campaign: OutreachCampaignDocument;
  enrollmentId: string;
  threadId: string;
  bodyText: string;
  interest: string;
  intent?: string | null;
  extractedVariables?: Record<string, unknown>;
  preferredChannel?: 'email' | 'whatsapp' | null;
}): Promise<{ action: string }> {
  log().info(
    {
      enrollmentId: input.enrollmentId,
      campaignId: String(input.campaign._id),
      interest: input.interest,
      intent: input.intent,
      preferredChannel: input.preferredChannel,
      bodyPreview: String(input.bodyText || '').slice(0, 120),
    },
    'processQualificationAfterReply start'
  );

  const config = (input.campaign.qualificationConfig || {
    enabled: true,
    questions: [],
    aiReplyEnabled: true,
  }) as QualificationConfig;

  // Qualification + AI reply are always-on in the product UI. Only skip when the
  // campaign has no questions AND was explicitly disabled (legacy).
  const hasQuestions = Array.isArray(config.questions) && config.questions.length > 0;
  if (config.enabled === false && !hasQuestions) {
    log().info(
      { enrollmentId: input.enrollmentId, campaignId: String(input.campaign._id) },
      'Qualification skipped — disabled and no questions'
    );
    return { action: 'skipped_disabled' };
  }

  if (input.interest === 'opt_out' || input.interest === 'not_interested') {
    return { action: 'skipped_not_interested' };
  }

  const enrollment = await OutreachEnrollmentModel.findById(input.enrollmentId);
  if (!enrollment) return { action: 'missing_enrollment' };

  /**
   * Fresh outreach cycle detection:
   * If the latest campaign send on this thread has no screening question after it,
   * wipe stale answers/completion state and start Q1 — never re-send an old wrap-up.
   */
  const latestOutreach = await ConversationMessageModel.findOne({
    threadId: input.threadId,
    direction: 'outbound',
    channel: { $in: ['email', 'whatsapp'] },
    messageType: { $nin: ['qualification', 'note', 'system', 'voice_summary'] },
    bodyText: {
      $not: /shared your responses with our recruiting team/i,
    },
  })
    .sort({ sentAt: -1, createdAt: -1 })
    .select('_id createdAt sentAt')
    .lean();

  const outreachAt = latestOutreach?.sentAt || latestOutreach?.createdAt || null;
  const qualAfterOutreach = outreachAt
    ? await ConversationMessageModel.exists({
        threadId: input.threadId,
        direction: 'outbound',
        messageType: 'qualification',
        createdAt: { $gt: outreachAt },
      })
    : await ConversationMessageModel.exists({
        threadId: input.threadId,
        direction: 'outbound',
        messageType: 'qualification',
      });

  const qualStatus = String(enrollment.qualificationState?.status || '');
  // Any reply after a fresh campaign send (before screening Qs) starts a new cycle.
  const needsFreshCycle = Boolean(latestOutreach) && !qualAfterOutreach;

  if (needsFreshCycle) {
    const hadStaleProgress =
      ['qualified', 'rejected', 'in_progress'].includes(qualStatus) ||
      (typeof enrollment.replyQuestionIndex === 'number' &&
        enrollment.replyQuestionIndex >= 0) ||
      Object.keys(enrollment.qualificationState?.answers || {}).length > 0;

    log().info(
      {
        enrollmentId: input.enrollmentId,
        qualificationStatus: qualStatus,
        latestOutreachId: String(latestOutreach?._id),
        outreachAt,
        hadStaleProgress,
      },
      'Starting fresh qualification cycle after newer outreach'
    );
    enrollment.qualificationState = { status: 'pending', answers: {} };
    enrollment.replyQuestionIndex = -1;
    enrollment.autoReplyCount = 0;
    if (
      ['completed', 'stopped', 'qualified', 'replied'].includes(
        String(enrollment.status)
      )
    ) {
      enrollment.status = 'replied';
    }
    await enrollment.save();
  } else if (qualStatus === 'qualified' || qualStatus === 'rejected') {
    log().info(
      {
        enrollmentId: input.enrollmentId,
        qualificationStatus: qualStatus,
      },
      'Qualification skipped — enrollment already complete for this outreach cycle'
    );
    return { action: 'skipped_already_complete' };
  }

  // Never block Q&A sends on a missing/false aiReplyEnabled flag (legacy campaigns).
  // Classification-only mode is no longer exposed in the builder.

  // Answer candidate questions from the linked JD before continuing Q&A.
  // While a screening question is open, Gemini decides answer vs question later —
  // skip the early JD pass so we don't answer from JD before evaluating the screening reply.
  const waitingForAnswer = nextQuestionIndex(enrollment) >= 0;
  const jdReply = waitingForAnswer
    ? { answered: false, handedOff: false }
    : await maybeAnswerCandidateQuestion({
        campaign: input.campaign,
        enrollment,
        threadId: input.threadId,
        bodyText: input.bodyText,
        intent: input.intent,
        preferredChannel: input.preferredChannel,
      });
  if (jdReply.handedOff) {
    return { action: 'answered_and_handed_off' };
  }

  let questions = await ensureJdQualificationQuestions(input.campaign);
  if (questions.length === 0) {
    // Last-resort defaults so engaged replies always get a follow-up question.
    questions = [
      {
        id: 'q-default-notice',
        prompt: 'What is your notice period (in days)?',
        answerType: 'Number',
        knockout: false,
        knockoutCondition: null,
      },
      {
        id: 'q-default-location',
        prompt: 'Are you open to the work location listed for this role?',
        answerType: 'Yes / No',
        knockout: false,
        knockoutCondition: null,
      },
    ];
    input.campaign.qualificationConfig = {
      ...input.campaign.qualificationConfig,
      enabled: true,
      aiReplyEnabled: true,
      questions,
    };
    await input.campaign.save().catch(() => undefined);
    log().info(
      { campaignId: String(input.campaign._id) },
      'Using default qualification questions — campaign had none configured'
    );
  }

  let waitingIndex = nextQuestionIndex(enrollment);

  const threadDocEarly = await ConversationThreadModel.findById(input.threadId)
    .select('channels')
    .lean();
  const screeningChannel = preferWhatsAppScreening(input.preferredChannel, input.campaign)
    ? 'whatsapp'
    : 'email';

  // Only real screening follow-ups count — campaign outreach is also stored with
  // aiGenerated:true, so never treat that as "already asked qualification".
  const qualSent = await ConversationMessageModel.exists({
    threadId: input.threadId,
    direction: 'outbound',
    messageType: 'qualification',
  });

  // Never sent a screening question but index/answers look "done" — common when
  // engagement replies ("Sure, I'd be happy to chat") were wrongly stored as
  // answers. Wipe and restart from Q1 instead of completing.
  if (!qualSent && waitingIndex >= 0) {
    log().warn(
      {
        enrollmentId: input.enrollmentId,
        staleIndex: waitingIndex,
        autoReplyCount: enrollment.autoReplyCount || 0,
        answers: Object.keys(enrollment.qualificationState?.answers || {}),
      },
      'Qualification marked progressed but no screening email was ever sent — restarting at Q1'
    );
    enrollment.replyQuestionIndex = -1;
    enrollment.autoReplyCount = 0;
    enrollment.qualificationState = { status: 'pending', answers: {} };
    await enrollment.save().catch(() => undefined);
    waitingIndex = -1;
  }

  // Self-heal stale/corrupt replyQuestionIndex: if it points past the end but the
  // candidate hasn't actually answered every question yet, restart from the first
  // unanswered question instead of silently completing.
  if (waitingIndex >= questions.length) {
    const answersState = enrollment.qualificationState?.answers || {};
    const firstUnanswered = questions.findIndex(
      (q) => !answerValue(answersState[q.id]).trim()
    );
    if (firstUnanswered >= 0) {
      log().warn(
        {
          enrollmentId: input.enrollmentId,
          staleIndex: waitingIndex,
          questionsLength: questions.length,
          resumingAt: firstUnanswered,
        },
        'Qualification replyQuestionIndex was past the end with unanswered questions — resuming'
      );
      enrollment.replyQuestionIndex = firstUnanswered;
      waitingIndex = firstUnanswered;
    } else if (!qualSent) {
      // All "answers" present but never actually asked — force Q1.
      enrollment.replyQuestionIndex = -1;
      enrollment.qualificationState = { status: 'pending', answers: {} };
      await enrollment.save().catch(() => undefined);
      waitingIndex = -1;
    }
  }

  const qualEmailBatched = await qualificationEmailWasBatched(input.threadId);
  if (screeningChannel === 'email' && !qualEmailBatched && (qualSent || waitingIndex >= 0)) {
    log().info(
      {
        enrollmentId: input.enrollmentId,
        qualSent,
        waitingIndex,
        questionCount: questions.length,
      },
      'Email screening not batched yet — resetting enrollment to send all questions in one follow-up'
    );
    enrollment.qualificationState = { status: 'in_progress', answers: {} };
    enrollment.replyQuestionIndex = null;
    await enrollment.save().catch(() => undefined);
    waitingIndex = -1;
  }

  log().info(
    {
      enrollmentId: input.enrollmentId,
      screeningChannel,
      waitingIndex,
      questionCount: questions.length,
      qualSent,
      qualEmailBatched,
    },
    'Qualification screening state'
  );

  // Not yet asked anything — send all predefined questions in one email (email) or Q1 (WhatsApp).
  if (waitingIndex < 0) {
    const engaged =
      input.interest === 'interested' ||
      input.interest === 'maybe' ||
      input.interest === 'neutral' ||
      input.interest === 'unclear' ||
      jdReply.answered ||
      input.intent === 'ask_question' ||
      input.intent === 'request_call' ||
      input.intent === 'provide_info' ||
      /\b(happy to|would like to|interested|sure,?|yes\b|okay|ok\b)/i.test(
        String(input.bodyText || '')
      );
    if (!engaged) {
      log().info(
        {
          enrollmentId: input.enrollmentId,
          interest: input.interest,
          intent: input.intent,
        },
        'Qualification skipped — low interest'
      );
      return {
        action: jdReply.answered ? 'answered_only' : 'skipped_low_interest',
      };
    }
    const first = questions[0];
    if (!first) return { action: 'skipped_no_questions' };

    if (screeningChannel === 'email' && questions.length < 2) {
      log().warn(
        {
          enrollmentId: input.enrollmentId,
          campaignId: String(input.campaign._id),
          questionCount: questions.length,
        },
        'Campaign has fewer than 2 qualification questions — email batch will send a single question'
      );
    }

    const emailBatch =
      !preferWhatsAppScreening(input.preferredChannel, input.campaign) &&
      questions.length >= 2;

    const result = await sendQualificationQuestion({
      campaign: input.campaign,
      enrollment,
      threadId: input.threadId,
      question: first,
      questionIndex: 0,
      preferredChannel: emailBatch ? 'email' : input.preferredChannel,
      allQuestions: questions,
      ...(emailBatch
        ? { batchQuestions: questions, batchKind: 'initial' as const }
        : {}),
    });
    return {
      action: result.sent
        ? jdReply.answered
          ? emailBatch
            ? 'answered_then_asked_all'
            : 'answered_then_asked_first'
          : emailBatch
            ? 'asked_all_questions'
            : 'asked_first'
        : `ask_failed:${result.error}`,
    };
  }

  // Waiting for answer — email evaluates all questions; WhatsApp one-by-one.
  const conversation = await loadRecentConversation(input.threadId);

  if (waitingIndex >= questions.length || !questions[waitingIndex]) {
    const stillNoQual = await ConversationMessageModel.exists({
      threadId: input.threadId,
      direction: 'outbound',
      messageType: 'qualification',
      ...(outreachAt ? { createdAt: { $gt: outreachAt } } : {}),
    });
    if (!stillNoQual && questions[0]) {
      enrollment.replyQuestionIndex = -1;
      enrollment.qualificationState = { status: 'pending', answers: {} };
      await enrollment.save().catch(() => undefined);
      const result = await sendQualificationQuestion({
        campaign: input.campaign,
        enrollment,
        threadId: input.threadId,
        question: questions[0],
        questionIndex: 0,
        preferredChannel: screeningChannel === 'email' ? 'email' : input.preferredChannel,
        allQuestions: questions,
        ...(screeningChannel === 'email'
          ? { batchQuestions: questions, batchKind: 'initial' as const }
          : {}),
      });
      return {
        action: result.sent ? 'asked_first_recovered' : `ask_failed:${result.error}`,
      };
    }
    // Refuse to complete/wrap-up when this outreach cycle never asked screening Qs.
    if (!stillNoQual) {
      log().warn(
        { enrollmentId: input.enrollmentId, threadId: input.threadId },
        'Refusing qualification wrap-up — no screening questions in current outreach cycle'
      );
      return { action: 'skipped_no_cycle_questions' };
    }
    const finalizedEarly = await completeQualificationWhenAllAnswered({
      campaign: input.campaign,
      enrollment,
      threadId: input.threadId,
      questions,
      config,
      conversation,
      channel: screeningChannel,
    });
    if (finalizedEarly) return finalizedEarly;
    await completeQualification({
      campaign: input.campaign,
      enrollment,
      threadId: input.threadId,
      status: 'qualified',
    });
    return { action: 'completed' };
  }

  let idx = waitingIndex;

  const jobContext = await jobContextBlockForCampaign(input.campaign);
  const allQuestionSummaries = questions.map((q) => ({ id: q.id, prompt: q.prompt }));

  if (!preferWhatsAppScreening(input.preferredChannel, input.campaign)) {
    return processEmailQualificationReply({
      campaign: input.campaign,
      enrollment,
      enrollmentId: input.enrollmentId,
      threadId: input.threadId,
      questions,
      config,
      bodyText: input.bodyText,
      conversation,
      extractedVariables: input.extractedVariables,
      intent: input.intent,
      preferredChannel: 'email',
    });
  }

  while (idx < questions.length) {
    const current = questions[idx];
    if (!current) break;

    const evaluation = await evaluateScreeningAnswer({
      question: {
        id: current.id,
        prompt: current.prompt,
        answerType: current.answerType,
        knockout: current.knockout,
        knockoutCondition: current.knockoutCondition,
      },
      candidateReply: input.bodyText,
      conversation,
      extractedVariables: input.extractedVariables,
      intent: input.intent,
      channel: screeningChannel,
      jobContext,
      campaignName: input.campaign.name || null,
      allQuestions: allQuestionSummaries,
    });

    log().info(
      {
        enrollmentId: input.enrollmentId,
        questionId: current.id,
        answersQuestion: evaluation.answersQuestion,
        isNotAnAnswer: evaluation.isNotAnAnswer,
        isCandidateQuestion: evaluation.isCandidateQuestion,
        knockout: evaluation.knockout,
        reason: evaluation.reason,
        model: evaluation.model,
      },
      'Gemini screening answer evaluation'
    );

    if (!evaluation.answersQuestion && evaluation.isCandidateQuestion) {
      const jdWhileWaiting = await maybeAnswerCandidateQuestion({
        campaign: input.campaign,
        enrollment,
        threadId: input.threadId,
        bodyText: input.bodyText,
        intent: input.intent,
        preferredChannel: input.preferredChannel,
      });
      if (jdWhileWaiting.handedOff) {
        return { action: 'answered_and_handed_off' };
      }
      const result = await sendQualificationQuestion({
        campaign: input.campaign,
        enrollment,
        threadId: input.threadId,
        question: current,
        questionIndex: idx,
        preferredChannel: input.preferredChannel,
        allQuestions: questions,
      });
      return {
        action: result.sent
          ? jdWhileWaiting.answered
            ? 'answered_then_reasked'
            : 'reasked_not_an_answer'
          : `ask_failed:${result.error}`,
      };
    }

    if (!evaluation.answersQuestion) {
      const result = await sendQualificationQuestion({
        campaign: input.campaign,
        enrollment,
        threadId: input.threadId,
        question: current,
        questionIndex: idx,
        preferredChannel: input.preferredChannel,
        allQuestions: questions,
      });
      return {
        action: result.sent ? 'reasked_not_an_answer' : `ask_failed:${result.error}`,
      };
    }

    const value =
      (evaluation.answerValue && evaluation.answerValue.trim()) ||
      input.bodyText.trim();

    enrollment.qualificationState = {
      status: 'in_progress',
      answers: {
        ...enrollment.qualificationState.answers,
        [current.id]: normalizeAnswerRecord(value, 'candidate'),
      },
    };

    const knockout = evaluation.knockout;
    if (knockout === 'fail') {
      await enrollment.save();
      await completeQualification({
        campaign: input.campaign,
        enrollment,
        threadId: input.threadId,
        status: 'rejected',
        reason: `Knockout on ${current.id}: ${current.knockoutCondition || 'failed'}`,
      });
      return { action: 'rejected_knockout' };
    }

    idx += 1;
    enrollment.replyQuestionIndex = idx;
    await enrollment.save();

    if (idx >= questions.length) {
      const finalized = await completeQualificationWhenAllAnswered({
        campaign: input.campaign,
        enrollment,
        threadId: input.threadId,
        questions,
        config,
        conversation,
        channel: screeningChannel,
      });
      if (finalized) return finalized;
      return { action: 'qualified' };
    }

    const next = questions[idx]!;
    const result = await sendQualificationQuestion({
      campaign: input.campaign,
      enrollment,
      threadId: input.threadId,
      question: next,
      questionIndex: idx,
      preferredChannel: input.preferredChannel,
      allQuestions: questions,
    });
    return { action: result.sent ? 'asked_next' : `ask_failed:${result.error}` };
  }

  const finalizedTail = await completeQualificationWhenAllAnswered({
    campaign: input.campaign,
    enrollment,
    threadId: input.threadId,
    questions,
    config,
    conversation,
    channel: screeningChannel,
  });
  if (finalizedTail) return finalizedTail;

  await completeQualification({
    campaign: input.campaign,
    enrollment,
    threadId: input.threadId,
    status: 'qualified',
  });
  return { action: 'completed' };
}
