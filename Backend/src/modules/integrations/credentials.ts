import { createHash, randomBytes } from 'node:crypto';

import {
  decryptField,
  encryptField,
  type EncryptedPayload,
} from '../../shared/encryption/cipher.js';
import { maskSecretKey, maskToken } from '../../shared/encryption/mask.js';

export function encryptSecret(value: string | null | undefined): EncryptedPayload | null {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return null;
  return encryptField(trimmed);
}

export function decryptSecret(payload: EncryptedPayload | null | undefined): string | null {
  if (!payload) return null;
  return decryptField(payload);
}

export function encryptJson(value: Record<string, unknown>): EncryptedPayload {
  return encryptField(JSON.stringify(value));
}

export function decryptJson<T extends Record<string, unknown>>(
  payload: EncryptedPayload | null | undefined
): T | null {
  if (!payload) return null;
  const raw = decryptField(payload);
  return JSON.parse(raw) as T;
}

export function maskIntegrationSecrets(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...input };
  for (const key of Object.keys(out)) {
    const lower = key.toLowerCase();
    const value = out[key];
    if (typeof value !== 'string') continue;
    if (
      lower.includes('token') ||
      lower.includes('password') ||
      lower.includes('secret') ||
      lower.includes('apikey') ||
      lower.includes('api_key')
    ) {
      out[key] = lower.includes('password') || lower.includes('secret')
        ? maskSecretKey(value)
        : maskToken(value);
    }
  }
  return out;
}

export function createOAuthStateToken(): string {
  return randomBytes(24).toString('base64url');
}

export function createPkcePair(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}
