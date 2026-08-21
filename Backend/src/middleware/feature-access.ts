import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../shared/errors/app-error.js';
import { asyncHandler } from '../shared/http/async-handler.js';
import { featureForRequestPath, featureLabel } from '../shared/usage/features.js';
import { quotaService } from '../shared/usage/quota.service.js';

export async function assertRequestFeatureAccess(req: Request): Promise<void> {
  const feature = featureForRequestPath(req.originalUrl || req.url || '');
  if (!feature) return;

  const organizationId = req.organizationId || req.organization?.id;
  if (!organizationId) {
    throw AppError.forbidden('Organization scope required');
  }

  const allowed = await quotaService.checkFeatureAccess(organizationId, feature);
  if (!allowed) {
    throw new AppError(
      403,
      'FEATURE_DISABLED',
      `${featureLabel(feature)} is not enabled on this plan.`,
      { meta: { feature } }
    );
  }
}

/**
 * Returns 403 FEATURE_DISABLED when the current workspace cannot use the
 * feature that owns this route. Skips paths that are not feature-gated.
 * Must run after requireOrganization.
 */
export const requireFeatureAccess = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    await assertRequestFeatureAccess(req);
    next();
  }
);
