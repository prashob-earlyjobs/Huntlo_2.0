import { Router } from 'express';

import {
  requireAuth,
  requireOrganization,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import { getRequestId } from '../../middleware/request-id.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { notificationsService } from './notifications.service.js';
import {
  listNotificationsSchema,
  notificationIdParamSchema,
} from './notifications.validation.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];

export const notificationsRouter = Router();

notificationsRouter.get(
  '/',
  ...orgAuth,
  asyncHandler(async (req, res) => {
    const query = listNotificationsSchema.parse(req.query);
    const data = await notificationsService.list(
      req.organizationId!,
      req.userId!,
      query
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

notificationsRouter.get(
  '/unread-count',
  ...orgAuth,
  asyncHandler(async (req, res) => {
    const data = await notificationsService.unreadCount(
      req.organizationId!,
      req.userId!
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

notificationsRouter.post(
  '/read-all',
  ...orgAuth,
  asyncHandler(async (req, res) => {
    const data = await notificationsService.markAllRead(
      req.organizationId!,
      req.userId!
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

notificationsRouter.post(
  '/:id/read',
  ...orgAuth,
  asyncHandler(async (req, res) => {
    const { id } = notificationIdParamSchema.parse(req.params);
    const data = await notificationsService.markRead(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

notificationsRouter.delete(
  '/:id',
  ...orgAuth,
  asyncHandler(async (req, res) => {
    const { id } = notificationIdParamSchema.parse(req.params);
    const data = await notificationsService.remove(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
