import { Router } from 'express';

import {
  requireAuth,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import { consumeRateLimit } from '../../middleware/rate-limit.js';
import { getRequestId } from '../../middleware/request-id.js';
import { hashIp } from '../../shared/auth/crypto.js';
import { AppError } from '../../shared/errors/app-error.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { requireIdempotencyKey } from '../../shared/idempotency/key.js';
import { getClientIp } from '../auth/auth.types.js';
import { revealService } from '../candidates/reveal.service.js';
import { peopleScoutLookupService } from './lookup.service.js';
import {
  createLookupSchema,
  listLookupsQuerySchema,
  saveLookupSchema,
} from './people-scout.validation.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];

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

function enforceLookupRateLimit(req: import('express').Request): void {
  const key = `people-scout:lookup:${req.organizationId}:${req.userId}`;
  const limit = consumeRateLimit(key, 30, 60_000);
  if (!limit.allowed) {
    throw new AppError(429, 'RATE_LIMITED', 'Too many People Scout lookups. Try again shortly.', {
      details: [{ message: `Retry after ${limit.retryAfterSeconds}s` }],
    });
  }
}

export const peopleScoutRouter = Router();

peopleScoutRouter.get(
  '/quota',
  ...orgAuth,
  requirePermission('peopleScout:view', 'candidates:view'),
  asyncHandler(async (req, res) => {
    const data = await peopleScoutLookupService.getQuota(actorFrom(req));
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

peopleScoutRouter.post(
  '/lookups',
  ...orgAuth,
  requirePermission('peopleScout:create', 'peopleScout:edit', 'candidates:create'),
  asyncHandler(async (req, res) => {
    enforceLookupRateLimit(req);
    const body = createLookupSchema.parse(req.body ?? {});
    const data = await peopleScoutLookupService.createLookup(actorFrom(req), body);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

peopleScoutRouter.get(
  '/lookups',
  ...orgAuth,
  requirePermission('peopleScout:view', 'candidates:view'),
  asyncHandler(async (req, res) => {
    const query = listLookupsQuerySchema.parse(req.query);
    const data = await peopleScoutLookupService.listLookups(actorFrom(req), query);
    successResponse(res, data, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

peopleScoutRouter.get(
  '/lookups/:id',
  ...orgAuth,
  requirePermission('peopleScout:view', 'candidates:view'),
  asyncHandler(async (req, res) => {
    const data = await peopleScoutLookupService.getLookup(
      actorFrom(req),
      String(req.params.id ?? '')
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

peopleScoutRouter.post(
  '/lookups/:id/reveal/email',
  ...orgAuth,
  requirePermission('peopleScout:edit', 'candidates:edit'),
  asyncHandler(async (req, res) => {
    const idempotencyKey = readIdempotencyKey(req);
    const data = await peopleScoutLookupService.revealContact(
      actorFrom(req),
      String(req.params.id ?? ''),
      'email',
      idempotencyKey
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

peopleScoutRouter.post(
  '/lookups/:id/reveal/mobile',
  ...orgAuth,
  requirePermission('peopleScout:edit', 'candidates:edit'),
  asyncHandler(async (req, res) => {
    const idempotencyKey = readIdempotencyKey(req);
    const data = await peopleScoutLookupService.revealContact(
      actorFrom(req),
      String(req.params.id ?? ''),
      'mobile',
      idempotencyKey
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

peopleScoutRouter.post(
  '/lookups/:id/save',
  ...orgAuth,
  requirePermission('peopleScout:edit', 'candidates:create', 'candidates:edit'),
  asyncHandler(async (req, res) => {
    const body = saveLookupSchema.parse(req.body ?? {});
    const data = await peopleScoutLookupService.saveToPool(
      actorFrom(req),
      String(req.params.id ?? ''),
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

/** Backward-compatible reveal used by older frontend profile cards. */
peopleScoutRouter.post(
  '/profiles/:id/reveal',
  ...orgAuth,
  requirePermission('peopleScout:edit', 'candidates:edit'),
  asyncHandler(async (req, res) => {
    const profileId = String(req.params.id ?? '').trim();
    const linkedinUrl = String((req.body as { linkedinUrl?: string })?.linkedinUrl ?? '').trim();
    const type = String((req.body as { type?: string })?.type ?? '').trim();
    if (type !== 'email' && type !== 'mobile') {
      throw AppError.badRequest('type must be email or mobile');
    }
    if (!linkedinUrl) {
      throw AppError.badRequest('linkedinUrl is required');
    }
    const idempotencyKey = readIdempotencyKey(req);
    const data = await revealService.revealByLinkedin(actorFrom(req), {
      linkedinUrl,
      contactType: type,
      profileId,
      idempotencyKey,
    });
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
