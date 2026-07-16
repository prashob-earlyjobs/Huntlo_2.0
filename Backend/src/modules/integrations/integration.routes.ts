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
import { AppError } from '../../shared/errors/app-error.js';
import { integrationsService } from './integration.service.js';
import {
  connectBodySchema,
  integrationIdParamSchema,
  listIntegrationsQuerySchema,
  patchIntegrationBodySchema,
  providerParamSchema,
} from './integration.validation.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];
const writePerm = requirePermission('integrations:manage', 'integrations:edit');
const readPerm = requirePermission('integrations:view', 'integrations:manage', 'integrations:edit');

export const integrationsRouter = Router();

integrationsRouter.get(
  '/',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const query = listIntegrationsQuerySchema.parse(req.query);
    const data = await integrationsService.list(
      req.organizationId!,
      req.userId!,
      query
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

integrationsRouter.post(
  '/:provider/connect',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { provider } = providerParamSchema.parse(req.params);
    const body = connectBodySchema.parse(req.body ?? {});
    const data = await integrationsService.connect(
      req.organizationId!,
      req.userId!,
      provider,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

integrationsRouter.get(
  '/:provider/callback',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { provider } = providerParamSchema.parse(req.params);
    const data = await integrationsService.handleCallback(
      req.organizationId!,
      req.userId!,
      provider,
      req.query as Record<string, unknown>
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

integrationsRouter.post(
  '/:id/test',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = integrationIdParamSchema.parse(req.params);
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid integration id.');
    }
    const data = await integrationsService.test(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

integrationsRouter.post(
  '/:id/default',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = integrationIdParamSchema.parse(req.params);
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid integration id.');
    }
    const data = await integrationsService.setDefault(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

integrationsRouter.patch(
  '/:id',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = integrationIdParamSchema.parse(req.params);
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid integration id.');
    }
    const body = patchIntegrationBodySchema.parse(req.body ?? {});
    const data = await integrationsService.patch(
      req.organizationId!,
      req.userId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

integrationsRouter.delete(
  '/:id',
  ...orgAuth,
  requirePermission('integrations:manage', 'integrations:edit', 'integrations:delete'),
  asyncHandler(async (req, res) => {
    const { id } = integrationIdParamSchema.parse(req.params);
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid integration id.');
    }
    const data = await integrationsService.disconnect(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

integrationsRouter.get(
  '/:id',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const id = String(req.params.id || '');
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      throw new AppError(404, 'NOT_FOUND', 'Integration not found.');
    }
    const data = await integrationsService.getById(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
