import { hostname } from 'node:os';
import { randomUUID } from 'node:crypto';

import { getLogger } from '../../config/logger.js';
import { campaignDeliveryMetrics } from '../../shared/observability/metrics.js';
import { CampaignJobModel } from './campaign-job.model.js';
import { OutreachCampaignModel, sequenceDelayToMs } from './campaign.model.js';
import { OutreachEnrollmentModel } from './enrollment.model.js';
import { campaignsService } from './campaigns.service.js';
import { recordCampaignActivity } from './campaign-activity.model.js';
import { executeCampaignMessageStep } from './campaign-delivery.js';
import { ConversationThreadModel } from '../conversations/conversation-thread.model.js';
import { conversationsService } from '../conversations/conversations.service.js';
import { ConversationMessageModel } from '../conversations/conversation-message.model.js';

const LEASE_MS = 60_000;
const MAX_ATTEMPTS = 5;

function workerId() {
  return `worker:${hostname()}:${process.pid}:${randomUUID().slice(0, 8)}`;
}

function jobTypeForStep(type: string) {
  return type === 'email'
    ? 'send_email'
    : type === 'whatsapp'
      ? 'send_whatsapp'
      : type === 'ai_voice'
        ? 'launch_voice'
        : type === 'wait'
          ? 'wait'
          : type === 'conditional'
            ? 'evaluate_conditional'
            : type === 'recruiter_task'
              ? 'create_recruiter_task'
              : type === 'scheduling_link'
                ? 'send_scheduling_link'
                : 'advance_sequence';
}

/**
 * Process due CampaignJobs for the canonical outreach engine.
 * Message steps send via connected providers; missing contacts skip that step.
 * Stop rules: reply / opt-out / recruiter stop / qualification reject / complete / fatal error.
 */
