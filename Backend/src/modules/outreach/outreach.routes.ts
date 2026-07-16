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
import { outreachAiService } from './ai.service.js';
import { sequenceTemplatesService } from './sequences.service.js';
import { outreachTemplatesService } from './templates.service.js';
import { listAllowedVariables } from './variables.js';
import {
  createSequenceTemplateSchema,
  createTemplateSchema,
  generateOutreachSchema,
  idParamSchema,
  listSequenceTemplatesQuerySchema,
  listTemplatesQuerySchema,
  previewTemplateSchema,
  rewriteOutreachSchema,
  updateSequenceTemplateSchema,
  updateTemplateSchema,
  validateVariablesSchema,
} from './outreach.validation.js';
import { campaignRoutes } from './campaign.routes.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];
const readPerm = requirePermission('outreach:view', 'outreach:manage');
const writePerm = requirePermission(
  'outreach:create',
  'outreach:edit',
  'outreach:manage'
);

export const outreachRouter = Router();

outreachRouter.use('/campaigns', campaignRoutes);

/* ------------------------------------------------------------------ */
/* Templates                                                            */
/* ------------------------------------------------------------------ */

outreachRouter.get(
  '/templates/variables',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    successResponse(
      res,
      { variables: listAllowedVariables() },
      { meta: { requestId: getRequestId(req) } }
    );
  })
);

outreachRouter.get(
  '/templates',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const query = listTemplatesQuerySchema.parse(req.query);
    const data = await outreachTemplatesService.list(req.organizationId!, query);
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

outreachRouter.post(
  '/templates',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const body = createTemplateSchema.parse(req.body ?? {});
    const data = await outreachTemplatesService.create(
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

outreachRouter.get(
  '/templates/:id',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const data = await outreachTemplatesService.get(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

outreachRouter.patch(
  '/templates/:id',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = updateTemplateSchema.parse(req.body ?? {});
    const data = await outreachTemplatesService.update(
      req.organizationId!,
      req.userId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

outreachRouter.delete(
  '/templates/:id',
  ...orgAuth,
  requirePermission('outreach:edit', 'outreach:delete', 'outreach:manage'),
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const data = await outreachTemplatesService.remove(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

outreachRouter.post(
  '/templates/:id/duplicate',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const data = await outreachTemplatesService.duplicate(
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

outreachRouter.post(
  '/templates/:id/preview',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = previewTemplateSchema.parse(req.body ?? {});
    const data = await outreachTemplatesService.preview(
      req.organizationId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

/* ------------------------------------------------------------------ */
/* Sequence templates                                                   */
/* ------------------------------------------------------------------ */

outreachRouter.get(
  '/sequence-templates',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const query = listSequenceTemplatesQuerySchema.parse(req.query);
    const data = await sequenceTemplatesService.list(req.organizationId!, query);
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

outreachRouter.post(
  '/sequence-templates',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const body = createSequenceTemplateSchema.parse(req.body ?? {});
    const data = await sequenceTemplatesService.create(
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

outreachRouter.patch(
  '/sequence-templates/:id',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = updateSequenceTemplateSchema.parse(req.body ?? {});
    const data = await sequenceTemplatesService.update(
      req.organizationId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

outreachRouter.delete(
  '/sequence-templates/:id',
  ...orgAuth,
  requirePermission('outreach:edit', 'outreach:delete', 'outreach:manage'),
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const data = await sequenceTemplatesService.remove(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

/* ------------------------------------------------------------------ */
/* AI + validation                                                      */
/* ------------------------------------------------------------------ */

outreachRouter.post(
  '/generate',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const body = generateOutreachSchema.parse(req.body ?? {});
    const data = await outreachAiService.generate(
      req.organizationId!,
      req.userId!,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

outreachRouter.post(
  '/rewrite',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const body = rewriteOutreachSchema.parse(req.body ?? {});
    const data = await outreachAiService.rewrite(
      req.organizationId!,
      req.userId!,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

outreachRouter.post(
  '/validate-variables',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const body = validateVariablesSchema.parse(req.body ?? {});
    const data = outreachAiService.validateVariables(body);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
