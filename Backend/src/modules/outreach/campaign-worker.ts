import { hostname } from 'node:os';
import { randomUUID } from 'node:crypto';
import { appendFileSync } from 'node:fs';

import { getLogger } from '../../config/logger.js';
import { campaignDeliveryMetrics } from '../../shared/observability/metrics.js';
import { CampaignJobModel, OUTREACH_QUEUE_STATUS } from './campaign-job.model.js';
import {
  OutreachCampaignModel,
  sequenceDelayToMs,
  type OutreachCampaignDocument,
} from './campaign.model.js';
import {
  OutreachEnrollmentModel,
  type OutreachEnrollmentDocument,
} from './enrollment.model.js';
import { campaignsService } from './campaigns.service.js';
import { recordCampaignActivity } from './campaign-activity.model.js';
import { executeCampaignMessageStep, type DeliveryResult } from './campaign-delivery.js';
import { nextSendAtWithinWindow } from './send-window.util.js';
import { ConversationThreadModel } from '../conversations/conversation-thread.model.js';
import {
  conversationsService,
} from '../conversations/conversations.service.js';
import { ConversationMessageModel } from '../conversations/conversation-message.model.js';
import type { ConversationChannel } from '../conversations/conversation-thread.model.js';
import {
  getApprovedTemplate,
  renderWhatsAppTemplatePreview,
} from './whatsapp-template-catalogue.js';
import type { CampaignSequenceStep } from './campaign.model.js';

function waDebug(line: string): void {
  try {
    appendFileSync(
      new URL('../../../.huntlo-wa-debug.log', import.meta.url),
      `${new Date().toISOString()} ${line}\n`
    );
  } catch {
    try {
      appendFileSync('.huntlo-wa-debug.log', `${new Date().toISOString()} ${line}\n`);
    } catch {
      // ignore
    }
  }
}

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

function channelForStep(type: string): ConversationChannel | null {
  if (type === 'email' || type === 'scheduling_link') return 'email';
  if (type === 'whatsapp') return 'whatsapp';
  if (type === 'ai_voice') return 'ai_voice';
  return null;
}

function previewBodyForStep(step: {
  type: string;
  body?: string | null;
  note?: string | null;
  subject?: string | null;
  templateId?: string | null;
}): string {
  if (step.type === 'ai_voice') return 'AI voice call started';
  if (step.templateId) {
    const catalogue = getApprovedTemplate(step.templateId);
    if (catalogue?.body) {
      // Prefer human preview without leaving {{1}} visible in the inbox.
      return renderWhatsAppTemplatePreview(step.templateId, {});
    }
    return `[template:${step.templateId}]`;
  }
  const raw = String(step.body || step.note || '').trim();
  if (raw) return raw;
  return `[${step.type}]`;
}

