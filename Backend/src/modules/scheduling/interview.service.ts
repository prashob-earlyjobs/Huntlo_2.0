import mongoose from 'mongoose';
import type { z } from 'zod';

import {
  buildSchedulingUrl,
  formatCalendlyLocation,
} from '../../providers/calendly/calendly.client.js';
import { emitRealtime } from '../../realtime/events.js';
import { AppError } from '../../shared/errors/app-error.js';
import { UserModel } from '../auth/user.model.js';
import { CandidateActivityModel } from '../candidates/candidate-activity.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { JobModel } from '../jobs/job.model.js';
import { OrganizationMemberModel } from '../organizations/member.model.js';
import { getOrgCalendlyCredentials } from './calendly-credentials.js';
import {
  InterviewModel,
  type InterviewDocument,
  type InterviewStatus,
} from './interview.model.js';
import { scheduleRemindersForInterview } from './reminder.service.js';
import {
  dateKeyInTimezone,
  formatInTimezone,
  normalizeTimezone,
  timeLabelInTimezone,
} from './timezone.js';
import type {
  calendarQuerySchema,
  createInterviewSchema,
  listInterviewsQuerySchema,
  rescheduleBodySchema,
  sendLinkBodySchema,
  updateInterviewSchema,
} from './scheduling.validation.js';

type CreateInput = z.infer<typeof createInterviewSchema>;
type UpdateInput = z.infer<typeof updateInterviewSchema>;
type ListQuery = z.infer<typeof listInterviewsQuerySchema>;
type CalendarQuery = z.infer<typeof calendarQuerySchema>;
type SendLinkInput = z.infer<typeof sendLinkBodySchema>;
type RescheduleInput = z.infer<typeof rescheduleBodySchema>;

const STATUS_DISPLAY: Record<InterviewStatus, string> = {
  draft: 'Draft',
  link_sent: 'Link Sent',
  awaiting_booking: 'Awaiting Booking',
  scheduled: 'Scheduled',
  rescheduled: 'Rescheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
  expired: 'Expired',
};

const METHOD_DISPLAY: Record<string, string> = {
  calendly_link: 'Calendly Link',
  manual: 'Manual Time Selection',
  candidate_availability: 'Request Candidate Availability',
};

async function loadInterview(organizationId: string, id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'INVALID_ID', 'Invalid interview id.');
  }
  const doc = await InterviewModel.findOne({
    _id: id,
    organizationId,
    deletedAt: null,
  });
  if (!doc) throw new AppError(404, 'INTERVIEW_NOT_FOUND', 'Interview not found.');
  return doc;
}

async function candidateExtras(candidateId: mongoose.Types.ObjectId | null) {
  if (!candidateId) {
    return { name: 'Candidate', title: '', company: '', email: null as string | null };
  }
  const c = await SavedCandidateModel.findById(candidateId)
    .select('name currentTitle currentCompany email')
    .lean();
  return {
    name: c?.name || 'Candidate',
    title: c?.currentTitle || '',
    company: c?.currentCompany || '',
    email: c?.email || null,
  };
}

async function jobTitle(jobId: mongoose.Types.ObjectId | null) {
  if (!jobId) return null;
  const job = await JobModel.findById(jobId).select('title').lean();
  return job?.title ? String(job.title) : null;
}

async function userName(userId: string) {
  const user = await UserModel.findById(userId).select('firstName lastName').lean();
  if (!user) return 'Unknown';
  return `${user.firstName} ${user.lastName}`.trim();
}

