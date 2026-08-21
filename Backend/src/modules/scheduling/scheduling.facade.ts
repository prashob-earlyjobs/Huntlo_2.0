import mongoose, { type Document, type Model, Schema } from 'mongoose';

import {
  buildSchedulingUrl,
} from '../../providers/calendly/calendly.client.js';
import { getOrgCalendlyCredentials } from './calendly-credentials.js';
import { InterviewModel } from './interview.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { getLogger } from '../../config/logger.js';

/**
 * Minimal schedule candidate record for Huntlo 360 orchestration.
 * Full interview CRUD lives in Interview model; this tracks link lifecycle.
 */
export type ScheduleCandidateDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  workflowId: mongoose.Types.ObjectId | null;
  campaignId: mongoose.Types.ObjectId | null;
  candidateId: mongoose.Types.ObjectId;
  enrollmentId: mongoose.Types.ObjectId | null;
  interviewId: mongoose.Types.ObjectId | null;
  status: 'link_pending' | 'link_sent' | 'booked' | 'expired' | 'cancelled';
  provider: string;
  eventTypeUri: string | null;
  bookingUrl: string | null;
  channel: 'email' | 'whatsapp';
  expiresAt: Date | null;
  bookedAt: Date | null;
  inviteDeliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const scheduleCandidateSchema = new Schema<ScheduleCandidateDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    workflowId: { type: Schema.Types.ObjectId, ref: 'Huntlo360Workflow', default: null },
    campaignId: { type: Schema.Types.ObjectId, ref: 'OutreachCampaign', default: null },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'SavedCandidate',
      required: true,
      index: true,
    },
    enrollmentId: { type: Schema.Types.ObjectId, ref: 'OutreachEnrollment', default: null },
    interviewId: { type: Schema.Types.ObjectId, ref: 'Interview', default: null },
    status: {
      type: String,
      enum: ['link_pending', 'link_sent', 'booked', 'expired', 'cancelled'],
      default: 'link_pending',
      index: true,
    },
    provider: { type: String, default: 'calendly' },
    eventTypeUri: { type: String, default: null, index: true },
    bookingUrl: { type: String, default: null },
    channel: { type: String, enum: ['email', 'whatsapp'], default: 'email' },
    expiresAt: { type: Date, default: null },
    bookedAt: { type: Date, default: null },
    inviteDeliveredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const ScheduleCandidateModel = (mongoose.models.ScheduleCandidate ??
  mongoose.model<ScheduleCandidateDocument>(
    'ScheduleCandidate',
    scheduleCandidateSchema
  )) as Model<ScheduleCandidateDocument>;

