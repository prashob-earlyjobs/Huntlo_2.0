import mongoose from 'mongoose';

import { getEnv } from '../../config/env.js';
import { AppError } from '../../shared/errors/app-error.js';
import {
  buildPaginationMeta,
  getSkip,
  type PaginatedResult,
} from '../../shared/pagination/paginate.js';
import {
  hashPassword,
  generateOpaqueToken,
  buildOrganizationInitials,
} from '../../shared/auth/crypto.js';
import { normalizeEmail } from '../../shared/validation/email.js';
import {
  currentPeriodKey,
  isUsageMetric,
  periodResetAt,
  quotaService,
  QuotaCounterModel,
  type UsageMetric,
} from '../../shared/usage/index.js';
import { UserModel, toPublicUser, type UserDocument } from '../auth/user.model.js';
import { UserSessionModel } from '../auth/session.model.js';
import { authService } from '../auth/auth.service.js';
import { integrationsService } from '../integrations/integration.service.js';
import {
  OrganizationModel,
  toPublicOrganization,
} from '../organizations/organization.model.js';
import { OrganizationMemberModel } from '../organizations/member.model.js';
import { plansService } from '../plans/plans.service.js';
import { PricingPlanModel } from '../plans/pricing-plan.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { SourcingSessionModel } from '../sourcing/sourcing-session.model.js';
import { OutreachCampaignModel } from '../outreach/campaign.model.js';
import { ScreeningModel } from '../screening/screening.model.js';
import { InterviewModel } from '../scheduling/interview.model.js';
import { BackgroundJobModel } from '../../workers/job.model.js';
import { toPublicJob } from '../../workers/queue.js';
import { WebhookEventModel } from '../webhooks/webhook-event.model.js';
import { PaymentOrderModel } from '../billing/payment-order.model.js';
import { maskAdminEmail, maskAdminName, maskAdminPhone, formatCount } from './admin-mask.js';
import {
  BlogArticleModel,
  toPublicBlog,
  type BlogArticleDocument,
} from './blog.model.js';
import {
  PLATFORM_PROVIDERS,
  PlatformSettingsModel,
  type PlatformProviderId,
} from './platform-settings.model.js';
import { maskSecretKey } from '../../shared/encryption/mask.js';
import {
  encryptField,
  serializeEncryptedField,
  deserializeEncryptedField,
  decryptField,
} from '../../shared/encryption/cipher.js';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200);
}

