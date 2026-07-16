import { Router } from 'express';

import {
  requireAuth,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import { getRequestId } from '../../middleware/request-id.js';
import { AppError } from '../../shared/errors/app-error.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { plansService } from './plans.service.js';
import {
  createPlanSchema,
  updatePlanSchema,
  updatePlanStatusSchema,
} from './plans.validation.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];

function requireOwnerOrAdmin() {
  return asyncHandler(async (req, _res, next) => {
    const role = req.member?.role ?? req.auth?.role;
    if (role !== 'owner' && role !== 'admin') {
      throw AppError.forbidden('Only owners and admins can manage pricing plans');
    }
    next();
  });
}

export const adminPlansRouter = Router();

adminPlansRouter.get(
  '/',
  ...orgAuth,
  requireOwnerOrAdmin(),
  requirePermission('plans:view'),
  asyncHandler(async (req, res) => {
    const data = await plansService.listAdminPlans();
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

adminPlansRouter.post(
  '/',
  ...orgAuth,
  requireOwnerOrAdmin(),
  requirePermission('plans:create'),
  asyncHandler(async (req, res) => {
    const body = createPlanSchema.parse(req.body ?? {});
    const data = await plansService.createPlan({
      ...body,
      limits: body.limits as never,
    });
    successResponse(res, data, { statusCode: 201, meta: { requestId: getRequestId(req) } });
  })
);

adminPlansRouter.patch(
  '/:id',
  ...orgAuth,
  requireOwnerOrAdmin(),
  requirePermission('plans:edit'),
  asyncHandler(async (req, res) => {
    const body = updatePlanSchema.parse(req.body ?? {});
    const data = await plansService.updatePlan(String(req.params.id ?? ''), body);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

adminPlansRouter.patch(
  '/:id/status',
  ...orgAuth,
  requireOwnerOrAdmin(),
  requirePermission('plans:edit'),
  asyncHandler(async (req, res) => {
    const body = updatePlanStatusSchema.parse(req.body ?? {});
    const data = await plansService.updatePlanStatus(
      String(req.params.id ?? ''),
      body.active
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
