/**
 * Run post-qualification hiring flows (WhatsApp template → questions → branches).
 */
import { getLogger } from '../../config/logger.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { ConversationMessageModel } from '../conversations/conversation-message.model.js';
import { ConversationThreadModel } from '../conversations/conversation-thread.model.js';
import { emitConversationMessageCreated } from '../../realtime/events.js';
import { JobModel } from '../jobs/job.model.js';
import {
  HiringFlowModel,
  type HiringFlowStep,
} from './hiring-flow.model.js';
import {
  ensureSingleLockedWhatsAppStep,
  findFirstMessageStep,
} from './hiring-flows.service.js';
import type { OutreachCampaignDocument } from './campaign.model.js';
import {
  OutreachEnrollmentModel,
  type OutreachEnrollmentDocument,
} from './enrollment.model.js';
import {
  getApprovedTemplate,
  renderWhatsAppTemplatePreview,
} from './whatsapp-template-catalogue.js';
import {
  buildMetaTemplateBodyParameters,
  findApprovedMetaTemplate,
  type MetaWhatsAppTemplate,
} from '../../providers/meta-whatsapp/meta.templates.js';
import { buildCandidateMergeContext } from './variables.js';
import { formatOutreachJobContextForPrompt, loadOutreachJobContext } from './job-context.js';
import {
  buildWhatsAppPostQualificationPrompt,
  formatKnockoutPassCondition,
} from './prompt/index.js';
import {
  WHATSAPP_YES_NO_BUTTONS,
  type GatewayWhatsAppQuestion,
} from '../../providers/whatsapp/whatsapp.gateway.js';

function log() {
  return getLogger().child({ component: 'hiring-flow-runtime' });
}

export function isYesNoAnswerType(answerType?: string | null): boolean {
  return /yes\s*\/\s*no|boolean/i.test(String(answerType || ''));
}

/** Campaign enrollments that must not keep receiving hiring-flow replies. */
export function isClosedOutreachEnrollmentStatus(status?: string | null): boolean {
  return ['completed', 'cancelled', 'opted_out'].includes(String(status || ''));
}

/**
 * Hiring-flow statuses that may consume an inbound reply.
 * `active` / `processing_reply` mean this enrollment is already sending the next step.
 */
export function isHiringFlowReplyAdvanceable(status?: string | null): boolean {
  return ['waiting_reply', 'completed', 'failed'].includes(String(status || ''));
}

/** True when the "prompt" is only an answer-type label, not a real question. */
export function isAnswerTypeStubPrompt(text?: string | null): boolean {
  return /^(yes\s*\/\s*no|boolean|short text|number|text)$/i.test(
    String(text || '').trim()
  );
}

/**
 * WhatsApp body for an ask_question step.
 * Editors often put the real question in `label` and type "Yes/No" into `prompt`.
 */
export function resolveHiringFlowQuestionBody(step: HiringFlowStep): string {
  const prompt = String(step.prompt || '').trim();
  const label = String(step.label || '').trim();
  if (prompt && !isAnswerTypeStubPrompt(prompt)) return prompt;
  if (label && !/^new question$/i.test(label)) return label;
  return prompt || label;
}

const YES_NO_REPLY_BUTTONS = [
  { id: 'yes', title: 'Yes' },
  { id: 'no', title: 'No' },
];

function fillMetaTemplateBody(
  template: MetaWhatsAppTemplate | null,
  mergeContext: Record<string, string>
): string {
  if (!template?.body) return '';
  const params = buildMetaTemplateBodyParameters(template.variableCount, mergeContext);
  return template.body.replace(/\{\{\s*(\d+)\s*\}\}/g, (full, raw) => {
    const index = Number(raw);
    return params[index - 1] || full;
  });
}

function findStep(steps: HiringFlowStep[], id: string | null | undefined) {
  if (!id) return null;
  return steps.find((step) => step.id === id) || null;
}

export function resolveHiringFlowBranch(
  step: HiringFlowStep,
  replyText: string
): string | null {
  const text = String(replyText || '').trim().toLowerCase();
  const branches = step.branches || [];
  for (const branch of branches) {
    if (branch.match === 'yes' && /^(yes|y|haan|ha|ok|okay)\b/i.test(text)) {
      return branch.nextStepId;
    }
    if (branch.match === 'no' && /^(no|n|nahi|na)\b/i.test(text)) {
      return branch.nextStepId;
    }
    if (
      branch.match === 'contains' &&
      branch.value &&
      text.includes(String(branch.value).toLowerCase())
    ) {
      return branch.nextStepId;
    }
  }
  const any = branches.find((branch) => branch.match === 'any');
  if (any) return any.nextStepId;
  return step.nextStepId || null;
}

function sequentialStepAfter(
  steps: HiringFlowStep[],
  current: HiringFlowStep,
  replyText?: string
): HiringFlowStep | null {
  const idx = steps.findIndex((step) => step.id === current.id);
  for (let i = idx + 1; i < steps.length; i += 1) {
    const step = steps[i];
    if (!step) continue;
    if (
      current.type === 'send_whatsapp_template' &&
      step.type === 'send_whatsapp_template'
    ) {
      continue;
    }
    if (step.type === 'branch') {
      const resolvedId = resolveHiringFlowBranch(step, replyText || '');
      const resolved = findStep(steps, resolvedId);
      if (resolved) return resolved;
      continue;
    }
    return step;
  }
  return null;
}

