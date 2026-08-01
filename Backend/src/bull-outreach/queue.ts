import { Queue } from 'bullmq';

import { getBullConnection } from './redis.js';

export const OUTREACH_QUEUE_NAME = 'huntlo-outreach';

let queue: Queue | null = null;

export function getOutreachQueue(): Queue {
  if (queue) return queue;
  queue = new Queue(OUTREACH_QUEUE_NAME, { connection: getBullConnection() });
  return queue;
}

export async function pushToQueue(mongoJobId: string): Promise<void> {
  // Mongo + cron owns retry policy (up to 5). BullMQ should run once per push;
  // a stable jobId would block re-queue after Redis marks the job failed.
  await getOutreachQueue().add(
    'run',
    { mongoJobId },
    {
      jobId: `${mongoJobId}-${Date.now()}`,
      removeOnComplete: 1000,
      removeOnFail: 2000,
      attempts: 1,
    }
  );
}

export async function closeOutreachQueue(): Promise<void> {
  if (!queue) return;
  await queue.close();
  queue = null;
}
