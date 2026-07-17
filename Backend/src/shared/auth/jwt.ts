import { randomUUID } from 'node:crypto';

import jwt, { type SignOptions } from 'jsonwebtoken';

import { getEnv } from '../../config/env.js';
import { AppError } from '../errors/app-error.js';

export type AccessTokenPayload = {
  sub: string;
  orgId: string;
  role: string;
  sessionId: string;
  type: 'access';
};

export type RealtimeTicketPayload = {
  sub: string;
  orgId: string;
  role: string;
  sessionId: string;
  type: 'realtime';
  jti: string;
};

const REALTIME_TICKET_TTL = '60s';

export function signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  const env = getEnv();
  return jwt.sign({ ...payload, type: 'access' }, env.JWT_ACCESS_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, getEnv().JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
    }) as AccessTokenPayload;
    if (decoded.type !== 'access') {
      throw AppError.unauthorized('Invalid access token type');
    }
    if (!decoded.sub || !decoded.orgId || !decoded.sessionId) {
      throw AppError.unauthorized('Malformed access token');
    }
    return decoded;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.unauthorized('Invalid or expired access token');
  }
}

/** Short-lived ticket for WebSocket auth — avoid putting access JWTs in URLs. */
export function signRealtimeTicket(
  payload: Omit<RealtimeTicketPayload, 'type' | 'jti'>,
  expiresIn: SignOptions['expiresIn'] = REALTIME_TICKET_TTL
): { token: string; expiresAt: Date; jti: string } {
  const env = getEnv();
  const jti = randomUUID();
  const token = jwt.sign(
    { ...payload, type: 'realtime', jti },
    env.JWT_ACCESS_SECRET,
    { algorithm: 'HS256', expiresIn }
  );
  const decoded = jwt.decode(token) as { exp?: number } | null;
  const expiresAt = decoded?.exp
    ? new Date(decoded.exp * 1000)
    : new Date(Date.now() + 60_000);
  return { token, expiresAt, jti };
}

export function verifyRealtimeTicket(token: string): RealtimeTicketPayload {
  try {
    const decoded = jwt.verify(token, getEnv().JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
    }) as RealtimeTicketPayload;
    if (decoded.type !== 'realtime') {
      throw AppError.unauthorized('Invalid realtime ticket type');
    }
    if (!decoded.sub || !decoded.orgId || !decoded.jti) {
      throw AppError.unauthorized('Malformed realtime ticket');
    }
    return decoded;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.unauthorized('Invalid or expired realtime ticket');
  }
}

export function parseDurationMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const amount = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's':
      return amount * 1000;
    case 'm':
      return amount * 60 * 1000;
    case 'h':
      return amount * 60 * 60 * 1000;
    case 'd':
      return amount * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}
