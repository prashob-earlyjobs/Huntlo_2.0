import { Router } from 'express';

import { getEnv } from '../../config/env.js';
import { getRealtimeConfig } from '../../config/realtime.js';
import {
  requireAuth,
  requireOrganization,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import { getRequestId } from '../../middleware/request-id.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { signRealtimeTicket } from '../../shared/auth/jwt.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];

export const realtimeRouter = Router();

/**
 * Issues a short-lived realtime ticket for WebSocket auth.
 * Prefer this over putting long-lived access tokens in WS URLs.
 */
realtimeRouter.post(
  '/ticket',
  ...orgAuth,
  asyncHandler(async (req, res) => {
    const env = getEnv();
    const config = getRealtimeConfig();
    const auth = req.auth!;
    const { token, expiresAt, jti } = signRealtimeTicket({
      sub: auth.sub,
      orgId: auth.orgId,
      role: auth.role,
      sessionId: auth.sessionId,
    });

    successResponse(
      res,
      {
        ticket: token,
        expiresAt: expiresAt.toISOString(),
        jti,
        wsPath: config.wsPath,
        realtimeEnabled: config.enabled,
        expiresInSeconds: 60,
        /** Absolute WS URL hint for local clients (host comes from API origin). */
        ticketParam: 'ticket',
      },
      {
        statusCode: 201,
        meta: {
          requestId: getRequestId(req),
          accessTokenTtlHint: env.JWT_ACCESS_EXPIRES_IN,
        },
      }
    );
  })
);
