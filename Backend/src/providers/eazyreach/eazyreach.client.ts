import { AppError } from '../../shared/errors/app-error.js';
import {
  clearEazyreachTokenCache,
  resolveEazyreachBearerToken,
} from './eazyreach.auth.js';
import {
  getEazyreachApiKey,
  getEazyreachApiSecret,
  getEazyreachBaseUrl,
  isEazyreachConfigured,
} from './eazyreach.config.js';

export class EazyreachUpstreamError extends Error {
  constructor(
    message: string,
    readonly httpStatus: number,
    readonly code?: string | null,
    readonly body?: unknown
  ) {
    super(message);
    this.name = 'EazyreachUpstreamError';
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

function collectStrings(value: unknown, into: string[] = []): string[] {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) into.push(trimmed);
    return into;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, into);
    return into;
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of [
      'email',
      'emails',
      'workEmail',
      'work_email',
      'personalEmail',
      'phone',
      'phones',
      'mobile',
      'mobiles',
      'phoneNumber',
      'phone_number',
      'value',
      'values',
      'data',
      'result',
      'results',
    ]) {
      if (key in record) collectStrings(record[key], into);
    }
  }
  return into;
}

function uniqueNonEmpty(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

async function eazyreachRequest(
  path: string,
  body: Record<string, unknown>,
  retried = false
): Promise<unknown> {
  if (!isEazyreachConfigured()) {
    throw new AppError(
      503,
      'PROVIDER_UNAVAILABLE',
      'Easy Scout provider is not configured. Set EAZYREACH_AUTH_TOKEN or EAZYREACH_API_KEY.'
    );
  }

  const token = await resolveEazyreachBearerToken();
  const url = `${getEazyreachBaseUrl()}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
  const apiKey = getEazyreachApiKey();
  const apiSecret = getEazyreachApiSecret();
  if (apiKey) headers['x-api-key'] = apiKey;
  if (apiSecret) headers['x-api-secret'] = apiSecret;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new EazyreachUpstreamError(
      error instanceof Error ? error.message : 'EazyReach network error',
      502,
      'NETWORK_ERROR'
    );
  }

  const json: unknown = await response.json().catch(() => null);
  if ((response.status === 401 || response.status === 403) && !retried) {
    clearEazyreachTokenCache();
    return eazyreachRequest(path, body, true);
  }

  if (!response.ok) {
    const record = asRecord(json);
    const message =
      asString(record.message) ||
      asString(record.error) ||
      `EazyReach request failed (${response.status})`;
    throw new EazyreachUpstreamError(
      message,
      response.status,
      asString(record.code) || null,
      json
    );
  }

  return json;
}

export type EazyreachContactResult = {
  values: string[];
  raw: unknown;
  found: boolean;
};

/** POST /b2b/linkedin-emails — work emails by default; personal via emailType. */
export async function eazyreachLinkedinEmails(input: {
  linkedinUrl: string;
  emailType?: 'work' | 'personal';
}): Promise<EazyreachContactResult> {
  const body: Record<string, unknown> = {
    linkedinUrl: input.linkedinUrl.trim(),
  };
  if (input.emailType === 'personal') body.emailType = 'personal';
  const raw = await eazyreachRequest('/b2b/linkedin-emails', body);
  const values = uniqueNonEmpty(collectStrings(raw)).filter((v) => v.includes('@'));
  return { values, raw, found: values.length > 0 };
}

/** POST /b2b/linkedin-phones */
export async function eazyreachLinkedinPhones(input: {
  linkedinUrl: string;
}): Promise<EazyreachContactResult> {
  const raw = await eazyreachRequest('/b2b/linkedin-phones', {
    linkedinUrl: input.linkedinUrl.trim(),
  });
  const values = uniqueNonEmpty(collectStrings(raw)).filter((v) => !v.includes('@'));
  return { values, raw, found: values.length > 0 };
}

/** POST /b2b/din-emails */
export async function eazyreachDinEmails(input: {
  din: string;
}): Promise<EazyreachContactResult> {
  const raw = await eazyreachRequest('/b2b/din-emails', {
    din: input.din.trim(),
  });
  const values = uniqueNonEmpty(collectStrings(raw)).filter((v) => v.includes('@'));
  return { values, raw, found: values.length > 0 };
}

/** POST /b2b/din-phones */
export async function eazyreachDinPhones(input: {
  din: string;
}): Promise<EazyreachContactResult> {
  const raw = await eazyreachRequest('/b2b/din-phones', {
    din: input.din.trim(),
  });
  const values = uniqueNonEmpty(collectStrings(raw)).filter((v) => !v.includes('@'));
  return { values, raw, found: values.length > 0 };
}

export function extractDirectorName(raw: unknown): string {
  const record = asRecord(raw);
  const nested = asRecord(record.data);
  return (
    asString(record.name) ||
    asString(record.directorName) ||
    asString(record.director_name) ||
    asString(nested.name) ||
    asString(nested.directorName) ||
    asString(nested.director_name) ||
    ''
  );
}
