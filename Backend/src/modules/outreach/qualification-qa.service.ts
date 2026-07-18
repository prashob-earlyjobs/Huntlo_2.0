/**
 * End-to-end qualification Q&A after a candidate replies to outreach.
 * Asks configured questions one-by-one (free-text), evaluates knockouts,
 * then qualifies / hands off / optionally flags screening.
 */

import mongoose from 'mongoose';

import { getLogger } from '../../config/logger.js';
import { answerCandidateQuestionFromJd } from '../../providers/gemini/gemini.conversations.js';
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
import { loadOutreachJobContext } from './job-context.js';

const log = () => getLogger().child({ component: 'qualification-qa' });

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

function pickOutboundChannel(
  threadChannels: string[] | undefined,
  campaign: OutreachCampaignDocument,
  preferred?: 'email' | 'whatsapp' | null
): 'email' | 'whatsapp' | null {
  if (preferred === 'email' || preferred === 'whatsapp') {
    if (preferred === 'email' && campaign.channelConfig?.email?.enabled !== false) {
      return 'email';
    }
    if (preferred === 'whatsapp' && campaign.channelConfig?.whatsapp?.enabled !== false) {
      return 'whatsapp';
    }
  }
  const last = [...(threadChannels || [])].reverse().find((c) => c === 'email' || c === 'whatsapp');
  if (last === 'whatsapp' || last === 'email') return last;
  if (campaign.channelConfig?.whatsapp?.enabled) return 'whatsapp';
  if (campaign.channelConfig?.email?.enabled) return 'email';
  return null;
}

async function persistOutboundQuestion(input: {
  organizationId: string;
  threadId: string;
  channel: ConversationChannel;
  body: string;
  provider: string;
  providerMessageId?: string;
  to: string;
}) {
  await ConversationMessageModel.create({
    organizationId: new mongoose.Types.ObjectId(input.organizationId),
    threadId: new mongoose.Types.ObjectId(input.threadId),
    provider: input.provider || 'system',
    channel: input.channel,
    direction: 'outbound',
    sender: null,
    recipient: input.to,
    subject: null,
    bodyText: input.body,
    bodyHtml: null,
    providerMessageId:
      input.providerMessageId || `qualification:${input.threadId}:${Date.now()}`,
    providerThreadId: null,
    deliveryStatus: 'sent',
    messageType: 'qualification',
    aiGenerated: true,
    sentAt: new Date(),
  });

  await ConversationThreadModel.updateOne(
    { _id: input.threadId },
    {
      $set: {
        lastMessageAt: new Date(),
        lastRecruiterMessageAt: new Date(),
        lastMessagePreview: input.body.slice(0, 240),
        status: 'awaiting_reply',
        qualificationStatus: 'in_progress',
      },
      $addToSet: { channels: input.channel },
    }
  );
}

