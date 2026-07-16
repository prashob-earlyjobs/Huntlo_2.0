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
import { availabilityService } from './availability.service.js';
import { interviewsService } from './interview.service.js';
import { schedulingSyncService } from './scheduling-sync.service.js';
import {
  calendarQuerySchema,
  createInterviewSchema,
  interviewIdParamSchema,
  listInterviewsQuerySchema,
  putAvailabilitySchema,
  rescheduleBodySchema,
  sendLinkBodySchema,
  syncBodySchema,
  updateInterviewSchema,
} from './scheduling.validation.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];
const readPerm = requirePermission('scheduling:view', 'scheduling:manage');
const writePerm = requirePermission(
  'scheduling:create',
  'scheduling:edit',
  'scheduling:manage'
);

export const interviewsRouter = Router();

interviewsRouter.get(
  '/calendar',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const query = calendarQuerySchema.parse(req.query);
    const data = await interviewsService.calendar(req.organizationId!, query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

interviewsRouter.get(
  '/',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const query = listInterviewsQuerySchema.parse(req.query);
    const data = await interviewsService.list(req.organizationId!, query);
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

interviewsRouter.post(
  '/',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const body = createInterviewSchema.parse(req.body ?? {});
    const data = await interviewsService.create(req.organizationId!, req.userId!, body);
    successResponse(res, data, {
      statusCode: 201,
      meta: { requestId: getRequestId(req) },
    });
  })
);

interviewsRouter.get(
  '/:id',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = interviewIdParamSchema.parse(req.params);
    const data = await interviewsService.get(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

interviewsRouter.patch(
  '/:id',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = interviewIdParamSchema.parse(req.params);
    const body = updateInterviewSchema.parse(req.body ?? {});
    const data = await interviewsService.update(req.organizationId!, id, body);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

interviewsRouter.post(
  '/:id/send-link',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = interviewIdParamSchema.parse(req.params);
    const body = sendLinkBodySchema.parse(req.body ?? {});
    const data = await interviewsService.sendLink(
      req.organizationId!,
      req.userId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

interviewsRouter.post(
  '/:id/reschedule',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = interviewIdParamSchema.parse(req.params);
    const body = rescheduleBodySchema.parse(req.body ?? {});
    const data = await interviewsService.reschedule(
      req.organizationId!,
      req.userId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

interviewsRouter.post(
  '/:id/cancel',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = interviewIdParamSchema.parse(req.params);
    const data = await interviewsService.cancel(req.organizationId!, req.userId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

interviewsRouter.post(
  '/:id/remind',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = interviewIdParamSchema.parse(req.params);
    const data = await interviewsService.remind(req.organizationId!, req.userId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

interviewsRouter.post(
  '/:id/complete',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = interviewIdParamSchema.parse(req.params);
    const data = await interviewsService.complete(req.organizationId!, req.userId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

interviewsRouter.post(
  '/:id/no-show',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = interviewIdParamSchema.parse(req.params);
    const data = await interviewsService.noShow(req.organizationId!, req.userId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

export const availabilityRouter = Router();

availabilityRouter.get(
  '/',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const data = await availabilityService.get(req.organizationId!, req.userId!);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

availabilityRouter.put(
  '/',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const body = putAvailabilitySchema.parse(req.body ?? {});
    const data = await availabilityService.put(req.organizationId!, req.userId!, body);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

export const schedulingRouter = Router();

schedulingRouter.get(
  '/event-types',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const data = await schedulingSyncService.listEventTypes(
      req.organizationId!,
      req.userId!
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

schedulingRouter.post(
  '/sync',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const body = syncBodySchema.parse(req.body ?? {});
    const data = await schedulingSyncService.sync(
      req.organizationId!,
      req.userId!,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

/** FE compatibility: /scheduling/interviews → interviews router */
schedulingRouter.use('/interviews', interviewsRouter);
schedulingRouter.use('/availability', availabilityRouter);
schedulingRouter.get(
  '/calendar',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const query = calendarQuerySchema.parse(req.query);
    const data = await interviewsService.calendar(req.organizationId!, query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
