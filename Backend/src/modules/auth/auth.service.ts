import mongoose from 'mongoose';

import { getEnv } from '../../config/env.js';
import { recordAuditEvent } from '../../shared/audit/audit.service.js';
import {
  buildOrganizationInitials,
  generateOpaqueToken,
  hashIp,
  hashPassword,
  hashToken,
  verifyPassword,
} from '../../shared/auth/crypto.js';
import { parseDurationMs, signAccessToken } from '../../shared/auth/jwt.js';
import { AppError } from '../../shared/errors/app-error.js';
import { consumeRateLimit, resetRateLimit } from '../../middleware/rate-limit.js';
import { OrganizationMemberModel } from '../organizations/member.model.js';
import { OrganizationModel } from '../organizations/organization.model.js';
import { integrationsService } from '../integrations/integration.service.js';
import { OnboardingModel } from './onboarding.model.js';
import {
  EmailVerificationTokenModel,
  PasswordResetTokenModel,
  UserSessionModel,
  type UserSessionDocument,
} from './session.model.js';
import { rolePermissions, parseUserAgent, getClientIp } from './auth.types.js';
import type { RequestContext } from './auth.types.js';
import { toPublicUser, UserModel, type UserDocument } from './user.model.js';
import type { OrganizationDocument } from '../organizations/organization.model.js';

type SessionMeta = {
  ip: string;
  userAgent?: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

async function uniqueOrganizationSlug(base: string): Promise<string> {
  const root = slugify(base) || 'workspace';
  let candidate = root;
  let suffix = 1;
  while (await OrganizationModel.exists({ slug: candidate })) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

async function loadOrganization(orgId: mongoose.Types.ObjectId | string) {
  const organization = await OrganizationModel.findById(orgId);
  if (!organization || organization.deletedAt) {
    throw AppError.notFound('Organization not found');
  }
  return organization;
}

async function loadActiveUser(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user || user.deletedAt) {
    throw AppError.notFound('User not found');
  }
  if (user.memberStatus === 'blocked' || user.memberStatus === 'suspended') {
    throw AppError.forbidden('Your account has been blocked');
  }
  return user;
}

function ensureNotLocked(user: { lockedUntil?: Date | null; failedLoginCount: number }) {
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    throw AppError.forbidden('Account temporarily locked due to failed login attempts');
  }
}

async function createSession(userId: mongoose.Types.ObjectId, meta: SessionMeta) {
  const refreshToken = generateOpaqueToken(48);
  const refreshTokenHash = hashToken(refreshToken);
  const { device, browser } = parseUserAgent(meta.userAgent);
  const expiresAt = new Date(Date.now() + parseDurationMs(getEnv().JWT_REFRESH_EXPIRES_IN));

  const session = await UserSessionModel.create({
    userId,
    refreshTokenHash,
    device,
    browser,
    ipHash: hashIp(meta.ip),
    expiresAt,
    lastUsedAt: new Date(),
  });

  return { session, refreshToken };
}

async function buildAuthResponse(userId: string, sessionId: string) {
  const user = await loadActiveUser(userId);
  const organization = await loadOrganization(user.organizationId);

  const accessToken = signAccessToken({
    sub: user._id.toHexString(),
    orgId: organization._id.toHexString(),
    role: user.role,
    sessionId,
  });

  return {
    accessToken,
    me: {
      user: toPublicUser(user, organization.plan),
      organization: {
        id: organization._id.toHexString(),
        name: organization.name,
        plan: organization.plan,
        initials: organization.initials,
      },
      permissions: rolePermissions(user.role),
    },
  };
}

