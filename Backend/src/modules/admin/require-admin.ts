import type { NextFunction, Request, Response } from 'express';

import { getEnv } from '../../config/env.js';
import { AppError } from '../../shared/errors/app-error.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { UserModel } from '../auth/user.model.js';

export const ADMIN_PERMISSIONS = [
  'admin:dashboard:read',
  'admin:users:read',
  'admin:users:write',
  'admin:users:suspend',
  'admin:users:quota',
  'admin:organizations:read',
  'admin:plans:read',
  'admin:plans:write',
  'admin:usage:read',
  'admin:candidates:read',
  'admin:sourcing:read',
  'admin:campaigns:read',
  'admin:screenings:read',
  'admin:interviews:read',
  'admin:jobs:read',
  'admin:jobs:write',
  'admin:webhooks:read',
  'admin:webhooks:write',
  'admin:providers:read',
  'admin:settings:read',
  'admin:settings:write',
  'admin:blog:read',
  'admin:blog:write',
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

declare module 'express-serve-static-core' {
  interface Request {
    platformAdmin?: boolean;
    adminPermissions?: string[];
  }
}

function allowlistEmails(): string[] {
  try {
    return getEnv().PLATFORM_ADMIN_EMAILS ?? [];
  } catch {
    return String(process.env.PLATFORM_ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }
}

export async function isPlatformAdminUser(user: {
  email: string;
  platformAdmin?: boolean | null;
}): Promise<boolean> {
  if (user.platformAdmin) return true;
  return allowlistEmails().includes(String(user.email || '').toLowerCase());
}

/**
 * Platform admin gate — never grant based on organization owner/admin role alone.
 * Must run after requireAuth.
 */
export const requireAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth?.sub) {
      throw AppError.unauthorized('Authentication required');
    }

    const user = await UserModel.findById(req.auth.sub).select(
      'email platformAdmin adminPermissions deletedAt memberStatus'
    );
    if (!user || user.deletedAt) {
      throw AppError.unauthorized('User not found');
    }
    if (user.memberStatus === 'suspended' || user.memberStatus === 'blocked') {
      throw AppError.forbidden('Account is not active');
    }

    const allowed = await isPlatformAdminUser(user);
    if (!allowed) {
      throw AppError.forbidden('Platform admin access required');
    }

    const permissions =
      Array.isArray(user.adminPermissions) && user.adminPermissions.length > 0
        ? user.adminPermissions.map(String)
        : ['*'];

    req.platformAdmin = true;
    req.adminPermissions = permissions;
    next();
  }
);

export function requireAdminPermission(...required: AdminPermission[]) {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.platformAdmin) {
      throw AppError.forbidden('Platform admin access required');
    }
    const granted = req.adminPermissions || [];
    if (granted.includes('*')) {
      next();
      return;
    }
    const ok = required.some((perm) => granted.includes(perm));
    if (!ok) {
      throw AppError.forbidden(`Missing admin permission: ${required.join(' or ')}`);
    }
    next();
  });
}
