import { AppError } from '../../shared/errors/app-error.js';
import { emitRealtime } from '../../realtime/events.js';
import { getLogger } from '../../config/logger.js';
import { normalizePhone } from '../../shared/validation/phone.js';
import { CandidateActivityModel } from '../candidates/candidate-activity.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { JobModel } from '../jobs/job.model.js';
import { sendAdHocMessage } from '../outreach/campaign-delivery.js';
import {
  ReminderLogModel,
  ReminderSettingsModel,
  type ReminderLogDocument,
} from './reminder.model.js';
import type { InterviewDocument } from './interview.model.js';
import { InterviewModel } from './interview.model.js';
import {
  defaultInterviewReminderMessage,
  renderInterviewMessage,
} from './interview-message.js';
import { formatInTimezone, normalizeTimezone } from './timezone.js';

export async function getOrCreateReminderSettings(organizationId: string) {
  let doc = await ReminderSettingsModel.findOne({ organizationId });
  if (!doc) {
    doc = await ReminderSettingsModel.create({
      organizationId,
      channel: 'email',
      timings: [24, 2],
      enabled: true,
    });
  }
  return doc;
}

export async function scheduleRemindersForInterview(
  interview: InterviewDocument,
  opts: { replace?: boolean; cancel?: boolean } = {}
) {
  if (opts.cancel) {
    await ReminderLogModel.updateMany(
      { interviewId: interview._id, status: 'scheduled' },
      { $set: { status: 'cancelled' } }
    );
    return;
  }

  if (!interview.startAt) return;

  const settings = await getOrCreateReminderSettings(String(interview.organizationId));
  if (!settings.enabled) return;

  if (opts.replace) {
    await ReminderLogModel.updateMany(
      { interviewId: interview._id, status: 'scheduled' },
      { $set: { status: 'cancelled' } }
    );
  }

  const preferredChannel = interview.inviteChannel || settings.channel;
  const channels: Array<'email' | 'whatsapp'> =
    preferredChannel === 'both'
      ? ['email', 'whatsapp']
      : preferredChannel === 'whatsapp'
        ? ['whatsapp']
        : ['email'];

  const timings = Array.isArray(interview.reminderHours)
    ? interview.reminderHours
    : settings.timings;
  const messageByHours = new Map(
    (interview.reminderMessages || []).map((entry) => [entry.hours, entry.message])
  );

  let scheduledCount = 0;
  for (const hours of timings) {
    const scheduledAt = new Date(interview.startAt.getTime() - hours * 60 * 60 * 1000);
    if (scheduledAt.getTime() <= Date.now()) continue;

    for (const channel of channels) {
      await ReminderLogModel.findOneAndUpdate(
        {
          interviewId: interview._id,
          channel,
          timingHours: hours,
        },
        {
          $set: {
            organizationId: interview.organizationId,
            candidateId: interview.candidateId,
            scheduledAt,
            status: 'scheduled',
            error: null,
            sentAt: null,
            message:
              messageByHours.get(hours) || defaultInterviewReminderMessage(hours),
          },
          $setOnInsert: {
            interviewId: interview._id,
            channel,
            timingHours: hours,
          },
        },
        { upsert: true }
      );
      scheduledCount += 1;
    }
  }

  if (
    scheduledCount > 0 &&
    (interview.reminderStatus === 'not_sent' || !interview.reminderStatus)
  ) {
    interview.reminderStatus = 'scheduled';
    await interview.save();
  }
}

async function resolveReminderCopy(
  interview: InterviewDocument,
  timingHours?: number | null,
  explicitMessage?: string | null
): Promise<string> {
  if (explicitMessage && explicitMessage.trim()) return explicitMessage.trim();
  if (timingHours != null) {
    const match = (interview.reminderMessages || []).find(
      (entry) => entry.hours === timingHours
    );
    if (match?.message?.trim()) return match.message.trim();
  }
  const first = (interview.reminderMessages || []).find((entry) => entry.message?.trim());
  if (first?.message?.trim()) return first.message.trim();
  return defaultInterviewReminderMessage(timingHours);
}