export class AuthService {
  async register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
    meta: SessionMeta;
  }) {
    const existing = await UserModel.findOne({ email: input.email });
    if (existing) {
      throw AppError.conflict('An account with this email already exists');
    }

    const orgName = input.organizationName?.trim() || `${input.firstName}'s Workspace`;
    const slug = await uniqueOrganizationSlug(orgName);
    const passwordHash = await hashPassword(input.password);

    let organization: OrganizationDocument | null = null;
    let user: UserDocument | null = null;

    try {
      organization = await OrganizationModel.create({
        name: orgName,
        slug,
        plan: 'Starter',
        initials: buildOrganizationInitials(orgName),
        timezone: 'Asia/Kolkata',
        defaultTimezone: 'Asia/Kolkata',
        currency: 'INR',
        status: 'active',
      });

      user = await UserModel.create({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        passwordHash,
        role: 'owner',
        organizationId: organization._id,
        memberStatus: 'active',
        onboardingStatus: 'not_started',
      });

      organization.ownerUserId = user._id;
      await organization.save();

      await OrganizationMemberModel.create({
        organizationId: organization._id,
        userId: user._id,
        role: 'owner',
        permissions: [],
        status: 'active',
        joinedAt: new Date(),
      });

      await OnboardingModel.create({
        userId: user._id,
        organizationId: organization._id,
        currentStep: 1,
        personalDetails: {
          firstName: input.firstName,
          lastName: input.lastName,
        },
        organisationDetails: {
          name: orgName,
        },
      });

      // Auto-connect platform-managed Huntlo Voice AI (and WhatsApp) when configured.
      await integrationsService.provisionDefaultsForUser(
        organization._id.toHexString(),
        user._id.toHexString()
      );

      const createdSession = await createSession(user._id, input.meta);
      const auth = await buildAuthResponse(
        user._id.toHexString(),
        createdSession.session._id.toHexString()
      );

      await recordAuditEvent({
        action: 'auth.register',
        userId: user._id,
        organizationId: organization._id,
        ipHash: hashIp(input.meta.ip),
        userAgent: input.meta.userAgent,
      });

      return { ...auth, refreshToken: createdSession.refreshToken };
    } catch (error) {
      if (user) {
        await OrganizationMemberModel.deleteMany({ userId: user._id });
        await UserModel.deleteOne({ _id: user._id });
      }
      if (organization) await OrganizationModel.deleteOne({ _id: organization._id });
      throw error;
    }
  }

  async login(input: { email: string; password: string; meta: SessionMeta }) {
    const rateKey = `login:${input.meta.ip}:${input.email}`;
    const limit = consumeRateLimit(rateKey, 10, 15 * 60 * 1000);
    if (!limit.allowed) {
      throw new AppError(429, 'RATE_LIMITED', 'Too many login attempts. Try again later.', {
        details: [{ message: `Retry after ${limit.retryAfterSeconds}s` }],
      });
    }

    const user = await UserModel.findOne({ email: input.email }).select('+passwordHash');
    if (!user || user.deletedAt) {
      throw AppError.unauthorized('Invalid email or password');
    }

    ensureNotLocked(user);

    if (user.memberStatus === 'blocked' || user.memberStatus === 'suspended') {
      throw AppError.forbidden('Your account has been blocked');
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      user.failedLoginCount += 1;
      if (user.failedLoginCount >= getEnv().AUTH_MAX_LOGIN_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + getEnv().AUTH_LOCKOUT_MINUTES * 60 * 1000);
      }
      await user.save();

      await recordAuditEvent({
        action: 'auth.login_failed',
        userId: user._id,
        organizationId: user.organizationId,
        ipHash: hashIp(input.meta.ip),
        userAgent: input.meta.userAgent,
        metadata: { failedLoginCount: user.failedLoginCount },
      });

      throw AppError.unauthorized('Invalid email or password');
    }

    user.failedLoginCount = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    if (user.onboardingStatus === 'not_started') {
      user.onboardingStatus = 'in_progress';
    }
    await user.save();

    resetRateLimit(rateKey);

    const createdSession = await createSession(user._id, input.meta);
    const auth = await buildAuthResponse(user._id.toHexString(), createdSession.session._id.toHexString());

    await recordAuditEvent({
      action: 'auth.login_success',
      userId: user._id,
      organizationId: user.organizationId,
      ipHash: hashIp(input.meta.ip),
      userAgent: input.meta.userAgent,
      metadata: { sessionId: createdSession.session._id.toHexString() },
    });

    return { ...auth, refreshToken: createdSession.refreshToken };
  }

  async refresh(refreshToken: string, meta: SessionMeta) {
    const refreshTokenHash = hashToken(refreshToken);
    const session = await UserSessionModel.findOne({ refreshTokenHash });

    if (!session) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    return this.rotateSession(session, meta);
  }

  /**
   * Rotate a refresh session. Concurrent callers that lose the race (or present a
   * just-rotated parent token) are allowed through a short grace window by
   * following `replacedBySessionId` and minting a fresh access token for the
   * already-active child session — without rotating again (cookie already correct).
   */
  private async rotateSession(
    session: import('./session.model.js').UserSessionDocument,
    meta: SessionMeta,
    depth = 0
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    const REFRESH_REUSE_GRACE_MS = 15_000;
    const MAX_CHAIN_DEPTH = 5;

    if (depth > MAX_CHAIN_DEPTH) {
      throw AppError.unauthorized('Refresh token reuse detected. All sessions revoked.');
    }

    if (session.revokedAt) {
      const revokedMs = session.revokedAt.getTime();
      const withinGrace =
        Number.isFinite(revokedMs) && Date.now() - revokedMs <= REFRESH_REUSE_GRACE_MS;

      if (withinGrace && session.replacedBySessionId) {
        const replacement = await UserSessionModel.findById(session.replacedBySessionId);
        if (!replacement) {
          throw AppError.unauthorized('Invalid refresh token');
        }

        // Child still active → winner already rotated; just re-issue access token.
        if (!replacement.revokedAt) {
          if (replacement.expiresAt.getTime() <= Date.now()) {
            throw AppError.unauthorized('Refresh token expired');
          }
          const user = await loadActiveUser(session.userId.toHexString());
          await UserSessionModel.updateOne(
            { _id: replacement._id },
            { $set: { lastUsedAt: new Date() } }
          );

          const accessToken = signAccessToken({
            sub: user._id.toHexString(),
            orgId: user.organizationId.toHexString(),
            role: user.role,
            sessionId: replacement._id.toHexString(),
          });

          await recordAuditEvent({
            action: 'auth.refresh_reuse_grace',
            userId: user._id,
            organizationId: user.organizationId,
            ipHash: hashIp(meta.ip),
            userAgent: meta.userAgent,
            metadata: {
              parentSessionId: session._id.toHexString(),
              sessionId: replacement._id.toHexString(),
            },
          });

          // Omit refreshToken so the controller keeps the cookie set by the winner.
          return { accessToken };
        }

        // Child also revoked (chained race) → keep walking.
        return this.rotateSession(replacement, meta, depth + 1);
      }

      await UserSessionModel.updateMany(
        { userId: session.userId, revokedAt: null },
        { revokedAt: new Date() }
      );

      await recordAuditEvent({
        action: 'auth.refresh_token_reuse_detected',
        userId: session.userId,
        ipHash: hashIp(meta.ip),
        userAgent: meta.userAgent,
        metadata: { sessionId: session._id.toHexString() },
      });

      throw AppError.unauthorized('Refresh token reuse detected. All sessions revoked.');
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await UserSessionModel.updateOne(
        { _id: session._id },
        { $set: { revokedAt: new Date() } }
      );
      throw AppError.unauthorized('Refresh token expired');
    }

    const user = await loadActiveUser(session.userId.toHexString());
    const newRefreshToken = generateOpaqueToken(48);
    const newRefreshTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + parseDurationMs(getEnv().JWT_REFRESH_EXPIRES_IN));
    const { device, browser } = parseUserAgent(meta.userAgent);

    const replacement = await UserSessionModel.create({
      userId: session.userId,
      refreshTokenHash: newRefreshTokenHash,
      device,
      browser,
      ipHash: hashIp(meta.ip),
      expiresAt,
      lastUsedAt: new Date(),
    });

    // Atomic claim — only one concurrent rotator wins this session.
    const claimed = await UserSessionModel.findOneAndUpdate(
      { _id: session._id, revokedAt: null },
      {
        $set: {
          revokedAt: new Date(),
          replacedBySessionId: replacement._id,
          lastUsedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!claimed) {
      await UserSessionModel.deleteOne({ _id: replacement._id });
      const latest = await UserSessionModel.findById(session._id);
      if (!latest) {
        throw AppError.unauthorized('Invalid refresh token');
      }
      return this.rotateSession(latest, meta, depth + 1);
    }

    const accessToken = signAccessToken({
      sub: user._id.toHexString(),
      orgId: user.organizationId.toHexString(),
      role: user.role,
      sessionId: replacement._id.toHexString(),
    });

    await recordAuditEvent({
      action: 'auth.refresh_success',
      userId: user._id,
      organizationId: user.organizationId,
      ipHash: hashIp(meta.ip),
      userAgent: meta.userAgent,
      metadata: { sessionId: replacement._id.toHexString() },
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string | null, context?: RequestContext) {
    if (refreshToken) {
      const refreshTokenHash = hashToken(refreshToken);
      await UserSessionModel.updateOne(
        { refreshTokenHash, revokedAt: null },
        { revokedAt: new Date(), lastUsedAt: new Date() }
      );
    }

    if (context) {
      await recordAuditEvent({
        action: 'auth.logout',
        userId: context.userId,
        organizationId: context.organizationId,
        metadata: { sessionId: context.sessionId },
      });
    }
  }

  async logoutAll(userId: string) {
    await UserSessionModel.updateMany({ userId, revokedAt: null }, { revokedAt: new Date() });
    await recordAuditEvent({
      action: 'auth.logout_all',
      userId,
    });
  }

  async me(context: RequestContext) {
    const user = await loadActiveUser(context.userId);
    const organization = await loadOrganization(user.organizationId);
    return {
      user: toPublicUser(user, organization.plan),
      organization: {
        id: organization._id.toHexString(),
        name: organization.name,
        plan: organization.plan,
        initials: organization.initials,
      },
      permissions: rolePermissions(user.role),
    };
  }

  async updateMe(context: RequestContext, input: Record<string, unknown>) {
    const user = await loadActiveUser(context.userId);
    if (input.firstName !== undefined) user.firstName = String(input.firstName);
    if (input.lastName !== undefined) user.lastName = String(input.lastName);
    if (input.phone !== undefined) user.phone = input.phone as string | null;
    if (input.jobTitle !== undefined) user.jobTitle = input.jobTitle as string | null;
    if (input.timezone !== undefined) user.timezone = String(input.timezone);
    if (input.locale !== undefined) user.locale = String(input.locale);
    if (input.profileImage !== undefined) user.profileImage = input.profileImage as string | null;
    await user.save();
    return this.me(context);
  }

  async changePassword(context: RequestContext, currentPassword: string, newPassword: string) {
    const user = await UserModel.findById(context.userId).select('+passwordHash');
    if (!user) throw AppError.notFound('User not found');

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      throw AppError.forbidden('Current password is incorrect');
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();
    await this.logoutAll(user._id.toHexString());

    await recordAuditEvent({
      action: 'auth.password_changed',
      userId: user._id,
      organizationId: user.organizationId,
    });
  }

  async forgotPassword(email: string, meta: SessionMeta) {
    const rateKey = `forgot:${meta.ip}:${email}`;
    const limit = consumeRateLimit(rateKey, 5, 60 * 60 * 1000);
    if (!limit.allowed) {
      throw new AppError(429, 'RATE_LIMITED', 'Too many password reset requests');
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return { message: 'If the account exists, a reset email will be sent.' };
    }

    const token = generateOpaqueToken(32);
    await PasswordResetTokenModel.create({
      userId: user._id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    await recordAuditEvent({
      action: 'auth.forgot_password_requested',
      userId: user._id,
      organizationId: user.organizationId,
      ipHash: hashIp(meta.ip),
      metadata: { tokenIssued: true },
    });

    return {
      message: 'If the account exists, a reset email will be sent.',
      ...(getEnv().APP_ENV !== 'production' ? { resetToken: token } : {}),
    };
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = hashToken(token);
    const resetToken = await PasswordResetTokenModel.findOne({ tokenHash, usedAt: null });
    if (!resetToken || resetToken.expiresAt.getTime() <= Date.now()) {
      throw AppError.badRequest('Invalid or expired reset token');
    }

    const user = await UserModel.findById(resetToken.userId).select('+passwordHash');
    if (!user) throw AppError.notFound('User not found');

    user.passwordHash = await hashPassword(password);
    user.failedLoginCount = 0;
    user.lockedUntil = null;
    await user.save();

    resetToken.usedAt = new Date();
    await resetToken.save();
    await this.logoutAll(user._id.toHexString());

    await recordAuditEvent({
      action: 'auth.password_reset_completed',
      userId: user._id,
      organizationId: user.organizationId,
    });
  }

  async verifyEmail(token: string) {
    const tokenHash = hashToken(token);
    const verification = await EmailVerificationTokenModel.findOne({ tokenHash, usedAt: null });
    if (!verification || verification.expiresAt.getTime() <= Date.now()) {
      throw AppError.badRequest('Invalid or expired verification token');
    }

    const user = await UserModel.findById(verification.userId);
    if (!user) throw AppError.notFound('User not found');

    user.emailVerifiedAt = new Date();
    await user.save();
    verification.usedAt = new Date();
    await verification.save();

    await recordAuditEvent({
      action: 'auth.email_verified',
      userId: user._id,
      organizationId: user.organizationId,
    });

    return { verified: true };
  }

  async resendVerification(context: RequestContext) {
    const user = await loadActiveUser(context.userId);
    if (user.emailVerifiedAt) {
      return { message: 'Email is already verified' };
    }

    const token = generateOpaqueToken(32);
    await EmailVerificationTokenModel.create({
      userId: user._id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await recordAuditEvent({
      action: 'auth.verification_resent',
      userId: user._id,
      organizationId: user.organizationId,
    });

    return {
      message: 'Verification email sent',
      ...(getEnv().APP_ENV !== 'production' ? { verificationToken: token } : {}),
    };
  }

  async listSessions(context: RequestContext) {
    const sessions = await UserSessionModel.find({
      userId: context.userId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    })
      .sort({ lastUsedAt: -1 })
      .lean();

    return sessions.map((session: UserSessionDocument) => ({
      id: session._id.toHexString(),
      device: session.device,
      browser: session.browser,
      lastUsedAt: session.lastUsedAt?.toISOString() ?? null,
      current: session._id.toHexString() === context.sessionId,
    }));
  }
}

export const authService = new AuthService();

export { getClientIp };