async function paginateQuery<T>(
  model: Pick<mongoose.Model<T>, 'find' | 'countDocuments'>,
  filter: Record<string, unknown>,
  page: number,
  limit: number,
  sort: Record<string, 1 | -1> = { createdAt: -1 }
): Promise<PaginatedResult<T>> {
  const [items, total] = await Promise.all([
    model.find(filter).sort(sort).skip(getSkip(page, limit)).limit(limit),
    model.countDocuments(filter),
  ]);
  return {
    items: items as T[],
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

function providerConfiguredFromEnv(provider: PlatformProviderId): {
  configured: boolean;
  maskedIdentifier: string | null;
  status: 'connected' | 'not_configured' | 'error' | 'degraded';
} {
  const env = process.env;
  const map: Record<PlatformProviderId, string | undefined> = {
    'future-jobs': env.FUTURE_JOBS_API_KEY,
    gemini: env.GEMINI_API_KEY,
    gmail: env.GMAIL_CLIENT_ID,
    outlook: env.OUTLOOK_CLIENT_ID,
    zoho: env.ZOHO_CLIENT_ID,
    smtp: env.SMTP_HOST,
    'meta-whatsapp': env.META_APP_SECRET || env.META_ACCESS_TOKEN,
    gupshup: env.GUPSHUP_API_KEY || env.GUPSHUP_WEBHOOK_SECRET,
    hunar: env.HUNAR_VOICE_API_KEY || env.HUNAR_WEBHOOK_SECRET,
    calendly: env.CALENDLY_WEBHOOK_SIGNING_KEY || env.CALENDLY_API_KEY,
    razorpay: env.RAZORPAY_KEY_ID || env.RAZORPAY_WEBHOOK_SECRET,
    dodo: env.DODO_PAYMENTS_WEBHOOK_KEY || env.DODO_API_KEY,
    realtime: env.REALTIME_ENABLED,
  };
  const raw = map[provider];
  const configured = Boolean(raw && String(raw).trim() && String(raw) !== 'false');
  return {
    configured,
    maskedIdentifier: configured
      ? maskSecretKey(String(raw).length > 4 ? String(raw) : `${provider}-configured`)
      : null,
    status: configured ? 'connected' : 'not_configured',
  };
}

export const adminConsoleService = {
  async getDashboard() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeOrgs,
      paidOrgs,
      searchesToday,
      campaignsActive,
      screeningsToday,
      revenueOrders,
    ] = await Promise.all([
      UserModel.countDocuments({ deletedAt: null }),
      OrganizationModel.countDocuments({ status: 'active', deletedAt: null }),
      OrganizationModel.countDocuments({
        status: 'active',
        deletedAt: null,
        plan: { $nin: ['Starter'] },
      }),
      SourcingSessionModel.countDocuments({ createdAt: { $gte: startOfDay } }),
      OutreachCampaignModel.countDocuments({ status: { $in: ['running', 'active'] } }),
      ScreeningModel.countDocuments({ createdAt: { $gte: startOfDay } }),
      PaymentOrderModel.aggregate([
        {
          $match: {
            status: 'paid',
            createdAt: { $gte: monthStart },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const revenuePaise = Number(revenueOrders[0]?.total || 0);
    const revenueInr = Math.round(revenuePaise / 100);

    const metrics = [
      {
        id: 'users',
        label: 'Total Users',
        value: formatCount(totalUsers),
        change: '',
        trend: 'up' as const,
        comparison: 'all time',
      },
      {
        id: 'workspaces',
        label: 'Active Workspaces',
        value: formatCount(activeOrgs),
        change: '',
        trend: 'up' as const,
        comparison: 'active',
      },
      {
        id: 'paid',
        label: 'Paid Workspaces',
        value: formatCount(paidOrgs),
        change: '',
        trend: 'up' as const,
        comparison: 'non-starter',
      },
      {
        id: 'searches',
        label: 'Searches Today',
        value: formatCount(searchesToday),
        change: '',
        trend: 'up' as const,
        comparison: 'vs yesterday',
      },
      {
        id: 'campaigns',
        label: 'Active Campaigns',
        value: formatCount(campaignsActive),
        change: '',
        trend: 'up' as const,
        comparison: 'running',
      },
      {
        id: 'voice',
        label: 'Screenings Today',
        value: formatCount(screeningsToday),
        change: '',
        trend: 'up' as const,
        comparison: 'created today',
      },
      {
        id: 'revenue',
        label: 'Platform Revenue',
        value: `₹${formatCount(revenueInr)}`,
        change: '',
        trend: 'up' as const,
        comparison: 'MTD',
      },
    ];

    return {
      metrics,
      charts: [],
      totals: {
        users: totalUsers,
        organizations: activeOrgs,
        paidOrganizations: paidOrgs,
        searchesToday,
        campaignsActive,
        screeningsToday,
        revenueInr,
      },
    };
  },

  async listUsers(query: {
    page: number;
    limit: number;
    q?: string;
    status?: string;
    plan?: string;
  }) {
    const filter: Record<string, unknown> = { deletedAt: null };
    if (query.status) {
      const map: Record<string, string> = {
        Active: 'active',
        Suspended: 'suspended',
        Invited: 'invited',
        Deleted: 'blocked',
      };
      filter.memberStatus = map[query.status] || query.status.toLowerCase();
    }
    if (query.q) {
      filter.$or = [
        { email: new RegExp(query.q, 'i') },
        { firstName: new RegExp(query.q, 'i') },
        { lastName: new RegExp(query.q, 'i') },
      ];
    }

    const result = await paginateQuery<UserDocument>(UserModel, filter, query.page, query.limit);
    const orgIds = [...new Set(result.items.map((u) => String(u.organizationId)))];
    const orgs = await OrganizationModel.find({ _id: { $in: orgIds } })
      .select('name plan')
      .lean();
    const orgMap = new Map(orgs.map((o) => [String(o._id), o]));

    const items = result.items.map((user) => {
      const org = orgMap.get(String(user.organizationId));
      return {
        id: user._id.toHexString(),
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: maskAdminEmail(user.email),
        emailHash: user.email,
        organisation: org?.name || '—',
        organizationId: String(user.organizationId),
        plan: org?.plan || 'Starter',
        role: user.role,
        status:
          user.memberStatus === 'active'
            ? 'Active'
            : user.memberStatus === 'suspended'
              ? 'Suspended'
              : user.memberStatus === 'invited'
                ? 'Invited'
                : 'Deleted',
        platformAdmin: Boolean(user.platformAdmin),
        searchesUsed: 0,
        revealsUsed: 0,
        outreachUsed: 0,
        createdAt: user.createdAt.toISOString(),
        lastActive: user.lastLoginAt?.toISOString() ?? null,
      };
    });

    return {
      items,
      ...buildPaginationMeta(result),
    };
  },

  async getUser(id: string) {
    const user = await UserModel.findById(id);
    if (!user || user.deletedAt) throw AppError.notFound('User not found');
    const org = await OrganizationModel.findById(user.organizationId);
    const usage = org
      ? await quotaService.getUsage(org._id.toHexString())
      : [];
    return {
      ...toPublicUser(user, org?.plan),
      email: maskAdminEmail(user.email),
      phone: maskAdminPhone(user.phone),
      platformAdmin: Boolean(user.platformAdmin),
      adminPermissions: user.adminPermissions || [],
      status:
        user.memberStatus === 'active'
          ? 'Active'
          : user.memberStatus === 'suspended'
            ? 'Suspended'
            : user.memberStatus === 'invited'
              ? 'Invited'
              : 'Deleted',
      organization: org ? toPublicOrganization(org) : null,
      usage,
    };
  },

  async createUser(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationId?: string;
    organizationName?: string;
    role: string;
    platformAdmin?: boolean;
    adminPermissions?: string[];
  }) {
    const email = normalizeEmail(input.email);
    const existing = await UserModel.findOne({ email });
    if (existing) throw AppError.conflict('Email already registered');

    let organizationId = input.organizationId;
    if (!organizationId) {
      const name = input.organizationName || `${input.firstName}'s Workspace`;
      const org = await OrganizationModel.create({
        name,
        slug: `${slugify(name)}-${Date.now().toString(36)}`,
        initials: buildOrganizationInitials(name),
        plan: 'Starter',
      });
      organizationId = org._id.toHexString();
    }

    const user = await UserModel.create({
      email,
      passwordHash: await hashPassword(input.password),
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      organizationId,
      memberStatus: 'active',
      onboardingStatus: 'completed',
      emailVerifiedAt: new Date(),
      platformAdmin: Boolean(input.platformAdmin),
      adminPermissions: input.adminPermissions || [],
    });

    await OrganizationMemberModel.findOneAndUpdate(
      { organizationId, userId: user._id },
      {
        organizationId,
        userId: user._id,
        role: input.role,
        permissions: [],
        status: 'active',
        joinedAt: new Date(),
      },
      { upsert: true }
    );

    if (input.role === 'owner') {
      await OrganizationModel.updateOne(
        { _id: organizationId },
        { $set: { ownerUserId: user._id } }
      );
    }

    await integrationsService.provisionDefaultsForUser(
      String(organizationId),
      user._id.toHexString()
    );

    return this.getUser(user._id.toHexString());
  },

  async updateUser(id: string, input: Record<string, unknown>) {
    const user = await UserModel.findById(id);
    if (!user || user.deletedAt) throw AppError.notFound('User not found');
    if (input.firstName !== undefined) user.firstName = String(input.firstName);
    if (input.lastName !== undefined) user.lastName = String(input.lastName);
    if (input.jobTitle !== undefined) user.jobTitle = input.jobTitle as string | null;
    if (input.role !== undefined) {
      user.role = String(input.role) as typeof user.role;
      await OrganizationMemberModel.updateOne(
        { userId: user._id, organizationId: user.organizationId },
        { $set: { role: input.role } }
      );
    }
    if (input.platformAdmin !== undefined) {
      user.platformAdmin = Boolean(input.platformAdmin);
    }
    if (input.adminPermissions !== undefined) {
      user.adminPermissions = input.adminPermissions as string[];
    }
    await user.save();
    return this.getUser(id);
  },

  async suspendUser(id: string) {
    const user = await UserModel.findById(id);
    if (!user || user.deletedAt) throw AppError.notFound('User not found');
    if (user.platformAdmin) {
      throw AppError.forbidden('Cannot suspend a platform admin from this action');
    }
    user.memberStatus = 'suspended';
    await user.save();
    await OrganizationMemberModel.updateOne(
      { userId: user._id },
      { $set: { status: 'suspended' } }
    );
    await UserSessionModel.updateMany(
      { userId: user._id, revokedAt: null },
      { revokedAt: new Date() }
    );
    return this.getUser(id);
  },

  async activateUser(id: string) {
    const user = await UserModel.findById(id);
    if (!user || user.deletedAt) throw AppError.notFound('User not found');
    user.memberStatus = 'active';
    user.lockedUntil = null;
    user.failedLoginCount = 0;
    await user.save();
    await OrganizationMemberModel.updateOne(
      { userId: user._id },
      { $set: { status: 'active' } }
    );
    return this.getUser(id);
  },

  async resetPassword(id: string, newPassword?: string) {
    const user = await UserModel.findById(id).select('+passwordHash');
    if (!user || user.deletedAt) throw AppError.notFound('User not found');
    const password = newPassword || generateOpaqueToken(12);
    user.passwordHash = await hashPassword(password);
    await user.save();
    await authService.logoutAll(user._id.toHexString());
    return {
      reset: true,
      ...(getEnv().APP_ENV !== 'production' ? { temporaryPassword: password } : {}),
    };
  },

  async assignPlan(id: string, plan: string) {
    const user = await UserModel.findById(id);
    if (!user || user.deletedAt) throw AppError.notFound('User not found');
    const org = await OrganizationModel.findById(user.organizationId);
    if (!org) throw AppError.notFound('Organization not found');

    const normalized = plan.trim();
    const pricing =
      (await PricingPlanModel.findOne({
        $or: [{ code: normalized.toLowerCase() }, { name: normalized }],
        active: true,
      })) || null;

    org.plan = (pricing?.name as typeof org.plan) || (normalized as typeof org.plan);
    await org.save();
    await plansService.ensureSubscription(org._id.toHexString());
    return this.getUser(id);
  },

  async adjustQuota(
    id: string,
    input: { metric: string; delta: number; reason?: string }
  ) {
    const user = await UserModel.findById(id);
    if (!user || user.deletedAt) throw AppError.notFound('User not found');
    if (!isUsageMetric(input.metric)) {
      throw AppError.badRequest(`Unknown usage metric: ${input.metric}`);
    }
    const metric = input.metric as UsageMetric;
    const orgId = user.organizationId.toHexString();
    const periodKey = currentPeriodKey();
    const counter = await QuotaCounterModel.findOneAndUpdate(
      { organizationId: user.organizationId, periodKey, metric },
      {
        $inc: { limit: input.delta },
        $setOnInsert: {
          used: 0,
          reserved: 0,
          resetAt: periodResetAt(periodKey),
          allowOverage: false,
        },
      },
      { upsert: true, new: true }
    );
    if (counter && counter.limit < 0) {
      counter.limit = 0;
      await counter.save();
    }
    const usage = await quotaService.getUsage(orgId, metric);
    return { usage, reason: input.reason || null };
  },

  async listOrganizations(query: { page: number; limit: number; q?: string; status?: string }) {
    const filter: Record<string, unknown> = { deletedAt: null };
    if (query.status) filter.status = query.status;
    if (query.q) filter.name = new RegExp(query.q, 'i');
    const result = await paginateQuery(OrganizationModel, filter, query.page, query.limit);
    return {
      items: result.items.map((org) => toPublicOrganization(org)),
      ...buildPaginationMeta(result),
    };
  },

  async getOrganization(id: string) {
    const org = await OrganizationModel.findById(id);
    if (!org || org.deletedAt) throw AppError.notFound('Organization not found');
    const [members, usage] = await Promise.all([
      OrganizationMemberModel.countDocuments({ organizationId: org._id, status: 'active' }),
      quotaService.getUsage(org._id.toHexString()),
    ]);
    return {
      ...toPublicOrganization(org),
      memberCount: members,
      usage,
    };
  },

  async getUsageOverview() {
    const counters = await QuotaCounterModel.aggregate([
      { $match: { periodKey: currentPeriodKey() } },
      {
        $group: {
          _id: '$metric',
          used: { $sum: '$used' },
          reserved: { $sum: '$reserved' },
          limit: { $sum: '$limit' },
        },
      },
    ]);
    const byAction = counters.map((row) => ({
      action: row._id,
      used: row.used,
      reserved: row.reserved,
      limit: row.limit,
    }));
    return { byAction, periodKey: currentPeriodKey() };
  },

  async listCandidates(query: { page: number; limit: number; q?: string }) {
    const filter: Record<string, unknown> = { deletedAt: null };
    if (query.q) {
      filter.$or = [
        { name: new RegExp(query.q, 'i') },
        { currentTitle: new RegExp(query.q, 'i') },
      ];
    }
    const result = await paginateQuery(SavedCandidateModel, filter, query.page, query.limit);
    const orgIds = [...new Set(result.items.map((c) => String(c.organizationId)))];
    const orgs = await OrganizationModel.find({ _id: { $in: orgIds } }).select('name').lean();
    const orgMap = new Map(orgs.map((o) => [String(o._id), o.name]));

    return {
      items: result.items.map((c) => ({
        id: c._id.toHexString(),
        name: maskAdminName(c.name),
        title: c.currentTitle || '',
        workspace: orgMap.get(String(c.organizationId)) || '—',
        organizationId: String(c.organizationId),
        source: c.sourceType,
        status: c.status,
        emailRevealed: Boolean(c.email),
        phoneRevealed: Boolean(c.phone),
        email: c.email ? maskAdminEmail(c.email) : null,
        phone: c.phone ? maskAdminPhone(c.phone) : null,
        lastActivity: c.updatedAt?.toISOString?.() ?? c.createdAt.toISOString(),
      })),
      ...buildPaginationMeta(result),
    };
  },

  async listSourcingSessions(query: { page: number; limit: number; organizationId?: string }) {
    const filter: Record<string, unknown> = {};
    if (query.organizationId) filter.organizationId = query.organizationId;
    const result = await paginateQuery(SourcingSessionModel, filter, query.page, query.limit);
    return {
      items: result.items.map((s) => ({
        id: s._id.toHexString(),
        organizationId: String(s.organizationId),
        status: s.status,
        query: String(s.naturalLanguageQuery || '').slice(0, 120),
        createdAt: s.createdAt.toISOString(),
      })),
      ...buildPaginationMeta(result),
    };
  },

  async listCampaigns(query: { page: number; limit: number; status?: string; q?: string }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.q) filter.name = new RegExp(query.q, 'i');
    const result = await paginateQuery(OutreachCampaignModel, filter, query.page, query.limit);
    const orgIds = [...new Set(result.items.map((c) => String(c.organizationId)))];
    const orgs = await OrganizationModel.find({ _id: { $in: orgIds } }).select('name').lean();
    const orgMap = new Map(orgs.map((o) => [String(o._id), o.name]));

    return {
      items: result.items.map((c) => ({
        id: c._id.toHexString(),
        name: c.name,
        workspace: orgMap.get(String(c.organizationId)) || '—',
        organizationId: String(c.organizationId),
        sourceModule: 'outreach',
        status: c.status,
        channels: c.channelConfig
          ? Object.entries(c.channelConfig)
              .filter(([, v]) => v && typeof v === 'object' && (v as { enabled?: boolean }).enabled)
              .map(([k]) => k)
          : [],
        candidates: c.stats?.enrolled ?? 0,
        queueState: c.status,
        lastTrigger: c.updatedAt?.toISOString?.() ?? null,
        errors: 0,
      })),
      ...buildPaginationMeta(result),
    };
  },

  async listScreenings(query: { page: number; limit: number; status?: string }) {
    const filter: Record<string, unknown> = { deletedAt: null };
    if (query.status) filter.status = query.status;
    const result = await paginateQuery(ScreeningModel, filter, query.page, query.limit);
    return {
      items: result.items.map((s) => ({
        id: s._id.toHexString(),
        name: s.name,
        organizationId: String(s.organizationId),
        status: s.status,
        createdAt: s.createdAt.toISOString(),
      })),
      ...buildPaginationMeta(result),
    };
  },

  async listInterviews(query: { page: number; limit: number; status?: string }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    const result = await paginateQuery(InterviewModel, filter, query.page, query.limit);
    return {
      items: result.items.map((i) => ({
        id: i._id.toHexString(),
        organizationId: String(i.organizationId),
        status: i.status,
        scheduledAt: i.startAt?.toISOString?.() ?? null,
        createdAt: i.createdAt.toISOString(),
      })),
      ...buildPaginationMeta(result),
    };
  },

  async listBackgroundJobs(query: {
    page: number;
    limit: number;
    status?: string;
    type?: string;
    organizationId?: string;
  }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;
    if (query.organizationId) filter.organizationId = query.organizationId;
    const result = await paginateQuery(BackgroundJobModel, filter, query.page, query.limit, {
      createdAt: -1,
    });
    return {
      items: result.items.map((j) => toPublicJob(j)),
      ...buildPaginationMeta(result),
    };
  },

  async listWebhooks(query: {
    page: number;
    limit: number;
    status?: string;
    provider?: string;
  }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.processingStatus = query.status;
    if (query.provider) filter.provider = query.provider;
    const result = await paginateQuery(WebhookEventModel, filter, query.page, query.limit);
    return {
      items: result.items.map((e) => ({
        id: e._id.toHexString(),
        provider: e.provider,
        providerEventId: e.providerEventId,
        eventType: e.eventType,
        processingStatus: e.processingStatus,
        signatureValid: e.signatureValid,
        attempts: e.attempts,
        error: e.error,
        receivedAt: e.receivedAt.toISOString(),
        processedAt: e.processedAt?.toISOString() ?? null,
      })),
      ...buildPaginationMeta(result),
    };
  },

  async getProviderHealth() {
    const settings = await this.ensurePlatformSettings();
    return {
      providers: settings.providers.map((p) => ({
        id: p.provider,
        name: p.provider,
        configured: Boolean(p.configured),
        status: p.status,
        lastTested: p.lastTestedAt?.toISOString?.() ?? null,
        maskedIdentifier: p.maskedIdentifier,
        errorSummary: p.errorSummary,
      })),
    };
  },

  async ensurePlatformSettings() {
    let doc = await PlatformSettingsModel.findOne({ singletonKey: 'platform' });
    if (!doc) {
      doc = await PlatformSettingsModel.create({
        singletonKey: 'platform',
        providers: PLATFORM_PROVIDERS.map((provider) => {
          const fromEnv = providerConfiguredFromEnv(provider);
          return {
            provider,
            configured: fromEnv.configured,
            status: fromEnv.status,
            maskedIdentifier: fromEnv.maskedIdentifier,
            lastTestedAt: null,
            errorSummary: null,
            publicConfig: {},
          };
        }),
      });
    } else {
      // Merge any missing providers from env snapshot
      const existing = new Set(doc.providers.map((p) => p.provider));
      for (const provider of PLATFORM_PROVIDERS) {
        if (!existing.has(provider)) {
          const fromEnv = providerConfiguredFromEnv(provider);
          doc.providers.push({
            provider,
            configured: fromEnv.configured,
            status: fromEnv.status,
            maskedIdentifier: fromEnv.maskedIdentifier,
            lastTestedAt: null,
            errorSummary: null,
            publicConfig: {},
            secretsCiphertext: null,
          } as never);
        }
      }
      await doc.save();
    }
    return doc;
  },

  async getPlatformSettings() {
    const doc = await this.ensurePlatformSettings();
    return {
      maintenanceMode: Boolean(doc.maintenanceMode),
      featureFlags: doc.featureFlags || {},
      providers: doc.providers.map((p) => ({
        id: p.provider,
        name: p.provider,
        configured: Boolean(p.configured),
        status: p.status,
        lastTested: p.lastTestedAt?.toISOString?.() ?? null,
        maskedIdentifier: p.maskedIdentifier,
        errorSummary: p.errorSummary,
        publicConfig: p.publicConfig || {},
      })),
      updatedAt: doc.updatedAt.toISOString(),
    };
  },

  async updatePlatformSettings(
    input: {
      maintenanceMode?: boolean;
      featureFlags?: Record<string, unknown>;
      providers?: Array<{
        provider: PlatformProviderId;
        configured?: boolean;
        status?: string;
        maskedIdentifier?: string | null;
        errorSummary?: string | null;
        publicConfig?: Record<string, unknown>;
        secretValue?: string;
      }>;
    },
    actorUserId: string
  ) {
    const doc = await this.ensurePlatformSettings();
    if (input.maintenanceMode !== undefined) doc.maintenanceMode = input.maintenanceMode;
    if (input.featureFlags) {
      doc.featureFlags = { ...(doc.featureFlags as object), ...input.featureFlags };
    }
    if (input.providers) {
      for (const patch of input.providers) {
        let row = doc.providers.find((p) => p.provider === patch.provider);
        if (!row) {
          doc.providers.push({
            provider: patch.provider,
            configured: false,
            status: 'not_configured',
            maskedIdentifier: null,
            lastTestedAt: null,
            errorSummary: null,
            publicConfig: {},
            secretsCiphertext: null,
          } as never);
          row = doc.providers.find((p) => p.provider === patch.provider)!;
        }
        if (patch.configured !== undefined) row.configured = patch.configured;
        if (patch.status !== undefined) row.status = patch.status as typeof row.status;
        if (patch.maskedIdentifier !== undefined) {
          row.maskedIdentifier = patch.maskedIdentifier;
        }
        if (patch.errorSummary !== undefined) row.errorSummary = patch.errorSummary;
        if (patch.publicConfig) {
          row.publicConfig = { ...(row.publicConfig as object), ...patch.publicConfig };
        }
        if (patch.secretValue) {
          row.secretsCiphertext = serializeEncryptedField(encryptField(patch.secretValue));
          row.configured = true;
          row.maskedIdentifier = maskSecretKey(patch.secretValue);
          row.status = 'connected';
          row.lastTestedAt = new Date();
          row.errorSummary = null;
          decryptField(deserializeEncryptedField(row.secretsCiphertext));
        }
      }
    }
    doc.updatedByUserId = new mongoose.Types.ObjectId(actorUserId);
    await doc.save();
    return this.getPlatformSettings();
  },

  async listBlog(query: { page: number; limit: number; status?: string; q?: string }) {
    const filter: Record<string, unknown> = { deletedAt: null };
    if (query.status) filter.status = query.status;
    if (query.q) filter.title = new RegExp(query.q, 'i');
    const result = await paginateQuery(BlogArticleModel, filter, query.page, query.limit);
    return {
      items: result.items.map((a) => toPublicBlog(a as BlogArticleDocument)),
      ...buildPaginationMeta(result),
    };
  },

  async getBlog(id: string) {
    const doc = await BlogArticleModel.findOne({ _id: id, deletedAt: null });
    if (!doc) throw AppError.notFound('Article not found');
    return toPublicBlog(doc);
  },

  async createBlog(
    input: {
      title: string;
      slug?: string;
      category?: string;
      author?: string;
      excerpt?: string;
      body?: string;
      seoStatus?: string;
    },
    actorUserId: string
  ) {
    const slug = input.slug?.trim() || slugify(input.title);
    const existing = await BlogArticleModel.findOne({ slug, deletedAt: null });
    if (existing) throw AppError.conflict('Slug already exists');
    const doc = await BlogArticleModel.create({
      ...input,
      slug,
      createdByUserId: actorUserId,
      updatedByUserId: actorUserId,
    });
    return toPublicBlog(doc);
  },

  async updateBlog(id: string, input: Record<string, unknown>, actorUserId: string) {
    const doc = await BlogArticleModel.findOne({ _id: id, deletedAt: null });
    if (!doc) throw AppError.notFound('Article not found');
    for (const key of [
      'title',
      'slug',
      'category',
      'author',
      'excerpt',
      'body',
      'seoStatus',
      'status',
    ] as const) {
      if (input[key] !== undefined) {
        (doc as unknown as Record<string, unknown>)[key] = input[key];
      }
    }
    doc.updatedByUserId = new mongoose.Types.ObjectId(actorUserId);
    await doc.save();
    return toPublicBlog(doc);
  },

  async deleteBlog(id: string) {
    const doc = await BlogArticleModel.findOne({ _id: id, deletedAt: null });
    if (!doc) throw AppError.notFound('Article not found');
    doc.deletedAt = new Date();
    doc.status = 'archived';
    await doc.save();
    return { deleted: true };
  },

  async publishBlog(id: string, actorUserId: string) {
    const doc = await BlogArticleModel.findOne({ _id: id, deletedAt: null });
    if (!doc) throw AppError.notFound('Article not found');
    doc.status = 'published';
    doc.publishedAt = new Date();
    doc.updatedByUserId = new mongoose.Types.ObjectId(actorUserId);
    await doc.save();
    return toPublicBlog(doc);
  },

  async unpublishBlog(id: string, actorUserId: string) {
    const doc = await BlogArticleModel.findOne({ _id: id, deletedAt: null });
    if (!doc) throw AppError.notFound('Article not found');
    doc.status = 'draft';
    doc.updatedByUserId = new mongoose.Types.ObjectId(actorUserId);
    await doc.save();
    return toPublicBlog(doc);
  },
};
