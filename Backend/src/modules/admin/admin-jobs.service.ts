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
import {
  CampaignJobModel,
  OUTREACH_QUEUE_STATUS,
} from '../outreach/campaign-job.model.js';
import { OutreachCampaignModel } from '../outreach/campaign.model.js';

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

export const listPendingTasksSchema = z.object({
  queue: z.enum(['all', 'background', 'campaign']).default('all'),
  includeScheduled: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((v) => {
      if (v === undefined) return true;
      if (typeof v === 'boolean') return v;
      return v === 'true';
    }),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

export const adminJobIdParamSchema = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/),
});

export type AdminPendingTask = {
  id: string;
  queue: 'background' | 'campaign';
  type: string;
  status: string;
  dueAt: string;
  organizationId: string | null;
  entityType: string | null;
  entityId: string | null;
  entityLabel: string | null;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  canCancel: boolean;
  canRetry: boolean;
};

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

  async listPendingTasks(query: z.infer<typeof listPendingTasksSchema>) {
    const now = new Date();
    const dueOnly = !query.includeScheduled;

    const bgOpen = { status: { $in: ['pending', 'retrying', 'leased', 'running'] } };
    const bgFilter = dueOnly
      ? {
          $or: [
            { status: { $in: ['pending', 'retrying'] }, runAt: { $lte: now } },
            { status: { $in: ['leased', 'running'] } },
          ],
        }
      : bgOpen;

    const campaignOpen = {
      status: { $in: ['queued', OUTREACH_QUEUE_STATUS, 'leased', 'running'] },
    };
    const campaignFilter = dueOnly
      ? {
          $or: [
            {
              status: { $in: ['queued', OUTREACH_QUEUE_STATUS] },
              scheduledAt: { $lte: now },
            },
            { status: { $in: ['leased', 'running'] } },
          ],
        }
      : campaignOpen;

    const [
      backgroundDue,
      backgroundScheduled,
      campaignDue,
      campaignScheduled,
      backgroundInFlight,
      campaignInFlight,
      failed24h,
      bgDocs,
      campaignDocs,
    ] = await Promise.all([
      BackgroundJobModel.countDocuments({
        status: { $in: ['pending', 'retrying'] },
        runAt: { $lte: now },
      }),
      BackgroundJobModel.countDocuments({
        status: { $in: ['pending', 'retrying'] },
        runAt: { $gt: now },
      }),
      CampaignJobModel.countDocuments({
        status: { $in: ['queued', OUTREACH_QUEUE_STATUS] },
        scheduledAt: { $lte: now },
      }),
      CampaignJobModel.countDocuments({
        status: { $in: ['queued', OUTREACH_QUEUE_STATUS] },
        scheduledAt: { $gt: now },
      }),
      BackgroundJobModel.countDocuments({
        status: { $in: ['leased', 'running'] },
      }),
      CampaignJobModel.countDocuments({
        status: { $in: ['leased', 'running'] },
      }),
      BackgroundJobModel.countDocuments({
        status: 'failed',
        failedAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      }),
      query.queue === 'campaign'
        ? Promise.resolve([])
        : BackgroundJobModel.find(bgFilter).sort({ runAt: 1 }).limit(500).lean(),
      query.queue === 'background'
        ? Promise.resolve([])
        : CampaignJobModel.find(campaignFilter)
            .sort({ scheduledAt: 1 })
            .limit(500)
            .lean(),
    ]);

    const campaignIds = [
      ...new Set(
        (campaignDocs as Array<{ campaignId?: unknown }>)
          .map((d) => String(d.campaignId || ''))
          .filter(Boolean)
      ),
    ];
    const campaigns = campaignIds.length
      ? await OutreachCampaignModel.find({ _id: { $in: campaignIds } })
          .select('name')
          .lean()
      : [];
    const campaignNameById = new Map(
      campaigns.map((c) => [String(c._id), String(c.name || 'Campaign')])
    );

    const items: AdminPendingTask[] = [];

    for (const doc of bgDocs as Array<Record<string, unknown>>) {
      const status = String(doc.status || '');
      items.push({
        id: String(doc._id),
        queue: 'background',
        type: String(doc.type || ''),
        status,
        dueAt: new Date(doc.runAt as Date).toISOString(),
        organizationId: doc.organizationId ? String(doc.organizationId) : null,
        entityType: doc.entityType ? String(doc.entityType) : null,
        entityId: doc.entityId ? String(doc.entityId) : null,
        entityLabel: doc.entityType
          ? `${doc.entityType}${doc.entityId ? `:${doc.entityId}` : ''}`
          : null,
        attempts: Number(doc.attempts || 0),
        lastError: doc.lastError ? String(doc.lastError) : null,
        createdAt: new Date(doc.createdAt as Date).toISOString(),
        canCancel: ['pending', 'retrying', 'leased', 'running'].includes(status),
        canRetry: status === 'failed',
      });
    }

    for (const doc of campaignDocs as Array<Record<string, unknown>>) {
      const status = String(doc.status || '');
      const campaignId = String(doc.campaignId || '');
      items.push({
        id: String(doc._id),
        queue: 'campaign',
        type: String(doc.jobType || ''),
        status,
        dueAt: new Date(doc.scheduledAt as Date).toISOString(),
        organizationId: doc.organizationId ? String(doc.organizationId) : null,
        entityType: 'campaign',
        entityId: campaignId || null,
        entityLabel: campaignNameById.get(campaignId) || campaignId || null,
        attempts: Number(doc.attempts || 0),
        lastError: doc.error ? String(doc.error) : null,
        createdAt: new Date(doc.createdAt as Date).toISOString(),
        canCancel: ['queued', 'queued_v2', 'leased', 'running'].includes(status),
        canRetry: ['failed', 'dead'].includes(status),
      });
    }

    items.sort((a, b) => {
      // Surface outreach/voice work before recurring background keepalives.
      if (a.queue !== b.queue) {
        return a.queue === 'campaign' ? -1 : 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    const total = items.length;
    const page = items.slice(query.offset, query.offset + query.limit);

    return {
      summary: {
        backgroundDue,
        backgroundScheduled,
        campaignDue,
        campaignScheduled,
        inFlight: backgroundInFlight + campaignInFlight,
        failed24h,
      },
      items: page,
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
    const bg = await retryFailedJob(id);
    if (bg) return { queue: 'background' as const, job: toPublicJob(bg) };

    const campaign = await CampaignJobModel.findById(id);
    if (!campaign) throw AppError.notFound('Job not found');
    if (!['failed', 'dead', 'cancelled'].includes(campaign.status)) {
      throw AppError.badRequest('Campaign job cannot be retried in its current state');
    }
    campaign.status = OUTREACH_QUEUE_STATUS;
    campaign.scheduledAt = new Date();
    campaign.error = null;
    campaign.leaseOwner = null;
    campaign.leaseExpiresAt = null;
    await campaign.save();
    return {
      queue: 'campaign' as const,
      job: {
        id: campaign._id.toHexString(),
        type: campaign.jobType,
        status: campaign.status,
        scheduledAt: campaign.scheduledAt.toISOString(),
      },
    };
  }

  async cancel(id: string) {
    const bg = await cancelJob(id);
    if (bg) return { queue: 'background' as const, job: toPublicJob(bg) };

    const campaign = await CampaignJobModel.findById(id);
    if (!campaign) throw AppError.notFound('Job not found');
    if (!['queued', 'queued_v2', 'leased', 'running'].includes(campaign.status)) {
      throw AppError.badRequest('Campaign job cannot be cancelled in its current state');
    }
    campaign.status = 'cancelled';
    campaign.leaseOwner = null;
    campaign.leaseExpiresAt = null;
    await campaign.save();
    return {
      queue: 'campaign' as const,
      job: {
        id: campaign._id.toHexString(),
        type: campaign.jobType,
        status: campaign.status,
      },
    };
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