function hopOnce(
  steps: HiringFlowStep[],
  current: HiringFlowStep,
  replyText?: string
): HiringFlowStep | null {
  let nextId = current.nextStepId || null;
  const linked = findStep(steps, nextId);
  if (linked?.type === 'branch') {
    nextId = resolveHiringFlowBranch(linked, replyText || '');
  }
  const direct = findStep(steps, nextId);
  if (direct && !(direct.id === current.id && direct.type === current.type)) {
    return direct;
  }
  return sequentialStepAfter(steps, current, replyText);
}

/**
 * Linked nextStepId, or the next step in the flow list if the link is missing.
 * Duplicate opening WhatsApp template steps (same id copied on assign) are skipped
 * so "Yes, continue" never re-sends the first template.
 */
export function resolveNextHiringFlowStep(
  steps: HiringFlowStep[],
  current: HiringFlowStep,
  replyText?: string
): HiringFlowStep | null {
  const seen = new Set<string>();
  let cursor: HiringFlowStep | null = current;
  for (let guard = 0; cursor && guard < 20; guard += 1) {
    const hop = hopOnce(steps, cursor, replyText);
    if (!hop) return null;
    const looped = hop.id === current.id || seen.has(`${hop.id}:${hop.type}`);
    const duplicateOpening =
      current.type === 'send_whatsapp_template' && hop.type === 'send_whatsapp_template';
    if (!duplicateOpening && !looped) return hop;
    seen.add(`${hop.id}:${hop.type}`);
    cursor = hop;
  }
  return sequentialStepAfter(steps, current, replyText);
}

/** Prebuilt ask_question steps in playbook order (no branch evaluation). */
export function collectHiringFlowQuestions(
  steps: HiringFlowStep[],
  entryStepId?: string | null
): GatewayWhatsAppQuestion[] {
  const questions: GatewayWhatsAppQuestion[] = [];
  const entry = findStep(steps, entryStepId) || steps[0] || null;
  let cursor: HiringFlowStep | null = entry;
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor.id)) {
    seen.add(cursor.id);
    if (cursor.type === 'ask_question') {
      const question = resolveHiringFlowQuestionBody(cursor);
      if (question) {
        const yesNo = isYesNoAnswerType(cursor.answerType);
        questions.push({
          id: cursor.id,
          question,
          required: true,
          answer_type: yesNo ? 'yes_no' : 'text',
          pass_condition:
            cursor.knockout && cursor.knockoutCondition
              ? formatKnockoutPassCondition(cursor.knockoutCondition)
              : 'Informational only; any reasonable answer is acceptable',
          ...(yesNo ? { buttons: WHATSAPP_YES_NO_BUTTONS } : {}),
        });
      }
    }
    cursor = resolveNextHiringFlowStep(steps, cursor, '') || null;
  }
  return questions;
}

function firstWhatsAppTemplateId(steps: HiringFlowStep[], entryStepId?: string | null): string | null {
  const entry = findStep(steps, entryStepId) || steps[0] || null;
  if (entry?.type === 'send_whatsapp_template' && entry.whatsappTemplateId) {
    return String(entry.whatsappTemplateId).trim() || null;
  }
  const first = steps.find((step) => step.type === 'send_whatsapp_template');
  return String(first?.whatsappTemplateId || '').trim() || null;
}

async function buildPostQualificationPrompt(input: {
  campaign: OutreachCampaignDocument;
  enrollment: OutreachEnrollmentDocument;
  questions: GatewayWhatsAppQuestion[];
}): Promise<{ prompt: string; phone: string; mergeContext: Record<string, string> }> {
  const { candidate, phone, mergeContext } = await loadMergeContext(
    input.campaign,
    input.enrollment
  );
  const cand = (candidate || {}) as {
    name?: string | null;
    currentTitle?: string | null;
    experienceYears?: number | null;
    skills?: string[] | null;
    location?: string | null;
    email?: string | null;
  };
  const jobCtx = await loadOutreachJobContext(
    input.campaign.jobId ? String(input.campaign.jobId) : null
  );
  return {
    phone,
    mergeContext,
    prompt: buildWhatsAppPostQualificationPrompt({
      jobText: formatOutreachJobContextForPrompt(jobCtx, input.campaign.name),
      candidateName: cand.name || 'Candidate',
      currentRole: cand.currentTitle || '',
      experience: cand.experienceYears != null ? `${cand.experienceYears} years` : '',
      skills: Array.isArray(cand.skills) ? cand.skills.join(', ') : '',
      location: cand.location || '',
      email: cand.email || '',
      screening: input.questions,
    }),
  };
}

