import mongoose, { type Document, type Model, Schema } from 'mongoose';

import {
  buildSchedulingUrl,
} from '../../providers/calendly/calendly.client.js';
import { getOrgCalendlyCredentials } from './calendly-credentials.js';
import { InterviewModel } from './interview.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';

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
      status: 'link_sent',
      provider: input.provider || 'calendly',
      eventTypeUri: input.eventTypeUri || null,
      bookingUrl,
      channel: input.channel,
      expiresAt,
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
      status: 'awaiting_booking',
      bookingStatus: 'link_sent',
      sourceModule: 'huntlo360',
      campaignId: input.campaignId || null,
      workflowId: input.workflowId,
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
