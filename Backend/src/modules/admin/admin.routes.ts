import { Router } from 'express';

import { requireAuth } from '../../middleware/auth.js';
import { getRequestId } from '../../middleware/request-id.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { adminJobsService } from './admin-jobs.service.js';
import { recordAdminMutation } from './admin-audit.js';
import { adminConsoleService } from './admin-console.service.js';
import { adminUsageAnalyticsService } from './admin-usage-analytics.service.js';
import {
  adjustQuotaSchema,
  adminListQuerySchema,
  adminUsageAnalyticsQuerySchema,
  adminUsageHistoryQuerySchema,
  assignPlanSchema,
  createAdminUserSchema,
  createBlogSchema,
  patchPlatformSettingsSchema,
  resetPasswordSchema,
  updateAdminUserSchema,
  updateBlogSchema,
} from './admin.validation.js';
import { requireAdmin, requireAdminPermission } from './require-admin.js';

const adminAuth = [requireAuth, requireAdmin];

export const adminConsoleRouter = Router();

/** Dashboard */
adminConsoleRouter.get(
  '/dashboard',
  ...adminAuth,
  requireAdminPermission('admin:dashboard:read'),
  asyncHandler(async (req, res) => {
    const data = await adminConsoleService.getDashboard();
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.get(
  '/metrics',
  ...adminAuth,
  requireAdminPermission('admin:dashboard:read'),
  asyncHandler(async (req, res) => {
    const data = await adminConsoleService.getDashboard();
    successResponse(res, data.metrics, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.get(
  '/charts',
  ...adminAuth,
  requireAdminPermission('admin:dashboard:read'),
  asyncHandler(async (req, res) => {
    const data = await adminConsoleService.getDashboard();
    successResponse(res, data.charts, { meta: { requestId: getRequestId(req) } });
  })
);

/** Users */
adminConsoleRouter.get(
  '/users',
  ...adminAuth,
  requireAdminPermission('admin:users:read'),
  asyncHandler(async (req, res) => {
    const query = adminListQuerySchema.parse(req.query);
    const data = await adminConsoleService.listUsers(query);
    successResponse(res, data, {
      meta: { requestId: getRequestId(req), pagination: data },
    });
  })
);
adminConsoleRouter.post(
  '/users',
  ...adminAuth,
  requireAdminPermission('admin:users:write'),
  asyncHandler(async (req, res) => {
    const body = createAdminUserSchema.parse(req.body ?? {});
    const data = await adminConsoleService.createUser(body);
    await recordAdminMutation(req, {
      action: 'admin.user.created',
      relatedEntityType: 'user',
      relatedEntityId: data.id,
      metadata: { role: body.role },
    });
    successResponse(res, data, { statusCode: 201, meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.get(
  '/users/:id',
  ...adminAuth,
  requireAdminPermission('admin:users:read'),
  asyncHandler(async (req, res) => {
    const data = await adminConsoleService.getUser(String(req.params.id));
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.patch(
  '/users/:id',
  ...adminAuth,
  requireAdminPermission('admin:users:write'),
  asyncHandler(async (req, res) => {
    const body = updateAdminUserSchema.parse(req.body ?? {});
    const data = await adminConsoleService.updateUser(String(req.params.id), body);
    await recordAdminMutation(req, {
      action: 'admin.user.updated',
      relatedEntityType: 'user',
      relatedEntityId: data.id,
      metadata: { fields: Object.keys(body) },
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.post(
  '/users/:id/suspend',
  ...adminAuth,
  requireAdminPermission('admin:users:suspend'),
  asyncHandler(async (req, res) => {
    const data = await adminConsoleService.suspendUser(String(req.params.id));
    await recordAdminMutation(req, {
      action: 'admin.user.suspended',
      relatedEntityType: 'user',
      relatedEntityId: data.id,
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.post(
  '/users/:id/activate',
  ...adminAuth,
  requireAdminPermission('admin:users:suspend'),
  asyncHandler(async (req, res) => {
    const data = await adminConsoleService.activateUser(String(req.params.id));
    await recordAdminMutation(req, {
      action: 'admin.user.activated',
      relatedEntityType: 'user',
      relatedEntityId: data.id,
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.post(
  '/users/:id/reset-password',
  ...adminAuth,
  requireAdminPermission('admin:users:write'),
  asyncHandler(async (req, res) => {
    const body = resetPasswordSchema.parse(req.body ?? {});
    const data = await adminConsoleService.resetPassword(
      String(req.params.id),
      body.newPassword
    );
    await recordAdminMutation(req, {
      action: 'admin.user.password_reset',
      relatedEntityType: 'user',
      relatedEntityId: String(req.params.id),
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.post(
  '/users/:id/assign-plan',
  ...adminAuth,
  requireAdminPermission('admin:users:write', 'admin:plans:write'),
  asyncHandler(async (req, res) => {
    const body = assignPlanSchema.parse(req.body ?? {});
    const data = await adminConsoleService.assignPlan(String(req.params.id), body.plan);
    await recordAdminMutation(req, {
      action: 'admin.user.plan_assigned',
      relatedEntityType: 'user',
      relatedEntityId: data.id,
      metadata: { plan: body.plan },
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.post(
  '/users/:id/adjust-quota',
  ...adminAuth,
  requireAdminPermission('admin:users:quota'),
  asyncHandler(async (req, res) => {
    const body = adjustQuotaSchema.parse(req.body ?? {});
    const data = await adminConsoleService.adjustQuota(String(req.params.id), body);
    await recordAdminMutation(req, {
      action: 'admin.user.quota_adjusted',
      relatedEntityType: 'user',
      relatedEntityId: String(req.params.id),
      metadata: { metric: body.metric, delta: body.delta },
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

/** Organizations */
adminConsoleRouter.get(
  '/organizations',
  ...adminAuth,
  requireAdminPermission('admin:organizations:read'),
  asyncHandler(async (req, res) => {
    const query = adminListQuerySchema.parse(req.query);
    const data = await adminConsoleService.listOrganizations(query);
    successResponse(res, data, { meta: { requestId: getRequestId(req), pagination: data } });
  })
);
adminConsoleRouter.get(
  '/organizations/:id',
  ...adminAuth,
  requireAdminPermission('admin:organizations:read'),
  asyncHandler(async (req, res) => {
    const data = await adminConsoleService.getOrganization(String(req.params.id));
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

/** Usage + domain browse */
adminConsoleRouter.get(
  '/usage',
  ...adminAuth,
  requireAdminPermission('admin:usage:read'),
  asyncHandler(async (req, res) => {
    const data = await adminConsoleService.getUsageOverview();
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.get(
  '/usage-analytics/summary',
  ...adminAuth,
  requireAdminPermission('admin:usage:read'),
  asyncHandler(async (req, res) => {
    const query = adminUsageAnalyticsQuerySchema.parse(req.query);
    const data = await adminUsageAnalyticsService.getSummary(query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.get(
  '/usage-analytics/history',
  ...adminAuth,
  requireAdminPermission('admin:usage:read'),
  asyncHandler(async (req, res) => {
    const query = adminUsageHistoryQuerySchema.parse(req.query);
    const data = await adminUsageAnalyticsService.listHistory(query);
    successResponse(res, data, {
      meta: {
        requestId: getRequestId(req),
        pagination: data.pagination,
      },
    });
  })
);
adminConsoleRouter.get(
  '/candidates',
  ...adminAuth,
  requireAdminPermission('admin:candidates:read'),
  asyncHandler(async (req, res) => {
    const query = adminListQuerySchema.parse(req.query);
    const data = await adminConsoleService.listCandidates(query);
    successResponse(res, data, { meta: { requestId: getRequestId(req), pagination: data } });
  })
);
adminConsoleRouter.get(
  '/sourcing-sessions',
  ...adminAuth,
  requireAdminPermission('admin:sourcing:read'),
  asyncHandler(async (req, res) => {
    const query = adminListQuerySchema.parse(req.query);
    const data = await adminConsoleService.listSourcingSessions(query);
    successResponse(res, data, { meta: { requestId: getRequestId(req), pagination: data } });
  })
);
adminConsoleRouter.get(
  '/campaigns',
  ...adminAuth,
  requireAdminPermission('admin:campaigns:read'),
  asyncHandler(async (req, res) => {
    const query = adminListQuerySchema.parse(req.query);
    const data = await adminConsoleService.listCampaigns(query);
    successResponse(res, data, { meta: { requestId: getRequestId(req), pagination: data } });
  })
);
adminConsoleRouter.get(
  '/screenings',
  ...adminAuth,
  requireAdminPermission('admin:screenings:read'),
  asyncHandler(async (req, res) => {
    const query = adminListQuerySchema.parse(req.query);
    const data = await adminConsoleService.listScreenings(query);
    successResponse(res, data, { meta: { requestId: getRequestId(req), pagination: data } });
  })
);
adminConsoleRouter.get(
  '/interviews',
  ...adminAuth,
  requireAdminPermission('admin:interviews:read'),
  asyncHandler(async (req, res) => {
    const query = adminListQuerySchema.parse(req.query);
    const data = await adminConsoleService.listInterviews(query);
    successResponse(res, data, { meta: { requestId: getRequestId(req), pagination: data } });
  })
);
adminConsoleRouter.get(
  '/background-jobs',
  ...adminAuth,
  requireAdminPermission('admin:jobs:read'),
  asyncHandler(async (req, res) => {
    const query = adminListQuerySchema.parse(req.query);
    const data = await adminConsoleService.listBackgroundJobs(query);
    successResponse(res, data, { meta: { requestId: getRequestId(req), pagination: data } });
  })
);
adminConsoleRouter.get(
  '/webhooks',
  ...adminAuth,
  requireAdminPermission('admin:webhooks:read'),
  asyncHandler(async (req, res) => {
    const query = adminListQuerySchema.parse(req.query);
    const data = await adminConsoleService.listWebhooks(query);
    successResponse(res, data, { meta: { requestId: getRequestId(req), pagination: data } });
  })
);
adminConsoleRouter.get(
  '/provider-health',
  ...adminAuth,
  requireAdminPermission('admin:providers:read'),
  asyncHandler(async (req, res) => {
    const data = await adminConsoleService.getProviderHealth();
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

/** Platform settings */
adminConsoleRouter.get(
  '/platform-settings',
  ...adminAuth,
  requireAdminPermission('admin:settings:read'),
  asyncHandler(async (req, res) => {
    const data = await adminConsoleService.getPlatformSettings();
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.patch(
  '/platform-settings',
  ...adminAuth,
  requireAdminPermission('admin:settings:write'),
  asyncHandler(async (req, res) => {
    const body = patchPlatformSettingsSchema.parse(req.body ?? {});
    const data = await adminConsoleService.updatePlatformSettings(body, req.auth!.sub);
    const promptMeta = body.roshniPrompt
      ? {
          roshniPromptUpdated: true,
          roshniPromptVersion: data.roshniPrompt?.version ?? null,
          introductionLength:
            body.roshniPrompt.introduction === undefined
              ? undefined
              : body.roshniPrompt.introduction === null
                ? 0
                : String(body.roshniPrompt.introduction).trim().length,
          agentPromptLength:
            body.roshniPrompt.agentPrompt === undefined
              ? undefined
              : body.roshniPrompt.agentPrompt === null
                ? 0
                : String(body.roshniPrompt.agentPrompt).trim().length,
          introductionCleared: body.roshniPrompt.introduction === null,
          agentPromptCleared: body.roshniPrompt.agentPrompt === null,
        }
      : {};
    await recordAdminMutation(req, {
      action: 'admin.platform_settings.updated',
      relatedEntityType: 'platform_settings',
      relatedEntityId: 'platform',
      metadata: {
        providers: body.providers?.map((p) => p.provider) ?? [],
        hasSecrets: Boolean(body.providers?.some((p) => p.secretValue)),
        ...promptMeta,
      },
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
/** Alias used by older FE contract */
adminConsoleRouter.get(
  '/settings/providers',
  ...adminAuth,
  requireAdminPermission('admin:settings:read'),
  asyncHandler(async (req, res) => {
    const data = await adminConsoleService.getPlatformSettings();
    successResponse(res, data.providers, { meta: { requestId: getRequestId(req) } });
  })
);

/** Blog */
adminConsoleRouter.get(
  '/blog',
  ...adminAuth,
  requireAdminPermission('admin:blog:read'),
  asyncHandler(async (req, res) => {
    const query = adminListQuerySchema.parse(req.query);
    const data = await adminConsoleService.listBlog(query);
    successResponse(res, data, { meta: { requestId: getRequestId(req), pagination: data } });
  })
);
adminConsoleRouter.post(
  '/blog',
  ...adminAuth,
  requireAdminPermission('admin:blog:write'),
  asyncHandler(async (req, res) => {
    const body = createBlogSchema.parse(req.body ?? {});
    const data = await adminConsoleService.createBlog(body, req.auth!.sub);
    await recordAdminMutation(req, {
      action: 'admin.blog.created',
      relatedEntityType: 'blog_article',
      relatedEntityId: data.id,
    });
    successResponse(res, data, { statusCode: 201, meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.get(
  '/blog/:id',
  ...adminAuth,
  requireAdminPermission('admin:blog:read'),
  asyncHandler(async (req, res) => {
    const data = await adminConsoleService.getBlog(String(req.params.id));
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.patch(
  '/blog/:id',
  ...adminAuth,
  requireAdminPermission('admin:blog:write'),
  asyncHandler(async (req, res) => {
    const body = updateBlogSchema.parse(req.body ?? {});
    const data = await adminConsoleService.updateBlog(
      String(req.params.id),
      body,
      req.auth!.sub
    );
    await recordAdminMutation(req, {
      action: 'admin.blog.updated',
      relatedEntityType: 'blog_article',
      relatedEntityId: data.id,
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.delete(
  '/blog/:id',
  ...adminAuth,
  requireAdminPermission('admin:blog:write'),
  asyncHandler(async (req, res) => {
    const data = await adminConsoleService.deleteBlog(String(req.params.id));
    await recordAdminMutation(req, {
      action: 'admin.blog.deleted',
      relatedEntityType: 'blog_article',
      relatedEntityId: String(req.params.id),
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.post(
  '/blog/:id/publish',
  ...adminAuth,
  requireAdminPermission('admin:blog:write'),
  asyncHandler(async (req, res) => {
    const data = await adminConsoleService.publishBlog(String(req.params.id), req.auth!.sub);
    await recordAdminMutation(req, {
      action: 'admin.blog.published',
      relatedEntityType: 'blog_article',
      relatedEntityId: data.id,
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.post(
  '/blog/:id/unpublish',
  ...adminAuth,
  requireAdminPermission('admin:blog:write'),
  asyncHandler(async (req, res) => {
    const data = await adminConsoleService.unpublishBlog(String(req.params.id), req.auth!.sub);
    await recordAdminMutation(req, {
      action: 'admin.blog.unpublished',
      relatedEntityType: 'blog_article',
      relatedEntityId: data.id,
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

// Keep job retry/cancel under platform admin as well (alongside legacy mount).
adminConsoleRouter.post(
  '/background-jobs/:id/retry',
  ...adminAuth,
  requireAdminPermission('admin:jobs:write'),
  asyncHandler(async (req, res) => {
    const data = await adminJobsService.retry(String(req.params.id));
    await recordAdminMutation(req, {
      action: 'admin.job.retried',
      relatedEntityType: 'background_job',
      relatedEntityId: String(req.params.id),
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.post(
  '/background-jobs/:id/cancel',
  ...adminAuth,
  requireAdminPermission('admin:jobs:write'),
  asyncHandler(async (req, res) => {
    const data = await adminJobsService.cancel(String(req.params.id));
    await recordAdminMutation(req, {
      action: 'admin.job.cancelled',
      relatedEntityType: 'background_job',
      relatedEntityId: String(req.params.id),
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