async function sendPostQualificationGatewayWhatsApp(input: {
  campaign: OutreachCampaignDocument;
  enrollment: OutreachEnrollmentDocument;
  templateId: string;
  questions: GatewayWhatsAppQuestion[];
}): Promise<'sent' | 'not_gateway' | 'failed'> {
  const catalogue = getApprovedTemplate(input.templateId);
  const metaTemplate = catalogue ? null : await findApprovedMetaTemplate(input.templateId);
  if (!catalogue && !metaTemplate) return 'failed';

  const { phone, mergeContext, prompt } = await buildPostQualificationPrompt({
    campaign: input.campaign,
    enrollment: input.enrollment,
    questions: input.questions,
  });
  if (!phone) return 'failed';

  const previewBody = catalogue
    ? renderWhatsAppTemplatePreview(input.templateId, mergeContext)
    : fillMetaTemplateBody(metaTemplate, mergeContext);

  try {
    const { sendPostQualificationWhatsAppViaGateway } = await import('./campaign-delivery.js');
    const sent = await sendPostQualificationWhatsAppViaGateway({
      organizationId: String(input.campaign.organizationId),
      userId: String(input.campaign.ownerUserId),
      campaignId: String(input.campaign._id),
      enrollmentId: String(input.enrollment._id),
      to: phone,
      templateId: input.templateId,
      body: previewBody || catalogue?.body || metaTemplate?.body || '',
      mergeContext,
      prompt,
      questions: input.questions,
    });
    if (!sent) return 'not_gateway';

    const thread = await ensureThread({
      organizationId: String(input.campaign.organizationId),
      candidateId: String(input.enrollment.candidateId),
      campaignId: String(input.campaign._id),
      enrollmentId: String(input.enrollment._id),
    });
    await persistOutboundMessage({
      organizationId: String(input.campaign.organizationId),
      threadId: String(thread._id),
      campaignId: String(input.campaign._id),
      candidateId: String(input.enrollment.candidateId),
      body: previewBody || catalogue?.body || metaTemplate?.body || '',
      providerMessageId: sent.providerMessageId || null,
      to: phone,
    });

    const firstQuestion = input.questions[0];
    if (firstQuestion?.answer_type === 'yes_no' && firstQuestion.question) {
      try {
        const { sendHiringFlowWhatsAppText } = await import('./campaign-delivery.js');
        const chip = await sendHiringFlowWhatsAppText({
          organizationId: String(input.campaign.organizationId),
          userId: String(input.campaign.ownerUserId),
          campaignId: String(input.campaign._id),
          enrollmentId: String(input.enrollment._id),
          to: phone,
          body: firstQuestion.question,
          replyButtons: YES_NO_REPLY_BUTTONS,
          threadId: sent.threadId || null,
        });
        await persistOutboundMessage({
          organizationId: String(input.campaign.organizationId),
          threadId: String(thread._id),
          campaignId: String(input.campaign._id),
          candidateId: String(input.enrollment.candidateId),
          body: firstQuestion.question,
          providerMessageId: chip.providerMessageId || null,
          to: phone,
        });
        log().info(
          {
            campaignId: String(input.campaign._id),
            enrollmentId: String(input.enrollment._id),
            questionId: firstQuestion.id,
            threadId: chip.threadId || sent.threadId || null,
          },
          'Post-qualification Yes/No chip sent via gateway'
        );
      } catch (chipError) {
        log().warn(
          { err: chipError, templateId: input.templateId, questionId: firstQuestion.id },
          'Post-qualification Yes/No chip send failed'
        );
      }
    }
    log().info(
      {
        campaignId: String(input.campaign._id),
        enrollmentId: String(input.enrollment._id),
        templateId: input.templateId,
        questionCount: input.questions.length,
        threadId: sent.threadId || null,
      },
      'Post-qualification WhatsApp sent via gateway autoReply'
    );
    return 'sent';
  } catch (error) {
    log().warn({ err: error, templateId: input.templateId }, 'Post-qualification gateway WhatsApp failed');
    return 'failed';
  }
}

async function ensureThread(input: {
  organizationId: string;
  candidateId: string;
  campaignId: string;
  enrollmentId: string;
}) {
  let thread =
    (input.enrollmentId
      ? await ConversationThreadModel.findOne({
          organizationId: input.organizationId,
          enrollmentId: input.enrollmentId,
        }).sort({ updatedAt: -1 })
      : null) ||
    (await ConversationThreadModel.findOne({
      organizationId: input.organizationId,
      candidateId: input.candidateId,
      campaignId: input.campaignId,
    }).sort({ updatedAt: -1 }));

  if (!thread) {
    thread = await ConversationThreadModel.create({
      organizationId: input.organizationId,
      candidateId: input.candidateId,
      campaignId: input.campaignId,
      enrollmentId: input.enrollmentId,
      channels: ['whatsapp'],
      status: 'awaiting_reply',
      qualificationStatus: 'qualified',
      // Outreach automation is always stopped before a hiring flow starts.
      automationStatus: 'stopped',
    });
    return thread;
  }

  if (!thread.channels.includes('whatsapp')) {
    thread.channels = [...thread.channels, 'whatsapp'];
  }
  if (input.enrollmentId) {
    thread.enrollmentId = input.enrollmentId as never;
  }
  if (input.campaignId) {
    thread.campaignId = input.campaignId as never;
  }
  if (thread.qualificationStatus === 'pending' || thread.qualificationStatus === 'in_progress') {
    thread.qualificationStatus = 'qualified';
  }
  // Outreach automation is always stopped before a hiring flow starts; prevent
  // applyWinnerLock from treating a resumed hiring-flow thread as still-active.
  thread.automationStatus = 'stopped';
  thread.status = 'awaiting_reply';
  await thread.save();
  return thread;
}

