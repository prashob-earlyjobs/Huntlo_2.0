import type { NextFunction, Request, Response } from 'express';

import { verifyAccessToken } from '../shared/auth/jwt.js';
import { AppError } from '../shared/errors/app-error.js';
import { asyncHandler } from '../shared/http/async-handler.js';
import { UserSessionModel } from '../modules/auth/session.model.js';
import { UserModel } from '../modules/auth/user.model.js';
import { OrganizationMemberModel } from '../modules/organizations/member.model.js';
import { OrganizationModel } from '../modules/organizations/organization.model.js';
import {
  hasAnyPermission,
  hasPermission,
  isMemberManager,
  normalizeAllowedModules,
  resolvePermissions,
  type OrganizationRole,
} from '../modules/organizations/permissions.js';
import { assertTrialNotExpired } from '../modules/plans/trial-access.js';

declare module 'express-serve-static-core' {
  interface Request {
    member?: {
      id: string;
      role: OrganizationRole | string;
      permissions: string[];
      status: string;
    };
    organization?: {
      id: string;
      plan: string;
      status: string;
      ownerUserId: string | null;
    };
  }
}

/** Routes still allowed after trial ends (upgrade / account / admin). */
function isTrialExpiredAllowlisted(req: Request): boolean {
  const path = String(req.originalUrl || req.url || '').split('?')[0] || '';
  return (
    path.startsWith('/api/v1/plans') ||
    path.startsWith('/api/v1/usage') ||
    path.startsWith('/api/v1/billing') ||
    path.startsWith('/api/v1/auth') ||
    path.startsWith('/api/v1/profile') ||
    path.startsWith('/api/v1/preferences') ||
    path.startsWith('/api/v1/users') ||
    path.startsWith('/api/v1/notifications') ||
    path.startsWith('/api/v1/realtime') ||
    path.startsWith('/api/v1/admin') ||
    path.startsWith('/api/v1/onboarding') ||
    path.startsWith('/api/v1/organization') ||
    path.startsWith('/api/v1/settings')
  );
}

/**
 * Access tokens are short-lived JWTs. Do not tie them to refresh-session
 * revocation — rotation/login/logout of the refresh cookie used to immediately
 * invalidate in-flight ATs and force false logouts under concurrent requests.
 * Refresh-token validity is enforced only on /auth/refresh.
 */
async function assertAccessSession(sessionId: string): Promise<void> {
  const session = await UserSessionModel.findById(sessionId).select('expiresAt');
  if (!session) {
    throw AppError.unauthorized('Session not found');
  }
  if (session.expiresAt.getTime() < Date.now()) {
    throw AppError.unauthorized('Session expired');
  }
}

export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Missing access token');
  }

  const token = header.slice('Bearer '.length).trim();
  const payload = verifyAccessToken(token);
  await assertAccessSession(payload.sessionId);
  req.auth = payload;
  req.userId = payload.sub;
  req.organizationId = payload.orgId;
  next();
});

export const optionalAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next();
    return;
  }

  try {
    const token = header.slice('Bearer '.length).trim();
    const payload = verifyAccessToken(token);
    await assertAccessSession(payload.sessionId);
    req.auth = payload;
    req.userId = payload.sub;
    req.organizationId = payload.orgId;
  } catch {
    // ignore invalid optional auth
  }
  next();
});

/**
 * Loads the caller's organization membership and attaches org + effective permissions.
 * Must run after requireAuth.
 */
