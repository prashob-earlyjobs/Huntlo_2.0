import { randomBytes, randomUUID } from 'node:crypto';

export function generateSecureToken(byteLength = 32): string {
  return randomBytes(byteLength).toString('base64url');
}

export function generateIdempotencyKey(): string {
  return randomUUID();
}

export function generateWebhookVerifyToken(): string {
  return randomBytes(24).toString('hex');
}

export function generateOtpCode(length = 6): string {
  const max = 10 ** length;
  const value = randomBytes(4).readUInt32BE(0) % max;
  return value.toString().padStart(length, '0');
}
