/**
 * Candidate-level recruiter actions and scheduling helpers for outreach campaigns.
 */

import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import { ConversationMessageModel } from '../conversations/conversation-message.model.js';
import { interviewsService } from '../scheduling/interview.service.js';
import { recordCampaignActivity } from './campaign-activity.model.js';
import { OutreachCampaignModel } from './campaign.model.js';
import { OutreachEnrollmentModel } from './enrollment.model.js';
import { campaignsService, refreshCampaignStats } from './campaigns.service.js';
import type { CandidateActionType } from './campaign.validation.js';
import {
  emitOutreachCampaignUpdated,
  emitOutreachEnrollmentUpdated,
  emitOutreachInterviewUpdated,
} from '../../realtime/events.js';

async function loadCampaign(organizationId: string, id: string) {
  const doc = await OutreachCampaignModel.findOne({
    _id: id,
    organizationId,
    deletedAt: null,
  });
  if (!doc) {
    throw new AppError(404, 'OUTREACH_CAMPAIGN_NOT_FOUND', 'Campaign not found.');
  }
  return doc;
}

async function loadEnrollment(
  organizationId: string,
  campaignId: string,
  candidateId: string
) {
  const enrollment = await OutreachEnrollmentModel.findOne({
    organizationId,
    campaignId,
    candidateId,
  });
  if (!enrollment) {
    throw new AppError(404, 'ENROLLMENT_NOT_FOUND', 'Candidate is not enrolled in this campaign.');
  }
  return enrollment;
}

async function ensureThread(
  organizationId: string,
  campaignId: string,
  candidateId: string,
  enrollmentId: string,
  jobId: mongoose.Types.ObjectId | null
) {
  const { conversationsService } = await import('../conversations/conversations.service.js');
  return conversationsService.ensureThreadForEnrollment({
    organizationId,
    candidateId,
    campaignId,
    enrollmentId,
    jobId: jobId ? String(jobId) : null,
    channel: 'note',
  });
}

