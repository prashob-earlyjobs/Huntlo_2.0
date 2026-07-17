import { z } from 'zod';

import { AppError } from '../../shared/errors/app-error.js';
import {
  BACKGROUND_JOB_STATUSES,
  BACKGROUND_JOB_TYPES,
  BackgroundJobModel,
} from '../../workers/job.model.js';
import {
  cancelJob,
  retryFailedJob,
  toPublicJob,
} from '../../workers/queue.js';

export const listAdminJobsSchema = z.object({
  status: z.enum(BACKGROUND_JOB_STATUSES).optional(),
  type: z.enum(BACKGROUND_JOB_TYPES).optional(),
  organizationId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/)
    .optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const adminJobIdParamSchema = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/),
});

export class AdminJobsService {
  async list(query: z.infer<typeof listAdminJobsSchema>) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;
    if (query.organizationId) filter.organizationId = query.organizationId;

    const [items, total] = await Promise.all([
      BackgroundJobModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(query.offset)
        .limit(query.limit),
      BackgroundJobModel.countDocuments(filter),
    ]);

    return {
      items: items.map(toPublicJob),
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }

  async get(id: string) {
    const doc = await BackgroundJobModel.findById(id);
    if (!doc) throw AppError.notFound('Job not found');
    return toPublicJob(doc);
  }

  async retry(id: string) {
    const doc = await retryFailedJob(id);
    if (!doc) {
      throw AppError.badRequest('Job cannot be retried in its current state');
    }
    return toPublicJob(doc);
  }

  async cancel(id: string) {
    const doc = await cancelJob(id);
    if (!doc) {
      throw AppError.badRequest('Job cannot be cancelled in its current state');
    }
    return toPublicJob(doc);
  }

  async failedSummary() {
    const rows = await BackgroundJobModel.aggregate([
      { $match: { status: 'failed' } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          lastFailedAt: { $max: '$failedAt' },
        },
      },
      { $sort: { count: -1 } },
    ]);
    return rows.map((row) => ({
      type: row._id as string,
      count: row.count as number,
      lastFailedAt: row.lastFailedAt
        ? new Date(row.lastFailedAt).toISOString()
        : null,
    }));
  }
}

export const adminJobsService = new AdminJobsService();
