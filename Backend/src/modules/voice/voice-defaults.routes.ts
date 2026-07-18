import { Router } from 'express';

import {
  requireAuth,
  requireOrganization,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import { getRequestId } from '../../middleware/request-id.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { getActiveRoshniPromptDefaults } from './roshni-prompt.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];

/**
 * Authenticated workspace read of effective Roshni voice defaults.
 * Does not expose admin/provider settings — only the resolved introduction + agent prompt.
 */
export const voiceDefaultsRouter = Router();

voiceDefaultsRouter.get(
  '/defaults',
  ...orgAuth,
  asyncHandler(async (req, res) => {
    const defaults = await getActiveRoshniPromptDefaults();
    successResponse(
      res,
      {
        introduction: defaults.introduction,
        agentPrompt: defaults.agentPrompt,
        version: defaults.version,
        source: defaults.source,
        introductionSource: defaults.introductionSource,
        agentPromptSource: defaults.agentPromptSource,
      },
      { meta: { requestId: getRequestId(req) } }
    );
  })
);