async function interviewerNames(
  organizationId: string,
  interviewerIds: string[]
): Promise<string[]> {
  const validIds = interviewerIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length === 0) return interviewerIds;

  const [users, members] = await Promise.all([
    UserModel.find({ _id: { $in: validIds } })
      .select('firstName lastName')
      .lean(),
    OrganizationMemberModel.find({
      organizationId,
      $or: [{ _id: { $in: validIds } }, { userId: { $in: validIds } }],
    })
      .select('_id userId')
      .lean(),
  ]);

  const names = new Map(
    users.map((user) => [
      String(user._id),
      `${user.firstName} ${user.lastName}`.trim(),
    ])
  );

  // Existing interviews may store organization-member ids instead of user ids.
  const unresolvedMemberUserIds = members
    .map((member) => String(member.userId))
    .filter((userId) => !names.has(userId));
  if (unresolvedMemberUserIds.length > 0) {
    const memberUsers = await UserModel.find({ _id: { $in: unresolvedMemberUserIds } })
      .select('firstName lastName')
      .lean();
    for (const user of memberUsers) {
      names.set(String(user._id), `${user.firstName} ${user.lastName}`.trim());
    }
  }

  for (const member of members) {
    const memberId = String(member._id);
    const userId = String(member.userId);
    const name = names.get(userId);
    if (name) {
      names.set(memberId, name);
      names.set(userId, name);
    }
  }

  return interviewerIds.map((id) => names.get(id) || id);
}

function durationMinutes(startAt: Date | null, endAt: Date | null): string {
  if (!startAt || !endAt) return '—';
  const mins = Math.max(0, Math.round((endAt.getTime() - startAt.getTime()) / 60_000));
  return `${mins} min`;
}

function renderInterviewMessage(
  template: string | null | undefined,
  values: {
    firstName: string;
    jobTitle: string;
    schedulingDetails: string;
  }
): string {
  const source =
    template ||
    'Hi {{first_name}}, we would like to schedule your next interview for {{job_title}}. {{scheduling_details}}';
  return source
    .replace(/\{\{\s*first_name\s*\}\}/gi, values.firstName)
    .replace(/\{\{\s*job_title\s*\}\}/gi, values.jobTitle)
    .replace(/\{\{\s*scheduling_details\s*\}\}/gi, values.schedulingDetails);
}

function emitInterviewUpdated(doc: InterviewDocument) {
  emitRealtime('interview.updated', {
    organizationId: String(doc.organizationId),
    interviewId: String(doc._id),
    status: doc.status,
    candidateId: doc.candidateId ? String(doc.candidateId) : null,
    jobId: doc.jobId ? String(doc.jobId) : null,
    startAt: doc.startAt?.toISOString() ?? null,
  });
}