/** Persist outbound attempt on the conversation thread (success or failure). */
async function recordOutboundConversationMessage(input: {
  organizationId: string;
  candidateId: string;
  campaignId: string;
  enrollmentId: string;
  jobId: string | null;
  campaignJobId: string;
  channel: ConversationChannel;
  provider?: string | null;
  providerMessageId?: string | null;
  providerThreadId?: string | null;
  subject?: string | null;
  bodyText: string;
  deliveryStatus: 'sent' | 'failed';
  errorMessage?: string | null;
}): Promise<{ insertedNew: boolean }> {
  let insertedNew = false;
  const convThread = await conversationsService.ensureThreadForEnrollment({
    organizationId: input.organizationId,
    candidateId: input.candidateId,
    campaignId: input.campaignId,
    enrollmentId: input.enrollmentId,
    jobId: input.jobId,
    channel: input.channel,
  });

  const providerMessageId =
    input.providerMessageId ||
    (input.deliveryStatus === 'failed'
      ? `campaign-job:${input.campaignJobId}:failed`
      : `campaign-job:${input.campaignJobId}`);

  if (input.deliveryStatus === 'failed') {
    await ConversationMessageModel.findOneAndUpdate(
      {
        organizationId: convThread.organizationId,
        providerMessageId,
      },
      {
        $set: {
          organizationId: convThread.organizationId,
          threadId: convThread._id,
          provider: input.provider || 'system',
          channel: input.channel,
          direction: 'outbound',
          sender: null,
          recipient: null,
          subject: input.subject ?? null,
          bodyText: input.bodyText.slice(0, 50000),
          bodyHtml: null,
          providerMessageId,
          providerThreadId: input.providerThreadId ?? null,
          deliveryStatus: 'failed',
          messageType: 'message',
          aiGenerated: true,
          sentAt: new Date(),
          error: {
            code: 'SEND_FAILED',
            message: (input.errorMessage || 'Send failed').slice(0, 2000),
          },
        },
      },
      { upsert: true, new: true }
    );
  } else {
    // Upsert (not create) so a retry that reuses an already-sent delivery cannot
    // insert a duplicate conversation row. `insertedNew` gates one-time side effects
    // like stats increments in the caller.
    const existing = await ConversationMessageModel.findOne({
      organizationId: convThread.organizationId,
      providerMessageId,
    })
      .select('_id')
      .lean();
    if (!existing) {
      await ConversationMessageModel.create({
        organizationId: convThread.organizationId,
        threadId: convThread._id,
        provider: input.provider || 'system',
        channel: input.channel,
        direction: 'outbound',
        sender: null,
        recipient: null,
        subject: input.subject ?? null,
        bodyText: input.bodyText.slice(0, 50000),
        bodyHtml: null,
        providerMessageId,
        providerThreadId: input.providerThreadId ?? null,
        deliveryStatus: 'sent',
        messageType: 'message',
        aiGenerated: true,
        sentAt: new Date(),
        error: null,
      });
      insertedNew = true;
    }
  }

  const preview =
    input.deliveryStatus === 'failed'
      ? `Failed: ${(input.errorMessage || 'Send failed').slice(0, 200)}`
      : input.bodyText.slice(0, 240);

  convThread.lastMessageAt = new Date();
  convThread.lastRecruiterMessageAt = new Date();
  convThread.lastMessagePreview = preview;
  if (input.deliveryStatus === 'sent') {
    convThread.status = 'awaiting_reply';
  }
  if (!convThread.channels.includes(input.channel)) {
    convThread.channels.push(input.channel);
  }
  if (
    input.providerThreadId &&
    input.provider &&
    !convThread.providerThreadIds.some(
      (p) => p.provider === input.provider && p.threadId === input.providerThreadId
    )
  ) {
    convThread.providerThreadIds.push({
      provider: input.provider,
      threadId: input.providerThreadId,
    });
  }
  await convThread.save();
  return { insertedNew };
}

/**
 * Process due CampaignJobs for the canonical outreach engine.
 * Message steps send via connected providers; missing contacts skip that step.
 * Stop rules: reply / opt-out / recruiter stop / qualification reject / complete / fatal error.
 */
function assertWorkerHostnameAllowed(): void {
  const raw = String(process.env.OUTREACH_ALLOWED_WORKER_HOSTNAMES || '').trim();
  if (!raw) return;
  const allowed = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!allowed.length) return;
  const host = hostname();
  if (!allowed.some((a) => a === host || host.includes(a) || a.includes(host))) {
    throw new Error(
      `OUTREACH_ALLOWED_WORKER_HOSTNAMES excludes this host ("${host}"). ` +
        `Allowed: ${allowed.join(', ')}. Refusing to process campaign jobs.`
    );
  }
}

