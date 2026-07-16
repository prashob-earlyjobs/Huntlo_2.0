import { z } from 'zod';

const idempotencyKeySchema = z
  .string()
  .trim()
  .min(8, 'Idempotency-Key must be at least 8 characters')
  .max(128, 'Idempotency-Key must be at most 128 characters')
  .regex(
    /^[A-Za-z0-9._-]+$/,
    'Idempotency-Key may only contain letters, numbers, dots, underscores, and hyphens'
  );

export function parseIdempotencyKey(headerValue: string | undefined): string | undefined {
  if (!headerValue) return undefined;
  return idempotencyKeySchema.parse(headerValue);
}

export function requireIdempotencyKey(headerValue: string | undefined): string {
  const key = parseIdempotencyKey(headerValue);
  if (!key) {
    throw new Error('Idempotency-Key header is required');
  }
  return key;
}

export function buildIdempotencyCacheKey(scope: string, key: string): string {
  return `${scope}:${key}`;
}
