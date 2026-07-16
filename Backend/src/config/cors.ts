import type { CorsOptions } from 'cors';

import { getEnv } from './env.js';

export function getCorsOptions(): CorsOptions {
  const { CORS_ORIGINS, FRONTEND_URL } = getEnv();
  const allowedOrigins = new Set([...CORS_ORIGINS, FRONTEND_URL]);

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-Id',
      'X-Workspace-Id',
      'Idempotency-Key',
    ],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 86400,
  };
}
