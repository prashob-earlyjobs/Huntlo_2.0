import { Router } from 'express';

import { requireAuth } from '../../middleware/auth.js';
import { getRequestId } from '../../middleware/request-id.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { requireAdmin, requireAdminPermission } from '../admin/require-admin.js';
import { recordAdminMutation } from '../admin/admin-audit.js';
import {
  createCouponBodySchema,
  updateCouponBodySchema,
} from './billing.validation.js';
import { couponAdminService } from './coupon.service.js';

const adminAuth = [requireAuth, requireAdmin];

export const adminCouponsRouter = Router();

adminCouponsRouter.get(
  '/',
  ...adminAuth,
  requireAdminPermission('admin:plans:read'),
  asyncHandler(async (req, res) => {
    const data = await couponAdminService.list();
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

adminCouponsRouter.get(
  '/:id/redemptions',
  ...adminAuth,
  requireAdminPermission('admin:plans:read'),
  asyncHandler(async (req, res) => {
    const data = await couponAdminService.listRedemptions(String(req.params.id ?? ''));
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

adminCouponsRouter.post(
  '/',
  ...adminAuth,
  requireAdminPermission('admin:plans:write'),
  asyncHandler(async (req, res) => {
    const body = createCouponBodySchema.parse(req.body ?? {});
    const data = await couponAdminService.create({
      ...body,
      createdByUserId: req.userId || null,
    });
    await recordAdminMutation(req, {
      action: 'admin.coupon.created',
      relatedEntityType: 'billing_coupon',
      relatedEntityId: data.id,
      metadata: { code: data.code },
    });
    successResponse(res, data, {
      statusCode: 201,
      meta: { requestId: getRequestId(req) },
    });
  })
);

adminCouponsRouter.patch(
  '/:id',
  ...adminAuth,
  requireAdminPermission('admin:plans:write'),
  asyncHandler(async (req, res) => {
    const body = updateCouponBodySchema.parse(req.body ?? {});
    const data = await couponAdminService.update(String(req.params.id ?? ''), body);
    await recordAdminMutation(req, {
      action: 'admin.coupon.updated',
      relatedEntityType: 'billing_coupon',
      relatedEntityId: data.id,
      metadata: { code: data.code, active: data.active },
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