export function toInterviewDisplay(
  doc: InterviewDocument,
  extras: {
    candidateName: string;
    candidateTitle: string;
    candidateCompany: string;
    jobTitle: string | null;
    recruiter: string;
    interviewerNames: string[];
  }
) {
  const tz = normalizeTimezone(doc.timezone);
  return {
    id: String(doc._id),
    organizationId: String(doc.organizationId),
    candidateId: doc.candidateId ? String(doc.candidateId) : null,
    candidateName: extras.candidateName,
    candidateTitle: extras.candidateTitle,
    candidateCompany: extras.candidateCompany,
    jobId: doc.jobId ? String(doc.jobId) : null,
    jobTitle: extras.jobTitle,
    interviewType: doc.interviewType,
    interviewers: extras.interviewerNames,
    interviewerIds: doc.interviewerIds,
    recruiter: extras.recruiter,
    createdBy: String(doc.createdBy),
    round: doc.round,
    schedulingMethod: METHOD_DISPLAY[doc.schedulingMethod] || doc.schedulingMethod,
    schedulingMethodRaw: doc.schedulingMethod,
    provider: doc.provider,
    providerEventTypeId: doc.providerEventTypeId,
    providerBookingId: doc.providerBookingId,
    providerEventUri: doc.providerEventUri,
    providerInviteeUri: doc.providerInviteeUri,
    schedulingUrl: doc.schedulingUrl,
    rescheduleUrl: doc.rescheduleUrl,
    cancelUrl: doc.cancelUrl,
    startAt: doc.startAt?.toISOString() ?? null,
    endAt: doc.endAt?.toISOString() ?? null,
    dateKey: doc.startAt ? dateKeyInTimezone(doc.startAt, tz) : null,
    dateLabel: doc.startAt ? formatInTimezone(doc.startAt, tz, { dateStyle: 'medium' }) : null,
    timeLabel: doc.startAt ? timeLabelInTimezone(doc.startAt, tz) : null,
    duration: durationMinutes(doc.startAt, doc.endAt),
    timezone: tz,
    location: doc.location,
    meetingUrl: doc.meetingUrl,
    meetingLink: doc.meetingUrl,
    platform: doc.meetingUrl ? 'Calendly' : doc.location || '—',
    instructions: doc.instructions,
    status: STATUS_DISPLAY[doc.status] || doc.status,
    statusRaw: doc.status,
    bookingStatus: doc.bookingStatus,
    reminderStatus:
      doc.reminderStatus === 'not_sent'
        ? 'Not sent'
        : doc.reminderStatus === '24h_sent'
          ? '24h sent'
          : doc.reminderStatus === '2h_sent'
            ? '2h sent'
            : doc.reminderStatus === 'both_sent'
              ? 'Both sent'
              : doc.reminderStatus === 'failed'
                ? 'Failed'
                : 'Not sent',
    reminderHours: doc.reminderHours,
    reminderStatusRaw: doc.reminderStatus,
    bookingSource:
      doc.sourceModule === 'huntlo360'
        ? 'Huntlo 360'
        : doc.sourceModule === 'outreach'
          ? 'Outreach campaign'
          : doc.schedulingMethod === 'manual'
            ? 'Manual'
            : doc.schedulingMethod === 'candidate_availability'
              ? 'Candidate availability'
              : 'Calendly',
    sourceModule: doc.sourceModule,
    campaignId: doc.campaignId ? String(doc.campaignId) : null,
    screeningId: doc.screeningId ? String(doc.screeningId) : null,
    workflowId: doc.workflowId ? String(doc.workflowId) : null,
    inviteChannel: doc.inviteChannel,
    linkExpiresAt: doc.linkExpiresAt?.toISOString() ?? null,
    inviteeEmail: doc.inviteeEmail,
    inviteeName: doc.inviteeName,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

async function display(doc: InterviewDocument) {
  const [cand, title, recruiter, names] = await Promise.all([
    candidateExtras(doc.candidateId),
    jobTitle(doc.jobId),
    userName(String(doc.createdBy)),
    interviewerNames(String(doc.organizationId), doc.interviewerIds),
  ]);
  return toInterviewDisplay(doc, {
    candidateName: doc.inviteeName || cand.name,
    candidateTitle: cand.title,
    candidateCompany: cand.company,
    jobTitle: title,
    recruiter,
    interviewerNames: names,
  });
}

async function recordActivity(
  organizationId: string,
  candidateId: string | null,
  userId: string,
  action: string,
  metadata: Record<string, unknown>
) {
  if (!candidateId) return;
  try {
    await CandidateActivityModel.create({
      organizationId,
      candidateId,
      userId,
      action,
      metadata,
    });
  } catch {
    // best-effort
  }
}

export const interviewsService = {
  async list(organizationId: string, query: ListQuery) {
    const filter: Record<string, unknown> = { organizationId, deletedAt: null };
    if (query.status) filter.status = query.status;
    if (query.jobId) filter.jobId = query.jobId;
    if (query.candidateId) filter.candidateId = query.candidateId;
    if (query.campaignId) filter.campaignId = query.campaignId;
    if (query.from || query.to) {
      filter.startAt = {};
      if (query.from) (filter.startAt as Record<string, Date>).$gte = new Date(query.from);
      if (query.to) (filter.startAt as Record<string, Date>).$lte = new Date(query.to);
    }

    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await Promise.all([
      InterviewModel.find(filter).sort({ startAt: 1, updatedAt: -1 }).skip(skip).limit(query.limit),
      InterviewModel.countDocuments(filter),
    ]);

    let items = await Promise.all(rows.map((doc) => display(doc)));
    if (query.q) {
      const q = query.q.toLowerCase();
      items = items.filter(
        (item) =>
          item.candidateName.toLowerCase().includes(q) ||
          (item.jobTitle || '').toLowerCase().includes(q) ||
          item.interviewType.toLowerCase().includes(q)
      );
    }

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async create(organizationId: string, userId: string, input: CreateInput) {
    const timezone = normalizeTimezone(input.timezone);
    const method = input.schedulingMethod || 'calendly_link';
    const linkExpiryHours = input.linkExpiryHours ?? 72;

    let schedulingUrl = input.schedulingUrl || null;
    let providerEventTypeId = input.providerEventTypeId || null;

    if (method === 'calendly_link' && !schedulingUrl) {
      const creds = await getOrgCalendlyCredentials(organizationId, userId);
      if (providerEventTypeId) {
        // providerEventTypeId may be event type URI or scheduling URL
        schedulingUrl = providerEventTypeId.startsWith('http')
          ? providerEventTypeId
          : creds?.schedulingUrl || null;
      } else {
        schedulingUrl = creds?.schedulingUrl || null;
      }
      if (creds?.schedulingUrl && providerEventTypeId?.includes('event_types')) {
        // keep URI as providerEventTypeId; URL resolved below via buildSchedulingUrl
      }
    }

    const candidate = input.candidateId
      ? await SavedCandidateModel.findOne({
          _id: input.candidateId,
          organizationId,
        }).lean()
      : null;

    if (schedulingUrl && candidate) {
      schedulingUrl = buildSchedulingUrl(schedulingUrl, {
        name: candidate.name,
        email: candidate.email || input.inviteeEmail || undefined,
        campaignId: input.campaignId || undefined,
        utmSource: input.sourceModule || 'scheduling',
      });
    }

    const startAt = input.startAt ? new Date(input.startAt) : null;
    const endAt = input.endAt
      ? new Date(input.endAt)
      : startAt
        ? new Date(startAt.getTime() + 30 * 60_000)
        : null;

    const isManualBooked = method === 'manual' && startAt;

    const doc = await InterviewModel.create({
      organizationId,
      candidateId: input.candidateId || null,
      jobId: input.jobId || null,
      createdBy: userId,
      interviewType: input.interviewType || 'Intro call',
      round: input.round ?? null,
      interviewerIds: input.interviewerIds || [],
      schedulingMethod: method,
      provider: input.provider ?? (method === 'calendly_link' ? 'calendly' : null),
      providerEventTypeId,
      schedulingUrl,
      startAt,
      endAt,
      timezone,
      location: input.location ?? null,
      meetingUrl: input.meetingUrl ?? null,
      instructions: input.instructions ?? null,
      reminderHours: input.reminderHours ?? [24, 2],
      status: isManualBooked ? 'scheduled' : schedulingUrl ? 'link_sent' : 'draft',
      bookingStatus: isManualBooked ? 'booked' : schedulingUrl ? 'link_sent' : 'pending',
      sourceModule: input.sourceModule || 'scheduling',
      campaignId: input.campaignId || null,
      screeningId: input.screeningId || null,
      workflowId: input.workflowId || null,
      inviteChannel: input.inviteChannel ?? null,
      linkExpiresAt:
        method === 'calendly_link'
          ? new Date(Date.now() + linkExpiryHours * 60 * 60 * 1000)
          : null,
      inviteeEmail: input.inviteeEmail || candidate?.email || null,
      inviteeName: input.inviteeName || candidate?.name || null,
    });

    if (input.sendLink) {
      await this.sendLink(organizationId, userId, String(doc._id), {
        channel: input.inviteChannel || 'email',
        message: input.message,
      });
    }

    if (isManualBooked) {
      await scheduleRemindersForInterview(doc);
    }

    await recordActivity(organizationId, input.candidateId || null, userId, 'interview_created', {
      interviewId: String(doc._id),
      method,
    });

    emitInterviewUpdated(doc);
    return display(doc);
  },

  async get(organizationId: string, id: string) {
    return display(await loadInterview(organizationId, id));
  },

  async update(organizationId: string, id: string, input: UpdateInput) {
    const doc = await loadInterview(organizationId, id);
    if (input.candidateId !== undefined) doc.candidateId = input.candidateId as never;
    if (input.jobId !== undefined) doc.jobId = input.jobId as never;
    if (input.interviewType !== undefined) doc.interviewType = input.interviewType;
    if (input.round !== undefined) doc.round = input.round;
    if (input.interviewerIds !== undefined) doc.interviewerIds = input.interviewerIds;
    if (input.schedulingMethod !== undefined) doc.schedulingMethod = input.schedulingMethod;
    if (input.provider !== undefined) doc.provider = input.provider;
    if (input.providerEventTypeId !== undefined)
      doc.providerEventTypeId = input.providerEventTypeId;
    if (input.schedulingUrl !== undefined) doc.schedulingUrl = input.schedulingUrl;
    if (input.startAt !== undefined) doc.startAt = input.startAt ? new Date(input.startAt) : null;
    if (input.endAt !== undefined) doc.endAt = input.endAt ? new Date(input.endAt) : null;
    if (input.timezone !== undefined) doc.timezone = normalizeTimezone(input.timezone);
    if (input.location !== undefined) doc.location = input.location;
    if (input.meetingUrl !== undefined) doc.meetingUrl = input.meetingUrl;
    if (input.instructions !== undefined) doc.instructions = input.instructions;
    if (input.reminderHours !== undefined) doc.reminderHours = input.reminderHours;
    if (input.status !== undefined) doc.status = input.status;
    if (input.bookingStatus !== undefined) doc.bookingStatus = input.bookingStatus;
    if (input.inviteChannel !== undefined) doc.inviteChannel = input.inviteChannel;
    if (input.inviteeEmail !== undefined) doc.inviteeEmail = input.inviteeEmail;
    if (input.inviteeName !== undefined) doc.inviteeName = input.inviteeName;
    doc.version += 1;
    await doc.save();
    emitInterviewUpdated(doc);
    return display(doc);
  },

  async sendLink(
    organizationId: string,
    userId: string,
    id: string,
    input: SendLinkInput = {}
  ) {
    const doc = await loadInterview(organizationId, id);
    if (doc.schedulingMethod === 'calendly_link' && !doc.schedulingUrl) {
      throw new AppError(400, 'NO_SCHEDULING_URL', 'Interview has no scheduling URL.');
    }

    const channel = input.channel || doc.inviteChannel || 'email';
    const candidate = doc.candidateId
      ? await SavedCandidateModel.findById(doc.candidateId).lean()
      : null;

    if (channel === 'email' && !(doc.inviteeEmail || candidate?.email)) {
      throw new AppError(400, 'NO_EMAIL', 'Candidate has no email for link delivery.');
    }
    if (channel === 'whatsapp' && !candidate?.phone) {
      throw new AppError(400, 'NO_PHONE', 'Candidate has no phone for WhatsApp delivery.');
    }

    const title = await jobTitle(doc.jobId);
    const firstName = String(doc.inviteeName || candidate?.name || 'Candidate')
      .trim()
      .split(/\s+/)[0]!;
    const schedulingDetails =
      doc.schedulingMethod === 'manual' && doc.startAt
        ? `${formatInTimezone(doc.startAt, doc.timezone, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}${doc.location ? ` · ${doc.location}` : ''}`
        : doc.schedulingUrl ||
          'Please reply to this message with your preferred interview slots.';
    const renderedMessage = renderInterviewMessage(input.message, {
      firstName,
      jobTitle: title || 'the role',
      schedulingDetails,
    });

    // Provider delivery is represented by the same persisted activity contract
    // used by scheduling messages. Connected channel delivery can consume this
    // payload without losing the recruiter's customized text.
    doc.inviteChannel = channel;
    doc.status = doc.startAt ? doc.status : 'awaiting_booking';
    if (!doc.startAt) {
      doc.bookingStatus = 'link_sent';
      if (doc.status === 'draft' || doc.status === 'link_sent') {
        doc.status = 'awaiting_booking';
      }
    }
    if (doc.status === 'draft') doc.status = 'link_sent';
    await doc.save();

    await recordActivity(
      organizationId,
      doc.candidateId ? String(doc.candidateId) : null,
      userId,
      'interview_link_sent',
      {
        interviewId: id,
        channel,
        schedulingUrl: doc.schedulingUrl,
        message: renderedMessage,
      }
    );

    emitRealtime('interview.link.sent', {
      organizationId,
      interviewId: id,
      candidateId: doc.candidateId ? String(doc.candidateId) : null,
      channel,
    });
    emitInterviewUpdated(doc);

    return display(doc);
  },

  async reschedule(
    organizationId: string,
    userId: string,
    id: string,
    input: RescheduleInput
  ) {
    const doc = await loadInterview(organizationId, id);
    doc.startAt = new Date(input.startAt);
    doc.endAt = input.endAt
      ? new Date(input.endAt)
      : new Date(doc.startAt.getTime() + 30 * 60_000);
    if (input.timezone) doc.timezone = normalizeTimezone(input.timezone);
    if (input.location !== undefined) doc.location = input.location;
    if (input.meetingUrl !== undefined) doc.meetingUrl = input.meetingUrl;
    doc.status = 'rescheduled';
    doc.bookingStatus = 'rescheduled';
    doc.reminderStatus = 'not_sent';
    doc.version += 1;
    await doc.save();

    await scheduleRemindersForInterview(doc, { replace: true });
    await recordActivity(
      organizationId,
      doc.candidateId ? String(doc.candidateId) : null,
      userId,
      'interview_rescheduled',
      { interviewId: id, reason: input.reason, startAt: doc.startAt.toISOString() }
    );

    emitInterviewUpdated(doc);
    return display(doc);
  },

  async cancel(organizationId: string, userId: string, id: string) {
    const doc = await loadInterview(organizationId, id);
    if (['completed', 'cancelled'].includes(doc.status)) {
      throw new AppError(400, 'INVALID_STATUS', `Cannot cancel from status ${doc.status}.`);
    }
    doc.status = 'cancelled';
    doc.bookingStatus = 'cancelled';
    await doc.save();
    await scheduleRemindersForInterview(doc, { cancel: true });
    await recordActivity(
      organizationId,
      doc.candidateId ? String(doc.candidateId) : null,
      userId,
      'interview_cancelled',
      { interviewId: id }
    );
    emitInterviewUpdated(doc);
    return display(doc);
  },

  async remind(organizationId: string, userId: string, id: string) {
    const doc = await loadInterview(organizationId, id);
    if (!doc.startAt) {
      throw new AppError(400, 'NOT_SCHEDULED', 'Interview is not scheduled yet.');
    }
    await recordActivity(
      organizationId,
      doc.candidateId ? String(doc.candidateId) : null,
      userId,
      'interview_reminder_manual',
      { interviewId: id }
    );
    const { sendInterviewReminderNow } = await import('./reminder.service.js');
    await sendInterviewReminderNow(doc, doc.inviteChannel || 'email');
    emitInterviewUpdated(doc);
    return display(doc);
  },

  async complete(organizationId: string, userId: string, id: string) {
    const doc = await loadInterview(organizationId, id);
    doc.status = 'completed';
    await doc.save();
    await scheduleRemindersForInterview(doc, { cancel: true });
    await recordActivity(
      organizationId,
      doc.candidateId ? String(doc.candidateId) : null,
      userId,
      'interview_completed',
      { interviewId: id }
    );
    emitInterviewUpdated(doc);
    return display(doc);
  },

  async noShow(organizationId: string, userId: string, id: string) {
    const doc = await loadInterview(organizationId, id);
    doc.status = 'no_show';
    await doc.save();
    await scheduleRemindersForInterview(doc, { cancel: true });
    await recordActivity(
      organizationId,
      doc.candidateId ? String(doc.candidateId) : null,
      userId,
      'interview_no_show',
      { interviewId: id }
    );
    emitInterviewUpdated(doc);
    return display(doc);
  },

  async calendar(organizationId: string, query: CalendarQuery) {
    const from = query.from
      ? new Date(query.from)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const to = query.to
      ? new Date(query.to)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const maxRangeMs = 120 * 24 * 60 * 60 * 1000;
    if (to.getTime() - from.getTime() > maxRangeMs) {
      throw new AppError(400, 'INVALID_RANGE', 'Calendar range cannot exceed 120 days.');
    }

    const filter: Record<string, unknown> = {
      organizationId,
      deletedAt: null,
      startAt: { $gte: from, $lte: to },
      status: { $in: ['scheduled', 'rescheduled', 'completed', 'no_show'] },
    };
    if (query.interviewerId) {
      filter.interviewerIds = query.interviewerId;
    }

    const rows = await InterviewModel.find(filter).sort({ startAt: 1 }).limit(500);
    const items = await Promise.all(rows.map((doc) => display(doc)));
    return {
      from: from.toISOString(),
      to: to.toISOString(),
      items,
      truncated: rows.length >= 500,
    };
  },

  /** Apply Calendly scheduled_event + invitee fields (EJ upsertBookingFromInvitee). */
  async upsertFromCalendlyInvitee(input: {
    organizationId: string;
    event: Record<string, unknown>;
    invitee: Record<string, unknown>;
    matchInterviewIds?: string[];
  }) {
    const inviteeUri = String(input.invitee.uri || '').trim();
    const eventUri = String(input.event.uri || '').trim();
    if (!inviteeUri || !eventUri) return null;

    const inviteeEmail = String(input.invitee.email || '')
      .trim()
      .toLowerCase();
    const eventStatus =
      String(input.event.status || 'active').toLowerCase() === 'canceled'
        ? 'cancelled'
        : 'scheduled';
    const inviteeStatus =
      String(input.invitee.status || 'active').toLowerCase() === 'canceled'
        ? 'cancelled'
        : eventStatus;

    const startAt = input.event.start_time
      ? new Date(String(input.event.start_time))
      : null;
    const endAt = input.event.end_time ? new Date(String(input.event.end_time)) : null;
    const locationLabel = formatCalendlyLocation(input.event.location);
    const meetingUrl = locationLabel.startsWith('http') ? locationLabel : null;

    let doc =
      (await InterviewModel.findOne({
        organizationId: input.organizationId,
        providerInviteeUri: inviteeUri,
        deletedAt: null,
      })) ||
      (inviteeEmail
        ? await InterviewModel.findOne({
            organizationId: input.organizationId,
            inviteeEmail,
            providerEventTypeId: String(input.event.event_type || '') || undefined,
            status: { $in: ['link_sent', 'awaiting_booking', 'draft'] },
            deletedAt: null,
          }).sort({ updatedAt: -1 })
        : null);

    if (!doc && input.matchInterviewIds?.length) {
      doc = await InterviewModel.findOne({
        _id: { $in: input.matchInterviewIds },
        organizationId: input.organizationId,
        deletedAt: null,
      });
    }

    let matchedCandidateId: mongoose.Types.ObjectId | null = null;
    if (!doc && inviteeEmail) {
      const candidate = await SavedCandidateModel.findOne({
        organizationId: input.organizationId,
        email: inviteeEmail,
      }).lean();
      if (candidate) {
        matchedCandidateId = candidate._id;
        doc = await InterviewModel.findOne({
          organizationId: input.organizationId,
          candidateId: candidate._id,
          status: { $in: ['link_sent', 'awaiting_booking', 'draft'] },
          deletedAt: null,
        }).sort({ updatedAt: -1 });
      }
    }

    const patch = {
      providerEventUri: eventUri,
      providerInviteeUri: inviteeUri,
      providerEventTypeId:
        String(input.event.event_type || '').trim() || undefined,
      providerBookingId: inviteeUri,
      startAt,
      endAt,
      timezone: String(input.invitee.timezone || '').trim() || undefined,
      location: meetingUrl ? null : locationLabel || undefined,
      meetingUrl: meetingUrl || undefined,
      rescheduleUrl: String(input.invitee.reschedule_url || '').trim() || undefined,
      cancelUrl: String(input.invitee.cancel_url || '').trim() || undefined,
      inviteeEmail: inviteeEmail || undefined,
      inviteeName: String(input.invitee.name || '').trim() || undefined,
      status: (inviteeStatus === 'cancelled' ? 'cancelled' : 'scheduled') as InterviewStatus,
      bookingStatus:
        inviteeStatus === 'cancelled'
          ? ('cancelled' as const)
          : ('booked' as const),
      provider: 'calendly',
    };

    if (!doc) {
      // Create orphan booking record for unmatched invitees (org-level)
      const orgMember = await OrganizationMemberModel.findOne({
        organizationId: input.organizationId,
        status: 'active',
      })
        .sort({ role: 1, createdAt: 1 })
        .select('userId')
        .lean();
      doc = await InterviewModel.create({
        organizationId: input.organizationId,
        createdBy: orgMember?.userId || new mongoose.Types.ObjectId(),
        candidateId: matchedCandidateId,
        interviewType: String(input.event.name || 'Interview'),
        schedulingMethod: 'calendly_link',
        ...patch,
        timezone: patch.timezone || 'Asia/Kolkata',
        sourceModule: 'calendly_sync',
      });
    } else {
      Object.assign(doc, {
        providerEventUri: patch.providerEventUri,
        providerInviteeUri: patch.providerInviteeUri,
        providerBookingId: patch.providerBookingId,
        startAt: patch.startAt,
        endAt: patch.endAt,
        status: patch.status,
        bookingStatus: patch.bookingStatus,
        provider: 'calendly',
      });
      if (patch.providerEventTypeId) doc.providerEventTypeId = patch.providerEventTypeId;
      if (patch.timezone) doc.timezone = normalizeTimezone(patch.timezone);
      if (patch.location !== undefined) doc.location = patch.location;
      if (patch.meetingUrl !== undefined) doc.meetingUrl = patch.meetingUrl;
      if (patch.rescheduleUrl) doc.rescheduleUrl = patch.rescheduleUrl;
      if (patch.cancelUrl) doc.cancelUrl = patch.cancelUrl;
      if (patch.inviteeEmail) doc.inviteeEmail = patch.inviteeEmail;
      if (patch.inviteeName) doc.inviteeName = patch.inviteeName;
      await doc.save();
    }

    if (doc.status === 'scheduled' && doc.startAt) {
      await scheduleRemindersForInterview(doc, { replace: true });
    }

    emitRealtime('interview.booking.updated', {
      organizationId: input.organizationId,
      interviewId: String(doc._id),
      status: doc.status,
      startAt: doc.startAt?.toISOString() ?? null,
    });
    emitRealtime('interview.updated', {
      organizationId: input.organizationId,
      interviewId: String(doc._id),
      status: doc.status,
      candidateId: doc.candidateId ? String(doc.candidateId) : null,
      jobId: doc.jobId ? String(doc.jobId) : null,
      startAt: doc.startAt?.toISOString() ?? null,
    });

    if (doc.status === 'scheduled' && doc.createdBy) {
      const { notificationsService } = await import(
        '../notifications/notifications.service.js'
      );
      void notificationsService
        .create({
          organizationId: input.organizationId,
          userId: String(doc.createdBy),
          type: 'interview_booked',
          severity: 'success',
          title: 'Interview booked',
          message: `${doc.inviteeName || 'A candidate'} booked an interview.`,
          relatedEntityType: 'interview',
          relatedEntityId: String(doc._id),
          actionUrl: `/dashboard/schedule/${String(doc._id)}`,
        })
        .catch(() => undefined);
    }

    return doc;
  },
};
