import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import { ConversationMessageModel } from '../conversations/conversation-message.model.js';
import { ConversationThreadModel } from '../conversations/conversation-thread.model.js';
import { CampaignActivityModel } from './campaign-activity.model.js';
import { OutreachCampaignModel } from './campaign.model.js';
import { OutreachEnrollmentModel } from './enrollment.model.js';
import { refreshCampaignStats } from './campaigns.service.js';

async function loadCampaign(organizationId: string, id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'INVALID_ID', 'Invalid campaign id.');
  }
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

export const campaignTrackingService = {
  async tracking(organizationId: string, campaignId: string) {
    const campaign = await loadCampaign(organizationId, campaignId);
    const stats = await refreshCampaignStats(campaignId);

    const enrollments = await OutreachEnrollmentModel.find({
      organizationId,
      campaignId,
    })
      .select('status replyState qualificationState screeningState schedulingState contactAvailability')
      .lean();

    const threads = await ConversationThreadModel.find({
      organizationId,
      campaignId,
    })
      .select('_id')
      .lean();
    const threadIds = threads.map((t) => t._id);
    const messages = threadIds.length
      ? await ConversationMessageModel.find({
          organizationId,
          threadId: { $in: threadIds },
        })
          .select('channel direction deliveryStatus')
          .lean()
      : [];

    const channelMetrics = {
      email: { sent: 0, delivered: 0, opened: 0, replied: 0, failed: 0 },
      whatsapp: { sent: 0, delivered: 0, read: 0, replied: 0, failed: 0 },
      voice: { attempted: 0, answered: 0, completed: 0, qualified: 0, failed: 0 },
    };

    for (const msg of messages) {
      if (msg.channel === 'email') {
        if (msg.direction === 'outbound') {
          channelMetrics.email.sent += 1;
          if (msg.deliveryStatus === 'delivered' || msg.deliveryStatus === 'read') {
            channelMetrics.email.delivered += 1;
          }
          if (msg.deliveryStatus === 'failed') channelMetrics.email.failed += 1;
        } else {
          channelMetrics.email.replied += 1;
        }
      } else if (msg.channel === 'whatsapp') {
        if (msg.direction === 'outbound') {
          channelMetrics.whatsapp.sent += 1;
          if (msg.deliveryStatus === 'delivered' || msg.deliveryStatus === 'read') {
            channelMetrics.whatsapp.delivered += 1;
          }
          if (msg.deliveryStatus === 'read') channelMetrics.whatsapp.read += 1;
          if (msg.deliveryStatus === 'failed') channelMetrics.whatsapp.failed += 1;
        } else {
          channelMetrics.whatsapp.replied += 1;
        }
      } else if (msg.channel === 'ai_voice') {
        channelMetrics.voice.attempted += 1;
        if (msg.deliveryStatus === 'delivered' || msg.deliveryStatus === 'read') {
          channelMetrics.voice.answered += 1;
          channelMetrics.voice.completed += 1;
        }
        if (msg.deliveryStatus === 'failed') channelMetrics.voice.failed += 1;
      }
    }

    channelMetrics.voice.qualified = enrollments.filter(
      (e) => e.qualificationState?.status === 'qualified'
    ).length;

    const stepMetrics = (campaign.sequenceSteps || []).map((step) => {
      const eligible = enrollments.length;
      const attempted = messages.filter((m) => m.direction === 'outbound').length;
      return {
        stepOrder: step.order,
        stepId: step.id,
        channel: step.type,
        eligible,
        attempted: Math.min(attempted, eligible),
        successful: Math.min(stats.delivered || 0, eligible),
        failed: Math.min(stats.failed || 0, eligible),
        repliedAfterStep: enrollments.filter((e) => e.replyState?.hasReply).length,
        conversionAfterStep: enrollments.filter(
          (e) =>
            e.qualificationState?.status === 'qualified' ||
            e.status === 'interested' ||
            e.status === 'qualified'
        ).length,
      };
    });

    return {
      campaignId,
      status: campaign.status,
      totalCandidates: enrollments.length,
      enrolled: stats.enrolled,
      pending: stats.pending,
      contacted: Math.max(stats.sent, stats.delivered),
      delivered: stats.delivered,
      failed: stats.failed,
      replied: stats.replies,
      interested: stats.interested,
      notInterested: enrollments.filter(
        (e) => e.replyState?.disposition === 'not_interested'
      ).length,
      qualified: stats.qualified,
      screened: enrollments.filter((e) => e.screeningState?.status === 'completed').length,
      shortlisted: enrollments.filter(
        (e) => e.qualificationState?.status === 'qualified' && e.status !== 'stopped'
      ).length,
      schedulingLinkSent: enrollments.filter(
        (e) =>
          e.schedulingState?.status === 'link_sent' || e.schedulingState?.status === 'booked'
      ).length,
      interviewScheduled: enrollments.filter((e) => e.schedulingState?.status === 'booked')
        .length,
      completed: stats.completed,
      optedOut: enrollments.filter((e) => e.status === 'opted_out').length,
      channels: channelMetrics,
      steps: stepMetrics,
      updatedAt: new Date().toISOString(),
    };
  },

  async candidateInteractions(
    organizationId: string,
    campaignId: string,
    candidateId: string
  ) {
    await loadCampaign(organizationId, campaignId);
    const thread = await ConversationThreadModel.findOne({
      organizationId,
      campaignId,
      candidateId,
    })
      .select('_id')
      .lean();

    const [messages, activities] = await Promise.all([
      thread
        ? ConversationMessageModel.find({
            organizationId,
            threadId: thread._id,
          })
            .sort({ createdAt: 1 })
            .limit(500)
            .lean()
        : Promise.resolve([]),
      CampaignActivityModel.find({
        organizationId,
        campaignId,
        'metadata.candidateId': candidateId,
      })
        .sort({ createdAt: 1 })
        .limit(200)
        .lean(),
    ]);

    const items = [
      ...messages.map((m) => ({
        id: String(m._id),
        kind: 'message' as const,
        channel: m.channel,
        direction: m.direction,
        subject: m.subject,
        bodyText: m.bodyText,
        deliveryStatus: m.deliveryStatus,
        messageType: m.messageType,
        createdAt: m.createdAt.toISOString(),
      })),
      ...activities.map((a) => ({
        id: String(a._id),
        kind: 'activity' as const,
        type: a.type,
        title: a.title,
        detail: a.detail,
        createdAt: a.createdAt.toISOString(),
      })),
    ].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    return { campaignId, candidateId, items };
  },

  async candidateConversation(
    organizationId: string,
    campaignId: string,
    candidateId: string
  ) {
    await loadCampaign(organizationId, campaignId);
    const thread = await ConversationThreadModel.findOne({
      organizationId,
      campaignId,
      candidateId,
    }).lean();

    if (!thread) {
      return {
        campaignId,
        candidateId,
        thread: null,
        messages: [],
      };
    }

    const messages = await ConversationMessageModel.find({
      organizationId,
      threadId: thread._id,
    })
      .sort({ createdAt: 1 })
      .limit(500)
      .lean();

    return {
      campaignId,
      candidateId,
      thread: {
        id: String(thread._id),
        status: thread.status,
        channels: thread.channels,
        qualificationStatus: thread.qualificationStatus,
        unreadCount: thread.unreadCount,
        lastMessageAt: thread.lastMessageAt?.toISOString() ?? null,
      },
      messages: messages.map((m) => ({
        id: String(m._id),
        channel: m.channel,
        direction: m.direction,
        subject: m.subject,
        bodyText: m.bodyText,
        deliveryStatus: m.deliveryStatus,
        messageType: m.messageType,
        aiGenerated: m.aiGenerated,
        sentAt: m.sentAt?.toISOString() ?? null,
        receivedAt: m.receivedAt?.toISOString() ?? null,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  },
};