export const schedulingFacade = {
  async createLink(input: {
    organizationId: string;
    workflowId: string;
    campaignId?: string | null;
    candidateId: string;
    enrollmentId?: string | null;
    ownerUserId?: string | null;
    provider?: string | null;
    eventTypeUri?: string | null;
    channel: 'email' | 'whatsapp';
    bookingExpiryHours: number;
    jobId?: string | null;
  }) {
    const expiresAt = new Date(
      Date.now() + Math.max(1, input.bookingExpiryHours) * 60 * 60 * 1000
    );

    const creds = await getOrgCalendlyCredentials(
      input.organizationId,
      input.ownerUserId
    );
    const candidate = await SavedCandidateModel.findById(input.candidateId).lean();

    let baseUrl = '';
    if (input.eventTypeUri?.startsWith('http') && !input.eventTypeUri.includes('/event_types/')) {
      baseUrl = input.eventTypeUri;
    } else {
      baseUrl = creds?.schedulingUrl || '';
    }

    const bookingUrl = baseUrl
      ? buildSchedulingUrl(baseUrl, {
          name: candidate?.name,
          email: candidate?.email || undefined,
          campaignId: input.campaignId || undefined,
          utmSource: 'huntlo360',
        })
      : input.eventTypeUri
        ? `${input.eventTypeUri}?utm_source=huntlo360`
        : `https://calendly.com/huntlo/placeholder/${input.candidateId}`;

    const ownerId = input.ownerUserId && mongoose.Types.ObjectId.isValid(input.ownerUserId)
      ? input.ownerUserId
      : null;
    if (!ownerId) {
      throw new Error('ownerUserId is required to create a Huntlo 360 scheduling link.');
    }

    const scheduleCandidate = await ScheduleCandidateModel.create({
      organizationId: input.organizationId,
      workflowId: input.workflowId,
      campaignId: input.campaignId || null,
      candidateId: input.candidateId,
      enrollmentId: input.enrollmentId || null,
      status: 'link_pending',
      provider: input.provider || 'calendly',
      eventTypeUri: input.eventTypeUri || null,
      bookingUrl,
      channel: input.channel,
      expiresAt,
      inviteDeliveredAt: null,
    });

    const interview = await InterviewModel.create({
      organizationId: input.organizationId,
      candidateId: input.candidateId,
      createdBy: ownerId,
      interviewType: 'Huntlo 360 interview',
      schedulingMethod: 'calendly_link',
      provider: input.provider || 'calendly',
      providerEventTypeId: input.eventTypeUri || null,
      schedulingUrl: bookingUrl,
      timezone: 'Asia/Kolkata',
      status: 'draft',
      bookingStatus: 'pending',
      sourceModule: 'huntlo360',
      campaignId: input.campaignId || null,
      workflowId: input.workflowId,
      jobId: input.jobId || null,
      scheduleCandidateId: scheduleCandidate._id,
      inviteChannel: input.channel,
      linkExpiresAt: expiresAt,
      inviteeEmail: candidate?.email || null,
      inviteeName: candidate?.name || null,
    });

    scheduleCandidate.interviewId = interview._id;
    await scheduleCandidate.save();

    return scheduleCandidate;
  },

  async deliverInvite(input: {
    organizationId: string;
    ownerUserId: string;
    scheduleCandidateId: string;
    channel?: 'email' | 'whatsapp';
  }) {
    const log = getLogger().child({ component: 'scheduling-facade' });
    const doc = await ScheduleCandidateModel.findById(input.scheduleCandidateId);
    if (!doc?.interviewId) {
      return { delivered: false, status: 'link_pending' as const, bookingUrl: null };
    }
    if (doc.inviteDeliveredAt) {
      return {
        delivered: true,
        status: 'link_sent' as const,
        bookingUrl: doc.bookingUrl,
      };
    }

    const primary = input.channel || doc.channel || 'email';
    const channels: Array<'email' | 'whatsapp'> =
      primary === 'whatsapp' ? ['whatsapp', 'email'] : ['email', 'whatsapp'];

    const { interviewsService } = await import('./interview.service.js');
    let lastError: unknown = null;
    let sentChannel: 'email' | 'whatsapp' | null = null;

    for (const channel of channels) {
      try {
        await interviewsService.sendLink(
          input.organizationId,
          input.ownerUserId,
          String(doc.interviewId),
          { channel }
        );
        sentChannel = channel;
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        log.warn(
          {
            err: error,
            organizationId: input.organizationId,
            scheduleCandidateId: input.scheduleCandidateId,
            interviewId: String(doc.interviewId),
            channel,
          },
          'Interview invite send failed'
        );
      }
    }

    if (!sentChannel) {
      doc.status = 'link_pending';
      await doc.save();
      log.error(
        {
          err: lastError,
          organizationId: input.organizationId,
          scheduleCandidateId: input.scheduleCandidateId,
        },
        'Interview invite was not delivered on any channel'
      );
      return { delivered: false, status: 'link_pending' as const, bookingUrl: doc.bookingUrl };
    }

    doc.status = 'link_sent';
    doc.channel = sentChannel;
    doc.inviteDeliveredAt = new Date();
    await doc.save();

    if (doc.campaignId && doc.enrollmentId && doc.candidateId && doc.bookingUrl) {
      try {
        const { conversationsService } = await import(
          '../conversations/conversations.service.js'
        );
        const { ConversationMessageModel } = await import(
          '../conversations/conversation-message.model.js'
        );
        const { emitConversationMessageCreated } = await import(
          '../../realtime/events.js'
        );
        const thread = await conversationsService.ensureThreadForEnrollment({
          organizationId: input.organizationId,
          candidateId: String(doc.candidateId),
          campaignId: String(doc.campaignId),
          enrollmentId: String(doc.enrollmentId),
          channel: sentChannel,
        });
        const msg = await ConversationMessageModel.create({
          organizationId: input.organizationId,
          threadId: thread._id,
          provider: 'system',
          channel: sentChannel,
          direction: 'outbound',
          bodyText: `Please book a time using this scheduling link: ${doc.bookingUrl}`,
          messageType: 'message',
          deliveryStatus: 'sent',
          sentAt: new Date(),
          createdByUserId: input.ownerUserId,
        });
        thread.lastMessageAt = msg.sentAt || new Date();
        thread.lastMessagePreview = String(msg.bodyText).slice(0, 240);
        await thread.save();
        emitConversationMessageCreated({
          organizationId: input.organizationId,
          threadId: String(thread._id),
          messageId: String(msg._id),
          campaignId: String(doc.campaignId),
          candidateId: String(doc.candidateId),
          direction: 'outbound',
          channel: sentChannel,
        });
      } catch (error) {
        log.warn(
          { err: error, scheduleCandidateId: input.scheduleCandidateId },
          'Interview invite sent but conversation thread was not updated'
        );
      }
    }

    return {
      delivered: true,
      status: 'link_sent' as const,
      bookingUrl: doc.bookingUrl,
    };
  },

  async markBooked(scheduleCandidateId: string) {
    const doc = await ScheduleCandidateModel.findById(scheduleCandidateId);
    if (!doc) return null;
    doc.status = 'booked';
    doc.bookedAt = new Date();
    await doc.save();
    if (doc.interviewId) {
      await InterviewModel.findByIdAndUpdate(doc.interviewId, {
        $set: { status: 'scheduled', bookingStatus: 'booked' },
      });
    }
    return doc;
  },

  async markExpired(scheduleCandidateId: string) {
    const doc = await ScheduleCandidateModel.findById(scheduleCandidateId);
    if (!doc) return null;
    doc.status = 'expired';
    await doc.save();
    if (doc.interviewId) {
      await InterviewModel.findByIdAndUpdate(doc.interviewId, {
        $set: { status: 'expired', bookingStatus: 'expired' },
      });
    }
    return doc;
  },
};
