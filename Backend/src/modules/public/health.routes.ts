import { Router } from 'express';

import { isDatabaseReady } from '../../config/database.js';
import { getEnv } from '../../config/env.js';
import { getBuildInfo } from '../../config/version.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { getRequestId } from '../../middleware/request-id.js';

export const healthRouter = Router();

/** Legacy liveness probe without API envelope. */
healthRouter.get(
  '/health',
  asyncHandler(async (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      requestId: getRequestId(req),
    });
  })
);

/** Versioned liveness probe. */
healthRouter.get(
  '/v1/health',
  asyncHandler(async (req, res) => {
    successResponse(
      res,
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
      { meta: { requestId: getRequestId(req) } }
    );
  })
);

/** Readiness probe — verifies MongoDB connectivity. */
healthRouter.get(
  '/v1/health/ready',
  asyncHandler(async (req, res) => {
    const dbReady = isDatabaseReady();
    const data = {
      status: dbReady ? 'ready' : 'not_ready',
      checks: {
        database: dbReady ? 'up' : 'down',
      },
      timestamp: new Date().toISOString(),
    };

    successResponse(res, data, {
      statusCode: dbReady ? 200 : 503,
      meta: { requestId: getRequestId(req) },
    });
  })
);

/** Application version metadata. */
healthRouter.get(
  '/v1/version',
  asyncHandler(async (req, res) => {
    const env = getEnv();
    successResponse(
      res,
      {
        ...getBuildInfo(),
        appEnv: env.APP_ENV,
        realtimeEnabled: env.REALTIME_ENABLED,
      },
      { meta: { requestId: getRequestId(req) } }
    );
  })
);
