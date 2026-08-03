import { Router } from 'express';

import { getRequestId } from '../../middleware/request-id.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { utmService } from './utm.service.js';
import { recordUtmEventSchema, recordUtmVisitSchema } from './utm.validation.js';

/**
 * Public UTM capture — no auth.
 */
export const publicUtmRouter = Router();

publicUtmRouter.post(
  '/visit',
  asyncHandler(async (req, res) => {
    const body = recordUtmVisitSchema.parse(req.body ?? {});
    const data = await utmService.recordVisit({
      ...body,
      userAgent: String(req.get('user-agent') || '').slice(0, 500) || null,
    });
    successResponse(res, data, {
      statusCode: 201,
      meta: { requestId: getRequestId(req) },
    });
  })
);

publicUtmRouter.post(
  '/event',
  asyncHandler(async (req, res) => {
    const body = recordUtmEventSchema.parse(req.body ?? {});
    const data = await utmService.recordEvent({
      ...body,
      userAgent: String(req.get('user-agent') || '').slice(0, 500) || null,
    });
    successResponse(res, data, {
      statusCode: 201,
      meta: { requestId: getRequestId(req) },
    });
  })
);
