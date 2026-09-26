import { Router } from 'express';

import { getRequestId } from '../../middleware/request-id.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { startAiVoiceDemo } from './ai-voice-demo.service.js';
import { startAiVoiceDemoSchema } from './ai-voice-demo.validation.js';

/**
 * Public AI Voice Recruiter demo.
 * Creates a Hunar agent for the selected job, then dials that agent.
 */
export const aiVoiceDemoRouter = Router();

aiVoiceDemoRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = startAiVoiceDemoSchema.parse(req.body ?? {});
    const data = await startAiVoiceDemo(body);
    successResponse(res, data, {
      statusCode: 201,
      meta: { requestId: getRequestId(req) },
    });
  })
);