export const requireOrganization = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth?.sub || !req.auth.orgId) {
      throw AppError.unauthorized('Authentication required');
    }

    const organization = await OrganizationModel.findById(req.auth.orgId);
    if (!organization || organization.deletedAt || organization.status === 'deleted') {
      throw AppError.notFound('Organization not found');
    }
    if (organization.status === 'suspended') {
      throw AppError.forbidden('Organization is suspended');
    }

    let member = await OrganizationMemberModel.findOne({
      organizationId: organization._id,
      userId: req.auth.sub,
    });

    // Legacy backfill only for the user's home org / recorded owner — never auto-rejoin after removal.
    if (!member) {
      const user = await UserModel.findById(req.auth.sub).select('organizationId');
      const homeOrgId = user?.organizationId ? String(user.organizationId) : null;
      const isHomeOrg = homeOrgId === organization._id.toHexString();
      const isRecordedOwner =
        organization.ownerUserId?.toHexString() === req.auth.sub && req.auth.role === 'owner';

      if (!isHomeOrg && !isRecordedOwner) {
        throw AppError.forbidden('You are not a member of this organization');
      }

      member = await OrganizationMemberModel.create({
        organizationId: organization._id,
        userId: req.auth.sub,
        role: (req.auth.role as OrganizationRole) || 'recruiter',
        permissions: [],
        status: 'active',
        joinedAt: new Date(),
      });

      if (!organization.ownerUserId && req.auth.role === 'owner') {
        organization.ownerUserId = member.userId;
        await organization.save();
      }
    }

    if (member.status === 'suspended' || member.status === 'deactivated') {
      throw AppError.forbidden('Your membership is not active');
    }

    const permissions = resolvePermissions(
      member.role,
      member.permissions ?? [],
      normalizeAllowedModules(member.allowedModules as string[] | null | undefined)
    );

    req.organization = {
      id: organization._id.toHexString(),
      plan: organization.plan,
      status: organization.status ?? 'active',
      ownerUserId: organization.ownerUserId ? organization.ownerUserId.toHexString() : null,
    };
    req.member = {
      id: member._id.toHexString(),
      role: member.role,
      permissions,
      status: member.status,
    };
    req.organizationId = organization._id.toHexString();

    if (!isTrialExpiredAllowlisted(req)) {
      await assertTrialNotExpired(organization._id.toHexString());
    }

    next();
  }
);

export function requireRole(...roles: string[]) {
  const allowed = new Set(roles.map((role) => role.toLowerCase()));
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.member) {
      throw AppError.forbidden('Organization membership required');
    }
    if (!allowed.has(String(req.member.role).toLowerCase())) {
      throw AppError.forbidden('Insufficient role');
    }
    next();
  });
}

export function requirePermission(...permissions: string[]) {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.member) {
      throw AppError.forbidden('Organization membership required');
    }
    if (!hasAnyPermission(req.member.permissions, permissions)) {
      throw AppError.forbidden(`Missing permission: ${permissions.join(' or ')}`);
    }
    next();
  });
}

export const requireOwner = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  if (!req.member || req.member.role !== 'owner') {
    throw AppError.forbidden('Only the workspace owner can perform this action');
  }
  next();
});

/**
 * Ensures a resource organizationId matches the authenticated organization.
 * Use after requireOrganization for any ID-based lookups.
 */
export function scopeToOrganization(organizationId: string | undefined | null): void {
  // This is used as a helper (not middleware) — Express middleware form below.
  void organizationId;
}

export function assertSameOrganization(
  resourceOrganizationId: string | { toHexString(): string } | null | undefined,
  requestOrganizationId: string
): void {
  if (!resourceOrganizationId) {
    throw AppError.notFound('Resource not found');
  }
  const id =
    typeof resourceOrganizationId === 'string'
      ? resourceOrganizationId
      : resourceOrganizationId.toHexString();

  if (id !== requestOrganizationId) {
    // Hide cross-tenant existence
    throw AppError.notFound('Resource not found');
  }
}

export const scopeToOrganizationMiddleware = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.organizationId) {
      throw AppError.forbidden('Organization scope required');
    }

    const paramOrgId =
      (typeof req.params.organizationId === 'string' ? req.params.organizationId : null) ??
      (typeof req.params.orgId === 'string' ? req.params.orgId : null);

    if (paramOrgId && paramOrgId !== req.organizationId) {
      throw AppError.notFound('Resource not found');
    }

    next();
  }
);

export function requireMemberManager() {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.member || !isMemberManager(String(req.member.role))) {
      throw AppError.forbidden('Only owners and admins can manage team members');
    }
    if (!hasPermission(req.member.permissions, 'team:manage')) {
      throw AppError.forbidden('Missing permission: team:manage');
    }
    next();
  });
}
