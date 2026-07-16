import { createHash } from 'node:crypto';

import { normalizeLinkedinProfileUrl } from '../../providers/future-jobs/futureJobs.reveal.js';
import { maskEmail, normalizeEmail } from '../../shared/validation/email.js';
import type { PeopleScoutLookupType } from './lookup.model.js';

export type NormalizedLookupInput = {
  lookupType: PeopleScoutLookupType;
  /** Value sent to Future Jobs (email or linkedin_url). */
  providerPayload: { email: string } | { linkedin_url: string };
  /** Canonical string used for hashing / cache keys. */
  normalizedValue: string;
  maskedInput: string;
  normalizedInputHash: string;
};

export type NormalizeLookupError = {
  error: string;
  lookupType?: PeopleScoutLookupType;
  maskedInput?: string;
};

function hashNormalized(lookupType: PeopleScoutLookupType, normalizedValue: string): string {
  return createHash('sha256')
    .update(`${lookupType}:${normalizedValue}`)
    .digest('hex');
}

function maskLinkedinUrl(url: string): string {
  const match = url.match(/\/in\/([^/]+)/i);
  const slug = match?.[1] ?? '';
  if (!slug) return 'linkedin.com/in/••••';
  const visible = slug.length <= 3 ? slug[0] ?? '•' : slug.slice(0, 3);
  return `linkedin.com/in/${visible}••••`;
}

function maskUsername(username: string): string {
  const visible = username.length <= 2 ? username[0] ?? '•' : username.slice(0, 2);
  return `${visible}••••`;
}

/**
 * Validate + normalize People Scout lookup input.
 * Future Jobs accepts only `{ email }` or `{ linkedin_url }` — usernames become LinkedIn URLs.
 */
export function normalizeLookupInput(input: {
  type?: string;
  input?: string;
  email?: string;
  linkedin_url?: string;
  linkedinUrl?: string;
  query?: string;
}): NormalizedLookupInput | NormalizeLookupError {
  const rawType = String(input.type ?? '').trim().toLowerCase();
  const rawInput = String(
    input.input ?? input.query ?? input.email ?? input.linkedin_url ?? input.linkedinUrl ?? ''
  ).trim();

  if (!rawInput && !rawType) {
    return { error: 'Provide a lookup input' };
  }

  const mappedType = mapUiLookupType(rawType, rawInput);
  if ('error' in mappedType) return mappedType;

  const { lookupType, value } = mappedType;

  if (lookupType === 'email') {
    try {
      const email = normalizeEmail(value);
      return {
        lookupType: 'email',
        providerPayload: { email },
        normalizedValue: email,
        maskedInput: maskEmail(email),
        normalizedInputHash: hashNormalized('email', email),
      };
    } catch {
      return {
        error: 'Invalid email format',
        lookupType: 'email',
        maskedInput: value.includes('@') ? maskEmailLoose(value) : '••••@••••',
      };
    }
  }

  if (lookupType === 'linkedin_username') {
    const username = value.replace(/^@/, '').trim();
    if (!/^[\w.-]+$/.test(username)) {
      return {
        error: 'Usernames can only contain letters, numbers, dots and hyphens',
        lookupType: 'linkedin_username',
        maskedInput: maskUsername(username || value),
      };
    }
    const linkedinUrl = `https://www.linkedin.com/in/${username}`;
    const normalized = normalizeLinkedinProfileUrl(linkedinUrl) || linkedinUrl;
    return {
      lookupType: 'linkedin_username',
      providerPayload: { linkedin_url: normalized },
      normalizedValue: normalized.toLowerCase(),
      maskedInput: maskUsername(username),
      // Hash by username type so URL vs username lookups stay distinct in history,
      // while provider still receives a LinkedIn URL.
      normalizedInputHash: hashNormalized('linkedin_username', username.toLowerCase()),
    };
  }

  // linkedin_url
  const lower = value.toLowerCase();
  if (!lower.includes('linkedin.com') && !lower.includes('lnkd.in')) {
    return {
      error: 'That does not look like a LinkedIn profile URL',
      lookupType: 'linkedin_url',
      maskedInput: maskLinkedinUrl(value),
    };
  }
  const normalized = normalizeLinkedinProfileUrl(value);
  if (!normalized || !/\/in\//i.test(normalized)) {
    return {
      error: 'Expected a LinkedIn profile URL like linkedin.com/in/candidate-name',
      lookupType: 'linkedin_url',
      maskedInput: maskLinkedinUrl(value),
    };
  }
  return {
    lookupType: 'linkedin_url',
    providerPayload: { linkedin_url: normalized },
    normalizedValue: normalized.toLowerCase(),
    maskedInput: maskLinkedinUrl(normalized),
    normalizedInputHash: hashNormalized('linkedin_url', normalized.toLowerCase()),
  };
}

function mapUiLookupType(
  rawType: string,
  rawInput: string
): { lookupType: PeopleScoutLookupType; value: string } | NormalizeLookupError {
  const aliases: Record<string, PeopleScoutLookupType> = {
    email: 'email',
    'email address': 'email',
    'email-address': 'email',
    linkedin_url: 'linkedin_url',
    'linkedin-url': 'linkedin_url',
    'linkedin url': 'linkedin_url',
    linkedin_username: 'linkedin_username',
    'linkedin-username': 'linkedin_username',
    'linkedin username': 'linkedin_username',
  };

  if (rawType && aliases[rawType]) {
    return { lookupType: aliases[rawType]!, value: rawInput };
  }

  // Auto-detect when type omitted (EJ `query` behaviour).
  const lower = rawInput.toLowerCase();
  if (lower.includes('linkedin.com') || lower.includes('lnkd.in')) {
    return { lookupType: 'linkedin_url', value: rawInput };
  }
  if (rawInput.includes('@')) {
    return { lookupType: 'email', value: rawInput };
  }
  if (/^[\w.-]+$/.test(rawInput)) {
    return { lookupType: 'linkedin_username', value: rawInput };
  }
  if (!rawInput) {
    return { error: 'Provide a lookup input' };
  }
  return { error: 'Enter a valid email, LinkedIn URL, or LinkedIn username' };
}

function maskEmailLoose(value: string): string {
  try {
    return maskEmail(value);
  } catch {
    const [local, domain] = value.toLowerCase().split('@');
    if (!local || !domain) return '••••@••••';
    return `${local.slice(0, 1)}•••@${domain}`;
  }
}
