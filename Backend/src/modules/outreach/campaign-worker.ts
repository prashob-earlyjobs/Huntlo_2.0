import { hostname } from 'node:os';
import { randomUUID } from 'node:crypto';

import { getLogger } from '../../config/logger.js';
import { quotaService } from '../../shared/usage/index.js';
import { CampaignJobModel } from './campaign-job.model.js';
import { OutreachCampaignModel } from './campaign.model.js';
import { OutreachEnrollmentModel } from './enrollment.model.js';
import { campaignsService } from './campaigns.service.js';
import { recordCampaignActivity } from './campaign-activity.model.js';
import { ConversationThreadModel } from '../conversations/conversation-thread.model.js';
import { conversationsService } from '../conversations/conversations.service.js';
import { ConversationMessageModel } from '../conversations/conversation-message.model.js';

const LEASE_MS = 60_000;
const MAX_ATTEMPTS = 5;

function workerId() {
  return `worker:${hostname()}:${process.pid}:${randomUUID().slice(0, 8)}`;
}

/**
 * Process due CampaignJobs for the canonical outreach engine.
 * Message sends are stubbed (quota reserved/committed) until provider campaign send lands.
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

      // Execute step (provider send stubs)
      if (step.type === 'email' || step.type === 'scheduling_link') {
        const key = `campaign-job:${String(leased._id)}:email`;
        await quotaService.reserveUsage({
          organizationId: String(campaign.organizationId),
          metric: 'email_outreach',
          quantity: 1,
          idempotencyKey: key,
          relatedEntityType: 'campaign_job',
          relatedEntityId: String(leased._id),
        });
        await quotaService.commitUsage({
          organizationId: String(campaign.organizationId),
          metric: 'email_outreach',
          idempotencyKey: key,
        });
        campaign.stats.sent = (campaign.stats.sent || 0) + 1;
        campaign.stats.delivered = (campaign.stats.delivered || 0) + 1;
      } else if (step.type === 'whatsapp') {
        const key = `campaign-job:${String(leased._id)}:whatsapp`;
        await quotaService.reserveUsage({
          organizationId: String(campaign.organizationId),
          metric: 'whatsapp_outreach',
          quantity: 1,
          idempotencyKey: key,
          relatedEntityType: 'campaign_job',
          relatedEntityId: String(leased._id),
        });
        await quotaService.commitUsage({
          organizationId: String(campaign.organizationId),
          metric: 'whatsapp_outreach',
          idempotencyKey: key,
        });
        campaign.stats.sent = (campaign.stats.sent || 0) + 1;
        campaign.stats.delivered = (campaign.stats.delivered || 0) + 1;
      } else if (step.type === 'ai_voice') {
        // Voice minutes reserved later when Hunar launch is wired
      }

      // Mirror outbound touch into unified conversation thread
      if (['email', 'whatsapp', 'ai_voice', 'scheduling_link'].includes(step.type)) {
        const channel =
          step.type === 'whatsapp'
            ? 'whatsapp'
            : step.type === 'ai_voice'
              ? 'ai_voice'
              : 'email';
        const convThread = await conversationsService.ensureThreadForEnrollment({
          organizationId: String(campaign.organizationId),
          candidateId: String(enrollment.candidateId),
          campaignId: String(campaign._id),
          enrollmentId: String(enrollment._id),
          jobId: campaign.jobId ? String(campaign.jobId) : null,
          channel,
        });
        await ConversationMessageModel.create({
          organizationId: campaign.organizationId,
          threadId: convThread._id,
          provider: 'system',
          channel,
          direction: 'outbound',
          sender: null,
          recipient: null,
          subject: step.subject || null,
          bodyText: step.body || step.note || `[${step.type}]`,
          bodyHtml: null,
          providerMessageId: `campaign-job:${String(leased._id)}`,
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
      }

      enrollment.sequenceState.lastStepId = step.id;
      if (!enrollment.sequenceState.completedStepIds.includes(step.id)) {
        enrollment.sequenceState.completedStepIds.push(step.id);
      }
      enrollment.lastActionAt = new Date();

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
        const delayMs = Math.max(0, (next.delayDays || 0) * 24 * 60 * 60 * 1000);
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
          jobType:
            next.type === 'email'
              ? 'send_email'
              : next.type === 'whatsapp'
                ? 'send_whatsapp'
                : next.type === 'ai_voice'
                  ? 'launch_voice'
                  : next.type === 'wait'
                    ? 'wait'
                    : next.type === 'conditional'
                      ? 'evaluate_conditional'
                      : next.type === 'recruiter_task'
                        ? 'create_recruiter_task'
                        : next.type === 'scheduling_link'
                          ? 'send_scheduling_link'
                          : 'advance_sequence',
          scheduledAt: when,
          status: 'queued',
          attempts: 0,
        });
      }

      await campaign.save();
      leased.status = 'succeeded';
      leased.result = { stepId: step.id, type: step.type };
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
