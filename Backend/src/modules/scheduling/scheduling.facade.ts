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

async function appendInviteToConversationThread(input: {
  organizationId: string;
  ownerUserId: string;
  doc: ScheduleCandidateDocument;
  channel: 'email' | 'whatsapp';
  log: { warn: (...args: unknown[]) => void };
}) {
  const { doc, log } = input;
  if (!doc.campaignId || !doc.candidateId || !doc.bookingUrl) return;

  try {
    let enrollmentId = doc.enrollmentId ? String(doc.enrollmentId) : null;
    if (!enrollmentId) {
      const { OutreachEnrollmentModel } = await import(
        '../outreach/enrollment.model.js'
      );
      const enrollment = await OutreachEnrollmentModel.findOne({
        organizationId: input.organizationId,
        campaignId: doc.campaignId,
        candidateId: doc.candidateId,
      })
        .select('_id')
        .lean();
      if (enrollment?._id) {
        enrollmentId = String(enrollment._id);
        doc.enrollmentId = enrollment._id as mongoose.Types.ObjectId;
        await doc.save();
      }
    }
    if (!enrollmentId) {
      log.warn(
        { scheduleCandidateId: String(doc._id), campaignId: String(doc.campaignId) },
        'Interview invite delivered but no enrollment to attach conversation message'
      );
      return;
    }

    const bookingUrl = String(doc.bookingUrl);
    const { conversationsService } = await import(
      '../conversations/conversations.service.js'
    );
    const { ConversationMessageModel } = await import(
      '../conversations/conversation-message.model.js'
    );
    const { emitConversationMessageCreated } = await import('../../realtime/events.js');
    const thread = await conversationsService.ensureThreadForEnrollment({
      organizationId: input.organizationId,
      candidateId: String(doc.candidateId),
      campaignId: String(doc.campaignId),
      enrollmentId,
      channel: input.channel,
    });

    const escaped = bookingUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existing = await ConversationMessageModel.findOne({
      threadId: thread._id,
      bodyText: { $regex: escaped },
    })
      .select('_id')
      .lean();
    if (existing) return;

    const bodyText = `Please book a time using this scheduling link: ${bookingUrl}`;
    const msg = await ConversationMessageModel.create({
      organizationId: input.organizationId,
      threadId: thread._id,
      provider: 'system',
      channel: input.channel,
      direction: 'outbound',
      bodyText,
      messageType: 'message',
      deliveryStatus: 'sent',
      sentAt: new Date(),
      createdByUserId: input.ownerUserId,
    });
    thread.lastMessageAt = msg.sentAt || new Date();
    thread.lastMessagePreview = bodyText.slice(0, 240);
    await thread.save();
    emitConversationMessageCreated({
      organizationId: input.organizationId,
      threadId: String(thread._id),
      messageId: String(msg._id),
      campaignId: String(doc.campaignId),
      candidateId: String(doc.candidateId),
      direction: 'outbound',
      channel: input.channel,
    });
  } catch (error) {
    log.warn(
      { err: error, scheduleCandidateId: String(doc._id) },
      'Interview invite sent but conversation thread was not updated'
    );
  }
}

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
    const existing = await ScheduleCandidateModel.findById(input.scheduleCandidateId);
    if (!existing?.interviewId) {
      return { delivered: false, status: 'link_pending' as const, bookingUrl: null };
    }
    if (existing.inviteDeliveredAt) {
      await appendInviteToConversationThread({
        organizationId: input.organizationId,
        ownerUserId: input.ownerUserId,
        doc: existing,
        channel: input.channel || existing.channel || 'email',
        log,
      });
      return {
        delivered: true,
        status: 'link_sent' as const,
        bookingUrl: existing.bookingUrl,
      };
    }

    // Claim before send so concurrent HCG/whatsapp+sync transitions cannot double-text.
    const claimed = await ScheduleCandidateModel.findOneAndUpdate(
      {
        _id: input.scheduleCandidateId,
        inviteDeliveredAt: null,
        status: { $in: ['link_pending'] },
      },
      {
        $set: {
          inviteDeliveredAt: new Date(),
          status: 'link_sent',
        },
      },
      { new: true }
    );
    if (!claimed?.interviewId) {
      const doc = await ScheduleCandidateModel.findById(input.scheduleCandidateId);
      if (doc?.inviteDeliveredAt) {
        await appendInviteToConversationThread({
          organizationId: input.organizationId,
          ownerUserId: input.ownerUserId,
          doc,
          channel: input.channel || doc.channel || 'email',
          log,
        });
        return {
          delivered: true,
          status: 'link_sent' as const,
          bookingUrl: doc.bookingUrl,
        };
      }
      return {
        delivered: false,
        status: 'link_pending' as const,
        bookingUrl: doc?.bookingUrl ?? null,
      };
    }

    const primary = input.channel || claimed.channel || 'email';
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
          String(claimed.interviewId),
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
            interviewId: String(claimed.interviewId),
            channel,
          },
          'Interview invite send failed'
        );
      }
    }

    if (!sentChannel) {
      // Release claim so a later retry can send.
      claimed.status = 'link_pending';
      claimed.inviteDeliveredAt = null;
      await claimed.save();
      log.error(
        {
          err: lastError,
          organizationId: input.organizationId,
          scheduleCandidateId: input.scheduleCandidateId,
        },
        'Interview invite was not delivered on any channel'
      );
      return { delivered: false, status: 'link_pending' as const, bookingUrl: claimed.bookingUrl };
    }

    claimed.status = 'link_sent';
    claimed.channel = sentChannel;
    await claimed.save();

    await appendInviteToConversationThread({
      organizationId: input.organizationId,
      ownerUserId: input.ownerUserId,
      doc: claimed,
      channel: sentChannel,
      log,
    });

    return {
      delivered: true,
      status: 'link_sent' as const,
      bookingUrl: claimed.bookingUrl,
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
