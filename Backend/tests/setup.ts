import { beforeEach } from 'vitest';

import { resetEnvCache } from '../src/config/env.ts';
import { resetLogger } from '../src/config/logger.ts';

process.env.APP_ENV = 'test';
process.env.PORT = '4001';
process.env.MONGODB_URI =
  process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/huntlo-test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-with-at-least-32-characters';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-with-at-least-32-characters';
process.env.CORS_ORIGINS = 'http://localhost:3000';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.ENCRYPTION_KEY =
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.REALTIME_ENABLED = 'false';
process.env.REALTIME_WS_PATH = '/realtime/v1';
process.env.LOG_LEVEL = 'silent';

beforeEach(() => {
  resetEnvCache();
  resetLogger();
});
