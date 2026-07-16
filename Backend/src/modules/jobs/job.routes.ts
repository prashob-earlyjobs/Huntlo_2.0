import { Router } from 'express';

import {
  requireAuth,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import {
  archiveJob,
  closeJob,
  createJob,
  deleteJob,
  duplicateJob,
  getJob,
  getJobActivity,
  getJobMetrics,
  getJobPipeline,
  getJobSummary,
  listJobs,
  pauseJob,
  publishJob,
  reopenJob,
  updateJob,
} from './job.controller.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];

export const jobsRouter = Router();

jobsRouter.get('/metrics', ...orgAuth, requirePermission('jobs:view'), getJobMetrics);
jobsRouter.get('/', ...orgAuth, requirePermission('jobs:view'), listJobs);
jobsRouter.post('/', ...orgAuth, requirePermission('jobs:create'), createJob);

jobsRouter.get('/:id', ...orgAuth, requirePermission('jobs:view'), getJob);
jobsRouter.patch('/:id', ...orgAuth, requirePermission('jobs:edit'), updateJob);
jobsRouter.delete('/:id', ...orgAuth, requirePermission('jobs:delete'), deleteJob);

jobsRouter.post('/:id/publish', ...orgAuth, requirePermission('jobs:launch', 'jobs:edit'), publishJob);
jobsRouter.post('/:id/pause', ...orgAuth, requirePermission('jobs:edit'), pauseJob);
jobsRouter.post('/:id/reopen', ...orgAuth, requirePermission('jobs:edit'), reopenJob);
jobsRouter.post('/:id/close', ...orgAuth, requirePermission('jobs:edit'), closeJob);
jobsRouter.post('/:id/archive', ...orgAuth, requirePermission('jobs:edit'), archiveJob);
jobsRouter.post('/:id/duplicate', ...orgAuth, requirePermission('jobs:create'), duplicateJob);

jobsRouter.get('/:id/summary', ...orgAuth, requirePermission('jobs:view'), getJobSummary);
jobsRouter.get('/:id/pipeline', ...orgAuth, requirePermission('jobs:view'), getJobPipeline);
jobsRouter.get('/:id/activity', ...orgAuth, requirePermission('jobs:view'), getJobActivity);