export async function processDueCampaignJobs(limit = 25): Promise<number> {
  const logger = getLogger();
  assertWorkerHostnameAllowed();
  const owner = workerId();
  const now = new Date();

  // Move legacy `queued` jobs into the isolated queue so foreign/old workers
  // (which only poll `queued`) cannot deliver broken WhatsApp free-text.
  await CampaignJobModel.updateMany(
    { status: 'queued' },
    { $set: { status: OUTREACH_QUEUE_STATUS } }
  );

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
    status: OUTREACH_QUEUE_STATUS,
    scheduledAt: { $lte: now },
  })
    .sort({ scheduledAt: 1 })
    .limit(limit);

  let processed = 0;
  for (const job of jobs) {
    const leased = await CampaignJobModel.findOneAndUpdate(
      {
        _id: job._id,
        status: OUTREACH_QUEUE_STATUS,
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

    let campaign: OutreachCampaignDocument | null = null;
    let enrollment: OutreachEnrollmentDocument | null = null;
    let step: CampaignSequenceStep | null = null;

    try {
      campaign = await OutreachCampaignModel.findById(leased.campaignId);
      enrollment = await OutreachEnrollmentModel.findById(leased.enrollmentId);
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

      step = campaign.sequenceSteps.find((s) => s.id === leased.stepId) || null;
      if (!step) {
        leased.status = 'failed';
        leased.error = 'Step not found';
        await leased.save();
        continue;
      }

      leased.status = 'running';
      await leased.save();

      // Idempotency guard: if a previous attempt already sent through the provider
      // but a *post-send* step threw (and the job was requeued), never send again —
      // reuse the cached outcome so bookkeeping can complete.
      let delivery: DeliveryResult;
      if (leased.deliveredAt && leased.deliveryResult) {
        delivery = leased.deliveryResult as unknown as DeliveryResult;
        waDebug(
          `REUSE job=${String(leased._id)} step=${step.id} deliveredAt=${leased.deliveredAt.toISOString()}`
        );
      } else {
        waDebug(
          `EXECUTE job=${String(leased._id)} step=${step.id} type=${step.type} templateId=${step.templateId} bodyHasPh=${/\{\{/.test(String(step.body || ''))}`
        );

        delivery = await executeCampaignMessageStep({
          campaign,
          enrollment,
          step,
          jobId: String(leased._id),
        });

        // Persist the send marker BEFORE any fragile post-send bookkeeping so a
        // later throw + retry cannot re-trigger the provider send.
        if (delivery.outcome === 'sent') {
          leased.deliveredAt = new Date();
          leased.deliveryResult = delivery as unknown as Record<string, unknown>;
          await leased.save();
        }
      }

      waDebug(
        `RESULT job=${String(leased._id)} outcome=${delivery.outcome} rendered=${
          delivery.outcome === 'sent'
            ? String(delivery.renderedBody || '')
                .slice(0, 80)
                .replace(/\n/g, ' ')
            : delivery.outcome === 'skipped'
              ? delivery.reason
              : ''
        }`
      );

      if (delivery.outcome === 'sent') {
        const sentSubject = delivery.renderedSubject ?? step.subject ?? null;
        let sentBody =
          step.type === 'ai_voice'
            ? String(delivery.renderedBody || 'AI voice call started')
            : String(
                delivery.renderedBody || step.body || step.note || `[${step.type}]`
              );
        // Last-resort personalization for WhatsApp cold templates if delivery forgot renderedBody.
        if (/\{\{\s*[0-9a-zA-Z_]+\s*\}\}/.test(sentBody) && step.templateId) {
          sentBody = renderWhatsAppTemplatePreview(String(step.templateId), {
            first_name: 'there',
            job_title: 'this role',
            '1': 'there',
            '2': 'this role',
          });
        }
        if (
          delivery.channel === 'whatsapp' &&
          /\{\{\s*[0-9a-zA-Z_]+\s*\}\}/.test(sentBody)
        ) {
          waDebug(`BLOCK_STORE job=${String(leased._id)} body=${sentBody.slice(0, 60)}`);
          throw Object.assign(
            new Error(
              'Refusing to store WhatsApp message with unfilled {{variables}}. ' +
                'Delivery layer must return a personalized renderedBody.'
            ),
            { statusCode: 500, code: 'UNFILLED_WHATSAPP_VARIABLES' }
          );
        }
        waDebug(`STORE job=${String(leased._id)} body=${sentBody.slice(0, 80).replace(/\n/g, ' ')}`);
        const { insertedNew } = await recordOutboundConversationMessage({
          organizationId: String(campaign.organizationId),
          candidateId: String(enrollment.candidateId),
          campaignId: String(campaign._id),
          enrollmentId: String(enrollment._id),
          jobId: campaign.jobId ? String(campaign.jobId) : null,
          campaignJobId: String(leased._id),
          channel: delivery.channel,
          provider: delivery.provider,
          providerMessageId: delivery.providerMessageId || `campaign-job:${String(leased._id)}`,
          providerThreadId: delivery.providerThreadId || null,
          subject: sentSubject,
          bodyText: sentBody,
          deliveryStatus: 'sent',
        });

        // Only count stats when a brand-new outbound row was written, so a retry
        // that reuses an already-sent delivery cannot inflate sent/delivered.
        if (insertedNew) {
          await OutreachCampaignModel.updateOne(
            { _id: campaign._id },
            { $inc: { 'stats.sent': 1, 'stats.delivered': 1 } }
          );
          // Keep in-memory copy roughly in sync for any later save in this loop.
          campaign.stats.sent = (campaign.stats.sent || 0) + 1;
          campaign.stats.delivered = (campaign.stats.delivered || 0) + 1;
          campaign.markModified('stats');
          campaignDeliveryMetrics.recordSent(delivery.channel);
          campaignDeliveryMetrics.recordDelivered();
        }
      } else if (delivery.outcome === 'skipped' && delivery.reason !== 'non_message') {
        const skipChannel =
          delivery.channel || channelForStep(step.type) || 'email';
        const skipMessage =
          delivery.reason === 'missing_email'
            ? 'Skipped — candidate has no email address'
            : delivery.reason === 'missing_phone'
              ? 'Skipped — candidate has no phone number'
              : `Skipped — ${delivery.reason}`;
        await recordOutboundConversationMessage({
          organizationId: String(campaign.organizationId),
          candidateId: String(enrollment.candidateId),
          campaignId: String(campaign._id),
          enrollmentId: String(enrollment._id),
          jobId: campaign.jobId ? String(campaign.jobId) : null,
          campaignJobId: String(leased._id),
          channel: skipChannel,
          provider: 'system',
          subject: step.subject ?? null,
          bodyText: previewBodyForStep(step),
          deliveryStatus: 'failed',
          errorMessage: skipMessage,
        }).catch(() => undefined);
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
      const idx = ordered.findIndex((s) => s.id === step!.id);
      const next = idx >= 0 ? ordered[idx + 1] : null;

      if (step!.stopOnReply && enrollment.replyState.hasReply) {
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
        const sendWindow = next.sendWindow || campaign.channelConfig.sendWindow || null;
        const when = nextSendAtWithinWindow(
          new Date(Date.now() + delayMs),
          sendWindow,
          campaign.channelConfig.timezone
        );
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
          status: OUTREACH_QUEUE_STATUS,
          attempts: 0,
        });
      }

      await campaign.save();
      leased.status = 'succeeded';
      leased.result = {
        stepId: step.id,
        type: step.type,
        channel: delivery.channel || channelForStep(step.type) || null,
        delivery: delivery.outcome,
        reason: delivery.outcome === 'skipped' ? delivery.reason : undefined,
      };
      await leased.save();
      processed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Campaign job failed';
      logger.warn({ err: error, jobId: String(leased._id) }, 'Campaign job failed');
      leased.error = message;

      // Surface the failed send in Conversations (even while retries continue).
      if (campaign && enrollment && step) {
        const failChannel = channelForStep(step.type);
        if (failChannel) {
          await recordOutboundConversationMessage({
            organizationId: String(campaign.organizationId),
            candidateId: String(enrollment.candidateId),
            campaignId: String(campaign._id),
            enrollmentId: String(enrollment._id),
            jobId: campaign.jobId ? String(campaign.jobId) : null,
            campaignJobId: String(leased._id),
            channel: failChannel,
            provider: 'system',
            subject: step.subject ?? null,
            bodyText: previewBodyForStep(step),
            deliveryStatus: 'failed',
            errorMessage: message,
          }).catch((recordErr) => {
            logger.warn(
              { err: recordErr, jobId: String(leased._id) },
              'Failed to record conversation for failed send'
            );
          });
        }
      }

      if (leased.attempts >= MAX_ATTEMPTS) {
        leased.status = 'dead';
        await campaignsService.stopEnrollment(String(leased.enrollmentId), 'fatal_provider_error', {
          code: 'JOB_DEAD',
          message,
        });
      } else {
        leased.status = OUTREACH_QUEUE_STATUS;
        leased.scheduledAt = new Date(Date.now() + leased.attempts * 30_000);
        leased.leaseOwner = null;
        leased.leaseExpiresAt = null;
      }
      await leased.save();
    }
  }

  return processed;
}
