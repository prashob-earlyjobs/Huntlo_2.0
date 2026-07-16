import mongoose from 'mongoose';

import { createChildLogger } from '../../config/logger.js';
import { emitRealtime } from '../../realtime/events.js';
import { AppError } from '../../shared/errors/app-error.js';
import { IdempotencyModel } from '../../shared/idempotency/idempotency.model.js';
import { CandidateActivityModel } from './candidate-activity.model.js';
import {
  BulkRevealJobModel,
  type BulkRevealItemStatus,
  type BulkRevealJobDocument,
} from './bulk-reveal-job.model.js';
import { revealService, type ActorContext, type RevealResult } from './reveal.service.js';
import type { RevealedContactType } from './revealed-contact.model.js';

const log = () => createChildLogger({ module: 'candidates-bulk-reveal' });

export type BulkRevealItemInput = {
  candidateId: string;
  contactTypes: RevealedContactType[];
};

function classifyReveal(result: RevealResult): BulkRevealItemStatus {
  if (!result.found || result.source === 'missing') return 'missing';
  if (result.source === 'previous_reveal') return 'previously_revealed';
  if (result.source === 'shared_cache') return 'cache_hit';
  if (result.charged) return 'success';
  return 'success';
}

function bumpCount(
  counts: BulkRevealJobDocument['counts'],
  status: BulkRevealItemStatus
): void {
  switch (status) {
    case 'success':
      counts.success = (counts.success ?? 0) + 1;
      break;
    case 'cache_hit':
      counts.cacheHit = (counts.cacheHit ?? 0) + 1;
      break;
    case 'previously_revealed':
      counts.previouslyRevealed = (counts.previouslyRevealed ?? 0) + 1;
      break;
    case 'missing':
      counts.missing = (counts.missing ?? 0) + 1;
      break;
    case 'quota_exhausted':
      counts.quotaExhausted = (counts.quotaExhausted ?? 0) + 1;
      break;
    case 'failed':
      counts.failed = (counts.failed ?? 0) + 1;
      break;
    default:
      break;
  }
}

function serializeJob(job: BulkRevealJobDocument) {
  return {
    id: job._id.toHexString(),
    organizationId: job.organizationId.toHexString(),
    userId: job.userId.toHexString(),
    status: job.status,
    progress: job.progress,
    counts: {
      success: job.counts?.success ?? 0,
      cacheHit: job.counts?.cacheHit ?? 0,
      previouslyRevealed: job.counts?.previouslyRevealed ?? 0,
      missing: job.counts?.missing ?? 0,
      failed: job.counts?.failed ?? 0,
      quotaExhausted: job.counts?.quotaExhausted ?? 0,
    },
    items: (job.items ?? []).map((item) => ({
      candidateId: item.candidateId.toHexString(),
      contactTypes: item.contactTypes,
      status: item.status,
      source: item.source ?? null,
      error: item.error ?? null,
    })),
    idempotencyKey: job.idempotencyKey,
    startedAt: job.startedAt ?? null,
    completedAt: job.completedAt ?? null,
    errorMessage: job.errorMessage ?? null,
    createdAt: job.createdAt ?? null,
  };
}

function emitBulkProgress(job: BulkRevealJobDocument): void {
  emitRealtime('candidates.reveal.bulk', {
    jobId: job._id.toHexString(),
    organizationId: job.organizationId.toHexString(),
    status: job.status,
    progress: job.progress,
    counts: serializeJob(job).counts,
  });
}

