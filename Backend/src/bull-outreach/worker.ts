import { Worker } from 'bullmq';

import { getLogger } from '../config/logger.js';
import { processBullJob } from './process-job.js';
import { OUTREACH_QUEUE_NAME } from './queue.js';
import { getBullConnection } from './redis.js';

let worker: Worker | null = null;

export function startOutreachWorker(): Worker {
  if (worker) return worker;

  const logger = getLogger().child({ component: 'bull-outreach-worker' });

  worker = new Worker(
    OUTREACH_QUEUE_NAME,
    async (bullJob) => {
      const mongoJobId = String(bullJob.data.mongoJobId || '');
      if (!mongoJobId) return;
      await processBullJob(mongoJobId);
    },
    {
      connection: getBullConnection(),
      concurrency: Number(process.env.BULL_OUTREACH_CONCURRENCY || 4),
    }
  );

  worker.on('failed', (job, error) => {
    logger.warn({ err: error, jobId: job?.id }, 'BullMQ job failed');
  });

  logger.info('BullMQ outreach worker started');
  return worker;
}

export async function stopOutreachWorker(): Promise<void> {
  if (!worker) return;
  await worker.close();
  worker = null;
}
