import { createChildLogger } from '../../config/logger.js';

/**
 * Time an external provider call and emit structured JSON logs.
 * Never pass secrets, tokens, or full PII in `meta`.
 */
export async function withProviderTiming<T>(
  options: {
    provider: string;
    operation: string;
    requestId?: string;
    organizationId?: string;
    userId?: string;
    meta?: Record<string, unknown>;
  },
  fn: () => Promise<T>
): Promise<T> {
  const log = createChildLogger({
    component: 'provider',
    provider: options.provider,
    operation: options.operation,
    requestId: options.requestId,
    organizationId: options.organizationId,
    userId: options.userId,
  });
  const started = Date.now();
  try {
    const result = await fn();
    const durationMs = Date.now() - started;
    const payload = { durationMs, ...(options.meta || {}) };
    if (durationMs >= 2000) {
      log.warn(payload, 'Slow provider call');
    } else {
      log.info(payload, 'Provider call completed');
    }
    return result;
  } catch (error) {
    log.error(
      {
        durationMs: Date.now() - started,
        errorClass: error instanceof Error ? error.name : 'UnknownError',
        ...(options.meta || {}),
      },
      'Provider call failed'
    );
    throw error;
  }
}
