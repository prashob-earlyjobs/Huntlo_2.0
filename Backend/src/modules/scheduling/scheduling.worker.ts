import {
  processDueInterviewReminders,
  processExpiredSchedulingLinks,
} from './reminder.service.js';

export async function processDueSchedulingJobs(limit = 50): Promise<number> {
  const reminders = await processDueInterviewReminders(limit);
  const expired = await processExpiredSchedulingLinks(limit);
  return reminders + expired;
}
