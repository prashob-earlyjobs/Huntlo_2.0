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
import { screeningService } from './screening.service.js';
import {
  createScreeningSchema,
  listCandidatesQuerySchema,
  listResultsQuerySchema,
  listScreeningsQuerySchema,
  noteBodySchema,
  resultIdParamSchema,
  screeningIdParamSchema,
  updateScreeningSchema,
} from './screening.validation.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];
const readPerm = requirePermission('screening:view', 'screening:manage');
const writePerm = requirePermission(
  'screening:create',
  'screening:edit',
  'screening:manage'
);
const launchPerm = requirePermission(
  'screening:launch',
  'screening:edit',
  'screening:manage'
);
const approvePerm = requirePermission(
  'screening:approve',
  'screening:edit',
  'screening:manage'
);

export const screeningRouter = Router();

screeningRouter.get(
  '/',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const query = listScreeningsQuerySchema.parse(req.query);
    const data = await screeningService.list(req.organizationId!, query);
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

screeningRouter.post(
  '/',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const body = createScreeningSchema.parse(req.body ?? {});
    const data = await screeningService.create(
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

screeningRouter.get(
  '/results',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const query = listResultsQuerySchema.parse(req.query);
    const data = await screeningService.listResults(req.organizationId!, query);
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

screeningRouter.get(
  '/results/:id',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = resultIdParamSchema.parse(req.params);
    const data = await screeningService.getResult(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

screeningRouter.post(
  '/results/:id/shortlist',
  ...orgAuth,
  approvePerm,
  asyncHandler(async (req, res) => {
    const { id } = resultIdParamSchema.parse(req.params);
    const data = await screeningService.setDecision(
      req.organizationId!,
      req.userId!,
      id,
      'shortlisted'
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

screeningRouter.post(
  '/results/:id/reject',
  ...orgAuth,
  approvePerm,
  asyncHandler(async (req, res) => {
    const { id } = resultIdParamSchema.parse(req.params);
    const data = await screeningService.setDecision(
      req.organizationId!,
      req.userId!,
      id,
      'rejected'
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

screeningRouter.post(
  '/results/:id/call-again',
  ...orgAuth,
  launchPerm,
  asyncHandler(async (req, res) => {
    const { id } = resultIdParamSchema.parse(req.params);
    const data = await screeningService.setDecision(
      req.organizationId!,
      req.userId!,
      id,
      'call_again'
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

screeningRouter.post(
  '/results/:id/note',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = resultIdParamSchema.parse(req.params);
    const body = noteBodySchema.parse(req.body ?? {});
    const data = await screeningService.addNote(
      req.organizationId!,
      req.userId!,
      id,
      body.text
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

screeningRouter.get(
  '/:id',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = screeningIdParamSchema.parse(req.params);
    const data = await screeningService.get(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

screeningRouter.patch(
  '/:id',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = screeningIdParamSchema.parse(req.params);
    const body = updateScreeningSchema.parse(req.body ?? {});
    const data = await screeningService.update(
      req.organizationId!,
      req.userId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

screeningRouter.delete(
  '/:id',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = screeningIdParamSchema.parse(req.params);
    const data = await screeningService.remove(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

screeningRouter.post(
  '/:id/validate',
  ...orgAuth,
  launchPerm,
  asyncHandler(async (req, res) => {
    const { id } = screeningIdParamSchema.parse(req.params);
    const data = await screeningService.validate(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

screeningRouter.post(
  '/:id/launch',
  ...orgAuth,
  launchPerm,
  asyncHandler(async (req, res) => {
    const { id } = screeningIdParamSchema.parse(req.params);
    const data = await screeningService.launch(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

screeningRouter.post(
  '/:id/pause',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = screeningIdParamSchema.parse(req.params);
    const data = await screeningService.pause(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

screeningRouter.post(
  '/:id/resume',
  ...orgAuth,
  launchPerm,
  asyncHandler(async (req, res) => {
    const { id } = screeningIdParamSchema.parse(req.params);
    const data = await screeningService.resume(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

screeningRouter.post(
  '/:id/cancel',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = screeningIdParamSchema.parse(req.params);
    const data = await screeningService.cancel(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

screeningRouter.get(
  '/:id/candidates',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = screeningIdParamSchema.parse(req.params);
    const query = listCandidatesQuerySchema.parse(req.query);
    const data = await screeningService.listCandidates(
      req.organizationId!,
      id,
      query
    );
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);
