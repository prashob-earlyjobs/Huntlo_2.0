import { Router } from 'express';

import {
  requireAuth,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import { getRequestId } from '../../middleware/request-id.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { campaignsService } from './campaigns.service.js';
import { listLegacyOutreachModuleCampaigns } from './legacy-compat.js';
import {
  audienceBodySchema,
  campaignIdParamSchema,
  createCampaignSchema,
  listCampaignsQuerySchema,
  listEnrollmentsQuerySchema,
  removeAudienceBodySchema,
  scheduleCampaignSchema,
  updateCampaignSchema,
} from './campaign.validation.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];
const readPerm = requirePermission('outreach:view', 'outreach:manage');
const writePerm = requirePermission(
  'outreach:create',
  'outreach:edit',
  'outreach:manage'
);
const launchPerm = requirePermission('outreach:launch', 'outreach:manage', 'outreach:edit');

export const campaignRoutes = Router();

campaignRoutes.get(
  '/',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const query = listCampaignsQuerySchema.parse(req.query);
    const data = await campaignsService.list(req.organizationId!, query);
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

campaignRoutes.post(
  '/',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const body = createCampaignSchema.parse(req.body ?? {});
    const data = await campaignsService.create(
      req.organizationId!,
      req.userId!,
      body
    );
    successResponse(res, data, {
      statusCode: 201,
      meta: { requestId: getRequestId(req) },
    });
  })
);

campaignRoutes.get(
  '/legacy',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const data = await listLegacyOutreachModuleCampaigns(req.userId!);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

campaignRoutes.get(
  '/overview',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const data = await campaignsService.overview(req.organizationId!);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

campaignRoutes.get(
  '/:id',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const data = await campaignsService.get(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

campaignRoutes.patch(
  '/:id',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const body = updateCampaignSchema.parse(req.body ?? {});
    const data = await campaignsService.update(
      req.organizationId!,
      req.userId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

campaignRoutes.delete(
  '/:id',
  ...orgAuth,
  requirePermission('outreach:delete', 'outreach:edit', 'outreach:manage'),
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const data = await campaignsService.remove(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

campaignRoutes.post(
  '/:id/audience',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const body = audienceBodySchema.parse(req.body ?? {});
    const data = await campaignsService.addAudience(
      req.organizationId!,
      req.userId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

campaignRoutes.delete(
  '/:id/audience',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const body = removeAudienceBodySchema.parse(req.body ?? {});
    const data = await campaignsService.removeAudience(
      req.organizationId!,
      req.userId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

campaignRoutes.get(
  '/:id/audience-preview',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const data = await campaignsService.audiencePreview(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

campaignRoutes.post(
  '/:id/validate',
  ...orgAuth,
  launchPerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const data = await campaignsService.validate(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

campaignRoutes.post(
  '/:id/launch',
  ...orgAuth,
  launchPerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const data = await campaignsService.launch(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

campaignRoutes.post(
  '/:id/schedule',
  ...orgAuth,
  launchPerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const body = scheduleCampaignSchema.parse(req.body ?? {});
    const scheduledAt =
      body.scheduledAt instanceof Date
        ? body.scheduledAt
        : new Date(body.scheduledAt);
    const data = await campaignsService.schedule(
      req.organizationId!,
      req.userId!,
      id,
      scheduledAt
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

campaignRoutes.post(
  '/:id/pause',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const data = await campaignsService.pause(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

campaignRoutes.post(
  '/:id/resume',
  ...orgAuth,
  launchPerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const data = await campaignsService.resume(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

campaignRoutes.post(
  '/:id/cancel',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const data = await campaignsService.cancel(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

campaignRoutes.post(
  '/:id/duplicate',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const data = await campaignsService.duplicate(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, {
      statusCode: 201,
      meta: { requestId: getRequestId(req) },
    });
  })
);

campaignRoutes.get(
  '/:id/enrollments',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const query = listEnrollmentsQuerySchema.parse(req.query);
    const data = await campaignsService.listEnrollments(
      req.organizationId!,
      id,
      query
    );
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

campaignRoutes.get(
  '/:id/stats',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const data = await campaignsService.stats(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

campaignRoutes.get(
  '/:id/activity',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const data = await campaignsService.activity(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