export async function processDueCampaignJobs(limit = 25): Promise<number> {
  const logger = getLogger();
  const owner = workerId();
  const now = new Date();

  // Activate scheduled campaigns whose time has come
  const dueCampaigns = await OutreachCampaignModel.find({
    status: 'scheduled',
    scheduledAt: { $lte: now },
    deletedAt: null,
  }).limit(10);

  for (const campaign of dueCampaigns) {
    try {
      await campaignsService.launch(
        String(campaign.organizationId),
        String(campaign.ownerUserId),
        String(campaign._id)
      );
    } catch (error) {
      logger.warn(
        { err: error, campaignId: String(campaign._id) },
        'Scheduled campaign launch failed'
      );
      campaign.status = 'failed';
      await campaign.save();
      const { emitCampaignUpdated } = await import('../../realtime/events.js');
      emitCampaignUpdated({
        organizationId: String(campaign.organizationId),
        campaignId: String(campaign._id),
        status: 'failed',
        userId: campaign.ownerUserId ? String(campaign.ownerUserId) : undefined,
      });
      if (campaign.ownerUserId) {
        const { notificationsService } = await import(
          '../notifications/notifications.service.js'
        );
        void notificationsService
          .create({
            organizationId: String(campaign.organizationId),
            userId: String(campaign.ownerUserId),
            type: 'campaign_failed',
            severity: 'error',
            title: 'Campaign failed to launch',
            message: campaign.name
              ? `"${campaign.name}" could not be launched.`
              : 'A scheduled campaign failed to launch.',
            relatedEntityType: 'campaign',
            relatedEntityId: String(campaign._id),
            actionUrl: `/dashboard/outreach/${String(campaign._id)}`,
          })
          .catch(() => undefined);
      }
    }
  }

  const jobs = await CampaignJobModel.find({
    status: 'queued',
    scheduledAt: { $lte: now },
  })
    .sort({ scheduledAt: 1 })
    .limit(limit);

  let processed = 0;
  for (const job of jobs) {
    const leased = await CampaignJobModel.findOneAndUpdate(
      {
        _id: job._id,
        status: 'queued',
      },
      {
        $set: {
          status: 'leased',
          leaseOwner: owner,
          leaseExpiresAt: new Date(Date.now() + LEASE_MS),
        },
        $inc: { attempts: 1 },
      },
      { new: true }
    );
    if (!leased) continue;

    try {
      const campaign = await OutreachCampaignModel.findById(leased.campaignId);
      const enrollment = await OutreachEnrollmentModel.findById(leased.enrollmentId);
      if (!campaign || campaign.status !== 'running' || campaign.deletedAt) {
        leased.status = 'cancelled';
        await leased.save();
        continue;
      }
      if (!enrollment || ['stopped', 'completed', 'opted_out', 'failed', 'replied'].includes(enrollment.status)) {
        leased.status = 'cancelled';
        await leased.save();
        continue;
      }
      if (enrollment.contactAvailability?.optedOut) {
        await campaignsService.stopEnrollment(String(enrollment._id), 'candidate_opted_out');
        leased.status = 'cancelled';
        await leased.save();
        continue;
      }
      if (enrollment.replyState?.hasReply) {
        await campaignsService.stopEnrollment(String(enrollment._id), 'candidate_replied');
        leased.status = 'cancelled';
        await leased.save();
        continue;
      }
      if (enrollment.qualificationState?.status === 'rejected') {
        await campaignsService.stopEnrollment(String(enrollment._id), 'qualification_rejected');
        leased.status = 'cancelled';
        await leased.save();
        continue;
      }

      const thread = await ConversationThreadModel.findOne({
        organizationId: campaign.organizationId,
        enrollmentId: enrollment._id,
      });
      if (thread?.automationStatus === 'stopped') {
        leased.status = 'cancelled';
        await leased.save();
        continue;
      }

      const step = campaign.sequenceSteps.find((s) => s.id === leased.stepId);
      if (!step) {
        leased.status = 'failed';
        leased.error = 'Step not found';
        await leased.save();
        continue;
      }

      leased.status = 'running';
      await leased.save();

      const delivery = await executeCampaignMessageStep({
        campaign,
        enrollment,
        step,
        jobId: String(leased._id),
      });

      if (delivery.outcome === 'sent') {
        campaign.stats.sent = (campaign.stats.sent || 0) + 1;
        campaign.stats.delivered = (campaign.stats.delivered || 0) + 1;
        campaignDeliveryMetrics.recordSent(delivery.channel);
        campaignDeliveryMetrics.recordDelivered();

        const convThread = await conversationsService.ensureThreadForEnrollment({
          organizationId: String(campaign.organizationId),
          candidateId: String(enrollment.candidateId),
          campaignId: String(campaign._id),
          enrollmentId: String(enrollment._id),
          jobId: campaign.jobId ? String(campaign.jobId) : null,
          channel: delivery.channel,
        });
        await ConversationMessageModel.create({
          organizationId: campaign.organizationId,
          threadId: convThread._id,
          provider: delivery.provider || 'system',
          channel: delivery.channel,
          direction: 'outbound',
          sender: null,
          recipient: null,
          subject: step.subject || null,
          bodyText: step.body || step.note || `[${step.type}]`,
          bodyHtml: null,
          providerMessageId:
            delivery.providerMessageId || `campaign-job:${String(leased._id)}`,
          providerThreadId: null,
          deliveryStatus: 'sent',
          messageType: 'message',
          aiGenerated: true,
          sentAt: new Date(),
        });
        convThread.lastMessageAt = new Date();
        convThread.lastRecruiterMessageAt = new Date();
        convThread.lastMessagePreview = (step.body || step.note || '').slice(0, 240);
        convThread.status = 'awaiting_reply';
        await convThread.save();
      } else if (delivery.outcome === 'skipped' && delivery.reason !== 'non_message') {
        await recordCampaignActivity({
          organizationId: String(campaign.organizationId),
          campaignId: String(campaign._id),
          enrollmentId: String(enrollment._id),
          type: 'enrollment.step_skipped',
          title:
            delivery.reason === 'missing_email'
              ? 'Skipped email step — no email address'
              : 'Skipped WhatsApp/voice step — no phone number',
          metadata: {
            stepId: step.id,
            reason: delivery.reason,
            channel: delivery.channel,
          },
        });
      }

      enrollment.sequenceState.lastStepId = step.id;
      if (!enrollment.sequenceState.completedStepIds.includes(step.id)) {
        enrollment.sequenceState.completedStepIds.push(step.id);
      }
      enrollment.lastActionAt = new Date();
      // Persist contactAvailability sync from delivery even when stop rules fire next.
      await enrollment.save();

      const ordered = [...campaign.sequenceSteps].sort((a, b) => a.order - b.order);
      const idx = ordered.findIndex((s) => s.id === step.id);
      const next = idx >= 0 ? ordered[idx + 1] : null;

      if (step.stopOnReply && enrollment.replyState.hasReply) {
        await campaignsService.stopEnrollment(String(enrollment._id), 'candidate_replied');
      } else if (!next) {
        enrollment.status = 'completed';
        enrollment.stopReason = 'sequence_completed';
        enrollment.nextActionAt = null;
        enrollment.currentStepIndex = idx;
        await enrollment.save();
        await recordCampaignActivity({
          organizationId: String(campaign.organizationId),
          campaignId: String(campaign._id),
          enrollmentId: String(enrollment._id),
          type: 'enrollment.completed',
          title: 'Sequence completed',
        });
      } else {
        const delayMs = Math.max(
          0,
          sequenceDelayToMs(next.delayDays || 0, next.delayUnit)
        );
        const when = new Date(Date.now() + delayMs);
        enrollment.currentStepIndex = idx + 1;
        enrollment.status = delayMs > 0 ? 'waiting' : 'active';
        enrollment.nextActionAt = when;
        enrollment.sequenceState.waitingUntil = delayMs > 0 ? when : null;
        await enrollment.save();
        await CampaignJobModel.create({
          organizationId: campaign.organizationId,
          campaignId: campaign._id,
          enrollmentId: enrollment._id,
          stepId: next.id,
          jobType: jobTypeForStep(next.type),
          scheduledAt: when,
          status: 'queued',
          attempts: 0,
        });
      }

      await campaign.save();
      leased.status = 'succeeded';
      leased.result = {
        stepId: step.id,
        type: step.type,
        delivery: delivery.outcome,
        reason: delivery.outcome === 'skipped' ? delivery.reason : undefined,
      };
      await leased.save();
      processed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Campaign job failed';
      logger.warn({ err: error, jobId: String(leased._id) }, 'Campaign job failed');
      leased.error = message;
      if (leased.attempts >= MAX_ATTEMPTS) {
        leased.status = 'dead';
        await campaignsService.stopEnrollment(String(leased.enrollmentId), 'fatal_provider_error', {
          code: 'JOB_DEAD',
          message,
        });
      } else {
        leased.status = 'queued';
        leased.scheduledAt = new Date(Date.now() + leased.attempts * 30_000);
        leased.leaseOwner = null;
        leased.leaseExpiresAt = null;
      }
      await leased.save();
    }
  }

  return processed;
}
