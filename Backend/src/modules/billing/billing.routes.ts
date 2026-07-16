import { Router } from 'express';

import {
  requireAuth,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import { getRequestId } from '../../middleware/request-id.js';
import { webhookBodyMiddleware } from '../../middleware/raw-body.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { billingService } from './billing.service.js';
import {
  processDodoWebhook,
  processRazorpayWebhook,
} from './billing-webhook.service.js';
import {
  checkoutBodySchema,
  listHistoryQuerySchema,
  orderIdParamSchema,
  razorpayVerifyBodySchema,
} from './billing.validation.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];
const viewPerm = requirePermission('plans:view', 'plans:manage');
const managePerm = requirePermission('plans:manage', 'settings:manage');

export const billingRouter = Router();

billingRouter.post(
  '/checkout',
  ...orgAuth,
  managePerm,
  asyncHandler(async (req, res) => {
    const body = checkoutBodySchema.parse(req.body ?? {});
    const data = await billingService.checkout(
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

billingRouter.get(
  '/orders/:id',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const { id } = orderIdParamSchema.parse(req.params);
    const data = await billingService.getOrder(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

billingRouter.get(
  '/history',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const query = listHistoryQuerySchema.parse(req.query);
    const data = await billingService.listHistory(req.organizationId!, query);
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

billingRouter.get(
  '/invoices',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const query = listHistoryQuerySchema.parse(req.query);
    const data = await billingService.listInvoices(req.organizationId!, query);
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

billingRouter.post(
  '/razorpay/verify',
  ...orgAuth,
  managePerm,
  asyncHandler(async (req, res) => {
    const body = razorpayVerifyBodySchema.parse(req.body ?? {});
    const data = await billingService.verifyRazorpay(
      req.organizationId!,
      req.userId!,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

export const dodoWebhookRouter = Router();
dodoWebhookRouter.use(...webhookBodyMiddleware);
dodoWebhookRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    await processDodoWebhook(req, res);
  })
);

export const razorpayWebhookRouter = Router();
razorpayWebhookRouter.use(...webhookBodyMiddleware);
razorpayWebhookRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    await processRazorpayWebhook(req, res);
  })
);