async function persistOutboundMessage(input: {
  organizationId: string;
  threadId: string;
  campaignId: string;
  candidateId: string;
  body: string;
  providerMessageId?: string | null;
  to?: string | null;
}) {
  const message = await ConversationMessageModel.create({
    organizationId: input.organizationId,
    threadId: input.threadId,
    provider: 'meta-whatsapp',
    channel: 'whatsapp',
    direction: 'outbound',
    sender: null,
    recipient: input.to || null,
    subject: null,
    bodyText: input.body,
    bodyHtml: null,
    providerMessageId: input.providerMessageId || `hiring-flow:${input.threadId}:${Date.now()}`,
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
      $addToSet: { channels: 'whatsapp' },
    }
  );
  emitConversationMessageCreated({
    organizationId: input.organizationId,
    threadId: input.threadId,
    messageId: String(message._id),
    campaignId: input.campaignId,
    candidateId: input.candidateId,
    direction: 'outbound',
    channel: 'whatsapp',
  });
  return message;
}

async function loadMergeContext(
  campaign: OutreachCampaignDocument,
  enrollment: OutreachEnrollmentDocument
) {
  const organizationId = String(campaign.organizationId);
  const candidate = await SavedCandidateModel.findOne({
    _id: enrollment.candidateId,
    organizationId,
    deletedAt: null,
  }).lean();
  const job = campaign.jobId
    ? await JobModel.findById(campaign.jobId).select('title').lean()
    : null;
  return {
    candidate,
    phone: String(candidate?.phone || '').trim(),
    mergeContext: buildCandidateMergeContext(candidate as never, {
      jobTitle: job?.title || null,
    }),
  };
}

async function runWhatsAppTemplateStep(input: {
  campaign: OutreachCampaignDocument;
  enrollment: OutreachEnrollmentDocument;
  step: HiringFlowStep;
}) {
  const templateId = String(input.step.whatsappTemplateId || '').trim();
  const catalogue = getApprovedTemplate(templateId);
  const metaTemplate = catalogue ? null : await findApprovedMetaTemplate(templateId);
  if (!catalogue && !metaTemplate) {
    throw Object.assign(new Error(`Unknown WhatsApp template: ${templateId}`), {
      statusCode: 400,
    });
  }

  const organizationId = String(input.campaign.organizationId);
  const { phone, mergeContext } = await loadMergeContext(input.campaign, input.enrollment);
  if (!phone) {
    throw Object.assign(new Error('Candidate phone missing'), { statusCode: 400 });
  }

  const previewBody = catalogue
    ? renderWhatsAppTemplatePreview(templateId, mergeContext)
    : fillMetaTemplateBody(metaTemplate, mergeContext);

  const { sendHiringFlowWhatsAppTemplate } = await import('./campaign-delivery.js');
  const sent = await sendHiringFlowWhatsAppTemplate({
    organizationId,
    userId: String(input.campaign.ownerUserId),
    campaignId: String(input.campaign._id),
    enrollmentId: String(input.enrollment._id),
    to: phone,
    templateId,
    body: previewBody || catalogue?.body || metaTemplate?.body || '',
    mergeContext,
  });

  const thread = await ensureThread({
    organizationId,
    candidateId: String(input.enrollment.candidateId),
    campaignId: String(input.campaign._id),
    enrollmentId: String(input.enrollment._id),
  });

  await persistOutboundMessage({
    organizationId,
    threadId: String(thread._id),
    campaignId: String(input.campaign._id),
    candidateId: String(input.enrollment.candidateId),
    body: previewBody || catalogue?.body || metaTemplate?.body || '',
    providerMessageId: sent.providerMessageId || null,
    to: phone,
  });

  return sent;
}

async function askQuestionStep(input: {
  campaign: OutreachCampaignDocument;
  enrollment: OutreachEnrollmentDocument;
  step: HiringFlowStep;
  threadId?: string | null;
}) {
  const prompt = resolveHiringFlowQuestionBody(input.step);
  if (!prompt) return;

  const organizationId = String(input.campaign.organizationId);
  const { phone } = await loadMergeContext(input.campaign, input.enrollment);
  if (!phone) return;

  const { sendHiringFlowWhatsAppText } = await import('./campaign-delivery.js');
  const sent = await sendHiringFlowWhatsAppText({
    organizationId,
    userId: String(input.campaign.ownerUserId),
    campaignId: String(input.campaign._id),
    enrollmentId: String(input.enrollment._id),
    to: phone,
    body: prompt,
    replyButtons: isYesNoAnswerType(input.step.answerType) ? YES_NO_REPLY_BUTTONS : null,
    threadId: input.threadId,
  });

  const thread = await ensureThread({
    organizationId,
    candidateId: String(input.enrollment.candidateId),
    campaignId: String(input.campaign._id),
    enrollmentId: String(input.enrollment._id),
  });
  await persistOutboundMessage({
    organizationId,
    threadId: String(thread._id),
    campaignId: String(input.campaign._id),
    candidateId: String(input.enrollment.candidateId),
    body: prompt,
    providerMessageId: sent.providerMessageId || null,
    to: phone,
  });
}

