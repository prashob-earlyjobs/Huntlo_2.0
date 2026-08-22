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

function log() {
  return getLogger().child({ component: 'hiring-flow-runtime' });
}

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
  if (!thread.enrollmentId && input.enrollmentId) {
    thread.enrollmentId = input.enrollmentId as never;
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
}) {
  const prompt = String(input.step.prompt || '').trim();
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
  let step: HiringFlowStep | null = input.step;

  for (let guard = 0; step && guard < 20; guard += 1) {
    if (step.type === 'send_whatsapp_template') {
      await runWhatsAppTemplateStep({
        campaign: input.campaign,
        enrollment: input.enrollment,
        step,
      });
      // Pause after the template and wait for the candidate's reply before
      // executing the next step. Without this, sequential steps fire instantly.
      if (step.nextStepId) {
        input.enrollment.hiringFlowState = {
          flowId: input.flowId,
          currentStepId: step.id,
          status: 'waiting_reply',
          answers: input.enrollment.hiringFlowState?.answers || {},
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
      });
      input.enrollment.hiringFlowState = {
        flowId: input.flowId,
        currentStepId: step.id,
        status: 'waiting_reply',
        answers: input.enrollment.hiringFlowState?.answers || {},
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
  const flow = config.hiringFlowId
    ? await HiringFlowModel.findOne({
        _id: config.hiringFlowId,
        organizationId,
        status: { $ne: 'archived' },
      })
    : null;

  if (!flow) {
    const templateId = String(config.autoWhatsAppTemplateId || 'resume_share').trim();
    const catalogue = getApprovedTemplate(templateId);
    if (!catalogue) {
      enrollment.hiringFlowState = {
        flowId: null,
        currentStepId: null,
        status: 'failed',
        answers: {},
      };
      await enrollment.save();
      input.enrollment.hiringFlowState = enrollment.hiringFlowState;
      return { started: false, reason: 'template_missing' };
    }
    try {
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
  };
  await enrollment.save();
  input.enrollment.hiringFlowState = enrollment.hiringFlowState;

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
}): Promise<{ advanced: boolean }> {
  const state = input.enrollment.hiringFlowState;
  if (!state?.flowId || state.status !== 'waiting_reply' || !state.currentStepId) {
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

  const current = findStep(flow.steps, state.currentStepId);
  if (!current) {
    await resetToWaiting();
    return { advanced: false };
  }

  // When paused on a send_whatsapp_template step (e.g. candidate clicked a
  // button or replied to the opening template), advance to the next step.
  if (current.type === 'send_whatsapp_template') {
    let nextId = current.nextStepId || null;
    const branchStep = findStep(flow.steps, nextId);
    if (branchStep?.type === 'branch') {
      nextId = resolveHiringFlowBranch(branchStep, input.replyText);
    }
    const next = findStep(flow.steps, nextId);
    input.enrollment.hiringFlowState = {
      flowId: String(flow._id),
      currentStepId: next?.id || null,
      status: next ? 'active' : 'completed',
      answers: state.answers || {},
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

  const answers = {
    ...(state.answers || {}),
    [current.id]: input.replyText,
  };

  if (
    current.knockout &&
    /^(no|n|nahi|na)\b/i.test(input.replyText.trim()) &&
    /yes\s*\/\s*no|boolean/i.test(String(current.answerType || ''))
  ) {
    input.enrollment.hiringFlowState = {
      flowId: String(flow._id),
      currentStepId: current.id,
      status: 'completed',
      answers,
    };
    await input.enrollment.save();
    return { advanced: true };
  }

  let nextId = current.nextStepId || null;
  const branchStep = findStep(flow.steps, nextId);
  if (branchStep?.type === 'branch') {
    nextId = resolveHiringFlowBranch(branchStep, input.replyText);
  }

  const next = findStep(flow.steps, nextId);
  input.enrollment.hiringFlowState = {
    flowId: String(flow._id),
    currentStepId: next?.id || null,
    status: next ? 'active' : 'completed',
    answers,
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
