import { getLogger } from '../config/logger.js';
import { executeCampaignMessageStep } from '../modules/outreach/campaign-delivery.js';
import {
  OutreachCampaignModel,
  sequenceDelayToMs,
} from '../modules/outreach/campaign.model.js';
import { ScreeningModel, screeningService } from '../modules/screening/index.js';
import { OutreachEnrollmentModel } from '../modules/outreach/enrollment.model.js';
import { campaignsService } from '../modules/outreach/campaigns.service.js';
import { conversationsService } from '../modules/conversations/conversations.service.js';
import { ConversationMessageModel } from '../modules/conversations/conversation-message.model.js';
import type { ConversationChannel } from '../modules/conversations/conversation-thread.model.js';
import { BullOutreachJobModel } from './job.model.js';
import { scheduleJob } from './schedule.js';

function channelFromStep(type: string): 'email' | 'whatsapp' | 'ai_voice' | null {
  if (type === 'email' || type === 'scheduling_link') return 'email';
  if (type === 'whatsapp') return 'whatsapp';
  if (type === 'ai_voice') return 'ai_voice';
  return null;
}

async function saveOutbound(input: {
  organizationId: string;
  candidateId: string;
  campaignId: string;
  enrollmentId: string;
  jobId: string | null;
  mongoJobId: string;
  channel: ConversationChannel;
  provider?: string | null;
  providerMessageId?: string | null;
  providerThreadId?: string | null;
  subject?: string | null;
  bodyText: string;
}) {
  const thread = await conversationsService.ensureThreadForEnrollment({
    organizationId: input.organizationId,
    candidateId: input.candidateId,
    campaignId: input.campaignId,
    enrollmentId: input.enrollmentId,
    jobId: input.jobId,
    channel: input.channel,
  });

  const providerMessageId =
    input.providerMessageId || `bull-job:${input.mongoJobId}`;

  // WhatsApp: Meta has no campaign thread id — store candidate phone digits.
  let providerThreadId = input.providerThreadId ?? null;
  if (!providerThreadId && input.channel === 'whatsapp') {
    const { SavedCandidateModel } = await import('../modules/candidates/saved-candidate.model.js');
    const candidate = await SavedCandidateModel.findById(input.candidateId)
      .select('phone')
      .lean();
    const digits = String(candidate?.phone || '').replace(/\D/g, '');
    if (digits) providerThreadId = digits;
  }

  await ConversationMessageModel.findOneAndUpdate(
    {
      organizationId: thread.organizationId,
      providerMessageId,
    },
    {
      $setOnInsert: {
        organizationId: thread.organizationId,
        threadId: thread._id,
        provider: input.provider || 'system',
        channel: input.channel,
        direction: 'outbound',
        sender: null,
        recipient: null,
        subject: input.subject ?? null,
        bodyText: input.bodyText.slice(0, 50000),
        bodyHtml: null,
        providerMessageId,
        providerThreadId,
        deliveryStatus: 'sent',
        sentAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  if (
    providerThreadId &&
    input.provider &&
    !thread.providerThreadIds.some(
      (p) => p.provider === input.provider && p.threadId === providerThreadId
    )
  ) {
    thread.providerThreadIds.push({
      provider: input.provider,
      threadId: providerThreadId,
    });
  }
  thread.lastMessageAt = new Date();
  thread.lastRecruiterMessageAt = new Date();
  thread.lastMessagePreview = input.bodyText.slice(0, 240);
  if (input.channel === 'email' || input.channel === 'whatsapp' || input.channel === 'ai_voice') {
    if (!thread.channels.includes(input.channel)) thread.channels.push(input.channel);
  }
  thread.status = 'awaiting_reply';
  await thread.save();
}

async function runSendOrFollowup(mongoJobId: string) {
  const job = await BullOutreachJobModel.findById(mongoJobId);
  if (!job) return;
  if (job.status === 'cancelled' || job.status === 'done') return;

  job.status = 'running';
  job.attempts += 1;
  await job.save();

  if (!job.campaignId || !job.enrollmentId || !job.stepId) {
    job.status = 'failed';
    job.lastError = 'missing campaign/enrollment/step';
    await job.save();
    return;
  }

  const campaign = await OutreachCampaignModel.findById(job.campaignId);
  const enrollment = await OutreachEnrollmentModel.findById(job.enrollmentId);

  if (!campaign || campaign.status !== 'running' || campaign.deletedAt) {
    job.status = 'cancelled';
    await job.save();
    return;
  }

  if (
    !enrollment ||
    ['stopped', 'completed', 'opted_out', 'failed', 'replied', 'paused'].includes(
      enrollment.status
    )
  ) {
    job.status = 'cancelled';
    await job.save();
    return;
  }

  if (enrollment.contactAvailability?.optedOut) {
    await campaignsService.stopEnrollment(String(enrollment._id), 'candidate_opted_out');
    job.status = 'cancelled';
    await job.save();
    return;
  }

  if (enrollment.replyState?.hasReply) {
    await campaignsService.stopEnrollment(String(enrollment._id), 'candidate_replied');
    job.status = 'cancelled';
    await job.save();
    return;
  }

  const step = campaign.sequenceSteps.find((s) => s.id === job.stepId) || null;
  if (!step) {
    job.status = 'failed';
    job.lastError = 'step not found';
    await job.save();
    return;
  }

  const mode = campaign.campaignType;
  const stepType = step.type;

  // single or multi — same send path; channel comes from the step
  if (mode === 'single_channel' || mode === 'multi_channel') {
    if (
      stepType === 'email' ||
      stepType === 'whatsapp' ||
      stepType === 'ai_voice' ||
      stepType === 'scheduling_link'
    ) {
      const delivery = await executeCampaignMessageStep({
        campaign,
        enrollment,
        step,
        jobId: String(job._id),
      });

      if (delivery.outcome === 'sent') {
        const channel = delivery.channel;
        const body =
          stepType === 'ai_voice'
            ? String(delivery.renderedBody || 'AI voice call started')
            : String(delivery.renderedBody || step.body || step.note || `[${stepType}]`);

        await saveOutbound({
          organizationId: String(campaign.organizationId),
          candidateId: String(enrollment.candidateId),
          campaignId: String(campaign._id),
          enrollmentId: String(enrollment._id),
          jobId: campaign.jobId ? String(campaign.jobId) : null,
          mongoJobId: String(job._id),
          channel,
          provider: delivery.provider,
          providerMessageId: delivery.providerMessageId || `bull-job:${String(job._id)}`,
          providerThreadId: delivery.providerThreadId || null,
          subject: delivery.renderedSubject ?? step.subject ?? null,
          bodyText: body,
        });

        job.details = {
          ...(job.details || {}),
          delivery: 'sent',
          channel,
        };
        job.markModified('details');

        await OutreachCampaignModel.updateOne(
          { _id: campaign._id },
          { $inc: { 'stats.sent': 1, 'stats.delivered': 1 } }
        );
      } else {
        job.details = {
          ...(job.details || {}),
          delivery: delivery.outcome,
          reason: 'reason' in delivery ? delivery.reason : undefined,
        };
        job.markModified('details');
      }
    } else {
      // wait / conditional / recruiter_task — just move on
    }
  }

  enrollment.sequenceState.lastStepId = step.id;
  if (!enrollment.sequenceState.completedStepIds.includes(step.id)) {
    enrollment.sequenceState.completedStepIds.push(step.id);
  }
  enrollment.lastActionAt = new Date();
  await enrollment.save();

  if (step.stopOnReply && enrollment.replyState.hasReply) {
    await campaignsService.stopEnrollment(String(enrollment._id), 'candidate_replied');
    job.status = 'done';
    await job.save();
    return;
  }

  const ordered = [...campaign.sequenceSteps].sort((a, b) => a.order - b.order);
  const idx = ordered.findIndex((s) => s.id === step.id);
  const next = idx >= 0 ? ordered[idx + 1] : null;

  if (!next) {
    enrollment.status = 'completed';
    enrollment.stopReason = 'sequence_completed';
    enrollment.nextActionAt = null;
    enrollment.currentStepIndex = idx;
    await enrollment.save();
    job.status = 'done';
    await job.save();
    return;
  }

  // Message/follow-up timing uses step delay only — no send window.
  // Call windows apply only to screening calls.
  const delayMs = Math.max(0, sequenceDelayToMs(next.delayDays || 0, next.delayUnit));
  const when = new Date(Date.now() + delayMs);

  enrollment.currentStepIndex = idx + 1;
  enrollment.status = delayMs > 0 ? 'waiting' : 'active';
  enrollment.nextActionAt = when;
  enrollment.sequenceState.waitingUntil = delayMs > 0 ? when : null;
  await enrollment.save();

  await scheduleJob({
    kind: delayMs > 0 ? 'followup' : 'send',
    channel: channelFromStep(next.type),
    organizationId: String(campaign.organizationId),
    campaignId: String(campaign._id),
    enrollmentId: String(enrollment._id),
    stepId: next.id,
    runAt: when,
  });

  job.status = 'done';
  await job.save();
}

async function runSyncReplies() {
  const { syncEmailReplies } = await import(
    '../modules/outreach/email-reply-sync.service.js'
  );
  await syncEmailReplies(15);
}

async function runLaunchScreening(mongoJobId: string) {
  const job = await BullOutreachJobModel.findById(mongoJobId);
  if (!job) return;
  if (job.status === 'cancelled' || job.status === 'done') return;

  job.status = 'running';
  job.attempts += 1;
  await job.save();

  const screeningId = String(job.details?.screeningId || '');
  if (!screeningId || !job.organizationId) {
    job.status = 'failed';
    job.lastError = 'missing screening/organization';
    await job.save();
    return;
  }

  const screening = await ScreeningModel.findOne({
    _id: screeningId,
    organizationId: job.organizationId,
    deletedAt: null,
  });
  if (!screening) {
    job.status = 'cancelled';
    job.lastError = 'screening not found';
    await job.save();
    return;
  }

  const candidateIds = Array.isArray(job.details?.candidateIds)
    ? job.details.candidateIds
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    : [];

  await screeningService.launch(
    String(job.organizationId),
    String(screening.ownerUserId),
    screeningId,
    candidateIds.length > 0 ? { candidateIds } : undefined
  );

  job.status = 'done';
  job.lastError = null;
  await job.save();
}

export async function processBullJob(mongoJobId: string): Promise<void> {
  const logger = getLogger().child({ component: 'bull-outreach' });
  const job = await BullOutreachJobModel.findById(mongoJobId);
  if (!job) return;
  if (job.status === 'cancelled' || job.status === 'done') return;

  try {
    if (job.kind === 'sync_replies') {
      job.status = 'running';
      job.attempts += 1;
      await job.save();
      await runSyncReplies();
      job.status = 'done';
      await job.save();
      return;
    }

    if (job.kind === 'send' || job.kind === 'followup') {
      await runSendOrFollowup(mongoJobId);
      return;
    }

    if (job.kind === 'launch_screening') {
      await runLaunchScreening(mongoJobId);
      return;
    }

    job.status = 'failed';
    job.lastError = `unknown kind: ${job.kind}`;
    await job.save();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'bull job failed';
    logger.warn({ err: error, mongoJobId }, 'Bull outreach job failed');
    const fresh = await BullOutreachJobModel.findById(mongoJobId);
    if (!fresh) return;
    if (fresh.attempts >= 5) {
      fresh.status = 'failed';
      fresh.lastError = message;
      if (fresh.enrollmentId) {
        await campaignsService.stopEnrollment(String(fresh.enrollmentId), 'fatal_provider_error', {
          code: 'BULL_JOB_DEAD',
          message,
        });
      }
    } else {
      fresh.status = 'pending';
      fresh.runAt = new Date(Date.now() + fresh.attempts * 30_000);
      fresh.lastError = message;
    }
    await fresh.save();
    throw error;
  }
}
