import { Router } from 'express';
import { z } from 'zod';

import {
  requireAuth,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import { getRequestId } from '../../middleware/request-id.js';
import { hashIp } from '../../shared/auth/crypto.js';
import { AppError } from '../../shared/errors/app-error.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { requireIdempotencyKey } from '../../shared/idempotency/key.js';
import { getClientIp } from '../auth/auth.types.js';
import { revealService } from '../candidates/reveal.service.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];

const revealBodySchema = z.object({
  type: z.enum(['email', 'mobile']),
  linkedinUrl: z.string().min(1),
});

function actorFrom(req: import('express').Request) {
  return {
    userId: req.userId!,
    organizationId: req.organizationId!,
    role: req.member?.role ?? req.auth?.role ?? 'recruiter',
    ipHash: hashIp(getClientIp(req)),
    userAgent: req.headers['user-agent'] ?? null,
  };
}

function readIdempotencyKey(req: import('express').Request): string {
  try {
    const header = req.headers['idempotency-key'];
    const value = Array.isArray(header) ? header[0] : header;
    return requireIdempotencyKey(value);
  } catch (error) {
    throw AppError.badRequest(
      error instanceof Error ? error.message : 'Idempotency-Key header is required'
    );
  }
}

export const peopleScoutRouter = Router();

peopleScoutRouter.post(
  '/profiles/:id/reveal',
  ...orgAuth,
  requirePermission('peopleScout:edit', 'candidates:edit'),
  asyncHandler(async (req, res) => {
    const profileId = String(req.params.id ?? '').trim();
    const body = revealBodySchema.parse(req.body);
    const idempotencyKey = readIdempotencyKey(req);
    const data = await revealService.revealByLinkedin(actorFrom(req), {
      linkedinUrl: body.linkedinUrl,
      contactType: body.type,
      profileId,
      idempotencyKey,
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
