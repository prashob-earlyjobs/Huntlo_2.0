import mongoose from 'mongoose';

import { hashIp, verifyPassword } from '../../shared/auth/crypto.js';
import {
  fingerprintIpHash,
  recordAuditEvent,
  sanitizeAuditMetadata,
  AuditLogModel,
} from '../../shared/audit/audit.service.js';
import { AppError } from '../../shared/errors/app-error.js';
import type { RequestContext } from '../auth/auth.types.js';
import { authService } from '../auth/auth.service.js';
import { UserSessionModel } from '../auth/session.model.js';
import { UserModel, toPublicUser } from '../auth/user.model.js';
import { OrganizationModel } from '../organizations/organization.model.js';
import {
  UserPreferenceModel,
  defaultNotificationPreferences,
  toPublicPreferences,
  type NotificationPreferences,
} from './user-preference.model.js';
import { WorkspaceSettingsModel } from './workspace-settings.model.js';

async function loadUser(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user || user.deletedAt) throw AppError.notFound('User not found');
  if (user.memberStatus === 'suspended' || user.memberStatus === 'blocked') {
    throw AppError.forbidden('Account is not active');
  }
  return user;
}

async function ensurePreferences(userId: string) {
  let prefs = await UserPreferenceModel.findOne({ userId });
  if (!prefs) {
    const user = await loadUser(userId);
    prefs = await UserPreferenceModel.create({
      userId,
      timezone: user.timezone || 'Asia/Kolkata',
      locale: user.locale || 'en-IN',
      notificationPreferences: defaultNotificationPreferences(),
    });
  }
  return prefs;
}

async function ensureWorkspaceSettings(organizationId: string) {
  let settings = await WorkspaceSettingsModel.findOne({ organizationId });
  if (!settings) {
    const org = await OrganizationModel.findById(organizationId);
    if (!org || org.deletedAt) throw AppError.notFound('Organization not found');
    settings = await WorkspaceSettingsModel.create({
      organizationId,
      defaultCurrency: org.currency || 'INR',
      defaultTimezone: org.timezone || org.defaultTimezone || 'Asia/Kolkata',
      dateFormat: org.settings?.dateFormat || 'DD MMM YYYY',
    });
  }
  return settings;
}

export async function assertCurrentPassword(userId: string, password: string) {
  const user = await UserModel.findById(userId).select('+passwordHash');
  if (!user) throw AppError.notFound('User not found');
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw AppError.forbidden('Current password is incorrect');
  }
}

function retentionLabelFromDays(days: number | null | undefined): string {
  if (days == null || days === 0) return 'Retain indefinitely';
  if (days <= 365) return '12 months after last activity';
  if (days <= 730) return '24 months after last activity';
  if (days <= 1095) return '36 months after last activity';
  return `${days} days after last activity`;
}

function daysFromRetentionLabel(label: string): number {
  const lower = label.toLowerCase();
  if (lower.includes('indefinitely')) return 0;
  if (lower.includes('12')) return 365;
  if (lower.includes('36')) return 1095;
  if (lower.includes('24')) return 730;
  const match = /(\d+)\s*days?/i.exec(label);
  if (match) return Math.min(3650, Number(match[1]));
  return 730;
}

