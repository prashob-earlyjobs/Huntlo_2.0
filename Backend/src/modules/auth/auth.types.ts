import type { Request } from 'express';

import type { AccessTokenPayload } from '../../shared/auth/jwt.js';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AccessTokenPayload;
    userId?: string;
    organizationId?: string;
  }
}

export type RequestContext = {
  userId: string;
  organizationId: string;
  role: string;
  sessionId: string;
};

export function getRequestContext(req: Request): RequestContext {
  if (!req.auth) {
    throw new Error('Missing auth context');
  }
  return {
    userId: req.auth.sub,
    organizationId: req.auth.orgId,
    role: req.auth.role,
    sessionId: req.auth.sessionId,
  };
}

export { rolePermissions } from '../organizations/permissions.js';

export function parseUserAgent(userAgent: string | undefined): { device: string; browser: string } {
  const ua = userAgent ?? 'Unknown';
  const browser = /Chrome/i.test(ua)
    ? 'Chrome'
    : /Safari/i.test(ua)
      ? 'Safari'
      : /Firefox/i.test(ua)
        ? 'Firefox'
        : /Edge/i.test(ua)
          ? 'Edge'
          : 'Unknown browser';
  const device = /Mobile/i.test(ua) ? 'Mobile' : /Macintosh/i.test(ua) ? 'Mac' : /Windows/i.test(ua) ? 'Windows' : 'Desktop';
  return { device, browser };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? req.ip ?? '0.0.0.0';
  }
  return req.ip ?? '0.0.0.0';
}
