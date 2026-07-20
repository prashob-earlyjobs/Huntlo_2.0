import { Router } from 'express';

import { requireAuth } from '../../middleware/auth.js';
import { getRequestId } from '../../middleware/request-id.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { plansService } from './plans.service.js';
import {
  createPlanSchema,
  updatePlanSchema,
  updatePlanStatusSchema,
} from './plans.validation.js';
import { requireAdmin, requireAdminPermission } from '../admin/require-admin.js';
import { recordAdminMutation } from '../admin/admin-audit.js';

const adminAuth = [requireAuth, requireAdmin];

export const adminPlansRouter = Router();

adminPlansRouter.get(
  '/',
  ...adminAuth,
  requireAdminPermission('admin:plans:read'),
  asyncHandler(async (req, res) => {
    const data = await plansService.listAdminPlans();
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

adminPlansRouter.post(
  '/',
  ...adminAuth,
  requireAdminPermission('admin:plans:write'),
  asyncHandler(async (req, res) => {
    const body = createPlanSchema.parse(req.body ?? {});
    const data = await plansService.createPlan({
      ...body,
      limits: body.limits as never,
      isDefaultSignup: body.isDefaultSignup,
      isTrialPlan: body.isTrialPlan,
      trialDays: body.trialDays,
    });
    await recordAdminMutation(req, {
      action: 'admin.plan.created',
      relatedEntityType: 'pricing_plan',
      relatedEntityId: data.id,
    });
    successResponse(res, data, { statusCode: 201, meta: { requestId: getRequestId(req) } });
  })
);

adminPlansRouter.patch(
  '/:id',
  ...adminAuth,
  requireAdminPermission('admin:plans:write'),
  asyncHandler(async (req, res) => {
    const body = updatePlanSchema.parse(req.body ?? {});
    const data = await plansService.updatePlan(String(req.params.id ?? ''), body);
    await recordAdminMutation(req, {
      action: 'admin.plan.updated',
      relatedEntityType: 'pricing_plan',
      relatedEntityId: data.id,
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

adminPlansRouter.patch(
  '/:id/status',
  ...adminAuth,
  requireAdminPermission('admin:plans:write'),
  asyncHandler(async (req, res) => {
    const body = updatePlanStatusSchema.parse(req.body ?? {});
    const data = await plansService.updatePlanStatus(
      String(req.params.id ?? ''),
      body.active
    );
    await recordAdminMutation(req, {
      action: 'admin.plan.status_updated',
      relatedEntityType: 'pricing_plan',
      relatedEntityId: data.id,
      metadata: { active: body.active },
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

adminPlansRouter.post(
  '/:id/set-default-signup',
  ...adminAuth,
  requireAdminPermission('admin:plans:write'),
  asyncHandler(async (req, res) => {
    const data = await plansService.setDefaultSignupPlan(String(req.params.id ?? ''));
    await recordAdminMutation(req, {
      action: 'admin.plan.default_signup_set',
      relatedEntityType: 'pricing_plan',
      relatedEntityId: data.id,
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
