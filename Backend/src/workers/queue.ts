import { hostname } from 'node:os';
import { randomUUID } from 'node:crypto';

import mongoose from 'mongoose';

import { getLogger } from '../config/logger.js';
import {
  BackgroundJobModel,
  type BackgroundJobDocument,
  type BackgroundJobStatus,
  type BackgroundJobType,
} from './job.model.js';

const logger = () => getLogger().child({ component: 'job-queue' });

export type EnqueueJobInput = {
  type: BackgroundJobType;
  organizationId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  payload?: Record<string, unknown>;
  priority?: number;
  runAt?: Date;
  maxAttempts?: number;
  idempotencyKey?: string | null;
};

export type PublicBackgroundJob = {
  id: string;
  type: BackgroundJobType;
  organizationId: string | null;
  entityType: string | null;
  entityId: string | null;
  payload: Record<string, unknown>;
  status: BackgroundJobStatus;
  priority: number;
  runAt: string;
  attempts: number;
  maxAttempts: number;
  leaseOwner: string | null;
  leaseExpiresAt: string | null;
  lastError: string | null;
  completedAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  idempotencyKey: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toPublicJob(doc: BackgroundJobDocument): PublicBackgroundJob {
  return {
    id: doc._id.toHexString(),
    type: doc.type,
    organizationId: doc.organizationId ? String(doc.organizationId) : null,
    entityType: doc.entityType,
    entityId: doc.entityId,
    payload: (doc.payload ?? {}) as Record<string, unknown>,
    status: doc.status,
    priority: doc.priority,
    runAt: doc.runAt.toISOString(),
    attempts: doc.attempts,
    maxAttempts: doc.maxAttempts,
    leaseOwner: doc.leaseOwner,
    leaseExpiresAt: doc.leaseExpiresAt?.toISOString() ?? null,
    lastError: doc.lastError,
    completedAt: doc.completedAt?.toISOString() ?? null,
    failedAt: doc.failedAt?.toISOString() ?? null,
    cancelledAt: doc.cancelledAt?.toISOString() ?? null,
    idempotencyKey: doc.idempotencyKey,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function createWorkerId(prefix = 'worker'): string {
  return `${prefix}:${hostname()}:${process.pid}:${randomUUID().slice(0, 8)}`;
}

/** Exponential backoff with jitter. attempt is 1-based after increment. */
export function computeBackoffMs(attempt: number, baseMs = 2_000, maxMs = 15 * 60_000): number {
  const exp = Math.min(maxMs, baseMs * 2 ** Math.max(0, attempt - 1));
  const jitter = Math.floor(Math.random() * Math.min(1_000, exp * 0.2));
  return exp + jitter;
}

export async function enqueueJob(
  input: EnqueueJobInput
): Promise<{ job: PublicBackgroundJob; created: boolean }> {
  if (input.idempotencyKey) {
    const existing = await BackgroundJobModel.findOne({
      idempotencyKey: input.idempotencyKey,
      status: { $in: ['pending', 'leased', 'running', 'retrying'] },
    });
    if (existing) {
      return { job: toPublicJob(existing), created: false };
    }
  }

  try {
    const doc = await BackgroundJobModel.create({
      type: input.type,
      organizationId: input.organizationId
        ? new mongoose.Types.ObjectId(input.organizationId)
        : null,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      payload: input.payload ?? {},
      priority: input.priority ?? 100,
      runAt: input.runAt ?? new Date(),
      maxAttempts: input.maxAttempts ?? 5,
      idempotencyKey: input.idempotencyKey ?? null,
      status: 'pending',
    });
    return { job: toPublicJob(doc), created: true };
  } catch (error) {
    // Race on unique idempotency index — return the winner.
    if (
      input.idempotencyKey &&
      error instanceof Error &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      const existing = await BackgroundJobModel.findOne({
        idempotencyKey: input.idempotencyKey,
        status: { $in: ['pending', 'leased', 'running', 'retrying'] },
      });
      if (existing) return { job: toPublicJob(existing), created: false };
    }
    throw error;
  }
}

/**
 * Atomically acquire a lease on the next due job.
 * Claimable: pending|retrying with runAt <= now, OR leased|running with expired lease.
 */
export async function acquireJobLease(options: {
  workerId: string;
  leaseMs: number;
  types?: BackgroundJobType[];
}): Promise<BackgroundJobDocument | null> {
  const now = new Date();
  const leaseExpiresAt = new Date(now.getTime() + options.leaseMs);

  const typeFilter = options.types?.length ? { type: { $in: options.types } } : {};

  const filter = {
    ...typeFilter,
    $or: [
      {
        status: { $in: ['pending', 'retrying'] },
        runAt: { $lte: now },
      },
      {
        status: { $in: ['leased', 'running'] },
        leaseExpiresAt: { $lte: now },
      },
    ],
  };

  const doc = await BackgroundJobModel.findOneAndUpdate(
    filter,
    {
      $set: {
        status: 'leased',
        leaseOwner: options.workerId,
        leaseExpiresAt,
        lastError: null,
      },
      $inc: { attempts: 1 },
    },
    {
      sort: { priority: -1, runAt: 1, createdAt: 1 },
      new: true,
    }
  );

  if (doc) {
    logger().debug(
      {
        jobId: String(doc._id),
        type: doc.type,
        attempts: doc.attempts,
        workerId: options.workerId,
      },
      'Job leased'
    );
  }

  return doc;
}

export async function markJobRunning(
  jobId: string,
  workerId: string,
  leaseMs: number
): Promise<BackgroundJobDocument | null> {
  return BackgroundJobModel.findOneAndUpdate(
    {
      _id: jobId,
      leaseOwner: workerId,
      status: { $in: ['leased', 'running'] },
    },
    {
      $set: {
        status: 'running',
        leaseExpiresAt: new Date(Date.now() + leaseMs),
      },
    },
    { new: true }
  );
}

export async function heartbeatJobLease(
  jobId: string,
  workerId: string,
  leaseMs: number
): Promise<boolean> {
  const updated = await BackgroundJobModel.findOneAndUpdate(
    {
      _id: jobId,
      leaseOwner: workerId,
      status: { $in: ['leased', 'running'] },
    },
    {
      $set: { leaseExpiresAt: new Date(Date.now() + leaseMs) },
    },
    { new: true }
  );
  return Boolean(updated);
}

export async function completeJob(
  jobId: string,
  workerId: string
): Promise<BackgroundJobDocument | null> {
  return BackgroundJobModel.findOneAndUpdate(
    {
      _id: jobId,
      leaseOwner: workerId,
      status: { $in: ['leased', 'running'] },
    },
    {
      $set: {
        status: 'completed',
        completedAt: new Date(),
        leaseOwner: null,
        leaseExpiresAt: null,
        lastError: null,
      },
    },
    { new: true }
  );
}

export async function failOrRetryJob(options: {
  jobId: string;
  workerId: string;
  error: string;
  baseBackoffMs?: number;
}): Promise<BackgroundJobDocument | null> {
  const job = await BackgroundJobModel.findOne({
    _id: options.jobId,
    leaseOwner: options.workerId,
    status: { $in: ['leased', 'running'] },
  });
  if (!job) return null;

  const errorMessage = options.error.slice(0, 4000);

  if (job.attempts >= job.maxAttempts) {
    job.status = 'failed';
    job.failedAt = new Date();
    job.lastError = errorMessage;
    job.leaseOwner = null;
    job.leaseExpiresAt = null;
    await job.save();
    logger().warn(
      { jobId: options.jobId, type: job.type, attempts: job.attempts },
      'Job permanently failed'
    );
    return job;
  }

  const delay = computeBackoffMs(job.attempts, options.baseBackoffMs);
  job.status = 'retrying';
  job.runAt = new Date(Date.now() + delay);
  job.lastError = errorMessage;
  job.leaseOwner = null;
  job.leaseExpiresAt = null;
  await job.save();
  logger().info(
    {
      jobId: options.jobId,
      type: job.type,
      attempts: job.attempts,
      retryInMs: delay,
    },
    'Job scheduled for retry'
  );
  return job;
}

export async function cancelJob(
  jobId: string,
  organizationId?: string | null
): Promise<BackgroundJobDocument | null> {
  const filter: Record<string, unknown> = {
    _id: jobId,
    status: { $in: ['pending', 'retrying', 'leased', 'running'] },
  };
  if (organizationId) filter.organizationId = organizationId;

  return BackgroundJobModel.findOneAndUpdate(
    filter,
    {
      $set: {
        status: 'cancelled',
        cancelledAt: new Date(),
        leaseOwner: null,
        leaseExpiresAt: null,
      },
    },
    { new: true }
  );
}

export async function retryFailedJob(
  jobId: string,
  organizationId?: string | null
): Promise<BackgroundJobDocument | null> {
  const filter: Record<string, unknown> = {
    _id: jobId,
    status: { $in: ['failed', 'cancelled'] },
  };
  if (organizationId) filter.organizationId = organizationId;

  return BackgroundJobModel.findOneAndUpdate(
    filter,
    {
      $set: {
        status: 'pending',
        runAt: new Date(),
        lastError: null,
        failedAt: null,
        cancelledAt: null,
        completedAt: null,
        leaseOwner: null,
        leaseExpiresAt: null,
        attempts: 0,
      },
    },
    { new: true }
  );
}

export async function releaseJobLease(
  jobId: string,
  workerId: string,
  reason = 'shutdown'
): Promise<void> {
  await BackgroundJobModel.updateOne(
    {
      _id: jobId,
      leaseOwner: workerId,
      status: { $in: ['leased', 'running'] },
    },
    {
      $set: {
        status: 'retrying',
        runAt: new Date(),
        leaseOwner: null,
        leaseExpiresAt: null,
        lastError: `Lease released: ${reason}`,
      },
    }
  );
}
