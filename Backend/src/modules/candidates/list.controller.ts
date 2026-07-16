import type { Request, Response } from 'express';

import { getRequestId } from '../../middleware/request-id.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { buildPaginationMeta } from '../../shared/pagination/paginate.js';
import { listService } from './list.service.js';
import {
  createListSchema,
  listListsQuerySchema,
  updateListSchema,
} from './pool.validation.js';

function actorFrom(req: Request) {
  return {
    userId: req.userId!,
    organizationId: req.organizationId!,
    role: req.member?.role ?? req.auth?.role ?? 'recruiter',
  };
}

export const listLists = asyncHandler(async (req: Request, res: Response) => {
  const query = listListsQuerySchema.parse(req.query);
  const result = await listService.list(actorFrom(req), query);
  successResponse(res, { items: result.items, pagination: buildPaginationMeta(result) }, {
    meta: { requestId: getRequestId(req), ...buildPaginationMeta(result) },
  });
});

export const createList = asyncHandler(async (req: Request, res: Response) => {
  const input = createListSchema.parse(req.body);
  const list = await listService.create(actorFrom(req), input);
  successResponse(res, list, {
    statusCode: 201,
    meta: { requestId: getRequestId(req) },
  });
});

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const list = await listService.getById(actorFrom(req), String(req.params.id));
  successResponse(res, list, { meta: { requestId: getRequestId(req) } });
});

export const updateList = asyncHandler(async (req: Request, res: Response) => {
  const input = updateListSchema.parse(req.body);
  const list = await listService.update(actorFrom(req), String(req.params.id), input);
  successResponse(res, list, { meta: { requestId: getRequestId(req) } });
});

export const deleteList = asyncHandler(async (req: Request, res: Response) => {
  const result = await listService.softDelete(actorFrom(req), String(req.params.id));
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const archiveList = asyncHandler(async (req: Request, res: Response) => {
  const list = await listService.archive(actorFrom(req), String(req.params.id));
  successResponse(res, list, { meta: { requestId: getRequestId(req) } });
});
