import { createHash } from 'node:crypto';

import { normalizeLinkedinProfileUrl } from '../../providers/future-jobs/futureJobs.reveal.js';
import type { EasyScoutLookupType } from './lookup.model.js';

export type NormalizedEasyScoutInput = {
  lookupType: EasyScoutLookupType;
  /** LinkedIn URL for EazyReach LinkedIn endpoints, or DIN string. */
  linkedinUrl: string | null;
  din: string | null;
  normalizedValue: string;
  maskedInput: string;
  normalizedInputHash: string;
  displayNameHint: string;
};

export type NormalizeEasyScoutError = {
  error: string;
  lookupType?: EasyScoutLookupType;
  maskedInput?: string;
};

function hashNormalized(lookupType: EasyScoutLookupType, normalizedValue: string): string {
  return createHash('sha256')
    .update(`easy-scout:${lookupType}:${normalizedValue}`)
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

function maskDin(din: string): string {
  if (din.length <= 4) return '••••';
  return `${din.slice(0, 2)}••••${din.slice(-2)}`;
}

function usernameFromUrl(url: string): string {
  const match = url.match(/\/in\/([^/?#]+)/i);
  return match?.[1] ? decodeURIComponent(match[1]) : '';
}

/**
 * Easy Scout accepts LinkedIn URL / username (EazyReach LinkedIn endpoints)
 * or an Indian DIN (MCA director lookups).
 */
export function normalizeEasyScoutInput(input: {
  type?: string;
  input?: string;
  query?: string;
  linkedin_url?: string;
  linkedinUrl?: string;
  din?: string;
}): NormalizedEasyScoutInput | NormalizeEasyScoutError {
  const rawType = String(input.type ?? '').trim().toLowerCase();
  const rawInput = String(
    input.input ?? input.query ?? input.linkedin_url ?? input.linkedinUrl ?? input.din ?? ''
  ).trim();

  if (!rawInput) {
    return { error: 'Provide a LinkedIn URL, username, or DIN' };
  }

  const mapped = mapType(rawType, rawInput);
  if ('error' in mapped) return mapped;

  if (mapped.lookupType === 'din') {
    const din = mapped.value.replace(/\s+/g, '').toUpperCase();
    if (!/^\d{6,12}$/.test(din)) {
      return {
        error: 'DIN should be a 6–12 digit Indian Director Identification Number',
        lookupType: 'din',
        maskedInput: maskDin(din || mapped.value),
      };
    }
    return {
      lookupType: 'din',
      linkedinUrl: null,
      din,
      normalizedValue: din,
      maskedInput: maskDin(din),
      normalizedInputHash: hashNormalized('din', din),
      displayNameHint: `Director ${din}`,
    };
  }

  if (mapped.lookupType === 'linkedin_username') {
    const username = mapped.value.replace(/^@/, '').trim();
    if (!/^[\w.-]+$/.test(username)) {
      return {
        error: 'Usernames can only contain letters, numbers, dots and hyphens',
        lookupType: 'linkedin_username',
        maskedInput: maskUsername(username || mapped.value),
      };
    }
    const linkedinUrl =
      normalizeLinkedinProfileUrl(`https://www.linkedin.com/in/${username}`) ||
      `https://www.linkedin.com/in/${username}`;
    return {
      lookupType: 'linkedin_username',
      linkedinUrl,
      din: null,
      normalizedValue: linkedinUrl.toLowerCase(),
      maskedInput: maskUsername(username),
      normalizedInputHash: hashNormalized('linkedin_username', username.toLowerCase()),
      displayNameHint: username.replace(/[-_]/g, ' '),
    };
  }

  const lower = mapped.value.toLowerCase();
  if (!lower.includes('linkedin.com') && !lower.includes('lnkd.in')) {
    return {
      error: 'That does not look like a LinkedIn profile URL',
      lookupType: 'linkedin_url',
      maskedInput: maskLinkedinUrl(mapped.value),
    };
  }
  const normalized = normalizeLinkedinProfileUrl(mapped.value);
  if (!normalized || !/\/in\//i.test(normalized)) {
    return {
      error: 'Expected a LinkedIn profile URL like linkedin.com/in/candidate-name',
      lookupType: 'linkedin_url',
      maskedInput: maskLinkedinUrl(mapped.value),
    };
  }
  const username = usernameFromUrl(normalized);
  return {
    lookupType: 'linkedin_url',
    linkedinUrl: normalized,
    din: null,
    normalizedValue: normalized.toLowerCase(),
    maskedInput: maskLinkedinUrl(normalized),
    normalizedInputHash: hashNormalized('linkedin_url', normalized.toLowerCase()),
    displayNameHint: username.replace(/[-_]/g, ' ') || 'Candidate',
  };
}

function mapType(
  rawType: string,
  rawInput: string
): { lookupType: EasyScoutLookupType; value: string } | NormalizeEasyScoutError {
  const aliases: Record<string, EasyScoutLookupType> = {
    din: 'din',
    'director identification number': 'din',
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

  const lower = rawInput.toLowerCase();
  if (lower.includes('linkedin.com') || lower.includes('lnkd.in')) {
    return { lookupType: 'linkedin_url', value: rawInput };
  }
  if (/^\d{6,12}$/.test(rawInput.replace(/\s+/g, ''))) {
    return { lookupType: 'din', value: rawInput };
  }
  if (/^[\w.-]+$/.test(rawInput)) {
    return { lookupType: 'linkedin_username', value: rawInput };
  }
  return { error: 'Enter a LinkedIn URL, LinkedIn username, or DIN' };
}
