import { startOutreachCron, stopOutreachCron } from './cron.js';
import { closeOutreachQueue } from './queue.js';
import { startOutreachWorker, stopOutreachWorker } from './worker.js';

export async function startBullOutreach(): Promise<void> {
  startOutreachWorker();
  startOutreachCron();
}

export async function stopBullOutreach(): Promise<void> {
  stopOutreachCron();
  await stopOutreachWorker();
  await closeOutreachQueue();
}
