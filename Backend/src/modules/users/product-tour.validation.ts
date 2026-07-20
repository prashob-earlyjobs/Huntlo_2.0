import { z } from 'zod';

import {
  HUNTLO_DASHBOARD_TOUR_VERSION,
  PRODUCT_TOUR_STATUSES,
} from './user-preference.model.js';

export const updateDashboardProductTourSchema = z
  .object({
    version: z.number().int().positive(),
    status: z.enum(PRODUCT_TOUR_STATUSES),
    lastStep: z.number().int().min(0).max(20),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.version !== HUNTLO_DASHBOARD_TOUR_VERSION) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['version'],
        message: `Unsupported tour version. Expected ${HUNTLO_DASHBOARD_TOUR_VERSION}.`,
        params: { code: 'PRODUCT_TOUR_INVALID_VERSION' },
      });
    }
  });

export type UpdateDashboardProductTourInput = z.infer<
  typeof updateDashboardProductTourSchema
>;
