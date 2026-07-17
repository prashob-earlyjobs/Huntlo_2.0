import { connectDatabase, disconnectDatabase } from './config/database.js';
import { getLogger } from './config/logger.js';
import { getWorkerRuntimeConfig } from './workers/config.js';
import { createWorkerRunner } from './workers/runner.js';
import { registerProcessHandlers, shutdownGracefully } from './shared/process/handlers.js';

async function startWorker(): Promise<void> {
  registerProcessHandlers('huntlo-worker');

  const logger = getLogger().child({ service: 'huntlo-worker' });
  const config = getWorkerRuntimeConfig();

  logger.info(
    {
      concurrency: config.concurrency,
      pollIntervalMs: config.pollIntervalMs,
      leaseMs: config.leaseMs,
    },
    'Starting Huntlo worker process'
  );

  await connectDatabase();

  const runner = createWorkerRunner();
  await runner.start();

  logger.info(
    { workerId: runner.workerId, metrics: runner.getMetrics() },
    'Worker lease loop started'
  );

  const metricsTimer = setInterval(() => {
    logger.info({ metrics: runner.getMetrics() }, 'Worker metrics');
  }, 60_000);
  metricsTimer.unref?.();

  let shuttingDown = false;
  const shutdownSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of shutdownSignals) {
    process.on(signal, () => {
      if (shuttingDown) return;
      shuttingDown = true;
      void shutdownGracefully(
        'huntlo-worker',
        async () => {
          clearInterval(metricsTimer);
          await runner.stop();
          await disconnectDatabase();
        },
        { timeoutMs: config.shutdownTimeoutMs }
      );
    });
  }
}

startWorker().catch((error) => {
  getLogger().fatal({ err: error }, 'Failed to start worker process');
  process.exit(1);
});
