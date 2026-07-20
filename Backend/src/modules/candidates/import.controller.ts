import type { Request, Response } from 'express';

import { getRequestId } from '../../middleware/request-id.js';
import { AppError } from '../../shared/errors/app-error.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { importService } from './import.service.js';
import { importCommitSchema, importRevalidateSchema } from './pool.validation.js';

function actorFrom(req: Request) {
  return {
    userId: req.userId!,
    organizationId: req.organizationId!,
    role: req.member?.role ?? req.auth?.role ?? 'recruiter',
  };
}

export const previewImport = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    throw AppError.badRequest('File is required');
  }
  const result = await importService.preview(actorFrom(req), file);
  successResponse(res, result, {
    statusCode: 201,
    meta: { requestId: getRequestId(req) },
  });
});

export const commitImport = asyncHandler(async (req: Request, res: Response) => {
  // Body may be JSON or multipart fields
  const body =
    typeof req.body?.columnMapping === 'string'
      ? {
          ...req.body,
          columnMapping: JSON.parse(req.body.columnMapping as string) as Record<
            string,
            string
          >,
        }
      : req.body;

  const input = importCommitSchema.parse(body);
  const result = await importService.commit(actorFrom(req), input, req.file);
  successResponse(res, result, {
    statusCode: 201,
    meta: { requestId: getRequestId(req) },
  });
});

export const revalidateImport = asyncHandler(async (req: Request, res: Response) => {
  const input = importRevalidateSchema.parse(req.body);
  const result = await importService.revalidate(
    actorFrom(req),
    String(req.params.id),
    input
  );
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const getImportJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await importService.getById(actorFrom(req), String(req.params.id));
  successResponse(res, job, { meta: { requestId: getRequestId(req) } });
});

export const getImportErrors = asyncHandler(async (req: Request, res: Response) => {
  const result = await importService.getErrors(actorFrom(req), String(req.params.id));
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});