export async function executeHiringFlowStep(input: {
  campaign: OutreachCampaignDocument;
  enrollment: OutreachEnrollmentDocument;
  flowId: string;
  step: HiringFlowStep;
  steps: HiringFlowStep[];
  replyText?: string;
}): Promise<{ currentStepId: string | null; status: string }> {
  let lastGatewayThreadId: string | undefined;
  let step: HiringFlowStep | null = input.step;

  for (let guard = 0; step && guard < 20; guard += 1) {
    if (step.type === 'send_whatsapp_template') {
      const sent = await runWhatsAppTemplateStep({
        campaign: input.campaign,
        enrollment: input.enrollment,
        step,
      });
      lastGatewayThreadId = sent?.threadId || lastGatewayThreadId;
      const next = resolveNextHiringFlowStep(input.steps, step, input.replyText);
      if (next?.type === 'ask_question' && isYesNoAnswerType(next.answerType)) {
        step = next;
        continue;
      }
      if (next) {
        input.enrollment.hiringFlowState = {
          flowId: input.flowId,
          currentStepId: step.id,
          status: 'waiting_reply',
          answers: input.enrollment.hiringFlowState?.answers || {},
          retryAttempts: input.enrollment.hiringFlowState?.retryAttempts ?? {},
        };
        await input.enrollment.save();
        return { currentStepId: step.id, status: 'waiting_reply' };
      }
      // No next step — fall through to completion.
      step = null as never;
      break;
    }

    if (step.type === 'branch') {
      const nextId = resolveHiringFlowBranch(step, input.replyText || '');
      step = findStep(input.steps, nextId);
      continue;
    }

    if (step.type === 'ask_question') {
      await askQuestionStep({
        campaign: input.campaign,
        enrollment: input.enrollment,
        step,
        threadId: lastGatewayThreadId,
      });
      input.enrollment.hiringFlowState = {
        flowId: input.flowId,
        currentStepId: step.id,
        status: 'waiting_reply',
        answers: input.enrollment.hiringFlowState?.answers || {},
        retryAttempts: input.enrollment.hiringFlowState?.retryAttempts ?? {},
      };
      await input.enrollment.save();
      return { currentStepId: step.id, status: 'waiting_reply' };
    }

    break;
  }

  input.enrollment.hiringFlowState = {
    flowId: input.flowId,
    currentStepId: step?.id || null,
    status: step ? 'active' : 'completed',
    answers: input.enrollment.hiringFlowState?.answers || {},
    retryAttempts: input.enrollment.hiringFlowState?.retryAttempts ?? {},
  };
  await input.enrollment.save();
  return {
    currentStepId: step?.id || null,
    status: step ? 'active' : 'completed',
  };
}

/**
 * Start a hiring flow after qualification. Executes the entry step (usually WA template).
 */
