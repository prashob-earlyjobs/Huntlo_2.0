import type { Request, Response } from 'express';

import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { AppError } from '../../shared/errors/app-error.js';
import { getRequestId } from '../../middleware/request-id.js';
import { getRequestContext } from '../auth/auth.types.js';
import { productTourService } from './product-tour.service.js';
import { updateDashboardProductTourSchema } from './product-tour.validation.js';
import { HUNTLO_DASHBOARD_TOUR_VERSION, PRODUCT_TOUR_STATUSES } from './user-preference.model.js';

function mapTourBodyError(body: unknown): AppError | null {
  if (!body || typeof body !== 'object') {
    return new AppError(422, 'PRODUCT_TOUR_INVALID_STATUS', 'Invalid product tour payload');
  }
  const record = body as Record<string, unknown>;
  if (
    record.version !== undefined &&
    (typeof record.version !== 'number' ||
      !Number.isInteger(record.version) ||
      record.version !== HUNTLO_DASHBOARD_TOUR_VERSION)
  ) {
    return new AppError(
      422,
      'PRODUCT_TOUR_INVALID_VERSION',
      `Unsupported tour version. Expected ${HUNTLO_DASHBOARD_TOUR_VERSION}.`
    );
  }
  if (
    record.status !== undefined &&
    (typeof record.status !== 'string' ||
      !PRODUCT_TOUR_STATUSES.includes(record.status as (typeof PRODUCT_TOUR_STATUSES)[number]))
  ) {
    return new AppError(422, 'PRODUCT_TOUR_INVALID_STATUS', 'Invalid product tour status');
  }
  if (
    record.lastStep !== undefined &&
    (typeof record.lastStep !== 'number' ||
      !Number.isInteger(record.lastStep) ||
      record.lastStep < 0)
  ) {
    return new AppError(422, 'PRODUCT_TOUR_INVALID_STEP', 'Tour step must be zero or greater');
  }
  return null;
}

export const getDashboardProductTour = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const data = await productTourService.getDashboardTour(context);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const patchDashboardProductTour = asyncHandler(async (req: Request, res: Response) => {
  const mapped = mapTourBodyError(req.body);
  if (mapped) throw mapped;

  const parsed = updateDashboardProductTourSchema.safeParse(req.body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const code =
      issue?.path?.[0] === 'version'
        ? 'PRODUCT_TOUR_INVALID_VERSION'
        : issue?.path?.[0] === 'lastStep'
          ? 'PRODUCT_TOUR_INVALID_STEP'
          : 'PRODUCT_TOUR_INVALID_STATUS';
    throw new AppError(422, code, issue?.message ?? 'Invalid product tour payload');
  }

  const context = getRequestContext(req);
  const data = await productTourService.updateDashboardTour(context, parsed.data);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const resetDashboardProductTour = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const data = await productTourService.resetDashboardTour(context);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});
