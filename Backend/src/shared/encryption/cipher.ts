import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import { getEncryptionKeyBuffer } from '../../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

export type EncryptedPayload = {
  ciphertext: string;
  iv: string;
  authTag: string;
  version: 1;
};

export function encryptField(plaintext: string): EncryptedPayload {
  const key = getEncryptionKeyBuffer();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString('base64url'),
    iv: iv.toString('base64url'),
    authTag: authTag.toString('base64url'),
    version: 1,
  };
}

export function decryptField(payload: EncryptedPayload): string {
  if (payload.version !== 1) {
    throw new Error(`Unsupported encryption version: ${payload.version}`);
  }

  const key = getEncryptionKeyBuffer();
  const iv = Buffer.from(payload.iv, 'base64url');
  const authTag = Buffer.from(payload.authTag, 'base64url');
  const ciphertext = Buffer.from(payload.ciphertext, 'base64url');

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

export function serializeEncryptedField(payload: EncryptedPayload): string {
  return JSON.stringify(payload);
}

export function deserializeEncryptedField(value: string): EncryptedPayload {
  const parsed = JSON.parse(value) as EncryptedPayload;
  if (
    typeof parsed.ciphertext !== 'string' ||
    typeof parsed.iv !== 'string' ||
    typeof parsed.authTag !== 'string'
  ) {
    throw new Error('Invalid encrypted field payload');
  }
  return parsed;
}
