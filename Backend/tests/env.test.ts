import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getEnv, resetEnvCache } from '../src/config/env.ts';

const BASE_ENV = {
  APP_ENV: 'test',
  PORT: '4001',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/huntlo-test',
  JWT_ACCESS_SECRET: 'test-access-secret-with-at-least-32-characters',
  JWT_REFRESH_SECRET: 'test-refresh-secret-with-at-least-32-characters',
  CORS_ORIGINS: 'http://localhost:3000',
  FRONTEND_URL: 'http://localhost:3000',
  ENCRYPTION_KEY: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  REALTIME_ENABLED: 'false',
  REALTIME_WS_PATH: '/realtime/v1',
  LOG_LEVEL: 'silent',
};

function restoreEnv(): void {
  Object.assign(process.env, BASE_ENV);
  resetEnvCache();
}

describe('environment validation', () => {
  beforeEach(() => {
    restoreEnv();
  });

  afterEach(() => {
    restoreEnv();
  });

  it('parses required environment variables', () => {
    const env = getEnv();

    expect(env.PORT).toBe(4001);
    expect(env.APP_ENV).toBe('test');
    expect(env.CORS_ORIGINS).toContain('http://localhost:3000');
    expect(env.ENCRYPTION_KEY).toHaveLength(64);
    expect(env.REALTIME_ENABLED).toBe(false);
  });

  it('rejects invalid encryption key', () => {
    process.env.ENCRYPTION_KEY = 'too-short';
    resetEnvCache();

    expect(() => getEnv()).toThrow(/ENCRYPTION_KEY/);
  });

  it('rejects short JWT secrets', () => {
    process.env.JWT_ACCESS_SECRET = 'short';
    resetEnvCache();

    expect(() => getEnv()).toThrow(/JWT_ACCESS_SECRET/);
  });
});