export const campaignActionsService = {
  async recordAction(
    organizationId: string,
    userId: string,
    campaignId: string,
    candidateId: string,
    input: {
      action: CandidateActionType;
      note?: string;
      reason?: string;
      channel?: 'email' | 'whatsapp';
      payload?: Record<string, unknown>;
    }
  ) {
    const campaign = await loadCampaign(organizationId, campaignId);
    const enrollment = await loadEnrollment(organizationId, campaignId, candidateId);
    const thread = await ensureThread(
      organizationId,
      campaignId,
      candidateId,
      String(enrollment._id),
      campaign.jobId
    );

    switch (input.action) {
      case 'add_note': {
        const note = (input.note || '').trim();
        if (!note) throw new AppError(400, 'NOTE_REQUIRED', 'Note text is required.');
        await ConversationMessageModel.create({
          organizationId,
          threadId: thread._id,
          provider: 'recruiter',
          channel: 'note',
          direction: 'internal',
          bodyText: note,
          messageType: 'note',
          deliveryStatus: 'sent',
          createdByUserId: userId,
          sentAt: new Date(),
        });
        break;
      }
      case 'mark_interested':
        enrollment.status = 'interested';
        enrollment.replyState = {
          ...enrollment.replyState,
          hasReply: true,
          disposition: 'interested',
          repliedAt: enrollment.replyState.repliedAt || new Date(),
        };
        await enrollment.save();
        break;
      case 'mark_not_interested':
        enrollment.replyState = {
          ...enrollment.replyState,
          hasReply: true,
          disposition: 'not_interested',
          repliedAt: enrollment.replyState.repliedAt || new Date(),
        };
        await campaignsService.stopEnrollment(String(enrollment._id), 'recruiter_stopped');
        break;
      case 'qualify':
        enrollment.status = 'qualified';
        enrollment.qualificationState = {
          ...enrollment.qualificationState,
          status: 'qualified',
        };
        await enrollment.save();
        break;
      case 'disqualify':
        enrollment.qualificationState = {
          ...enrollment.qualificationState,
          status: 'rejected',
        };
        await campaignsService.stopEnrollment(
          String(enrollment._id),
          'qualification_rejected'
        );
        break;
      case 'shortlist':
        enrollment.qualificationState = {
          ...enrollment.qualificationState,
          status: 'qualified',
          answers: {
            ...(enrollment.qualificationState.answers || {}),
            shortlisted: true,
          },
        };
        await enrollment.save();
        break;
      case 'reject':
        await campaignsService.stopEnrollment(String(enrollment._id), 'recruiter_stopped');
        break;
      case 'stop_automation':
        await campaignsService.stopEnrollment(String(enrollment._id), 'recruiter_stopped');
        thread.automationStatus = 'stopped';
        await thread.save();
        break;
      case 'resume_automation':
        if (['replied', 'opted_out', 'completed', 'failed', 'stopped'].includes(enrollment.status)) {
          throw new AppError(
            409,
            'ENROLLMENT_NOT_RESUMABLE',
            `Cannot resume automation for enrollment in status ${enrollment.status}.`
          );
        }
        enrollment.status = 'active';
        enrollment.stopReason = null;
        enrollment.nextActionAt = new Date();
        await enrollment.save();
        thread.automationStatus = 'active';
        await thread.save();
        break;
      case 'start_screening':
        enrollment.screeningState = {
          ...enrollment.screeningState,
          status: 'scheduled',
        };
        await enrollment.save();
        break;
      case 'send_scheduling_link':
        return this.sendSchedulingLink(organizationId, userId, campaignId, candidateId, {
          channel: input.channel,
        });
      default:
        throw new AppError(400, 'UNSUPPORTED_ACTION', `Unsupported action: ${input.action}`);
    }

    await recordCampaignActivity({
      organizationId,
      campaignId,
      actorUserId: userId,
      enrollmentId: String(enrollment._id),
      type: `candidate.${input.action}`,
      title: `Candidate action: ${input.action}`,
      detail: input.note || input.reason || null,
      metadata: { candidateId, action: input.action },
    });

    await refreshCampaignStats(campaignId);
    emitOutreachEnrollmentUpdated({
      organizationId,
      campaignId,
      candidateId,
      enrollmentId: String(enrollment._id),
      status: enrollment.status,
      currentStepIndex: enrollment.currentStepIndex,
      nextSendAt: enrollment.nextActionAt?.toISOString() ?? null,
    });

    return {
      ok: true,
      action: input.action,
      enrollmentId: String(enrollment._id),
      status: enrollment.status,
    };
  },

  async sendSchedulingLink(
    organizationId: string,
    userId: string,
    campaignId: string,
    candidateId: string,
    input: {
      channel?: 'email' | 'whatsapp';
      eventTypeUri?: string | null;
      message?: string | null;
    } = {}
  ) {
    const campaign = await loadCampaign(organizationId, campaignId);
    const enrollment = await loadEnrollment(organizationId, campaignId, candidateId);

    const eventTypeUri =
      input.eventTypeUri || campaign.schedulingConfig?.eventTypeUri || null;
    if (!campaign.schedulingConfig?.enabled && !eventTypeUri) {
      throw new AppError(
        422,
        'OUTREACH_PROVIDER_DISCONNECTED',
        'Scheduling is not configured for this campaign.'
      );
    }

    // Cooldown: avoid duplicate link sends within 30 minutes.
    if (
      enrollment.schedulingState?.status === 'link_sent' &&
      enrollment.lastActionAt &&
      Date.now() - enrollment.lastActionAt.getTime() < 30 * 60 * 1000
    ) {
      throw new AppError(
        409,
        'OUTREACH_DUPLICATE_SEND',
        'A scheduling link was already sent recently. Wait before resending.'
      );
    }

    let bookingUrl: string | null =
      enrollment.schedulingState?.bookingUrl || eventTypeUri || null;

    try {
      // Prefer creating/updating an interview record so booking attribution works.
      const interview = await interviewsService.create(organizationId, userId, {
        candidateId,
        jobId: campaign.jobId ? String(campaign.jobId) : null,
        schedulingUrl: bookingUrl,
        sendLink: true,
        campaignId,
        sourceModule: 'outreach',
        inviteChannel: input.channel || 'email',
      });
      bookingUrl =
        (interview as { schedulingUrl?: string | null })?.schedulingUrl || bookingUrl;
    } catch {
      // Fall back to campaign-configured URL when interview creation is unavailable.
      if (!bookingUrl) {
        throw new AppError(
          422,
          'OUTREACH_PROVIDER_DISCONNECTED',
          'Unable to create a scheduling link for this candidate.'
        );
      }
    }

    enrollment.schedulingState = {
      status: 'link_sent',
      bookingUrl,
    };
    enrollment.lastActionAt = new Date();
    await enrollment.save();

    const thread = await ensureThread(
      organizationId,
      campaignId,
      candidateId,
      String(enrollment._id),
      campaign.jobId
    );
    await ConversationMessageModel.create({
      organizationId,
      threadId: thread._id,
      provider: 'system',
      channel: input.channel === 'whatsapp' ? 'whatsapp' : 'email',
      direction: 'outbound',
      bodyText:
        input.message?.trim() ||
        `Please book a time using this scheduling link: ${bookingUrl}`,
      messageType: 'message',
      deliveryStatus: 'sent',
      createdByUserId: userId,
      sentAt: new Date(),
    });

    await recordCampaignActivity({
      organizationId,
      campaignId,
      actorUserId: userId,
      enrollmentId: String(enrollment._id),
      type: 'scheduling.link_sent',
      title: 'Scheduling link sent',
      metadata: { candidateId, bookingUrl },
    });

    emitOutreachEnrollmentUpdated({
      organizationId,
      campaignId,
      candidateId,
      enrollmentId: String(enrollment._id),
      status: enrollment.status,
      currentStepIndex: enrollment.currentStepIndex,
      nextSendAt: enrollment.nextActionAt?.toISOString() ?? null,
    });
    emitOutreachInterviewUpdated({
      organizationId,
      campaignId,
      candidateId,
      interviewId: null,
      status: 'link_sent',
    });

    return {
      ok: true,
      bookingUrl,
      enrollmentId: String(enrollment._id),
      schedulingState: enrollment.schedulingState,
    };
  },

  async listScheduledInterviews(organizationId: string, campaignId: string) {
    await loadCampaign(organizationId, campaignId);
    const enrollments = await OutreachEnrollmentModel.find({
      organizationId,
      campaignId,
      'schedulingState.status': { $in: ['link_sent', 'booked'] },
    })
      .select('candidateId schedulingState status updatedAt')
      .lean();

    return {
      items: enrollments.map((e) => ({
        enrollmentId: String(e._id),
        candidateId: String(e.candidateId),
        status: e.schedulingState?.status || 'not_started',
        bookingUrl: e.schedulingState?.bookingUrl || null,
        enrollmentStatus: e.status,
        updatedAt: e.updatedAt.toISOString(),
      })),
    };
  },

  async syncScheduledInterviews(
    organizationId: string,
    userId: string,
    campaignId: string
  ) {
    await loadCampaign(organizationId, campaignId);
    // Delegate to the scheduling module's booking sync when available.
    try {
      const { processDueSchedulingJobs } = await import('../scheduling/index.js');
      const processed = await processDueSchedulingJobs(25);
      emitOutreachCampaignUpdated({
        organizationId,
        campaignId,
        status: 'running',
        userId,
      });
      return { synced: processed };
    } catch {
      return { synced: 0, warning: 'Scheduling sync is not available in this environment.' };
    }
  },
};
