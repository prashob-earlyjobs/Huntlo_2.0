import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

const booleanFromEnv = z
  .union([z.boolean(), z.string()])
  .transform((value) => {
    if (typeof value === 'boolean') return value;
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  });

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  APP_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  CORS_ORIGINS: z
    .string()
    .min(1)
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    ),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
  ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, 'ENCRYPTION_KEY must be a 64-character hex string (32 bytes)'),
  REALTIME_ENABLED: booleanFromEnv.default(false),
  REALTIME_WS_PATH: z.string().min(1).default('/realtime/v1'),

  // Worker process
  WORKER_CONCURRENCY: z.coerce.number().int().min(1).max(64).default(4),
  WORKER_POLL_INTERVAL_MS: z.coerce.number().int().min(250).default(2_000),
  WORKER_LEASE_MS: z.coerce.number().int().min(5_000).default(60_000),
  WORKER_HEARTBEAT_MS: z.coerce.number().int().min(1_000).default(15_000),
  WORKER_SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(1_000).default(20_000),
  WORKER_SWEEP_INTERVAL_MS: z.coerce.number().int().min(5_000).default(30_000),

  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  REFRESH_COOKIE_NAME: z.string().default('huntlo_refresh_token'),
  COOKIE_DOMAIN: z.string().optional(),
  AUTH_MAX_LOGIN_ATTEMPTS: z.coerce.number().int().min(3).default(5),
  AUTH_LOCKOUT_MINUTES: z.coerce.number().int().min(1).default(15),

  // Platform admin console — comma-separated emails granted platformAdmin access
  PLATFORM_ADMIN_EMAILS: z
    .string()
    .optional()
    .transform((value) =>
      (value ?? '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
    ),

  // Future Jobs (candidate sourcing)
  FUTURE_JOBS_API_URL: z
    .string()
    .default('https://prod.api.futurejobs.ai/api/v1')
    .transform((value) => value.replace(/\/$/, '')),
  FUTURE_JOBS_API_KEY: z.string().default(''),
  FUTURE_JOBS_AUTH_STYLE: z
    .enum(['bearer', 'x-api-key', 'x-fj-api-key'])
    .default('x-fj-api-key'),
  FUTURE_JOBS_USE_MOCK: booleanFromEnv.optional(),
  FUTURE_JOBS_TIMEOUT_MS: z.coerce.number().int().min(1000).default(30000),
  FUTURE_JOBS_MAX_RETRIES: z.coerce.number().int().min(0).default(2),
  FUTURE_JOBS_CIRCUIT_FAILURE_THRESHOLD: z.coerce.number().int().min(1).default(5),
  FUTURE_JOBS_CIRCUIT_RESET_MS: z.coerce.number().int().min(1000).default(60000),

  // Optional Gemini enhancement for sourcing interpret (no-op when empty)
  GEMINI_API_KEY: z.string().default(''),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

/** Reset cached env — for tests only. */
export function resetEnvCache(): void {
  cachedEnv = null;
}

export function getEncryptionKeyBuffer(): Buffer {
  return Buffer.from(getEnv().ENCRYPTION_KEY, 'hex');
}

export function isProduction(): boolean {
  return getEnv().APP_ENV === 'production';
}

export function isTest(): boolean {
  return getEnv().APP_ENV === 'test';
}
