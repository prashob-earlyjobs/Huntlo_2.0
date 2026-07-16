import { getLogger } from '../../config/logger.js';
import { AssessmentCampaignModel } from './assessment-campaign.model.js';
import { AssessmentCandidateModel } from './assessment-candidate.model.js';
import { assessmentsService, applyAttemptUpdate, refreshCampaignStats } from './assessment.service.js';

/**
 * Worker tick: send due reminders and expire overdue attempts.
 */
export async function processDueAssessmentJobs(limit = 50): Promise<number> {
  const logger = getLogger();
  let handled = 0;
  const now = new Date();

  // Expire overdue invitations
  const expired = await AssessmentCandidateModel.find({
    invitationStatus: { $in: ['invited', 'started', 'pending'] },
    expiresAt: { $lte: now },
  }).limit(limit);

  for (const row of expired) {
    await applyAttemptUpdate(row, { status: 'expired', result: 'pending' });
    await refreshCampaignStats(String(row.campaignId));
    handled += 1;
  }

  // Due reminders
  const due = await AssessmentCandidateModel.find({
    invitationStatus: { $in: ['invited', 'started'] },
    nextReminderAt: { $lte: now },
  }).limit(limit);

  for (const row of due) {
    const campaign = await AssessmentCampaignModel.findById(row.campaignId);
    if (!campaign || campaign.status !== 'running' || !campaign.reminderConfig.enabled) {
      row.nextReminderAt = null;
      await row.save();
      continue;
    }
    if (row.reminderCount >= campaign.reminderConfig.maxReminders) {
      row.nextReminderAt = null;
      await row.save();
      continue;
    }
    try {
      await assessmentsService.sendReminder(
        String(campaign.organizationId),
        String(campaign.ownerUserId),
        campaign,
        row
      );
      handled += 1;
    } catch (err) {
      logger.warn({ err, resultId: String(row._id) }, 'Assessment reminder failed');
    }
  }

  return handled;
}
