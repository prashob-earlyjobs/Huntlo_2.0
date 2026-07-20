import {
  ReminderLogModel,
  ReminderSettingsModel,
  type ReminderLogDocument,
} from './reminder.model.js';
import type { InterviewDocument } from './interview.model.js';
import { InterviewModel } from './interview.model.js';
import { CandidateActivityModel } from '../candidates/candidate-activity.model.js';
import { emitRealtime } from '../../realtime/events.js';
import { getLogger } from '../../config/logger.js';

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
          },
          $setOnInsert: {
            interviewId: interview._id,
            channel,
            timingHours: hours,
          },
        },
        { upsert: true }
      );
    }
  }
}

export async function sendInterviewReminderNow(
  interview: InterviewDocument,
  channel: 'email' | 'whatsapp'
) {
  // Mirror delivery as activity — same pattern as outreach invite stubs.
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
          startAt: interview.startAt?.toISOString() ?? null,
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

  if (channel === 'email') {
    if (interview.reminderStatus === '2h_sent') interview.reminderStatus = 'both_sent';
    else if (interview.reminderStatus === 'not_sent' || interview.reminderStatus === 'scheduled') {
      interview.reminderStatus = '24h_sent';
    }
  }
  await interview.save();
}

async function markLogSent(log: ReminderLogDocument) {
  log.status = 'sent';
  log.sentAt = new Date();
  await log.save();

  const interview = await InterviewModel.findById(log.interviewId);
  if (!interview) return;

  if (log.timingHours >= 12) {
    interview.reminderStatus =
      interview.reminderStatus === '2h_sent' ? 'both_sent' : '24h_sent';
  } else {
    interview.reminderStatus =
      interview.reminderStatus === '24h_sent' ? 'both_sent' : '2h_sent';
  }
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
      await markLogSent(log);
      handled += 1;
    } catch (err) {
      log.status = 'failed';
      log.error = err instanceof Error ? err.message : 'Reminder failed';
      await log.save();
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
