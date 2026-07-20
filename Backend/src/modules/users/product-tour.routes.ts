import { Router } from 'express';

import { requireAuth } from '../../middleware/auth.js';
import {
  getDashboardProductTour,
  patchDashboardProductTour,
  resetDashboardProductTour,
} from './product-tour.controller.js';

export const usersMeRouter = Router();

usersMeRouter.get('/me/product-tour/dashboard', requireAuth, getDashboardProductTour);
usersMeRouter.patch('/me/product-tour/dashboard', requireAuth, patchDashboardProductTour);
usersMeRouter.post('/me/product-tour/dashboard/reset', requireAuth, resetDashboardProductTour);
