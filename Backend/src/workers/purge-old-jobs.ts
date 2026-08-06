import { BackgroundJobModel } from './job.model.js';

/** Keep terminal job history for this many days. */
export const BACKGROUND_JOB_RETENTION_DAYS = 7;

const TERMINAL_STATUSES = ['completed', 'failed', 'cancelled'] as const;

export type PurgeOldJobsOptions = {
  retentionDays?: number;
  batchSize?: number;
  /** Cap work per run so the worker lease stays healthy. */
  maxBatches?: number;
};

export type PurgeOldJobsResult = {
  deleted: number;
  batches: number;
  retentionDays: number;
  cutoff: string;
  /** True when more matching docs may remain. */
  hasMore: boolean;
};

/**
 * Deletes terminal background jobs older than the retention window.
 * Active jobs (pending / leased / running / retrying) are never touched.
 */
export async function purgeOldBackgroundJobs(
  options: PurgeOldJobsOptions = {}
): Promise<PurgeOldJobsResult> {
  const retentionDays = Math.max(
    1,
    Number(options.retentionDays ?? BACKGROUND_JOB_RETENTION_DAYS) ||
      BACKGROUND_JOB_RETENTION_DAYS
  );
  const batchSize = Math.min(
    10_000,
    Math.max(100, Number(options.batchSize ?? 5_000) || 5_000)
  );
  const maxBatches = Math.min(
    500,
    Math.max(1, Number(options.maxBatches ?? 100) || 100)
  );
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  let deleted = 0;
  let batches = 0;

  while (batches < maxBatches) {
    const docs = await BackgroundJobModel.find({
      status: { $in: [...TERMINAL_STATUSES] },
      updatedAt: { $lt: cutoff },
    })
      .select('_id')
      .limit(batchSize)
      .lean();

    if (docs.length === 0) {
      return {
        deleted,
        batches,
        retentionDays,
        cutoff: cutoff.toISOString(),
        hasMore: false,
      };
    }

    const result = await BackgroundJobModel.deleteMany({
      _id: { $in: docs.map((d) => d._id) },
    });
    deleted += result.deletedCount ?? 0;
    batches += 1;

    if (docs.length < batchSize) {
      return {
        deleted,
        batches,
        retentionDays,
        cutoff: cutoff.toISOString(),
        hasMore: false,
      };
    }
  }

  return {
    deleted,
    batches,
    retentionDays,
    cutoff: cutoff.toISOString(),
    hasMore: true,
  };
}
