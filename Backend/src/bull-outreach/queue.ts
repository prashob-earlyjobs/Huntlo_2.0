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
  await getOutreachQueue().add(
    'run',
    { mongoJobId },
    {
      jobId: mongoJobId,
      removeOnComplete: 1000,
      removeOnFail: 2000,
      attempts: 3,
      backoff: { type: 'fixed', delay: 30_000 },
    }
  );
}

export async function closeOutreachQueue(): Promise<void> {
  if (!queue) return;
  await queue.close();
  queue = null;
}
