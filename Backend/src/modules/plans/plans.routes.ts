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
import {
  isUsageMetric,
  quotaService,
  type UsageMetric,
} from '../../shared/usage/index.js';
import { AppError } from '../../shared/errors/app-error.js';
import { plansService } from './plans.service.js';
import { listUsageHistoryQuerySchema } from './plans.validation.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];

export const plansRouter = Router();
export const usageRouter = Router();

plansRouter.get(
  '/',
  ...orgAuth,
  requirePermission('plans:view'),
  asyncHandler(async (req, res) => {
    const data = await plansService.listPublicPlans();
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

plansRouter.get(
  '/current',
  ...orgAuth,
  requirePermission('plans:view'),
  asyncHandler(async (req, res) => {
    const data = await plansService.getCurrentPlan(req.organizationId!, req.userId!);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

usageRouter.get(
  '/',
  ...orgAuth,
  requirePermission('plans:view'),
  asyncHandler(async (req, res) => {
    await plansService.ensureSubscription(req.organizationId!);
    const data = await quotaService.getUsage(req.organizationId!);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

usageRouter.get(
  '/history',
  ...orgAuth,
  requirePermission('plans:view'),
  asyncHandler(async (req, res) => {
    const query = listUsageHistoryQuerySchema.parse(req.query);
    const data = await quotaService.getHistory(req.organizationId!, query);
    successResponse(res, data, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

usageRouter.get(
  '/summary',
  ...orgAuth,
  requirePermission('plans:view'),
  asyncHandler(async (req, res) => {
    await plansService.ensureSubscription(req.organizationId!);
    const data = await quotaService.getSummary(req.organizationId!);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

usageRouter.get(
  '/:metric',
  ...orgAuth,
  requirePermission('plans:view'),
  asyncHandler(async (req, res) => {
    const metric = String(req.params.metric ?? '');
    if (!isUsageMetric(metric)) {
      throw AppError.badRequest('Unknown usage metric');
    }
    const data = await quotaService.getUsage(req.organizationId!, metric as UsageMetric);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
