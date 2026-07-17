import pino from 'pino';

import { getEnv, isProduction } from './env.js';

let loggerInstance: pino.Logger | null = null;

const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'password',
  'currentPassword',
  'newPassword',
  'smtpPassword',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'clientSecret',
  'encryptionKey',
  'ENCRYPTION_KEY',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'bodyText',
  'bodyHtml',
  'messageBody',
  'rawBody',
  'email',
  'phone',
  'mobile',
  'inviteeEmail',
  '*.password',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  '*.apiKey',
  '*.secret',
  '*.email',
  '*.phone',
  '*.mobile',
  '*.bodyText',
  '*.bodyHtml',
];

export function getLogger(): pino.Logger {
  if (loggerInstance) return loggerInstance;

  const env = getEnv();
  loggerInstance = pino({
    level: env.LOG_LEVEL,
    redact: {
      paths: REDACT_PATHS,
      censor: '[REDACTED]',
    },
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
      env: env.APP_ENV,
      service: 'huntlo-api',
    },
  });

  if (isProduction()) {
    loggerInstance = loggerInstance.child({ pid: process.pid });
  }

  return loggerInstance;
}

export function createChildLogger(bindings: Record<string, unknown>): pino.Logger {
  return getLogger().child(bindings);
}

export function resetLogger(): void {
  loggerInstance = null;
}
