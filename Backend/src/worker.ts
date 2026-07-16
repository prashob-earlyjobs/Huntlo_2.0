import { connectDatabase, disconnectDatabase } from './config/database.js';
import { getLogger } from './config/logger.js';
import {
  processQueuedBulkRevealJobs,
  processQueuedImportJobs,
} from './modules/candidates/index.js';
import { pollSourcingSessions } from './modules/sourcing/index.js';
import { registerProcessHandlers, shutdownGracefully } from './shared/process/handlers.js';

const POLL_INTERVAL_MS = 5_000;
let pollTimer: NodeJS.Timeout | null = null;
let isPolling = false;

async function pollJobs(): Promise<void> {
  if (!isPolling) return;
  await pollSourcingSessions();
  await processQueuedBulkRevealJobs();
  await processQueuedImportJobs();
}

async function startWorker(): Promise<void> {
  registerProcessHandlers('huntlo-worker');

  const logger = getLogger();
  logger.info('Starting Huntlo worker process');

  await connectDatabase();

  isPolling = true;
  pollTimer = setInterval(() => {
    void pollJobs().catch((error) => {
      logger.error({ err: error }, 'Worker poll failed');
    });
  }, POLL_INTERVAL_MS);

  logger.info({ pollIntervalMs: POLL_INTERVAL_MS }, 'Worker poll loop started');

  const shutdownSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of shutdownSignals) {
    process.on(signal, () => {
      void shutdownGracefully('huntlo-worker', async () => {
        isPolling = false;
        if (pollTimer) {
          clearInterval(pollTimer);
          pollTimer = null;
        }
        await disconnectDatabase();
      });
    });
  }
}

startWorker().catch((error) => {
  getLogger().fatal({ err: error }, 'Failed to start worker process');
  process.exit(1);
});