export class BulkRevealService {
  async createJob(
    actor: ActorContext,
    items: BulkRevealItemInput[],
    idempotencyKey: string
  ) {
    if (!items.length) {
      throw AppError.badRequest('At least one reveal item is required');
    }

    const existingIdem = await IdempotencyModel.findOne({
      scope: 'candidates.reveal.bulk',
      key: idempotencyKey,
      organizationId: actor.organizationId,
      userId: actor.userId,
      expiresAt: { $gt: new Date() },
    });
    if (existingIdem?.responseBody && typeof existingIdem.responseBody === 'object') {
      return existingIdem.responseBody as ReturnType<typeof serializeJob>;
    }

    const existingJob = await BulkRevealJobModel.findOne({
      organizationId: actor.organizationId,
      userId: actor.userId,
      idempotencyKey,
    });
    if (existingJob) {
      return serializeJob(existingJob);
    }

    const job = await BulkRevealJobModel.create({
      organizationId: actor.organizationId,
      userId: actor.userId,
      status: 'queued',
      items: items.map((item) => ({
        candidateId: new mongoose.Types.ObjectId(item.candidateId),
        contactTypes: item.contactTypes,
        status: 'queued',
      })),
      progress: 0,
      counts: {
        success: 0,
        cacheHit: 0,
        previouslyRevealed: 0,
        missing: 0,
        failed: 0,
        quotaExhausted: 0,
      },
      idempotencyKey,
    });

    await CandidateActivityModel.create({
      organizationId: actor.organizationId,
      candidateId: items[0] ? new mongoose.Types.ObjectId(items[0].candidateId) : job._id,
      userId: actor.userId,
      action: 'bulk_reveal_queued',
      metadata: { jobId: job._id.toHexString(), itemCount: items.length },
    });

    const payload = serializeJob(job);

    await IdempotencyModel.findOneAndUpdate(
      {
        scope: 'candidates.reveal.bulk',
        key: idempotencyKey,
        organizationId: actor.organizationId,
        userId: actor.userId,
      },
      {
        $set: {
          responseStatus: 202,
          responseBody: payload,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        $setOnInsert: {
          scope: 'candidates.reveal.bulk',
          key: idempotencyKey,
          organizationId: actor.organizationId,
          userId: actor.userId,
        },
      },
      { upsert: true }
    ).catch(() => undefined);

    log().info(
      {
        organizationId: actor.organizationId,
        jobId: job._id.toHexString(),
        itemCount: items.length,
      },
      'bulk reveal job queued'
    );

    // Local DX: kick off processing without waiting for the worker tick.
    setImmediate(() => {
      void this.processBulkRevealJob(job._id.toHexString()).catch((error) => {
        log().error(
          { err: error, jobId: job._id.toHexString() },
          'bulk reveal job failed'
        );
      });
    });

    return payload;
  }

  async getJob(actor: ActorContext, jobId: string) {
    if (!mongoose.isValidObjectId(jobId)) {
      throw AppError.badRequest('Invalid job id');
    }
    const job = await BulkRevealJobModel.findById(jobId);
    if (!job || job.organizationId.toHexString() !== actor.organizationId) {
      throw AppError.notFound('Bulk reveal job not found');
    }
    if (job.userId.toHexString() !== actor.userId) {
      // Same org members can poll progress for ops; still scope to org above.
    }
    return serializeJob(job);
  }

  async processBulkRevealJob(jobId: string): Promise<void> {
    const job = await BulkRevealJobModel.findOneAndUpdate(
      {
        _id: jobId,
        status: { $in: ['queued'] },
      },
      {
        $set: { status: 'running', startedAt: new Date(), progress: 0 },
      },
      { new: true }
    );

    if (!job) return;

    const actor: ActorContext = {
      userId: job.userId.toHexString(),
      organizationId: job.organizationId.toHexString(),
    };

    const totalSteps = Math.max(
      1,
      job.items.reduce((sum, item) => sum + (item.contactTypes?.length ?? 0), 0)
    );
    let completedSteps = 0;

    emitBulkProgress(job);

    for (let i = 0; i < job.items.length; i++) {
      const item = job.items[i]!;
      const contactTypes = (item.contactTypes ?? []) as RevealedContactType[];
      let itemStatus: BulkRevealItemStatus = 'success';
      let itemSource: string | null = null;
      let itemError: string | null = null;

      for (const contactType of contactTypes) {
        try {
          const result = await revealService.reveal(
            actor,
            item.candidateId.toHexString(),
            contactType
          );
          const status = classifyReveal(result);
          bumpCount(job.counts, status);
          itemSource = result.source;
          if (status === 'missing' || status === 'failed') {
            itemStatus = status;
          } else if (itemStatus === 'success' || itemStatus === 'queued') {
            itemStatus = status;
          }
        } catch (error) {
          const isQuota =
            error instanceof AppError &&
            error.statusCode === 409 &&
            /quota/i.test(error.message);
          const status: BulkRevealItemStatus = isQuota ? 'quota_exhausted' : 'failed';
          bumpCount(job.counts, status);
          itemStatus = status;
          itemError =
            error instanceof Error ? error.message.slice(0, 200) : 'reveal_failed';
          log().warn(
            {
              jobId: job._id.toHexString(),
              candidateId: item.candidateId.toHexString(),
              contactType,
              status,
            },
            'bulk reveal item failed'
          );
        }

        completedSteps += 1;
        job.progress = Math.min(100, Math.round((completedSteps / totalSteps) * 100));
        job.items[i]!.status = itemStatus;
        job.items[i]!.source = itemSource;
        job.items[i]!.error = itemError;
        job.markModified('items');
        job.markModified('counts');
        await job.save();
        emitBulkProgress(job);
      }
    }

    job.status = 'completed';
    job.progress = 100;
    job.completedAt = new Date();
    await job.save();
    emitBulkProgress(job);

    log().info(
      {
        jobId: job._id.toHexString(),
        organizationId: job.organizationId.toHexString(),
        counts: serializeJob(job).counts,
      },
      'bulk reveal job completed'
    );
  }

  async processQueuedBulkRevealJobs(limit = 5): Promise<number> {
    const jobs = await BulkRevealJobModel.find({ status: 'queued' })
      .sort({ createdAt: 1 })
      .limit(limit)
      .select('_id');

    let processed = 0;
    for (const job of jobs) {
      await this.processBulkRevealJob(job._id.toHexString());
      processed += 1;
    }
    return processed;
  }
}

export const bulkRevealService = new BulkRevealService();

export const processBulkRevealJob = (jobId: string) =>
  bulkRevealService.processBulkRevealJob(jobId);

export const processQueuedBulkRevealJobs = (limit?: number) =>
  bulkRevealService.processQueuedBulkRevealJobs(limit);
