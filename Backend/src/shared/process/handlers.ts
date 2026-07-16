import { getLogger } from '../../config/logger.js';

export function registerProcessHandlers(serviceName: string): void {
  const logger = getLogger().child({ service: serviceName });

  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled promise rejection');
  });

  process.on('uncaughtException', (error) => {
    logger.fatal({ err: error }, 'Uncaught exception');
    process.exit(1);
  });
}

export async function shutdownGracefully(
  serviceName: string,
  cleanup: () => Promise<void>,
  options?: { timeoutMs?: number }
): Promise<void> {
  const logger = getLogger().child({ service: serviceName });
  const timeoutMs = options?.timeoutMs ?? 10_000;

  logger.info('Graceful shutdown initiated');

  const forceExitTimer = setTimeout(() => {
    logger.error('Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, timeoutMs);

  forceExitTimer.unref();

  try {
    await cleanup();
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Error during graceful shutdown');
    process.exit(1);
  }
}