async function buildSchedulingDetails(interview: InterviewDocument): Promise<string> {
  const tz = normalizeTimezone(interview.timezone);
  if (interview.startAt) {
    const when = formatInTimezone(interview.startAt, tz, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const parts = [when];
    if (interview.location) parts.push(String(interview.location));
    if (interview.meetingUrl) parts.push(String(interview.meetingUrl));
    return parts.join(' · ');
  }
  if (interview.schedulingUrl) return String(interview.schedulingUrl);
  return 'Please check your interview invite for details.';
}

/**
 * Deliver one interview reminder over email or WhatsApp via connected integrations.
 */
export async function deliverInterviewReminder(input: {
  interview: InterviewDocument;
  channel: 'email' | 'whatsapp';
  timingHours?: number | null;
  message?: string | null;
  userId?: string | null;
}): Promise<{ provider: string; providerMessageId?: string; renderedBody: string }> {
  const interview = input.interview;
  const organizationId = String(interview.organizationId);
  const userId = String(input.userId || interview.createdBy);

  const candidate = interview.candidateId
    ? await SavedCandidateModel.findById(interview.candidateId).lean()
    : null;
  const email = String(interview.inviteeEmail || candidate?.email || '').trim();
  const phoneRaw = String(candidate?.phone || '').trim();

  if (input.channel === 'email' && !email) {
    throw new AppError(400, 'NO_EMAIL', 'Candidate has no email for reminder delivery.');
  }
  if (input.channel === 'whatsapp' && !phoneRaw) {
    throw new AppError(400, 'NO_PHONE', 'Candidate has no phone for WhatsApp reminder delivery.');
  }

  let phone = phoneRaw;
  if (input.channel === 'whatsapp') {
    try {
      phone = normalizePhone(phoneRaw);
    } catch {
      throw new AppError(
        400,
        'INVALID_PHONE',
        'Candidate phone number is invalid for WhatsApp reminder delivery.'
      );
    }
  }

  const job = interview.jobId
    ? await JobModel.findById(interview.jobId).select('title').lean()
    : null;
  const firstName = String(interview.inviteeName || candidate?.name || 'Candidate')
    .trim()
    .split(/\s+/)[0]!;
  const jobTitle = String(job?.title || 'the role').trim() || 'the role';
  const schedulingDetails = await buildSchedulingDetails(interview);
  const template = await resolveReminderCopy(
    interview,
    input.timingHours,
    input.message
  );
  const renderedBody = renderInterviewMessage(template, {
    firstName,
    jobTitle,
    schedulingDetails,
  });

  const subject =
    input.channel === 'email'
      ? `Interview reminder${job?.title ? ` — ${job.title}` : ''}`
      : null;

  try {
    const sent = await sendAdHocMessage({
      organizationId,
      userId,
      channel: input.channel,
      to: input.channel === 'email' ? email : phone,
      subject,
      body: renderedBody,
    });
    return {
      provider: sent.provider,
      providerMessageId: sent.providerMessageId,
      renderedBody,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    const statusCode =
      typeof error === 'object' &&
      error &&
      'statusCode' in error &&
      typeof (error as { statusCode?: unknown }).statusCode === 'number'
        ? (error as { statusCode: number }).statusCode
        : 502;
    const message =
      error instanceof Error
        ? error.message
        : `Failed to send interview reminder via ${input.channel}.`;
    throw new AppError(
      statusCode >= 400 && statusCode < 600 ? statusCode : 502,
      'REMINDER_DELIVERY_FAILED',
      message,
      { cause: error }
    );
  }
}

function updateReminderStatusAfterSend(
  interview: InterviewDocument,
  timingHours?: number | null
) {
  const hours = timingHours ?? 24;
  if (hours >= 12) {
    interview.reminderStatus =
      interview.reminderStatus === '2h_sent' ? 'both_sent' : '24h_sent';
  } else {
    interview.reminderStatus =
      interview.reminderStatus === '24h_sent' ? 'both_sent' : '2h_sent';
  }
}

export async function sendInterviewReminderNow(
  interview: InterviewDocument,
  channel: 'email' | 'whatsapp',
  opts: { userId?: string | null; timingHours?: number | null } = {}
) {
  // Prefer the soonest still-scheduled reminder for this channel.
  const upcoming = await ReminderLogModel.findOne({
    interviewId: interview._id,
    channel,
    status: 'scheduled',
  })
    .sort({ scheduledAt: 1 })
    .lean();

  const timingHours = opts.timingHours ?? upcoming?.timingHours ?? null;
  const message = upcoming?.message ?? null;

  const delivery = await deliverInterviewReminder({
    interview,
    channel,
    timingHours,
    message,
    userId: String(opts.userId || interview.createdBy),
  });

  if (upcoming?._id) {
    await ReminderLogModel.findByIdAndUpdate(upcoming._id, {
      $set: {
        status: 'sent',
        sentAt: new Date(),
        error: null,
        message: delivery.renderedBody,
      },
    });
  }

  updateReminderStatusAfterSend(interview, timingHours);
  await interview.save();

  try {
    if (interview.candidateId) {
      await CandidateActivityModel.create({
        organizationId: interview.organizationId,
        candidateId: interview.candidateId,
        userId: interview.createdBy,
        action: 'interview_reminder_sent',
        metadata: {
          interviewId: String(interview._id),
          channel,
          timingHours: timingHours ?? null,
          startAt: interview.startAt?.toISOString() ?? null,
          provider: delivery.provider,
          providerMessageId: delivery.providerMessageId ?? null,
        },
      });
    }
  } catch {
    // best-effort
  }

  emitRealtime('interview.reminder.sent', {
    organizationId: String(interview.organizationId),
    interviewId: String(interview._id),
    channel,
  });

  return delivery;
}

async function markLogSent(
  log: ReminderLogDocument,
  extras?: { provider?: string; providerMessageId?: string; renderedBody?: string }
) {
  log.status = 'sent';
  log.sentAt = new Date();
  if (extras?.renderedBody) log.message = extras.renderedBody;
  log.error = null;
  await log.save();

  const interview = await InterviewModel.findById(log.interviewId);
  if (!interview) return;

  updateReminderStatusAfterSend(interview, log.timingHours);
  await interview.save();

  try {
    if (interview.candidateId) {
      await CandidateActivityModel.create({
        organizationId: interview.organizationId,
        candidateId: interview.candidateId,
        userId: interview.createdBy,
        action: 'interview_reminder_sent',
        metadata: {
          interviewId: String(interview._id),
          channel: log.channel,
          timingHours: log.timingHours,
          startAt: interview.startAt?.toISOString() ?? null,
          provider: extras?.provider ?? null,
          providerMessageId: extras?.providerMessageId ?? null,
        },
      });
    }
  } catch {
    // best-effort
  }

  emitRealtime('interview.reminder.sent', {
    organizationId: String(interview.organizationId),
    interviewId: String(interview._id),
    channel: log.channel,
  });
}

export async function processDueInterviewReminders(limit = 50): Promise<number> {
  const logger = getLogger();
  const due = await ReminderLogModel.find({
    status: 'scheduled',
    scheduledAt: { $lte: new Date() },
  })
    .sort({ scheduledAt: 1 })
    .limit(limit);

  let handled = 0;
  for (const log of due) {
    try {
      const interview = await InterviewModel.findById(log.interviewId);
      if (
        !interview ||
        ['cancelled', 'completed', 'no_show', 'expired'].includes(interview.status)
      ) {
        log.status = 'cancelled';
        await log.save();
        continue;
      }

      const delivery = await deliverInterviewReminder({
        interview,
        channel: log.channel,
        timingHours: log.timingHours,
        message: log.message,
        userId: String(interview.createdBy),
      });
      await markLogSent(log, {
        provider: delivery.provider,
        providerMessageId: delivery.providerMessageId,
        renderedBody: delivery.renderedBody,
      });
      handled += 1;
    } catch (err) {
      log.status = 'failed';
      log.error = err instanceof Error ? err.message : 'Reminder failed';
      await log.save();

      try {
        const interview = await InterviewModel.findById(log.interviewId);
        if (interview) {
          interview.reminderStatus = 'failed';
          await interview.save();
        }
      } catch {
        // best-effort
      }

      logger.warn({ err, reminderId: String(log._id) }, 'Interview reminder failed');
    }
  }
  return handled;
}

export async function processExpiredSchedulingLinks(limit = 50): Promise<number> {
  const now = new Date();
  const expired = await InterviewModel.find({
    status: { $in: ['link_sent', 'awaiting_booking', 'draft'] },
    linkExpiresAt: { $lte: now },
    startAt: null,
    deletedAt: null,
  }).limit(limit);

  for (const doc of expired) {
    doc.status = 'expired';
    doc.bookingStatus = 'expired';
    await doc.save();
    await scheduleRemindersForInterview(doc, { cancel: true });
  }
  return expired.length;
}
