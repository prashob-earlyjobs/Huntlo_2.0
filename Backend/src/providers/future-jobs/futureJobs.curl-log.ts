import { mkdir, appendFile } from 'node:fs/promises';
import path from 'node:path';

import { getEnv, isProduction, isTest } from '../../config/env.js';
import { createChildLogger } from '../../config/logger.js';

const log = () => createChildLogger({ provider: 'future-jobs', component: 'curl-log' });

const DEFAULT_RELATIVE_PATH = path.join('logs', 'future-jobs-curls.sh');

let writeChain: Promise<void> = Promise.resolve();

function shellSingleQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function headersToRecord(headers: HeadersInit | undefined): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    const out: Record<string, string> = {};
    headers.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers.map(([key, value]) => [key, String(value)]));
  }
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value == null) continue;
    out[key] = Array.isArray(value) ? value.join(', ') : String(value);
  }
  return out;
}

function bodyToString(body: BodyInit | null | undefined): string | null {
  if (body == null) return null;
  if (typeof body === 'string') return body;
  if (body instanceof URLSearchParams) return body.toString();
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(body)) {
    return body.toString('utf8');
  }
  // ReadableStream / FormData / Blob — skip raw dump
  return null;
}

export function isFutureJobsCurlLogEnabled(): boolean {
  if (isTest()) return false;
  const env = getEnv();
  if (typeof env.FUTURE_JOBS_CURL_LOG === 'boolean') {
    return env.FUTURE_JOBS_CURL_LOG;
  }
  // Default on in local/dev, off elsewhere (curls contain API keys).
  return env.APP_ENV === 'development' && !isProduction();
}

export function getFutureJobsCurlLogPath(): string {
  const configured = getEnv().FUTURE_JOBS_CURL_LOG_PATH?.trim();
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.resolve(process.cwd(), configured);
  }
  return path.resolve(process.cwd(), DEFAULT_RELATIVE_PATH);
}

export function formatFutureJobsCurl(input: {
  method: string;
  url: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
}): string {
  const method = (input.method || 'GET').toUpperCase();
  const headers = headersToRecord(input.headers);
  const parts: string[] = [`curl -sS -X ${method} ${shellSingleQuote(input.url)}`];

  for (const [key, value] of Object.entries(headers)) {
    parts.push(`  -H ${shellSingleQuote(`${key}: ${value}`)}`);
  }

  const body = bodyToString(input.body ?? null);
  if (body != null && method !== 'GET' && method !== 'HEAD') {
    parts.push(`  --data-raw ${shellSingleQuote(body)}`);
  }

  return parts.join(' \\\n');
}

/**
 * Append a runnable curl for a Future Jobs HTTP call. Fire-and-forget; never throws to callers.
 */
export function appendFutureJobsCurl(input: {
  method: string;
  url: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
  fjOperation?: string;
}): void {
  if (!isFutureJobsCurlLogEnabled()) return;

  const filePath = getFutureJobsCurlLogPath();
  const stamp = new Date().toISOString();
  const op = input.fjOperation ? ` ${input.fjOperation}` : '';
  const block = [
    `# ${stamp}${op}`,
    formatFutureJobsCurl(input),
    '',
  ].join('\n');

  writeChain = writeChain
    .then(async () => {
      await mkdir(path.dirname(filePath), { recursive: true });
      await appendFile(filePath, block, 'utf8');
    })
    .catch((err) => {
      log().warn(
        {
          err: err instanceof Error ? err.message : String(err),
          filePath,
        },
        'failed to append Future Jobs curl log'
      );
    });
}
