import type { Request, Response } from 'express';

import { getRequestId } from '../../middleware/request-id.js';
import { hashIp } from '../../shared/auth/crypto.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { buildPaginationMeta } from '../../shared/pagination/paginate.js';
import { getClientIp } from '../auth/auth.types.js';
import { sourcingService } from './sourcing.service.js';
import {
  createSessionSchema,
  interpretQuerySchema,
  listSessionsQuerySchema,
  resultsQuerySchema,
  updateSessionSchema,
} from './sourcing.validation.js';

function actorFrom(req: Request) {
  return {
    userId: req.userId!,
    organizationId: req.organizationId!,
    role: req.member?.role ?? req.auth?.role ?? 'recruiter',
    ipHash: hashIp(getClientIp(req)),
    userAgent: req.headers['user-agent'] ?? null,
  };
}

export const interpretQuery = asyncHandler(async (req: Request, res: Response) => {
  const input = interpretQuerySchema.parse(req.body);
  const result = await sourcingService.interpret(actorFrom(req), input);
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const createSession = asyncHandler(async (req: Request, res: Response) => {
  const input = createSessionSchema.parse(req.body);
  const session = await sourcingService.createSession(actorFrom(req), input);
  successResponse(res, session, {
    statusCode: 201,
    meta: { requestId: getRequestId(req) },
  });
});

export const listSessions = asyncHandler(async (req: Request, res: Response) => {
  const query = listSessionsQuerySchema.parse(req.query);
  const result = await sourcingService.listSessions(actorFrom(req), query);
  successResponse(res, { items: result.items, pagination: buildPaginationMeta(result) }, {
    meta: { requestId: getRequestId(req), ...buildPaginationMeta(result) },
  });
});

export const getSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await sourcingService.getSession(actorFrom(req), String(req.params.id));
  successResponse(res, session, { meta: { requestId: getRequestId(req) } });
});

export const updateSession = asyncHandler(async (req: Request, res: Response) => {
  const input = updateSessionSchema.parse(req.body);
  const session = await sourcingService.updateSession(
    actorFrom(req),
    String(req.params.id),
    input
  );
  successResponse(res, session, { meta: { requestId: getRequestId(req) } });
});

export const deleteSession = asyncHandler(async (req: Request, res: Response) => {
  const result = await sourcingService.softDelete(actorFrom(req), String(req.params.id));
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const runSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await sourcingService.runSession(actorFrom(req), String(req.params.id));
  successResponse(res, session, { meta: { requestId: getRequestId(req) } });
});

export const cancelSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await sourcingService.cancelSession(actorFrom(req), String(req.params.id));
  successResponse(res, session, { meta: { requestId: getRequestId(req) } });
});

export const rerunSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await sourcingService.rerunSession(actorFrom(req), String(req.params.id));
  successResponse(res, session, { meta: { requestId: getRequestId(req) } });
});

export const duplicateSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await sourcingService.duplicateSession(actorFrom(req), String(req.params.id));
  successResponse(res, session, {
    statusCode: 201,
    meta: { requestId: getRequestId(req) },
  });
});

export const getSessionResults = asyncHandler(async (req: Request, res: Response) => {
  const query = resultsQuerySchema.parse(req.query);
  const result = await sourcingService.getResults(actorFrom(req), String(req.params.id), query);
  successResponse(res, { items: result.items, pagination: buildPaginationMeta(result) }, {
    meta: { requestId: getRequestId(req), ...buildPaginationMeta(result) },
  });
});

export const getSessionProgress = asyncHandler(async (req: Request, res: Response) => {
  const progress = await sourcingService.getProgress(actorFrom(req), String(req.params.id));
  successResponse(res, progress, { meta: { requestId: getRequestId(req) } });
});
