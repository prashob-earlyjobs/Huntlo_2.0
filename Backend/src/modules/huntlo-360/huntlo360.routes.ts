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
import { huntlo360Service } from './huntlo360.service.js';
import {
  createWorkflowSchema,
  listCandidatesQuerySchema,
  listWorkflowsQuerySchema,
  transitionBodySchema,
  updateWorkflowSchema,
  workflowIdParamSchema,
} from './huntlo360.validation.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];
const readPerm = requirePermission('huntlo360:view', 'huntlo360:manage');
const writePerm = requirePermission(
  'huntlo360:create',
  'huntlo360:edit',
  'huntlo360:manage'
);
const launchPerm = requirePermission(
  'huntlo360:launch',
  'huntlo360:manage',
  'huntlo360:edit'
);

export const huntlo360Router = Router();

huntlo360Router.get(
  '/workflows',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const query = listWorkflowsQuerySchema.parse(req.query);
    const data = await huntlo360Service.list(req.organizationId!, query);
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

huntlo360Router.post(
  '/workflows',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const body = createWorkflowSchema.parse(req.body ?? {});
    const data = await huntlo360Service.create(
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

huntlo360Router.get(
  '/workflows/:id',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = workflowIdParamSchema.parse(req.params);
    const data = await huntlo360Service.get(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

huntlo360Router.patch(
  '/workflows/:id',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = workflowIdParamSchema.parse(req.params);
    const body = updateWorkflowSchema.parse(req.body ?? {});
    const data = await huntlo360Service.update(
      req.organizationId!,
      req.userId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

huntlo360Router.delete(
  '/workflows/:id',
  ...orgAuth,
  requirePermission('huntlo360:delete', 'huntlo360:edit', 'huntlo360:manage'),
  asyncHandler(async (req, res) => {
    const { id } = workflowIdParamSchema.parse(req.params);
    const data = await huntlo360Service.remove(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

huntlo360Router.post(
  '/workflows/:id/validate',
  ...orgAuth,
  launchPerm,
  asyncHandler(async (req, res) => {
    const { id } = workflowIdParamSchema.parse(req.params);
    const data = await huntlo360Service.validate(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

huntlo360Router.post(
  '/workflows/:id/launch',
  ...orgAuth,
  launchPerm,
  asyncHandler(async (req, res) => {
    const { id } = workflowIdParamSchema.parse(req.params);
    const data = await huntlo360Service.launch(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

huntlo360Router.post(
  '/workflows/:id/pause',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = workflowIdParamSchema.parse(req.params);
    const data = await huntlo360Service.pause(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

huntlo360Router.post(
  '/workflows/:id/resume',
  ...orgAuth,
  launchPerm,
  asyncHandler(async (req, res) => {
    const { id } = workflowIdParamSchema.parse(req.params);
    const data = await huntlo360Service.resume(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

huntlo360Router.post(
  '/workflows/:id/cancel',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = workflowIdParamSchema.parse(req.params);
    const data = await huntlo360Service.cancel(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

huntlo360Router.get(
  '/workflows/:id/candidates',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = workflowIdParamSchema.parse(req.params);
    const query = listCandidatesQuerySchema.parse(req.query);
    const data = await huntlo360Service.listCandidates(
      req.organizationId!,
      id,
      query
    );
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

huntlo360Router.get(
  '/workflows/:id/stats',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = workflowIdParamSchema.parse(req.params);
    const data = await huntlo360Service.stats(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

huntlo360Router.get(
  '/workflows/:id/exceptions',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = workflowIdParamSchema.parse(req.params);
    const data = await huntlo360Service.exceptions(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

huntlo360Router.post(
  '/workflows/:id/transitions',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = workflowIdParamSchema.parse(req.params);
    const body = transitionBodySchema.parse(req.body ?? {});
    const data = await huntlo360Service.transition(
      req.organizationId!,
      req.userId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
