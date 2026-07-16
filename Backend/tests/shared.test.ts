import { describe, expect, it } from 'vitest';

import {
  decryptField,
  encryptField,
  serializeEncryptedField,
} from '../src/shared/encryption/cipher.ts';
import { maskSecretKey, maskToken } from '../src/shared/encryption/mask.ts';
import { buildIdempotencyCacheKey, parseIdempotencyKey } from '../src/shared/idempotency/key.ts';
import { paginateArray } from '../src/shared/pagination/paginate.ts';
import { generateSecureToken } from '../src/shared/tokens/random.ts';
import { normalizeEmail } from '../src/shared/validation/email.ts';
import { isValidObjectId, parseObjectId } from '../src/shared/validation/object-id.ts';
import { normalizePhone } from '../src/shared/validation/phone.ts';

describe('shared utilities', () => {
  it('normalizes email addresses', () => {
    expect(normalizeEmail('  User@Example.COM ')).toBe('user@example.com');
  });

  it('normalizes Indian phone numbers', () => {
    expect(normalizePhone('9876543210')).toBe('+919876543210');
    expect(normalizePhone('+919876543210')).toBe('+919876543210');
    expect(normalizePhone('09876543210')).toBe('+919876543210');
  });

  it('validates and parses object ids', () => {
    const id = '507f1f77bcf86cd799439011';
    expect(isValidObjectId(id)).toBe(true);
    expect(parseObjectId(id).toHexString()).toBe(id);
  });

  it('encrypts and decrypts field values', () => {
    const encrypted = encryptField('super-secret-token');
    const decrypted = decryptField(encrypted);
    expect(decrypted).toBe('super-secret-token');

    const serialized = serializeEncryptedField(encrypted);
    expect(serialized).toContain('ciphertext');
  });

  it('masks sensitive values', () => {
    expect(maskToken('abcdefghijklmnop')).toMatch(/••••/);
    expect(maskSecretKey('hnr_tok_live_abcdefgh')).toMatch(/^hnr/);
  });

  it('paginates arrays', () => {
    const result = paginateArray([1, 2, 3, 4, 5], 2, 2);
    expect(result.items).toEqual([3, 4]);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(3);
  });

  it('parses idempotency keys', () => {
    const key = parseIdempotencyKey(' 550e8400-e29b-41d4-a716-446655440000 ');
    expect(key).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(buildIdempotencyCacheKey('reveal', key!)).toBe(
      'reveal:550e8400-e29b-41d4-a716-446655440000'
    );
  });

  it('generates secure tokens', () => {
    const token = generateSecureToken();
    expect(token.length).toBeGreaterThan(20);
  });
});
