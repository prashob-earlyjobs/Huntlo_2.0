import { Router } from 'express';

import { requireAuth } from '../../middleware/auth.js';
import { getRequestId } from '../../middleware/request-id.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { recordAdminMutation } from './admin-audit.js';
import {
  adminJobIdParamSchema,
  adminJobsService,
  listAdminJobsSchema,
} from './admin-jobs.service.js';
import { requireAdmin, requireAdminPermission } from './require-admin.js';

const adminAuth = [requireAuth, requireAdmin];

export const adminJobsRouter = Router();

adminJobsRouter.get(
  '/',
  ...adminAuth,
  requireAdminPermission('admin:jobs:read'),
  asyncHandler(async (req, res) => {
    const query = listAdminJobsSchema.parse(req.query);
    const data = await adminJobsService.list(query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

adminJobsRouter.get(
  '/failed-summary',
  ...adminAuth,
  requireAdminPermission('admin:jobs:read'),
  asyncHandler(async (req, res) => {
    const data = await adminJobsService.failedSummary();
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

adminJobsRouter.get(
  '/:id',
  ...adminAuth,
  requireAdminPermission('admin:jobs:read'),
  asyncHandler(async (req, res) => {
    const { id } = adminJobIdParamSchema.parse(req.params);
    const data = await adminJobsService.get(id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

adminJobsRouter.post(
  '/:id/retry',
  ...adminAuth,
  requireAdminPermission('admin:jobs:write'),
  asyncHandler(async (req, res) => {
    const { id } = adminJobIdParamSchema.parse(req.params);
    const data = await adminJobsService.retry(id);
    await recordAdminMutation(req, {
      action: 'admin.job.retried',
      relatedEntityType: 'background_job',
      relatedEntityId: id,
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

adminJobsRouter.post(
  '/:id/cancel',
  ...adminAuth,
  requireAdminPermission('admin:jobs:write'),
  asyncHandler(async (req, res) => {
    const { id } = adminJobIdParamSchema.parse(req.params);
    const data = await adminJobsService.cancel(id);
    await recordAdminMutation(req, {
      action: 'admin.job.cancelled',
      relatedEntityType: 'background_job',
      relatedEntityId: id,
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
