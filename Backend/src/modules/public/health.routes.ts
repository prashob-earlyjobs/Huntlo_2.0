import { Router } from 'express';

import { isDatabaseReady } from '../../config/database.js';
import { getEnv } from '../../config/env.js';
import { getBuildInfo } from '../../config/version.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { getRequestId } from '../../middleware/request-id.js';
import {
  campaignDeliveryMetrics,
  webhookMetrics,
} from '../../shared/observability/metrics.js';
import { WebhookEventModel } from '../webhooks/webhook-event.model.js';
import { BackgroundJobModel } from '../../workers/job.model.js';

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

/** Readiness probe — verifies MongoDB and reports queue/webhook backlog signals. */
healthRouter.get(
  '/v1/health/ready',
  asyncHandler(async (req, res) => {
    const dbReady = isDatabaseReady();
    let webhookBacklog = 0;
    let jobBacklog = 0;
    if (dbReady) {
      try {
        [webhookBacklog, jobBacklog] = await Promise.all([
          WebhookEventModel.countDocuments({
            processingStatus: { $in: ['received', 'queued', 'failed'] },
          }),
          BackgroundJobModel.countDocuments({
            status: { $in: ['queued', 'leased', 'running'] },
          }),
        ]);
      } catch {
        // Counts are advisory; DB ping already failed-closed via isDatabaseReady.
      }
    }

    const data = {
      status: dbReady ? 'ready' : 'not_ready',
      checks: {
        database: dbReady ? 'up' : 'down',
        webhookBacklog,
        jobBacklog,
      },
      metrics: {
        webhooks: webhookMetrics.snapshot(),
        campaignDelivery: campaignDeliveryMetrics.snapshot(),
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
