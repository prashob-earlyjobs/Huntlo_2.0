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
import { easyScoutLookupService } from './lookup.service.js';
import {
  createEasyScoutLookupSchema,
  listEasyScoutLookupsQuerySchema,
  saveEasyScoutLookupSchema,
} from './easy-scout.validation.js';

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
  const key = `easy-scout:lookup:${req.organizationId}:${req.userId}`;
  const limit = consumeRateLimit(key, 30, 60_000);
  if (!limit.allowed) {
    throw new AppError(429, 'RATE_LIMITED', 'Too many Easy Scout lookups. Try again shortly.', {
      details: [{ message: `Retry after ${limit.retryAfterSeconds}s` }],
    });
  }
}

export const easyScoutRouter = Router();

easyScoutRouter.get(
  '/quota',
  ...orgAuth,
  requirePermission('easyScout:view', 'candidates:view'),
  asyncHandler(async (req, res) => {
    const data = await easyScoutLookupService.getQuota(actorFrom(req));
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

easyScoutRouter.post(
  '/lookups',
  ...orgAuth,
  requirePermission('easyScout:create', 'easyScout:edit', 'candidates:create'),
  asyncHandler(async (req, res) => {
    enforceLookupRateLimit(req);
    const body = createEasyScoutLookupSchema.parse(req.body ?? {});
    const data = await easyScoutLookupService.createLookup(actorFrom(req), body);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

easyScoutRouter.get(
  '/lookups',
  ...orgAuth,
  requirePermission('easyScout:view', 'candidates:view'),
  asyncHandler(async (req, res) => {
    const query = listEasyScoutLookupsQuerySchema.parse(req.query);
    const data = await easyScoutLookupService.listLookups(actorFrom(req), query);
    successResponse(res, data, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

easyScoutRouter.get(
  '/lookups/:id',
  ...orgAuth,
  requirePermission('easyScout:view', 'candidates:view'),
  asyncHandler(async (req, res) => {
    const data = await easyScoutLookupService.getLookup(
      actorFrom(req),
      String(req.params.id ?? '')
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

easyScoutRouter.post(
  '/lookups/:id/reveal/email',
  ...orgAuth,
  requirePermission('easyScout:edit', 'candidates:edit'),
  asyncHandler(async (req, res) => {
    const idempotencyKey = readIdempotencyKey(req);
    const data = await easyScoutLookupService.revealContact(
      actorFrom(req),
      String(req.params.id ?? ''),
      'email',
      idempotencyKey
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

easyScoutRouter.post(
  '/lookups/:id/reveal/mobile',
  ...orgAuth,
  requirePermission('easyScout:edit', 'candidates:edit'),
  asyncHandler(async (req, res) => {
    const idempotencyKey = readIdempotencyKey(req);
    const data = await easyScoutLookupService.revealContact(
      actorFrom(req),
      String(req.params.id ?? ''),
      'mobile',
      idempotencyKey
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

easyScoutRouter.post(
  '/lookups/:id/save',
  ...orgAuth,
  requirePermission('easyScout:edit', 'candidates:create', 'candidates:edit'),
  asyncHandler(async (req, res) => {
    const body = saveEasyScoutLookupSchema.parse(req.body ?? {});
    const data = await easyScoutLookupService.saveToPool(
      actorFrom(req),
      String(req.params.id ?? ''),
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