function formatRelative(date: Date | null | undefined): string {
  if (!date) return 'Unknown';
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) return 'Active now';
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)} minutes ago`;
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)} hours ago`;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const usersService = {
  async getProfile(context: RequestContext) {
    const user = await loadUser(context.userId);
    const organization = await OrganizationModel.findById(user.organizationId);
    return {
      ...toPublicUser(user, organization?.plan),
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? '',
      jobTitle: user.jobTitle ?? '',
      timezone: user.timezone,
      locale: user.locale,
    };
  },

  async updateProfile(context: RequestContext, input: Record<string, unknown>) {
    await authService.updateMe(context, input);
    await recordAuditEvent({
      action: 'profile.updated',
      module: 'profile',
      userId: context.userId,
      organizationId: context.organizationId,
      relatedEntityType: 'user',
      relatedEntityId: context.userId,
      metadata: { fields: Object.keys(input) },
    });
    return this.getProfile(context);
  },

  async changePassword(
    context: RequestContext,
    currentPassword: string,
    newPassword: string
  ) {
    await authService.changePassword(context, currentPassword, newPassword);
    return { changed: true };
  },

  async listSessions(context: RequestContext) {
    const sessions = await UserSessionModel.find({
      userId: context.userId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    })
      .sort({ lastUsedAt: -1 })
      .lean();

    return sessions.map((session) => {
      const current = session._id.toHexString() === context.sessionId;
      const deviceLabel = `${session.browser || 'Browser'} on ${session.device || 'device'}`;
      return {
        id: session._id.toHexString(),
        device: deviceLabel,
        browser: session.browser,
        location: '—',
        lastActive: formatRelative(session.lastUsedAt),
        lastUsedAt: session.lastUsedAt?.toISOString() ?? null,
        current,
      };
    });
  },

  async revokeSession(context: RequestContext, sessionId: string) {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw AppError.badRequest('Invalid session id');
    }
    if (sessionId === context.sessionId) {
      throw AppError.badRequest('Cannot revoke the current session from this endpoint');
    }
    const session = await UserSessionModel.findOne({
      _id: sessionId,
      userId: context.userId,
      revokedAt: null,
    });
    if (!session) throw AppError.notFound('Session not found');
    session.revokedAt = new Date();
    await session.save();
    await recordAuditEvent({
      action: 'profile.session_revoked',
      module: 'profile',
      userId: context.userId,
      organizationId: context.organizationId,
      relatedEntityType: 'session',
      relatedEntityId: sessionId,
    });
    return { revoked: true, id: sessionId };
  },

  async revokeOtherSessions(context: RequestContext, currentPassword: string) {
    await assertCurrentPassword(context.userId, currentPassword);
    await UserSessionModel.updateMany(
      {
        userId: context.userId,
        revokedAt: null,
        _id: { $ne: context.sessionId },
      },
      { revokedAt: new Date() }
    );
    await recordAuditEvent({
      action: 'profile.sessions_revoked',
      module: 'profile',
      userId: context.userId,
      organizationId: context.organizationId,
      metadata: { exceptCurrent: true },
    });
    return { revoked: true };
  },

  async getPreferences(context: RequestContext) {
    const prefs = await ensurePreferences(context.userId);
    return toPublicPreferences(prefs);
  },

  async updatePreferences(context: RequestContext, input: Record<string, unknown>) {
    const prefs = await ensurePreferences(context.userId);
    const appearance = (input.appearance as { theme?: string; density?: string } | undefined) || {};

    if (input.theme !== undefined || appearance.theme !== undefined) {
      prefs.theme = String(input.theme ?? appearance.theme) as typeof prefs.theme;
    }
    if (input.density !== undefined || appearance.density !== undefined) {
      prefs.density = String(input.density ?? appearance.density) as typeof prefs.density;
    }
    if (input.timezone !== undefined) prefs.timezone = String(input.timezone);
    if (input.locale !== undefined) prefs.locale = String(input.locale);
    if (input.dateFormat !== undefined) prefs.dateFormat = String(input.dateFormat);
    if (input.notificationPreferences !== undefined) {
      prefs.notificationPreferences = {
        ...defaultNotificationPreferences(),
        ...(prefs.notificationPreferences as NotificationPreferences),
        ...(input.notificationPreferences as NotificationPreferences),
      };
    }
    await prefs.save();

    if (input.timezone !== undefined) {
      await UserModel.updateOne(
        { _id: context.userId },
        { $set: { timezone: String(input.timezone) } }
      );
    }
    if (input.locale !== undefined) {
      await UserModel.updateOne(
        { _id: context.userId },
        { $set: { locale: String(input.locale) } }
      );
    }

    await recordAuditEvent({
      action: 'preferences.updated',
      module: 'profile',
      userId: context.userId,
      organizationId: context.organizationId,
      relatedEntityType: 'user_preference',
      relatedEntityId: prefs._id.toHexString(),
      metadata: { fields: Object.keys(input).filter((k) => k !== 'notificationPreferences') },
    });

    return toPublicPreferences(prefs);
  },

  async getSettings(context: RequestContext) {
    const org = await OrganizationModel.findById(context.organizationId);
    if (!org || org.deletedAt) throw AppError.notFound('Organization not found');
    const settings = await ensureWorkspaceSettings(context.organizationId);
    const consent = settings.consentSettings || {
      email: true,
      whatsapp: true,
      voice: true,
      dataSharing: false,
    };

    return {
      workspace: {
        organisationName: org.name,
        industry: org.industry ?? '',
        website: org.website ?? '',
        companySize: org.companySize ?? '',
        defaultTimezone: settings.defaultTimezone || org.timezone || 'Asia/Kolkata',
        dateFormat: settings.dateFormat || org.settings?.dateFormat || 'DD MMM YYYY',
        defaultCurrency: settings.defaultCurrency || org.currency || 'INR',
      },
      recruitingDefaults: settings.recruitingDefaults || {},
      outreachDefaults: settings.outreachDefaults || {},
      screeningDefaults: settings.screeningDefaults || {},
      schedulingDefaults: settings.schedulingDefaults || {},
      candidateRetentionDays: settings.candidateRetentionDays ?? 730,
      candidateRetention: retentionLabelFromDays(settings.candidateRetentionDays),
      consentSettings: {
        email: Boolean(consent.email),
        whatsapp: Boolean(consent.whatsapp),
        voice: Boolean(consent.voice),
        dataSharing: Boolean(consent.dataSharing),
      },
      /** FE privacy section aliases */
      privacy: {
        candidateRetention: retentionLabelFromDays(settings.candidateRetentionDays),
        consentEmail: Boolean(consent.email),
        consentWhatsapp: Boolean(consent.whatsapp),
        consentVoice: Boolean(consent.voice),
        consentDataSharing: Boolean(consent.dataSharing),
      },
      featureFlags: settings.featureFlags || {},
    };
  },

  async updateSettings(
    context: RequestContext,
    input: Record<string, unknown>,
    meta?: { ip?: string; userAgent?: string | null }
  ) {
    const org = await OrganizationModel.findById(context.organizationId);
    if (!org || org.deletedAt) throw AppError.notFound('Organization not found');
    const settings = await ensureWorkspaceSettings(context.organizationId);

    const privacy = input.privacy as
      | {
          candidateRetention?: string;
          consentEmail?: boolean;
          consentWhatsapp?: boolean;
          consentVoice?: boolean;
          consentDataSharing?: boolean;
        }
      | undefined;

    const nextRetentionDays =
      input.candidateRetentionDays !== undefined
        ? input.candidateRetentionDays === null
          ? 0
          : Number(input.candidateRetentionDays)
        : input.candidateRetention !== undefined
          ? daysFromRetentionLabel(String(input.candidateRetention))
          : privacy?.candidateRetention
            ? daysFromRetentionLabel(privacy.candidateRetention)
            : null;

    const nextConsent = {
      email:
        (input.consentSettings as { email?: boolean } | undefined)?.email ??
        privacy?.consentEmail,
      whatsapp:
        (input.consentSettings as { whatsapp?: boolean } | undefined)?.whatsapp ??
        privacy?.consentWhatsapp,
      voice:
        (input.consentSettings as { voice?: boolean } | undefined)?.voice ??
        privacy?.consentVoice,
      dataSharing:
        (input.consentSettings as { dataSharing?: boolean } | undefined)?.dataSharing ??
        privacy?.consentDataSharing,
    };

    const currentConsent = settings.consentSettings || {};
    const privacyChanging =
      (nextRetentionDays !== null &&
        nextRetentionDays !== (settings.candidateRetentionDays ?? 730)) ||
      (nextConsent.email !== undefined &&
        Boolean(nextConsent.email) !== Boolean(currentConsent.email)) ||
      (nextConsent.whatsapp !== undefined &&
        Boolean(nextConsent.whatsapp) !== Boolean(currentConsent.whatsapp)) ||
      (nextConsent.voice !== undefined &&
        Boolean(nextConsent.voice) !== Boolean(currentConsent.voice)) ||
      (nextConsent.dataSharing !== undefined &&
        Boolean(nextConsent.dataSharing) !== Boolean(currentConsent.dataSharing));

    if (privacyChanging) {
      const password = String(input.currentPassword || '');
      if (!password) {
        throw AppError.forbidden(
          'Re-authenticate with your current password to change privacy settings'
        );
      }
      await assertCurrentPassword(context.userId, password);
    }

    const workspace = (input.workspace as Record<string, unknown> | undefined) || {};
    if (workspace.organisationName !== undefined) {
      org.name = String(workspace.organisationName);
    }
    if (workspace.industry !== undefined) {
      org.industry = workspace.industry as string | null;
    }
    if (workspace.website !== undefined) {
      org.website = workspace.website as string | null;
    }
    if (workspace.companySize !== undefined) {
      org.companySize = workspace.companySize as string | null;
    }
    if (workspace.defaultTimezone !== undefined) {
      const tz = String(workspace.defaultTimezone);
      org.timezone = tz;
      org.defaultTimezone = tz;
      settings.defaultTimezone = tz;
    }
    if (workspace.defaultCurrency !== undefined) {
      const currency = String(workspace.defaultCurrency).split(' ')[0] || 'INR';
      org.currency = currency;
      settings.defaultCurrency = currency;
    }
    if (workspace.dateFormat !== undefined) {
      settings.dateFormat = String(workspace.dateFormat);
      org.settings = {
        ...(org.settings || {}),
        dateFormat: String(workspace.dateFormat),
      };
    }

    if (input.recruitingDefaults) {
      settings.recruitingDefaults = {
        ...(settings.recruitingDefaults || {}),
        ...(input.recruitingDefaults as object),
      };
    }
    if (input.outreachDefaults) {
      settings.outreachDefaults = {
        ...(settings.outreachDefaults || {}),
        ...(input.outreachDefaults as object),
      };
    }
    if (input.screeningDefaults) {
      settings.screeningDefaults = {
        ...(settings.screeningDefaults || {}),
        ...(input.screeningDefaults as object),
      };
    }
    if (input.schedulingDefaults) {
      settings.schedulingDefaults = {
        ...(settings.schedulingDefaults || {}),
        ...(input.schedulingDefaults as object),
      };
    }
    if (nextRetentionDays !== null) {
      settings.candidateRetentionDays = nextRetentionDays;
    }

    if (privacy) {
      settings.consentSettings = {
        ...(settings.consentSettings || {}),
        ...(privacy.consentEmail !== undefined ? { email: privacy.consentEmail } : {}),
        ...(privacy.consentWhatsapp !== undefined
          ? { whatsapp: privacy.consentWhatsapp }
          : {}),
        ...(privacy.consentVoice !== undefined ? { voice: privacy.consentVoice } : {}),
        ...(privacy.consentDataSharing !== undefined
          ? { dataSharing: privacy.consentDataSharing }
          : {}),
      };
    }

    if (input.consentSettings) {
      settings.consentSettings = {
        ...(settings.consentSettings || {}),
        ...(input.consentSettings as object),
      };
    }
    if (input.featureFlags) {
      settings.featureFlags = {
        ...((settings.featureFlags as object) || {}),
        ...(input.featureFlags as object),
      };
    }

    await org.save();
    await settings.save();

    await recordAuditEvent({
      action: 'settings.updated',
      module: 'settings',
      userId: context.userId,
      organizationId: context.organizationId,
      relatedEntityType: 'workspace_settings',
      relatedEntityId: settings._id.toHexString(),
      ipHash: meta?.ip ? hashIp(meta.ip) : null,
      userAgent: meta?.userAgent ?? null,
      metadata: {
        sections: Object.keys(input).filter((k) => k !== 'currentPassword'),
      },
    });

    return this.getSettings(context);
  },

  async listAuditLogs(
    context: RequestContext,
    query: { module?: string; action?: string; limit: number; offset: number }
  ) {
    const filter: Record<string, unknown> = {
      organizationId: context.organizationId,
    };
    if (query.module) filter.module = query.module;
    if (query.action) filter.action = query.action;

    const [rows, total] = await Promise.all([
      AuditLogModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(query.offset)
        .limit(query.limit)
        .lean(),
      AuditLogModel.countDocuments(filter),
    ]);

    const userIds = [
      ...new Set(
        rows
          .map((row) => (row.userId ? String(row.userId) : null))
          .filter((id): id is string => Boolean(id))
      ),
    ];
    const users = await UserModel.find({ _id: { $in: userIds } })
      .select('firstName lastName')
      .lean();
    const userMap = new Map(
      users.map((u) => [
        String(u._id),
        `${u.firstName} ${u.lastName}`.trim() || 'User',
      ])
    );

    const items = rows.map((row) => {
      const related =
        row.relatedEntityType && row.relatedEntityId
          ? `${row.relatedEntityType} · ${row.relatedEntityId}`
          : row.relatedEntityType || '—';
      return {
        id: row._id.toHexString(),
        user: row.userId ? userMap.get(String(row.userId)) || 'User' : 'System',
        action: row.action,
        module: row.module,
        relatedEntity: related,
        relatedEntityType: row.relatedEntityType ?? null,
        relatedEntityId: row.relatedEntityId ?? null,
        timestamp: row.createdAt.toISOString(),
        ip: fingerprintIpHash(row.ipHash),
        metadata: sanitizeAuditMetadata(
          (row.metadata as Record<string, unknown>) || {}
        ),
      };
    });

    return { items, total, limit: query.limit, offset: query.offset };
  },
};
