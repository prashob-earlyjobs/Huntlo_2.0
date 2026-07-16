import type { Request, Response } from 'express';

import { getRequestId } from '../../middleware/request-id.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { buildPaginationMeta } from '../../shared/pagination/paginate.js';
import { noteService } from './note.service.js';
import { poolService } from './pool.service.js';
import {
  bulkAddToListSchema,
  bulkArchiveSchema,
  bulkAssignSchema,
  bulkExportSchema,
  bulkRemoveFromListSchema,
  bulkStatusSchema,
  createNoteSchema,
  createPoolCandidateSchema,
  listNotesQuerySchema,
  listPoolQuerySchema,
  updateNoteSchema,
  updatePoolCandidateSchema,
} from './pool.validation.js';

function actorFrom(req: Request) {
  return {
    userId: req.userId!,
    organizationId: req.organizationId!,
    role: req.member?.role ?? req.auth?.role ?? 'recruiter',
  };
}

export const listPool = asyncHandler(async (req: Request, res: Response) => {
  const query = listPoolQuerySchema.parse(req.query);
  const result = await poolService.list(actorFrom(req), query);
  successResponse(res, { items: result.items, pagination: buildPaginationMeta(result) }, {
    meta: { requestId: getRequestId(req), ...buildPaginationMeta(result) },
  });
});

export const createPoolCandidate = asyncHandler(async (req: Request, res: Response) => {
  const input = createPoolCandidateSchema.parse(req.body);
  const candidate = await poolService.create(actorFrom(req), input);
  successResponse(res, candidate, {
    statusCode: 201,
    meta: { requestId: getRequestId(req) },
  });
});

export const getPoolCandidate = asyncHandler(async (req: Request, res: Response) => {
  const candidate = await poolService.getById(actorFrom(req), String(req.params.id));
  successResponse(res, candidate, { meta: { requestId: getRequestId(req) } });
});

export const updatePoolCandidate = asyncHandler(async (req: Request, res: Response) => {
  const input = updatePoolCandidateSchema.parse(req.body);
  const candidate = await poolService.update(
    actorFrom(req),
    String(req.params.id),
    input
  );
  successResponse(res, candidate, { meta: { requestId: getRequestId(req) } });
});

export const deletePoolCandidate = asyncHandler(async (req: Request, res: Response) => {
  const result = await poolService.softDelete(actorFrom(req), String(req.params.id));
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const bulkStatus = asyncHandler(async (req: Request, res: Response) => {
  const input = bulkStatusSchema.parse(req.body);
  const result = await poolService.bulkStatus(actorFrom(req), input);
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const bulkAssign = asyncHandler(async (req: Request, res: Response) => {
  const input = bulkAssignSchema.parse(req.body);
  const result = await poolService.bulkAssign(actorFrom(req), input);
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const bulkAddToList = asyncHandler(async (req: Request, res: Response) => {
  const input = bulkAddToListSchema.parse(req.body);
  const result = await poolService.bulkAddToList(actorFrom(req), input);
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const bulkRemoveFromList = asyncHandler(async (req: Request, res: Response) => {
  const input = bulkRemoveFromListSchema.parse(req.body);
  const result = await poolService.bulkRemoveFromList(actorFrom(req), input);
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const bulkArchive = asyncHandler(async (req: Request, res: Response) => {
  const input = bulkArchiveSchema.parse(req.body);
  const result = await poolService.bulkArchive(actorFrom(req), input);
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const bulkExport = asyncHandler(async (req: Request, res: Response) => {
  const input = bulkExportSchema.parse(req.body);
  const result = await poolService.bulkExport(actorFrom(req), input);

  if (result.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="candidate-pool-export-${Date.now()}.csv"`
    );
    res.status(200).send(result.csv);
    return;
  }

  successResponse(res, { items: result.items }, { meta: { requestId: getRequestId(req) } });
});

export const listNotes = asyncHandler(async (req: Request, res: Response) => {
  const query = listNotesQuerySchema.parse(req.query);
  const result = await noteService.list(
    actorFrom(req),
    String(req.params.id),
    query.page,
    query.limit
  );
  successResponse(res, { items: result.items, pagination: buildPaginationMeta(result) }, {
    meta: { requestId: getRequestId(req), ...buildPaginationMeta(result) },
  });
});

export const createNote = asyncHandler(async (req: Request, res: Response) => {
  const input = createNoteSchema.parse(req.body);
  const note = await noteService.create(actorFrom(req), String(req.params.id), input);
  successResponse(res, note, {
    statusCode: 201,
    meta: { requestId: getRequestId(req) },
  });
});

export const updateNote = asyncHandler(async (req: Request, res: Response) => {
  const input = updateNoteSchema.parse(req.body);
  const note = await noteService.update(
    actorFrom(req),
    String(req.params.id),
    String(req.params.noteId),
    input
  );
  successResponse(res, note, { meta: { requestId: getRequestId(req) } });
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  const result = await noteService.remove(
    actorFrom(req),
    String(req.params.id),
    String(req.params.noteId)
  );
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});
