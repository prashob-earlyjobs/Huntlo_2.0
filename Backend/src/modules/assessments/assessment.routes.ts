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
import { assessmentsService } from './assessment.service.js';
import {
  campaignIdParamSchema,
  createCampaignSchema,
  createTemplateSchema,
  listCampaignsQuerySchema,
  listResultsQuerySchema,
  listTemplatesQuerySchema,
  resultIdParamSchema,
  templateIdParamSchema,
  updateTemplateSchema,
} from './assessment.validation.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];
const readPerm = requirePermission('assessments:view', 'assessments:manage');
const writePerm = requirePermission(
  'assessments:create',
  'assessments:edit',
  'assessments:manage'
);
const launchPerm = requirePermission(
  'assessments:launch',
  'assessments:edit',
  'assessments:manage'
);

export const assessmentsRouter = Router();

// --- Templates ---

assessmentsRouter.get(
  '/templates',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const query = listTemplatesQuerySchema.parse(req.query);
    const data = await assessmentsService.listTemplates(req.organizationId!, query);
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

assessmentsRouter.post(
  '/templates',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const body = createTemplateSchema.parse(req.body ?? {});
    const data = await assessmentsService.createTemplate(
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

assessmentsRouter.get(
  '/templates/:id',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = templateIdParamSchema.parse(req.params);
    const data = await assessmentsService.getTemplate(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

assessmentsRouter.patch(
  '/templates/:id',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = templateIdParamSchema.parse(req.params);
    const body = updateTemplateSchema.parse(req.body ?? {});
    const data = await assessmentsService.updateTemplate(req.organizationId!, id, body);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

assessmentsRouter.delete(
  '/templates/:id',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = templateIdParamSchema.parse(req.params);
    const data = await assessmentsService.deleteTemplate(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

// --- Results (before /campaigns/:id to avoid param conflicts) ---

assessmentsRouter.get(
  '/results',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const query = listResultsQuerySchema.parse(req.query);
    const data = await assessmentsService.listResults(req.organizationId!, query);
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

assessmentsRouter.get(
  '/results/:id',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = resultIdParamSchema.parse(req.params);
    const data = await assessmentsService.getResult(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

// --- Campaigns ---

assessmentsRouter.get(
  '/campaigns',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const query = listCampaignsQuerySchema.parse(req.query);
    const data = await assessmentsService.listCampaigns(req.organizationId!, query);
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

assessmentsRouter.post(
  '/campaigns',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const body = createCampaignSchema.parse(req.body ?? {});
    const data = await assessmentsService.createCampaign(
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

assessmentsRouter.get(
  '/campaigns/:id',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const data = await assessmentsService.getCampaign(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

assessmentsRouter.post(
  '/campaigns/:id/launch',
  ...orgAuth,
  launchPerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const data = await assessmentsService.launch(req.organizationId!, req.userId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

assessmentsRouter.post(
  '/campaigns/:id/remind',
  ...orgAuth,
  launchPerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const data = await assessmentsService.remind(req.organizationId!, req.userId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

assessmentsRouter.post(
  '/campaigns/:id/cancel',
  ...orgAuth,
  launchPerm,
  asyncHandler(async (req, res) => {
    const { id } = campaignIdParamSchema.parse(req.params);
    const data = await assessmentsService.cancel(req.organizationId!, req.userId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

// --- Compatibility aliases for thin FE client (GET /assessments) ---

assessmentsRouter.get(
  '/',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const data = await assessmentsService.listSummaries(req.organizationId!);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
