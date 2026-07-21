import { getLogger } from '../config/logger.js';
import { OutreachCampaignModel } from '../modules/outreach/campaign.model.js';
import { campaignsService } from '../modules/outreach/campaigns.service.js';
import { BullOutreachJobModel } from './job.model.js';
import { pushToQueue } from './queue.js';
import { scheduleJob } from './schedule.js';

const LIMIT = 100;

export async function runOutreachCronTick(): Promise<void> {
  const logger = getLogger().child({ component: 'bull-outreach-cron' });
  const now = new Date();

  // 1) launch campaigns that were scheduled for later
  const dueCampaigns = await OutreachCampaignModel.find({
    status: 'scheduled',
    scheduledAt: { $lte: now },
    deletedAt: null,
  }).limit(10);

  for (const campaign of dueCampaigns) {
    try {
      await campaignsService.launch(
        String(campaign.organizationId),
        String(campaign.ownerUserId),
        String(campaign._id)
      );
    } catch (error) {
      logger.warn({ err: error, campaignId: String(campaign._id) }, 'Scheduled launch failed');
      campaign.status = 'failed';
      await campaign.save();
    }
  }

  // 2) make sure a reply-check job exists every minute
  const replyBusy = await BullOutreachJobModel.exists({
    kind: 'sync_replies',
    status: { $in: ['pending', 'queued', 'running'] },
  });
  if (!replyBusy) {
    await scheduleJob({
      kind: 'sync_replies',
      runAt: now,
      details: { source: 'cron' },
    });
  }

  // 3) find anything due (send / followup / sync_replies) and push to Redis
  const due = await BullOutreachJobModel.find({
    status: 'pending',
    runAt: { $lte: now },
  })
    .sort({ runAt: 1 })
    .limit(LIMIT);

  let pushed = 0;
  for (const job of due) {
    const claimed = await BullOutreachJobModel.findOneAndUpdate(
      { _id: job._id, status: 'pending' },
      { $set: { status: 'queued' } },
      { new: true }
    );
    if (!claimed) continue;

    try {
      await pushToQueue(String(claimed._id));
      pushed += 1;
    } catch (error) {
      claimed.status = 'pending';
      claimed.lastError = error instanceof Error ? error.message : 'queue push failed';
      await claimed.save();
      logger.warn({ err: error, jobId: String(claimed._id) }, 'Failed to push job to Redis');
    }
  }

  if (pushed > 0) {
    logger.info({ pushed }, 'Pushed due outreach jobs to BullMQ');
  }
}

let timer: NodeJS.Timeout | null = null;

export function startOutreachCron(): void {
  if (timer) return;
  const logger = getLogger().child({ component: 'bull-outreach-cron' });
  void runOutreachCronTick().catch((error) => {
    logger.warn({ err: error }, 'Outreach cron tick failed');
  });
  timer = setInterval(() => {
    void runOutreachCronTick().catch((error) => {
      logger.warn({ err: error }, 'Outreach cron tick failed');
    });
  }, 60_000);
  timer.unref?.();
  logger.info('Outreach cron started (every 1 minute)');
}

export function stopOutreachCron(): void {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
}
