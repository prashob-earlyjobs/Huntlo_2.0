import { createServer } from 'node:http';

import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { getEnv } from './config/env.js';
import { getLogger } from './config/logger.js';
import { attachWebSocketServer } from './realtime/server.js';
import { stopRealtimeRedisBridge } from './realtime/redis-bridge.js';
import { registerProcessHandlers, shutdownGracefully } from './shared/process/handlers.js';

async function startServer(): Promise<void> {
  registerProcessHandlers('huntlo-api');

  const logger = getLogger();
  const env = getEnv();

  await connectDatabase();

  const app = createApp();
  const httpServer = createServer(app);
  const realtime = attachWebSocketServer(httpServer);

  await new Promise<void>((resolve) => {
    httpServer.listen(env.PORT, () => {
      logger.info({ port: env.PORT, env: env.APP_ENV }, 'Huntlo API server listening');
      resolve();
    });
  });

  const shutdownSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of shutdownSignals) {
    process.on(signal, () => {
      void shutdownGracefully('huntlo-api', async () => {
        await new Promise<void>((resolve, reject) => {
          httpServer.close((error) => {
            if (error) reject(error);
            else resolve();
          });
        });

        if (realtime) {
          await realtime.close();
        }

        await stopRealtimeRedisBridge();
        await disconnectDatabase();
      });
    });
  }
}

startServer().catch((error) => {
  getLogger().fatal({ err: error }, 'Failed to start API server');
  process.exit(1);
});