export async function startHiringFlowAfterQualification(input: {
  campaign: OutreachCampaignDocument;
  enrollment: OutreachEnrollmentDocument;
}): Promise<{ started: boolean; stepId?: string; reason?: string }> {
  const config = (input.campaign.qualificationConfig || {}) as {
    autoWhatsAppAfterQualification?: boolean;
    hiringFlowId?: string | null;
    autoWhatsAppTemplateId?: string | null;
  };

  if (!config.autoWhatsAppAfterQualification) {
    return { started: false, reason: 'disabled' };
  }

  const claimed = await OutreachEnrollmentModel.findOneAndUpdate(
    {
      _id: input.enrollment._id,
      $or: [
        { hiringFlowState: null },
        {
          'hiringFlowState.status': {
            $nin: ['active', 'waiting_reply', 'processing_reply', 'completed'],
          },
        },
      ],
    },
    {
      $set: {
        hiringFlowState: {
          flowId: config.hiringFlowId ? String(config.hiringFlowId) : null,
          currentStepId: null,
          status: 'active',
          answers: {},
          retryAttempts: {},
        },
      },
    },
    { new: true }
  );
  if (!claimed) {
    return { started: false, reason: 'already_started' };
  }
  const enrollment = claimed;
  input.enrollment.hiringFlowState = enrollment.hiringFlowState;

  const organizationId = String(input.campaign.organizationId);
  await OutreachEnrollmentModel.updateMany(
    {
      organizationId,
      candidateId: enrollment.candidateId,
      _id: { $ne: enrollment._id },
      'hiringFlowState.status': {
        $in: ['waiting_reply', 'active', 'processing_reply'],
      },
    },
    { $set: { 'hiringFlowState.status': 'completed' } }
  );
  const flow = config.hiringFlowId
    ? await HiringFlowModel.findOne({
        _id: config.hiringFlowId,
        organizationId,
        status: { $ne: 'archived' },
      })
    : null;

  if (flow) {
    const locked = findFirstMessageStep(flow.steps, flow.entryStepId);
    const collapsed = ensureSingleLockedWhatsAppStep(flow.steps, locked);
    if (collapsed.length !== flow.steps.length) {
      flow.steps = collapsed;
      flow.entryStepId = collapsed[0]?.id || flow.entryStepId;
      flow.markModified('steps');
      await flow.save();
    }
  }

  if (!flow) {
    const templateId = String(config.autoWhatsAppTemplateId || 'resume_share').trim();
    const catalogue = getApprovedTemplate(templateId);
    if (!catalogue) {
      enrollment.hiringFlowState = {
        flowId: null,
        currentStepId: null,
        status: 'failed',
        answers: {},
        retryAttempts: {},
      };
      await enrollment.save();
      input.enrollment.hiringFlowState = enrollment.hiringFlowState;
      return { started: false, reason: 'template_missing' };
    }
    try {
      const gateway = await sendPostQualificationGatewayWhatsApp({
        campaign: input.campaign,
        enrollment,
        templateId,
        questions: [],
      });
      if (gateway === 'sent') {
        enrollment.hiringFlowState = {
          flowId: null,
          currentStepId: null,
          status: 'completed',
          answers: {},
          retryAttempts: {},
        };
        await enrollment.save();
        input.enrollment.hiringFlowState = enrollment.hiringFlowState;
        return { started: true, stepId: 'ad-hoc-wa' };
      }
      if (gateway === 'failed') {
        throw Object.assign(new Error('Post-qualification WhatsApp send failed'), {
          statusCode: 502,
        });
      }
      await runWhatsAppTemplateStep({
        campaign: input.campaign,
        enrollment,
        step: {
          id: 'ad-hoc-wa',
          type: 'send_whatsapp_template',
          whatsappTemplateId: templateId,
          nextStepId: null,
          branches: [],
        },
      });
      enrollment.hiringFlowState = {
        flowId: null,
        currentStepId: null,
        status: 'completed',
        answers: {},
        retryAttempts: {},
      };
      await enrollment.save();
      input.enrollment.hiringFlowState = enrollment.hiringFlowState;
      return { started: true, stepId: 'ad-hoc-wa' };
    } catch (error) {
      log().warn({ err: error }, 'Ad-hoc post-qualification WhatsApp send failed');
      enrollment.hiringFlowState = {
        flowId: null,
        currentStepId: null,
        status: 'failed',
        answers: {},
        retryAttempts: {},
      };
      await enrollment.save();
      input.enrollment.hiringFlowState = enrollment.hiringFlowState;
      return { started: false, reason: 'send_failed' };
    }
  }

  const entry = findStep(flow.steps, flow.entryStepId) || flow.steps[0] || null;
  if (!entry) {
    enrollment.hiringFlowState = {
      flowId: enrollment.hiringFlowState?.flowId ?? null,
      currentStepId: enrollment.hiringFlowState?.currentStepId ?? null,
      status: 'failed',
      answers: enrollment.hiringFlowState?.answers ?? {},
      retryAttempts: enrollment.hiringFlowState?.retryAttempts ?? {},
    };
    await enrollment.save();
    input.enrollment.hiringFlowState = enrollment.hiringFlowState;
    return { started: false, reason: 'empty_flow' };
  }

  enrollment.hiringFlowState = {
    flowId: String(flow._id),
    currentStepId: entry.id,
    status: 'active',
    answers: {},
    retryAttempts: {},
  };
  await enrollment.save();
  input.enrollment.hiringFlowState = enrollment.hiringFlowState;

  const templateId = firstWhatsAppTemplateId(flow.steps, flow.entryStepId);
  if (templateId) {
    const gateway = await sendPostQualificationGatewayWhatsApp({
      campaign: input.campaign,
      enrollment,
      templateId,
      questions: collectHiringFlowQuestions(flow.steps, flow.entryStepId),
    });
    if (gateway === 'sent') {
      flow.usageCount = (flow.usageCount || 0) + 1;
      await flow.save();
      input.enrollment.hiringFlowState = enrollment.hiringFlowState;
      return { started: true, stepId: entry.id };
    }
    if (gateway === 'failed') {
      enrollment.hiringFlowState = {
        flowId: enrollment.hiringFlowState?.flowId ?? null,
        currentStepId: enrollment.hiringFlowState?.currentStepId ?? null,
        status: 'failed',
        answers: enrollment.hiringFlowState?.answers ?? {},
        retryAttempts: enrollment.hiringFlowState?.retryAttempts ?? {},
      };
      await enrollment.save();
      input.enrollment.hiringFlowState = enrollment.hiringFlowState;
      return { started: false, reason: 'start_failed' };
    }
  }

  try {
    const advanced = await executeHiringFlowStep({
      campaign: input.campaign,
      enrollment,
      flowId: String(flow._id),
      step: entry,
      steps: flow.steps,
    });
    flow.usageCount = (flow.usageCount || 0) + 1;
    await flow.save();
    input.enrollment.hiringFlowState = enrollment.hiringFlowState;
    return { started: true, stepId: advanced.currentStepId || entry.id };
  } catch (error) {
    log().warn(
      { err: error, flowId: String(flow._id), enrollmentId: String(enrollment._id) },
      'Hiring flow start failed'
    );
    enrollment.hiringFlowState = {
      flowId: enrollment.hiringFlowState?.flowId ?? null,
      currentStepId: enrollment.hiringFlowState?.currentStepId ?? null,
      status: 'failed',
      answers: enrollment.hiringFlowState?.answers ?? {},
      retryAttempts: enrollment.hiringFlowState?.retryAttempts ?? {},
    };
    await enrollment.save();
    input.enrollment.hiringFlowState = enrollment.hiringFlowState;
    return { started: false, reason: 'start_failed' };
  }
}

/**
 * Continue an active hiring flow after a candidate WhatsApp reply.
 */