export async function sendQualificationQuestion(input: {
  campaign: OutreachCampaignDocument;
  enrollment: OutreachEnrollmentDocument;
  threadId: string;
  question: QualificationQuestion;
  questionIndex: number;
  preferredChannel?: 'email' | 'whatsapp' | null;
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

  const channel = pickOutboundChannel(
    thread.channels as string[] | undefined,
    campaign,
    input.preferredChannel
  );
  if (!channel) return { sent: false, error: 'No email/WhatsApp channel available' };

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
  const intro =
    input.questionIndex === 0
      ? `Thanks for getting back, ${firstName}! Quick question to move forward:\n\n`
      : `Thanks — next question:\n\n`;
  const body = `${intro}${question.prompt}`;

  try {
    const sent = await sendAdHocMessage({
      organizationId,
      userId,
      channel,
      to,
      subject:
        channel === 'email'
          ? `Quick question — ${campaign.name || 'your application'}`
          : null,
      body,
      senderEmail: campaign.channelConfig?.email?.senderEmail,
      integrationId:
        channel === 'email'
          ? campaign.channelConfig?.email?.integrationId
          : campaign.channelConfig?.whatsapp?.integrationId,
    });

    await persistOutboundQuestion({
      organizationId,
      threadId: input.threadId,
      channel,
      body,
      provider: sent.provider,
      providerMessageId: sent.providerMessageId,
      to,
    });

    enrollment.replyQuestionIndex = input.questionIndex;
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
      title: `Asked qualification question ${input.questionIndex + 1}`,
      metadata: { questionId: question.id, channel },
    }).catch(() => undefined);

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

async function completeQualification(input: {
  campaign: OutreachCampaignDocument;
  enrollment: OutreachEnrollmentDocument;
  threadId: string;
  status: 'qualified' | 'rejected' | 'handed_off';
  reason?: string;
}) {
  const { campaign, enrollment, status } = input;
  const organizationId = String(campaign.organizationId);

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
    enrollment.screeningState = {
      ...enrollment.screeningState,
      status: 'scheduled',
    };
    await enrollment.save();
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

function looksLikeCandidateQuestion(bodyText: string, intent?: string | null): boolean {
  if (intent === 'ask_question') return true;
  const text = bodyText.trim();
  if (!text) return false;
  if (/\?/.test(text)) return true;
  return /^(what|when|where|who|why|how|is|are|can|do|does|will|would|could)\b/i.test(
    text
  );
}

async function persistOutboundAiReply(input: {
  organizationId: string;
  threadId: string;
  channel: ConversationChannel;
  body: string;
  provider: string;
  providerMessageId?: string;
  to: string;
}) {
  await ConversationMessageModel.create({
    organizationId: new mongoose.Types.ObjectId(input.organizationId),
    threadId: new mongoose.Types.ObjectId(input.threadId),
    provider: input.provider || 'system',
    channel: input.channel,
    direction: 'outbound',
    sender: null,
    recipient: input.to,
    subject: null,
    bodyText: input.body,
    bodyHtml: null,
    providerMessageId:
      input.providerMessageId || `ai-reply:${input.threadId}:${Date.now()}`,
    providerThreadId: null,
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
        lastMessagePreview: input.body.slice(0, 240),
        status: 'awaiting_reply',
      },
      $addToSet: { channels: input.channel },
    }
  );
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

  try {
    const sent = await sendAdHocMessage({
      organizationId: String(input.campaign.organizationId),
      userId: String(input.campaign.ownerUserId),
      channel,
      to,
      subject:
        channel === 'email'
          ? `Re: ${job.title || input.campaign.name || 'your application'}`
          : null,
      body: answer.body,
      senderEmail: input.campaign.channelConfig?.email?.senderEmail,
      integrationId:
        channel === 'email'
          ? input.campaign.channelConfig?.email?.integrationId
          : input.campaign.channelConfig?.whatsapp?.integrationId,
    });

    await persistOutboundAiReply({
      organizationId: String(input.campaign.organizationId),
      threadId: input.threadId,
      channel,
      body: answer.body,
      provider: sent.provider,
      providerMessageId: sent.providerMessageId,
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
  const config = (input.campaign.qualificationConfig || {
    enabled: false,
    questions: [],
  }) as QualificationConfig;

  if (!config.enabled) {
    return { action: 'skipped_disabled' };
  }

  if (input.interest === 'opt_out' || input.interest === 'not_interested') {
    return { action: 'skipped_not_interested' };
  }

  const enrollment = await OutreachEnrollmentModel.findById(input.enrollmentId);
  if (!enrollment) return { action: 'missing_enrollment' };

  // AI reply / Q&A asking requires the toggle (classification-only mode skips sends).
  if (!config.aiReplyEnabled) {
    // Still merge extracted answers for recruiter visibility.
    if (input.extractedVariables && Object.keys(input.extractedVariables).length) {
      enrollment.qualificationState = {
        status:
          enrollment.qualificationState.status === 'pending'
            ? 'in_progress'
            : enrollment.qualificationState.status,
        answers: {
          ...enrollment.qualificationState.answers,
          ...Object.fromEntries(
            Object.entries(input.extractedVariables).map(([k, v]) => [
              k,
              normalizeAnswerRecord(v, 'ai'),
            ])
          ),
        },
      };
      await enrollment.save();
    }
    return { action: 'classification_only' };
  }

  // Answer candidate questions from the linked JD before continuing Q&A.
  const jdReply = await maybeAnswerCandidateQuestion({
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
    // No questions and no JD to generate from → interested reply auto-qualifies.
    if (
      input.interest === 'interested' ||
      input.interest === 'maybe' ||
      input.interest === 'unclear' ||
      jdReply.answered
    ) {
      await completeQualification({
        campaign: input.campaign,
        enrollment,
        threadId: input.threadId,
        status: shouldHandOffAfterQuestions(config) ? 'handed_off' : 'qualified',
        reason: 'No qualification questions configured',
      });
      return {
        action: jdReply.answered ? 'answered_then_auto_qualified' : 'auto_qualified_empty',
      };
    }
    return {
      action: jdReply.answered ? 'answered_only' : 'skipped_no_questions',
    };
  }

  const waitingIndex = nextQuestionIndex(enrollment);

  // Not yet asked anything — start with Q1 on engaged replies.
  if (waitingIndex < 0) {
    const engaged =
      input.interest === 'interested' ||
      input.interest === 'maybe' ||
      input.interest === 'unclear' ||
      jdReply.answered ||
      input.intent === 'ask_question' ||
      input.intent === 'request_call';
    if (!engaged) {
      return {
        action: jdReply.answered ? 'answered_only' : 'skipped_low_interest',
      };
    }
    const first = questions[0];
    if (!first) return { action: 'skipped_no_questions' };
    const result = await sendQualificationQuestion({
      campaign: input.campaign,
      enrollment,
      threadId: input.threadId,
      question: first,
      questionIndex: 0,
      preferredChannel: input.preferredChannel,
    });
    return {
      action: result.sent
        ? jdReply.answered
          ? 'answered_then_asked_first'
          : 'asked_first'
        : `ask_failed:${result.error}`,
    };
  }

  // Waiting for answer to questions[waitingIndex]
  const current = questions[waitingIndex];
  if (!current) {
    await completeQualification({
      campaign: input.campaign,
      enrollment,
      threadId: input.threadId,
      status: 'qualified',
    });
    return { action: 'completed' };
  }

  const fromExtract =
    input.extractedVariables?.[current.id] ??
    input.extractedVariables?.[`q${waitingIndex + 1}`] ??
    input.extractedVariables?.answer;
  const value = fromExtract != null ? answerValue(fromExtract) : input.bodyText.trim();

  // Candidate asked something instead of answering — we already replied from JD; re-ask.
  if (
    jdReply.answered &&
    fromExtract == null &&
    looksLikeCandidateQuestion(input.bodyText, input.intent) &&
    evaluateKnockout(current, value) === 'unknown'
  ) {
    const result = await sendQualificationQuestion({
      campaign: input.campaign,
      enrollment,
      threadId: input.threadId,
      question: current,
      questionIndex: waitingIndex,
      preferredChannel: input.preferredChannel,
    });
    return {
      action: result.sent ? 'answered_then_reasked' : `ask_failed:${result.error}`,
    };
  }

  enrollment.qualificationState = {
    status: 'in_progress',
    answers: {
      ...enrollment.qualificationState.answers,
      [current.id]: normalizeAnswerRecord(value, 'candidate'),
    },
  };

  const knockout = evaluateKnockout(current, value);
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

  const nextIndex = waitingIndex + 1;
  if (nextIndex >= questions.length) {
    enrollment.replyQuestionIndex = nextIndex;
    await enrollment.save();
    const handoff = shouldHandOffAfterQuestions(config);
    await completeQualification({
      campaign: input.campaign,
      enrollment,
      threadId: input.threadId,
      status: handoff ? 'handed_off' : 'qualified',
      reason: handoff ? config.takeoverCondition || 'Takeover after questions' : undefined,
    });
    return { action: handoff ? 'handed_off' : 'qualified' };
  }

  await enrollment.save();
  const next = questions[nextIndex]!;
  const result = await sendQualificationQuestion({
    campaign: input.campaign,
    enrollment,
    threadId: input.threadId,
    question: next,
    questionIndex: nextIndex,
    preferredChannel: input.preferredChannel,
  });
  return { action: result.sent ? 'asked_next' : `ask_failed:${result.error}` };
}
