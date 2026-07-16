import type { Request, Response } from 'express';

import { hashIp } from '../../shared/auth/crypto.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { buildPaginationMeta } from '../../shared/pagination/paginate.js';
import { getRequestId } from '../../middleware/request-id.js';
import { getClientIp } from '../auth/auth.types.js';
import { jobService } from './job.service.js';
import {
  createJobSchema,
  listJobsQuerySchema,
  updateJobSchema,
} from './job.validation.js';

function actorFrom(req: Request) {
  return {
    userId: req.userId!,
    organizationId: req.organizationId!,
    role: req.member?.role ?? req.auth?.role ?? 'recruiter',
    ipHash: hashIp(getClientIp(req)),
    userAgent: req.headers['user-agent'] ?? null,
  };
}

export const listJobs = asyncHandler(async (req: Request, res: Response) => {
  const query = listJobsQuerySchema.parse(req.query);
  const result = await jobService.list(actorFrom(req), query);
  successResponse(res, { items: result.items, pagination: buildPaginationMeta(result) }, {
    meta: { requestId: getRequestId(req), ...buildPaginationMeta(result) },
  });
});

export const createJob = asyncHandler(async (req: Request, res: Response) => {
  const input = createJobSchema.parse(req.body);
  const job = await jobService.create(actorFrom(req), input);
  successResponse(res, job, { statusCode: 201, meta: { requestId: getRequestId(req) } });
});

export const getJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.getById(actorFrom(req), String(req.params.id));
  successResponse(res, job, { meta: { requestId: getRequestId(req) } });
});

export const updateJob = asyncHandler(async (req: Request, res: Response) => {
  const input = updateJobSchema.parse(req.body);
  const job = await jobService.update(actorFrom(req), String(req.params.id), input);
  successResponse(res, job, { meta: { requestId: getRequestId(req) } });
});

export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
  const result = await jobService.softDelete(actorFrom(req), String(req.params.id));
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const publishJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.publish(actorFrom(req), String(req.params.id));
  successResponse(res, job, { meta: { requestId: getRequestId(req) } });
});

export const pauseJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.pause(actorFrom(req), String(req.params.id));
  successResponse(res, job, { meta: { requestId: getRequestId(req) } });
});

export const reopenJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.reopen(actorFrom(req), String(req.params.id));
  successResponse(res, job, { meta: { requestId: getRequestId(req) } });
});

export const closeJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.close(actorFrom(req), String(req.params.id));
  successResponse(res, job, { meta: { requestId: getRequestId(req) } });
});

export const archiveJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.archive(actorFrom(req), String(req.params.id));
  successResponse(res, job, { meta: { requestId: getRequestId(req) } });
});

export const duplicateJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.duplicate(actorFrom(req), String(req.params.id));
  successResponse(res, job, { statusCode: 201, meta: { requestId: getRequestId(req) } });
});

export const getJobSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await jobService.summary(actorFrom(req), String(req.params.id));
  successResponse(res, summary, { meta: { requestId: getRequestId(req) } });
});

export const getJobPipeline = asyncHandler(async (req: Request, res: Response) => {
  const pipeline = await jobService.pipeline(actorFrom(req), String(req.params.id));
  successResponse(res, pipeline, { meta: { requestId: getRequestId(req) } });
});

export const getJobActivity = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const activity = await jobService.activity(actorFrom(req), String(req.params.id), {
    page,
    limit,
  });
  successResponse(res, activity, { meta: { requestId: getRequestId(req) } });
});

export const getJobMetrics = asyncHandler(async (req: Request, res: Response) => {
  const metrics = await jobService.metrics(actorFrom(req));
  successResponse(res, metrics, { meta: { requestId: getRequestId(req) } });
});
