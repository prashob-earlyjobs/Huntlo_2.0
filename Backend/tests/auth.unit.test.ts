import { describe, expect, it } from 'vitest';

import {
  buildOrganizationInitials,
  generateOpaqueToken,
  hashIp,
  hashToken,
  verifyPassword,
} from '../src/shared/auth/crypto.js';
import { parseDurationMs, signAccessToken, verifyAccessToken } from '../src/shared/auth/jwt.js';

describe('Auth crypto utilities', () => {
  it('hashes tokens deterministically', () => {
    const token = 'sample-refresh-token';
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toBe(token);
  });

  it('generates unique opaque tokens', () => {
    const a = generateOpaqueToken();
    const b = generateOpaqueToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(20);
  });

  it('hashes IP addresses without exposing raw IP', () => {
    const hashed = hashIp('127.0.0.1');
    expect(hashed).not.toContain('127');
    expect(hashed.length).toBe(64);
  });

  it('builds organization initials', () => {
    expect(buildOrganizationInitials('Huntlo Talent')).toBe('HT');
    expect(buildOrganizationInitials('Acme')).toBe('AC');
  });

  it('verifies bcrypt password hashes', async () => {
    const { hashPassword } = await import('../src/shared/auth/crypto.js');
    const hash = await hashPassword('Password123!');
    expect(await verifyPassword('Password123!', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});

describe('JWT utilities', () => {
  it('signs and verifies access tokens', () => {
    const token = signAccessToken({
      sub: 'user-1',
      orgId: 'org-1',
      role: 'owner',
      sessionId: 'session-1',
    });

    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.orgId).toBe('org-1');
    expect(payload.type).toBe('access');
  });

  it('parses duration strings', () => {
    expect(parseDurationMs('15m')).toBe(15 * 60 * 1000);
    expect(parseDurationMs('7d')).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