export async function advanceHiringFlowOnReply(input: {
  campaign: OutreachCampaignDocument;
  enrollment: OutreachEnrollmentDocument;
  replyText: string;
  /** True when the candidate attached a file/image (no API call if media expected and received). */
  hasAttachment?: boolean;
}): Promise<{ advanced: boolean }> {
  if (isClosedOutreachEnrollmentStatus(input.enrollment.status)) {
    return { advanced: false };
  }

  let state = input.enrollment.hiringFlowState;
  if (!state?.flowId) {
    return { advanced: false };
  }
  const flowId = state.flowId;
  const answersSoFar = state.answers || {};

  // Recover flows that sent the opening template then marked the hiring-flow
  // completed because nextStepId was missing. Do not reopen `active` —
  // that status means this enrollment is already sending the next question.
  if (state.status !== 'waiting_reply') {
    if (state.status === 'processing_reply' || state.status === 'active') {
      return { advanced: false };
    }
    if (!['completed', 'failed'].includes(String(state.status))) {
      return { advanced: false };
    }
    const flowForResume = await HiringFlowModel.findOne({
      _id: state.flowId,
      organizationId: input.campaign.organizationId,
    }).lean();
    const unusedQuestion = (flowForResume?.steps || []).some(
      (step) =>
        step.type === 'ask_question' &&
        !String(answersSoFar[step.id] || '').trim()
    );
    if (!unusedQuestion || !flowForResume) return { advanced: false };
    const entry =
      findStep(flowForResume.steps, flowForResume.entryStepId) ||
      flowForResume.steps[0] ||
      null;
    if (!entry) return { advanced: false };
    const reopened = await OutreachEnrollmentModel.findOneAndUpdate(
      {
        _id: input.enrollment._id,
        'hiringFlowState.status': state.status,
        'hiringFlowState.flowId': flowId,
      },
      {
        $set: {
          'hiringFlowState.status': 'waiting_reply',
          'hiringFlowState.currentStepId': entry.id,
        },
      },
      { new: true }
    );
    if (!reopened?.hiringFlowState) return { advanced: false };
    input.enrollment.hiringFlowState = reopened.hiringFlowState;
    state = reopened.hiringFlowState;
    log().info(
      { enrollmentId: String(input.enrollment._id), stepId: entry.id },
      'Hiring flow reopened from completed/active — unused questions remain'
    );
  }

  if (state.status !== 'waiting_reply' || !state.currentStepId) {
    return { advanced: false };
  }

  // Atomic claim: flip waiting_reply → processing_reply so concurrent webhooks
  // (duplicate Meta delivery, rapid candidate replies) cannot both advance the same step.
  const claimed = await OutreachEnrollmentModel.findOneAndUpdate(
    {
      _id: input.enrollment._id,
      'hiringFlowState.status': 'waiting_reply',
      'hiringFlowState.currentStepId': state.currentStepId,
    },
    { $set: { 'hiringFlowState.status': 'processing_reply' } },
    { new: true }
  );
  if (!claimed) {
    log().info(
      { enrollmentId: String(input.enrollment._id) },
      'Hiring flow advance skipped — already claimed or state changed'
    );
    return { advanced: false };
  }
  input.enrollment.hiringFlowState = claimed.hiringFlowState;

  const resetToWaiting = async () => {
    await OutreachEnrollmentModel.findOneAndUpdate(
      { _id: input.enrollment._id, 'hiringFlowState.status': 'processing_reply' },
      { $set: { 'hiringFlowState.status': 'waiting_reply' } }
    );
  };

  const flow = await HiringFlowModel.findOne({
    _id: state.flowId,
    organizationId: input.campaign.organizationId,
  });
  if (!flow) {
    await resetToWaiting();
    return { advanced: false };
  }

  const locked = findFirstMessageStep(flow.steps, flow.entryStepId);
  const collapsed = ensureSingleLockedWhatsAppStep(flow.steps || [], locked);
  if (collapsed.length !== (flow.steps || []).length) {
    flow.steps = collapsed;
    flow.entryStepId = collapsed[0]?.id || flow.entryStepId;
    flow.markModified('steps');
    await flow.save();
  }

  const current = findStep(flow.steps, state.currentStepId);
  if (!current) {
    await resetToWaiting();
    return { advanced: false };
  }

  // When paused on a send_whatsapp_template step (e.g. candidate clicked a
  // button or replied to the opening template), advance to the next step.
  if (current.type === 'send_whatsapp_template') {
    const next = resolveNextHiringFlowStep(flow.steps, current, input.replyText);
    input.enrollment.hiringFlowState = {
      flowId: String(flow._id),
      currentStepId: next?.id || null,
      status: next ? 'active' : 'completed',
      answers: state.answers || {},
      retryAttempts: state.retryAttempts ?? {},
    };
    await input.enrollment.save();
    if (!next) return { advanced: true };
    try {
      await executeHiringFlowStep({
        campaign: input.campaign,
        enrollment: input.enrollment,
        flowId: String(flow._id),
        step: next,
        steps: flow.steps,
        replyText: input.replyText,
      });
    } catch (err) {
      log().warn(
        { err, enrollmentId: String(input.enrollment._id) },
        'executeHiringFlowStep failed after template advance — resetting to waiting_reply on template step'
      );
      // resetToWaiting() is ineffective here because we already saved 'active'.
      // Reset directly back to waiting_reply on the original template step so
      // a re-send or candidate retry can re-trigger the next step.
      await OutreachEnrollmentModel.findOneAndUpdate(
        { _id: input.enrollment._id },
        {
          $set: {
            'hiringFlowState.status': 'waiting_reply',
            'hiringFlowState.currentStepId': state.currentStepId,
          },
        }
      );
      throw err;
    }
    return { advanced: true };
  }

  if (current.type !== 'ask_question') {
    // Unknown/unhandled step type while claimed — reset so future replies can retry.
    await resetToWaiting();
    return { advanced: false };
  }

  // ── Gemini answer validation ─────────────────────────────────────────────
  // Evaluate whether the candidate's reply actually answers this question.
  // If not (irrelevant answer / wrong format / image expected but text sent),
  // send a polite re-prompt and stay in waiting_reply on the same step.
  // We allow at most MAX_REPROMPTS re-prompts before accepting whatever they send.
  const MAX_REPROMPTS = 2;
  const retryAttempts = state.retryAttempts ?? {};
  const stepAttemptsSoFar = retryAttempts[current.id] ?? 0;
  // attempt = how many times the candidate has already replied to this step
  // (1 on first try, 2 on second, etc.)
  const currentAttempt = stepAttemptsSoFar + 1;
  const yesNoButtonReply =
    isYesNoAnswerType(current.answerType) &&
    /^(yes|y|haan|ha|ok|okay|no|n|nahi|na)$/i.test(input.replyText.trim());

  if (!yesNoButtonReply && currentAttempt <= MAX_REPROMPTS) {
    try {
      const { evaluateHiringFlowAnswer } = await import(
        '../../providers/gemini/gemini.conversations.js'
      );
      const evaluation = await evaluateHiringFlowAnswer({
        questionPrompt: resolveHiringFlowQuestionBody(current),
        answerType: current.answerType,
        candidateReply: input.replyText,
        hasAttachment: Boolean(input.hasAttachment),
        attempt: currentAttempt,
      });

      if (evaluation.needsReprompt && evaluation.repromptMessage) {
        log().info(
          {
            enrollmentId: String(input.enrollment._id),
            stepId: current.id,
            attempt: currentAttempt,
            reason: evaluation.reason,
            reprompt: evaluation.repromptMessage,
          },
          'Hiring flow ask_question — re-prompting candidate (irrelevant/wrong-format answer)'
        );
        // Increment retry counter atomically.
        const newRetryAttempts = { ...retryAttempts, [current.id]: currentAttempt };
        await OutreachEnrollmentModel.findOneAndUpdate(
          { _id: input.enrollment._id },
          {
            $set: {
              'hiringFlowState.status': 'waiting_reply',
              'hiringFlowState.retryAttempts': newRetryAttempts,
            },
          }
        );
        // Send the re-prompt via WhatsApp text.
        try {
          const organizationId = String(input.campaign.organizationId);
          const { phone } = await loadMergeContext(input.campaign, input.enrollment);
          if (phone) {
            const { sendHiringFlowWhatsAppText } = await import('./campaign-delivery.js');
            await sendHiringFlowWhatsAppText({
              organizationId,
              userId: String(input.campaign.ownerUserId),
              campaignId: String(input.campaign._id),
              enrollmentId: String(input.enrollment._id),
              to: phone,
              body: evaluation.repromptMessage,
              replyButtons: isYesNoAnswerType(current.answerType) ? YES_NO_REPLY_BUTTONS : null,
            });
          }
        } catch (sendErr) {
          log().warn(
            { err: sendErr, enrollmentId: String(input.enrollment._id) },
            'Failed to send hiring flow re-prompt — keeping waiting_reply'
          );
        }
        return { advanced: false };
      }
    } catch (evalErr) {
      // Gemini evaluation failure → fail open and accept the answer.
      log().warn(
        { err: evalErr, enrollmentId: String(input.enrollment._id) },
        'Hiring flow answer evaluation failed — accepting reply as-is'
      );
    }
  }
  // ── End of Gemini validation ─────────────────────────────────────────────

  const answers = {
    ...(state.answers || {}),
    [current.id]: input.replyText,
  };

  if (
    current.knockout &&
    /^(no|n|nahi|na)\b/i.test(input.replyText.trim()) &&
    isYesNoAnswerType(current.answerType)
  ) {
    input.enrollment.hiringFlowState = {
      flowId: String(flow._id),
      currentStepId: current.id,
      status: 'completed',
      answers,
      retryAttempts: retryAttempts,
    };
    await input.enrollment.save();
    return { advanced: true };
  }

  const next = resolveNextHiringFlowStep(flow.steps, current, input.replyText);
  input.enrollment.hiringFlowState = {
    flowId: String(flow._id),
    currentStepId: next?.id || null,
    status: next ? 'active' : 'completed',
    answers,
    retryAttempts: retryAttempts,
  };
  await input.enrollment.save();

  if (!next) return { advanced: true };

  try {
    await executeHiringFlowStep({
      campaign: input.campaign,
      enrollment: input.enrollment,
      flowId: String(flow._id),
      step: next,
      steps: flow.steps,
      replyText: input.replyText,
    });
  } catch (err) {
    log().warn(
      { err, enrollmentId: String(input.enrollment._id) },
      'executeHiringFlowStep failed after ask_question advance — resetting to waiting_reply on question step'
    );
    // resetToWaiting() targets processing_reply, but we already saved 'active' above.
    // Reset directly back to waiting_reply on the original question step so the
    // candidate can reply again to retry.
    await OutreachEnrollmentModel.findOneAndUpdate(
      { _id: input.enrollment._id },
      {
        $set: {
          'hiringFlowState.status': 'waiting_reply',
          'hiringFlowState.currentStepId': state.currentStepId,
        },
      }
    );
    throw err;
  }
  return { advanced: true };
}
