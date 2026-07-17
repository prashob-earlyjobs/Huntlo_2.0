import { Router } from 'express';

import {
  requireAuth,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import { getRequestId } from '../../middleware/request-id.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { analyticsService } from './analytics.service.js';
import { dashboardService } from './dashboard.service.js';
import { generateReportSchema, reportsService } from './reports.service.js';
import { z } from 'zod';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];
const viewPerm = requirePermission('analytics:view', 'analytics:manage');
const exportPerm = requirePermission('analytics:export', 'analytics:manage');

const idParam = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/),
});

export const dashboardRouter = Router();

dashboardRouter.get(
  '/summary',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const data = await dashboardService.summary(req.organizationId!, req.query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

dashboardRouter.get(
  '/priorities',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const data = await dashboardService.priorities(req.organizationId!, req.query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

dashboardRouter.get(
  '/jobs',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const data = await dashboardService.jobs(req.organizationId!, req.query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

dashboardRouter.get(
  '/pipeline',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const data = await dashboardService.pipeline(req.organizationId!, req.query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

dashboardRouter.get(
  '/campaign-performance',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const data = await dashboardService.campaignPerformance(
      req.organizationId!,
      req.query
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

dashboardRouter.get(
  '/interviews',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const data = await dashboardService.interviews(req.organizationId!, req.query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

dashboardRouter.get(
  '/activity',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const data = await dashboardService.activity(req.organizationId!, req.query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

dashboardRouter.get(
  '/usage',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const data = await dashboardService.usage(
      req.organizationId!,
      req.query,
      req.userId!
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

export const analyticsRouter = Router();

analyticsRouter.get(
  '/overview',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const data = await analyticsService.overview(req.organizationId!, req.query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

analyticsRouter.get(
  '/pipeline',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const data = await analyticsService.pipeline(req.organizationId!, req.query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

analyticsRouter.get(
  '/channels',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const data = await analyticsService.channels(req.organizationId!, req.query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

analyticsRouter.get(
  '/jobs',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const data = await analyticsService.jobs(req.organizationId!, req.query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

analyticsRouter.get(
  '/recruiters',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const data = await analyticsService.recruiters(req.organizationId!, req.query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

analyticsRouter.get(
  '/screening',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const data = await analyticsService.screening(req.organizationId!, req.query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

analyticsRouter.get(
  '/scheduling',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const data = await analyticsService.scheduling(req.organizationId!, req.query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

analyticsRouter.get(
  '/usage',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const data = await analyticsService.usage(req.organizationId!, req.query);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

/** Backward-compatible composite for older FE clients */
analyticsRouter.get(
  '/dashboard',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const [summary, pipeline, campaign, jobs] = await Promise.all([
      dashboardService.summary(req.organizationId!, req.query),
      dashboardService.pipeline(req.organizationId!, req.query),
      dashboardService.campaignPerformance(req.organizationId!, req.query),
      dashboardService.jobs(req.organizationId!, req.query),
    ]);
    successResponse(
      res,
      {
        metrics: summary.metrics,
        secondary: summary.secondary,
        pipeline: pipeline.stages,
        campaignSummary: campaign.summary,
        channelComparison: campaign.comparison,
        jobs: jobs.items,
      },
      { meta: { requestId: getRequestId(req) } }
    );
  })
);

export const reportsRouter = Router();

reportsRouter.get(
  '/',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const data = await reportsService.list(req.organizationId!);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

reportsRouter.post(
  '/generate',
  ...orgAuth,
  exportPerm,
  asyncHandler(async (req, res) => {
    const body = generateReportSchema.parse(req.body ?? {});
    const data = await reportsService.generate(
      req.organizationId!,
      req.userId!,
      body
    );
    successResponse(res, data, {
      statusCode: 201,
      meta: { requestId: getRequestId(req) },
    });
  })
);

reportsRouter.get(
  '/:id',
  ...orgAuth,
  viewPerm,
  asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const data = await reportsService.get(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

reportsRouter.get(
  '/:id/export',
  ...orgAuth,
  exportPerm,
  asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const { stream, filename, contentType } = await reportsService.exportStream(
      req.organizationId!,
      id
    );
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    stream.pipe(res);
  })
);
