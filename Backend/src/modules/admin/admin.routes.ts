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
  createWhatsAppTemplateSchema,
  listEmailTemplatesQuerySchema,
  patchPlanFeatureAccessSchema,
  patchSearchVendorSchema,
  patchPlatformSettingsSchema,
  resetPasswordSchema,
  featureAccessWorkspaceQuerySchema,
  upsertWorkspaceFeatureAccessSchema,
  sendEmailTemplateTestSchema,
  sendWhatsAppTemplateTestSchema,
  updateAdminUserSchema,
  updateBlogSchema,
  updateEmailTemplateSchema,
  updateWhatsAppTemplateSchema,
} from './admin.validation.js';
import { emailTemplatesService } from './email-templates.service.js';
import { whatsappTemplatesService } from './whatsapp-templates.service.js';
import { requireAdmin, requireAdminPermission } from './require-admin.js';
import { featureAccessService } from './feature-access.service.js';
import { utmService } from '../utm/utm.service.js';
import {
  attributedVisitsQuerySchema,
  createUtmCampaignSchema,
  listUtmCampaignsQuerySchema,
  updateUtmCampaignSchema,
} from '../utm/utm.validation.js';

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
      metadata: { metric: body.metric, used: body.used },
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

/** Feature access — plan defaults and workspace exceptions */
adminConsoleRouter.get(
  '/feature-access',
  ...adminAuth,
  requireAdminPermission('admin:plans:read'),
  asyncHandler(async (req, res) => {
    const data = await featureAccessService.getOverview();
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.get(
  '/feature-access/workspaces',
  ...adminAuth,
  requireAdminPermission('admin:plans:read'),
  asyncHandler(async (req, res) => {
    const query = featureAccessWorkspaceQuerySchema.parse(req.query);
    const data = await featureAccessService.searchWorkspaces(query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.get(
  '/feature-access/workspaces/:organizationId',
  ...adminAuth,
  requireAdminPermission('admin:plans:read'),
  asyncHandler(async (req, res) => {
    const data = await featureAccessService.getWorkspace(String(req.params.organizationId));
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.patch(
  '/feature-access/plans/:planId',
  ...adminAuth,
  requireAdminPermission('admin:plans:write'),
  asyncHandler(async (req, res) => {
    const body = patchPlanFeatureAccessSchema.parse(req.body ?? {});
    const data = await featureAccessService.setPlanFeature(
      String(req.params.planId),
      body.feature,
      body.enabled
    );
    await recordAdminMutation(req, {
      action: 'admin.feature_access.plan_updated',
      relatedEntityType: 'pricing_plan',
      relatedEntityId: data.id,
      metadata: { feature: body.feature, enabled: body.enabled },
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.put(
  '/feature-access/workspaces/:organizationId',
  ...adminAuth,
  requireAdminPermission('admin:plans:write'),
  asyncHandler(async (req, res) => {
    const body = upsertWorkspaceFeatureAccessSchema.parse(req.body ?? {});
    const data = await featureAccessService.upsertWorkspaceOverrides(
      String(req.params.organizationId),
      body
    );
    await recordAdminMutation(req, {
      action: 'admin.feature_access.exception_updated',
      relatedEntityType: 'organization',
      relatedEntityId: data.organizationId,
      metadata: { features: Object.keys(body.overrides) },
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.delete(
  '/feature-access/workspaces/:organizationId',
  ...adminAuth,
  requireAdminPermission('admin:plans:write'),
  asyncHandler(async (req, res) => {
    const data = await featureAccessService.clearWorkspaceOverrides(
      String(req.params.organizationId)
    );
    await recordAdminMutation(req, {
      action: 'admin.feature_access.exception_cleared',
      relatedEntityType: 'organization',
      relatedEntityId: data.organizationId,
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.get(
  '/feature-access/users',
  ...adminAuth,
  requireAdminPermission('admin:plans:read'),
  asyncHandler(async (req, res) => {
    const query = featureAccessWorkspaceQuerySchema.parse(req.query);
    const data = await featureAccessService.searchUsers(query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.patch(
  '/feature-access/users/:userId/search-vendor',
  ...adminAuth,
  requireAdminPermission('admin:plans:write'),
  asyncHandler(async (req, res) => {
    const body = patchSearchVendorSchema.parse(req.body ?? {});
    const data = await featureAccessService.setUserSearchVendor(
      String(req.params.userId),
      body.vendor
    );
    await recordAdminMutation(req, {
      action: 'admin.feature_access.search_vendor_updated',
      relatedEntityType: 'user',
      relatedEntityId: data.id,
      metadata: { vendor: body.vendor, email: data.email },
    });
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
  '/utm/attributed-visits',
  ...adminAuth,
  requireAdminPermission('admin:usage:read'),
  asyncHandler(async (req, res) => {
    const query = attributedVisitsQuerySchema.parse(req.query);
    const data = await utmService.getAttributedVisitsSummary(query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.get(
  '/utm/attributed-visits/breakdown',
  ...adminAuth,
  requireAdminPermission('admin:usage:read'),
  asyncHandler(async (req, res) => {
    const query = attributedVisitsQuerySchema.parse(req.query);
    const data = await utmService.getAttributedVisitsBreakdown(query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.get(
  '/utm/overview',
  ...adminAuth,
  requireAdminPermission('admin:usage:read'),
  asyncHandler(async (req, res) => {
    const query = attributedVisitsQuerySchema.parse(req.query);
    const data = await utmService.getOverview(query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.get(
  '/utm/campaigns',
  ...adminAuth,
  requireAdminPermission('admin:usage:read'),
  asyncHandler(async (req, res) => {
    const query = listUtmCampaignsQuerySchema.parse(req.query);
    const data = await utmService.listCampaigns(query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.post(
  '/utm/campaigns',
  ...adminAuth,
  requireAdminPermission('admin:utm:write', 'admin:usage:read'),
  asyncHandler(async (req, res) => {
    const body = createUtmCampaignSchema.parse(req.body ?? {});
    const data = await utmService.createCampaign(body, req.auth!.sub);
    await recordAdminMutation(req, {
      action: 'admin.utm.campaign.created',
      relatedEntityType: 'utm_campaign',
      relatedEntityId: data.id,
    });
    successResponse(res, data, {
      statusCode: 201,
      meta: { requestId: getRequestId(req) },
    });
  })
);
adminConsoleRouter.patch(
  '/utm/campaigns/:id',
  ...adminAuth,
  requireAdminPermission('admin:utm:write', 'admin:usage:read'),
  asyncHandler(async (req, res) => {
    const body = updateUtmCampaignSchema.parse(req.body ?? {});
    const data = await utmService.updateCampaign(String(req.params.id), body);
    await recordAdminMutation(req, {
      action: 'admin.utm.campaign.updated',
      relatedEntityType: 'utm_campaign',
      relatedEntityId: data.id,
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.post(
  '/utm/campaigns/:id/archive',
  ...adminAuth,
  requireAdminPermission('admin:utm:write', 'admin:usage:read'),
  asyncHandler(async (req, res) => {
    const data = await utmService.archiveCampaign(String(req.params.id));
    await recordAdminMutation(req, {
      action: 'admin.utm.campaign.archived',
      relatedEntityType: 'utm_campaign',
      relatedEntityId: data.id,
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
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
        metricCostsUpdated: Boolean(body.metricCosts),
        metricCosts: body.metricCosts ?? undefined,
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

/** Email templates (post-signup drip and future sequence types) */
adminConsoleRouter.get(
  '/email-templates',
  ...adminAuth,
  requireAdminPermission('admin:email-templates:read'),
  asyncHandler(async (req, res) => {
    const query = listEmailTemplatesQuerySchema.parse(req.query);
    const data = await emailTemplatesService.list(query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.get(
  '/email-templates/:id',
  ...adminAuth,
  requireAdminPermission('admin:email-templates:read'),
  asyncHandler(async (req, res) => {
    const data = await emailTemplatesService.get(String(req.params.id));
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.patch(
  '/email-templates/:id',
  ...adminAuth,
  requireAdminPermission('admin:email-templates:write'),
  asyncHandler(async (req, res) => {
    const body = updateEmailTemplateSchema.parse(req.body ?? {});
    const data = await emailTemplatesService.update(String(req.params.id), body, req.auth!.sub);
    await recordAdminMutation(req, {
      action: 'admin.email_template.updated',
      relatedEntityType: 'email_template',
      relatedEntityId: data.id,
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.post(
  '/email-templates/:id/send-test',
  ...adminAuth,
  requireAdminPermission('admin:email-templates:write'),
  asyncHandler(async (req, res) => {
    const body = sendEmailTemplateTestSchema.parse(req.body ?? {});
    const data = await emailTemplatesService.sendTest(String(req.params.id), body);
    await recordAdminMutation(req, {
      action: 'admin.email_template.test_sent',
      relatedEntityType: 'email_template',
      relatedEntityId: String(req.params.id),
      metadata: { to: data.to, sent: data.sent },
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

/** WhatsApp message templates (admin-managed copy; delivery wiring separate) */
adminConsoleRouter.get(
  '/whatsapp-templates',
  ...adminAuth,
  requireAdminPermission('admin:email-templates:read'),
  asyncHandler(async (req, res) => {
    const data = await whatsappTemplatesService.list();
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.post(
  '/whatsapp-templates',
  ...adminAuth,
  requireAdminPermission('admin:email-templates:write'),
  asyncHandler(async (req, res) => {
    const body = createWhatsAppTemplateSchema.parse(req.body ?? {});
    const data = await whatsappTemplatesService.create(body, req.auth!.sub);
    await recordAdminMutation(req, {
      action: 'admin.whatsapp_template.created',
      relatedEntityType: 'whatsapp_template',
      relatedEntityId: data.id,
    });
    successResponse(res, data, { statusCode: 201, meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.get(
  '/whatsapp-templates/:id',
  ...adminAuth,
  requireAdminPermission('admin:email-templates:read'),
  asyncHandler(async (req, res) => {
    const data = await whatsappTemplatesService.get(String(req.params.id));
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.patch(
  '/whatsapp-templates/:id',
  ...adminAuth,
  requireAdminPermission('admin:email-templates:write'),
  asyncHandler(async (req, res) => {
    const body = updateWhatsAppTemplateSchema.parse(req.body ?? {});
    const data = await whatsappTemplatesService.update(
      String(req.params.id),
      body,
      req.auth!.sub
    );
    await recordAdminMutation(req, {
      action: 'admin.whatsapp_template.updated',
      relatedEntityType: 'whatsapp_template',
      relatedEntityId: data.id,
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.delete(
  '/whatsapp-templates/:id',
  ...adminAuth,
  requireAdminPermission('admin:email-templates:write'),
  asyncHandler(async (req, res) => {
    const data = await whatsappTemplatesService.remove(String(req.params.id));
    await recordAdminMutation(req, {
      action: 'admin.whatsapp_template.deleted',
      relatedEntityType: 'whatsapp_template',
      relatedEntityId: String(req.params.id),
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
adminConsoleRouter.post(
  '/whatsapp-templates/:id/send-test',
  ...adminAuth,
  requireAdminPermission('admin:email-templates:write'),
  asyncHandler(async (req, res) => {
    const body = sendWhatsAppTemplateTestSchema.parse(req.body ?? {});
    const data = await whatsappTemplatesService.sendTest(String(req.params.id), body);
    await recordAdminMutation(req, {
      action: 'admin.whatsapp_template.test_sent',
      relatedEntityType: 'whatsapp_template',
      relatedEntityId: String(req.params.id),
      metadata: { to: data.to, sent: data.sent },
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
