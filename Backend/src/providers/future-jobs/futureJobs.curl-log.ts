import { mkdir, appendFile } from 'node:fs/promises';
import path from 'node:path';

import { getEnv, isProduction, isTest } from '../../config/env.js';
import { createChildLogger } from '../../config/logger.js';

const log = () => createChildLogger({ provider: 'future-jobs', component: 'curl-log' });

const DEFAULT_RELATIVE_PATH = path.join('logs', 'future-jobs-curls.sh');
const MAX_RESPONSE_CHARS = 80_000;

let writeChain: Promise<void> = Promise.resolve();

function shellSingleQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

type CurlHeaders = NonNullable<RequestInit['headers']>;
type CurlBody = NonNullable<RequestInit['body']>;

function headersToRecord(headers: CurlHeaders | undefined): Record<string, string> {
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

function bodyToString(body: CurlBody | null | undefined): string | null {
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
  headers?: CurlHeaders;
  body?: CurlBody | null;
  /** When true, replace Authorization / api-key header values. */
  redactAuth?: boolean;
}): string {
  const method = (input.method || 'GET').toUpperCase();
  const headers = headersToRecord(input.headers);
  const parts: string[] = [`curl -sS -X ${method} ${shellSingleQuote(input.url)}`];

  for (const [key, value] of Object.entries(headers)) {
    const lower = key.toLowerCase();
    const safeValue =
      input.redactAuth &&
      (lower === 'authorization' ||
        lower === 'x-api-key' ||
        lower === 'api-key' ||
        lower.includes('secret'))
        ? '[REDACTED]'
        : value;
    parts.push(`  -H ${shellSingleQuote(`${key}: ${safeValue}`)}`);
  }

  const body = bodyToString(input.body ?? null);
  if (body != null && method !== 'GET' && method !== 'HEAD') {
    parts.push(`  --data-raw ${shellSingleQuote(body)}`);
  }

  return parts.join(' \\\n');
}

function truncateForTerminal(value: string, max = MAX_RESPONSE_CHARS): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}\n…[truncated ${value.length - max} more chars]`;
}

function responseToLogString(data: unknown): string {
  if (typeof data === 'string') return truncateForTerminal(data);
  try {
    return truncateForTerminal(JSON.stringify(data, null, 2));
  } catch {
    return truncateForTerminal(String(data));
  }
}

/**
 * Append a runnable curl for a Future Jobs HTTP call and print it to the terminal.
 * Fire-and-forget; never throws to callers.
 */
export function appendFutureJobsCurl(input: {
  method: string;
  url: string;
  headers?: CurlHeaders;
  body?: CurlBody | null;
  fjOperation?: string;
}): void {
  if (!isFutureJobsCurlLogEnabled()) return;

  const filePath = getFutureJobsCurlLogPath();
  const stamp = new Date().toISOString();
  const op = input.fjOperation ? ` ${input.fjOperation}` : '';
  const curlForFile = formatFutureJobsCurl(input);
  const curlForTerminal = formatFutureJobsCurl({ ...input, redactAuth: true });

  log().info(
    {
      fjOperation: input.fjOperation,
      method: (input.method || 'GET').toUpperCase(),
      url: input.url,
      curl: curlForTerminal,
    },
    `FJ curl →${op}`
  );

  const block = [`# ${stamp}${op}`, curlForFile, ''].join('\n');

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

/**
 * Print Future Jobs HTTP response body to the terminal (and the curl log file).
 */
export function logFutureJobsCurlResponse(input: {
  fjOperation?: string;
  method: string;
  url: string;
  status: number;
  statusText?: string;
  elapsedMs?: number;
  response: unknown;
}): void {
  if (!isFutureJobsCurlLogEnabled()) return;

  const op = input.fjOperation ? ` ${input.fjOperation}` : '';
  const responseText = responseToLogString(input.response);

  log().info(
    {
      fjOperation: input.fjOperation,
      method: (input.method || 'GET').toUpperCase(),
      url: input.url,
      status: input.status,
      statusText: input.statusText,
      elapsedMs: input.elapsedMs,
      response: responseText,
    },
    `FJ response ←${op}`
  );

  const filePath = getFutureJobsCurlLogPath();
  const stamp = new Date().toISOString();
  const block = [
    `# ${stamp}${op} response HTTP ${input.status}${
      input.elapsedMs != null ? ` ${input.elapsedMs}ms` : ''
    }`,
    responseText,
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
        'failed to append Future Jobs response log'
      );
    });
}
