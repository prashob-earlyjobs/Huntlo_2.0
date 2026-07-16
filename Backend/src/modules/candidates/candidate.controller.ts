import type { Request, Response } from 'express';
import { ZodError } from 'zod';

import { getRequestId } from '../../middleware/request-id.js';
import { hashIp } from '../../shared/auth/crypto.js';
import { AppError } from '../../shared/errors/app-error.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { requireIdempotencyKey } from '../../shared/idempotency/key.js';
import { getClientIp } from '../auth/auth.types.js';
import { bulkRevealService } from './bulk-reveal.service.js';
import { candidateService } from './candidate.service.js';
import {
  activityQuerySchema,
  bulkJobIdParamSchema,
  bulkRevealBodySchema,
  candidateIdParamSchema,
  revealedContactsLookupSchema,
} from './candidate.validation.js';
import { revealService } from './reveal.service.js';

function actorFrom(req: Request) {
  return {
    userId: req.userId!,
    organizationId: req.organizationId!,
    role: req.member?.role ?? req.auth?.role ?? 'recruiter',
    ipHash: hashIp(getClientIp(req)),
    userAgent: req.headers['user-agent'] ?? null,
  };
}

function readIdempotencyKey(req: Request): string {
  try {
    const header = req.headers['idempotency-key'];
    const value = Array.isArray(header) ? header[0] : header;
    return requireIdempotencyKey(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw AppError.badRequest('Invalid Idempotency-Key header', [
        { path: 'Idempotency-Key', message: error.issues[0]?.message ?? 'Invalid key' },
      ]);
    }
    throw AppError.badRequest(
      error instanceof Error ? error.message : 'Idempotency-Key header is required'
    );
  }
}

export const getCandidate = asyncHandler(async (req: Request, res: Response) => {
  const { candidateId } = candidateIdParamSchema.parse(req.params);
  const data = await candidateService.getById(actorFrom(req), candidateId);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const enrichCandidate = asyncHandler(async (req: Request, res: Response) => {
  const { candidateId } = candidateIdParamSchema.parse(req.params);
  const data = await candidateService.enrich(actorFrom(req), candidateId);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const revealEmail = asyncHandler(async (req: Request, res: Response) => {
  const { candidateId } = candidateIdParamSchema.parse(req.params);
  const idempotencyKey = readIdempotencyKey(req);
  const data = await revealService.reveal(actorFrom(req), candidateId, 'email', {
    idempotencyKey,
  });
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const revealMobile = asyncHandler(async (req: Request, res: Response) => {
  const { candidateId } = candidateIdParamSchema.parse(req.params);
  const idempotencyKey = readIdempotencyKey(req);
  const data = await revealService.reveal(actorFrom(req), candidateId, 'mobile', {
    idempotencyKey,
  });
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const createBulkReveal = asyncHandler(async (req: Request, res: Response) => {
  const idempotencyKey = readIdempotencyKey(req);
  const body = bulkRevealBodySchema.parse(req.body);
  const data = await bulkRevealService.createJob(actorFrom(req), body.items, idempotencyKey);
  successResponse(res, data, {
    statusCode: 202,
    meta: { requestId: getRequestId(req) },
  });
});

export const getBulkRevealJob = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = bulkJobIdParamSchema.parse(req.params);
  const data = await bulkRevealService.getJob(actorFrom(req), jobId);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const getRevealStatus = asyncHandler(async (req: Request, res: Response) => {
  const { candidateId } = candidateIdParamSchema.parse(req.params);
  const data = await revealService.getRevealStatus(actorFrom(req), candidateId);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const getCandidateActivity = asyncHandler(async (req: Request, res: Response) => {
  const { candidateId } = candidateIdParamSchema.parse(req.params);
  const query = activityQuerySchema.parse(req.query);
  const data = await candidateService.getActivity(actorFrom(req), candidateId, query.limit);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const lookupRevealedContacts = asyncHandler(async (req: Request, res: Response) => {
  const body = revealedContactsLookupSchema.parse(req.body);
  const data = await revealService.lookupRevealedContacts(actorFrom(req), body);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});
