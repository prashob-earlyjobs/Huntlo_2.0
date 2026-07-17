import { getLogger } from '../config/logger.js';
import { getWorkerRuntimeConfig, type WorkerRuntimeConfig } from './config.js';
import { ensureRecurringSweepJobs, registerAllJobHandlers } from './handlers.js';
import { BackgroundJobModel } from './job.model.js';
import { WorkerMetrics } from './metrics.js';
import {
  acquireJobLease,
  completeJob,
  createWorkerId,
  enqueueJob,
  failOrRetryJob,
  heartbeatJobLease,
  markJobRunning,
  releaseJobLease,
} from './queue.js';
import { getJobHandler } from './registry.js';

export type WorkerRunner = {
  workerId: string;
  metrics: WorkerMetrics;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  getMetrics: () => ReturnType<WorkerMetrics['snapshot']>;
};

export function createWorkerRunner(
  overrides?: Partial<WorkerRuntimeConfig> & { workerId?: string }
): WorkerRunner {
  const config = { ...getWorkerRuntimeConfig(), ...overrides };
  const workerId = overrides?.workerId ?? createWorkerId();
  const metrics = new WorkerMetrics(workerId);
  const logger = getLogger().child({ component: 'worker-runner', workerId });

  let running = false;
  let stopping = false;
  let pollTimer: NodeJS.Timeout | null = null;
  let sweepTimer: NodeJS.Timeout | null = null;
  const inFlight = new Map<string, AbortController>();
  let active = 0;

  async function executeJob(jobId: string): Promise<void> {
    const controller = new AbortController();
    inFlight.set(jobId, controller);
    metrics.activeJobs = inFlight.size;
    active += 1;

    const heartbeat = setInterval(() => {
      void heartbeatJobLease(jobId, workerId, config.leaseMs).then((ok) => {
        if (!ok) {
          logger.warn({ jobId }, 'Heartbeat failed — lease lost');
          controller.abort();
        }
      });
    }, config.heartbeatMs);
    heartbeat.unref?.();

    try {
      const job = await markJobRunning(jobId, workerId, config.leaseMs);
      if (!job) {
        metrics.jobsCancelledSkipped += 1;
        return;
      }

      // Re-check cancellation / status races
      const fresh = await BackgroundJobModel.findById(jobId);
      if (!fresh || fresh.status === 'cancelled') {
        metrics.jobsCancelledSkipped += 1;
        return;
      }

      const handler = getJobHandler(job.type);
      if (!handler) {
        throw new Error(`No handler registered for job type ${job.type}`);
      }

      const outcome = await handler({
        jobId,
        type: job.type,
        organizationId: job.organizationId ? String(job.organizationId) : null,
        entityType: job.entityType,
        entityId: job.entityId,
        payload: (job.payload ?? {}) as Record<string, unknown>,
        attempts: job.attempts,
        leaseOwner: workerId,
        signal: controller.signal,
      });

      if (controller.signal.aborted) {
        await failOrRetryJob({
          jobId,
          workerId,
          error: 'Lease lost or aborted during execution',
        });
        metrics.jobsRetried += 1;
        return;
      }

      const completed = await completeJob(jobId, workerId);
      if (!completed) {
        metrics.jobsCancelledSkipped += 1;
        return;
      }
      metrics.jobsCompleted += 1;

      if (outcome?.rescheduleInMs && outcome.rescheduleInMs > 0) {
        const isSweep = Boolean(
          (job.payload as { sweep?: boolean } | null)?.sweep
        );
        await enqueueJob({
          type: job.type,
          organizationId: job.organizationId
            ? String(job.organizationId)
            : null,
          entityType: job.entityType,
          entityId: job.entityId,
          payload: {
            ...(job.payload as Record<string, unknown>),
            ...(outcome.reschedulePayload ?? {}),
          },
          priority: job.priority,
          runAt: new Date(Date.now() + outcome.rescheduleInMs),
          maxAttempts: job.maxAttempts,
          idempotencyKey: isSweep
            ? job.idempotencyKey
            : job.idempotencyKey
              ? `${job.idempotencyKey}:next`
              : null,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      metrics.lastError = message;
      const failed = await failOrRetryJob({
        jobId,
        workerId,
        error: message,
      });
      if (failed?.status === 'failed') metrics.jobsFailed += 1;
      else metrics.jobsRetried += 1;
      logger.error({ err: error, jobId }, 'Job execution failed');
    } finally {
      clearInterval(heartbeat);
      inFlight.delete(jobId);
      metrics.activeJobs = inFlight.size;
      active = Math.max(0, active - 1);
    }
  }

  async function fillSlots(): Promise<void> {
    if (stopping || !running) return;
    metrics.lastPollAt = new Date();

    while (!stopping && active < config.concurrency) {
      const leased = await acquireJobLease({
        workerId,
        leaseMs: config.leaseMs,
      });
      if (!leased) break;

      metrics.jobsLeased += 1;
      const jobId = leased._id.toHexString();
      void executeJob(jobId);
      // Yield so concurrent leases can proceed without waiting for completion.
      await Promise.resolve();
    }
  }

  async function start(): Promise<void> {
    if (running) return;
    running = true;
    stopping = false;
    registerAllJobHandlers();
    await ensureRecurringSweepJobs(config.pollIntervalMs);

    logger.info(
      {
        concurrency: config.concurrency,
        pollIntervalMs: config.pollIntervalMs,
        leaseMs: config.leaseMs,
      },
      'Worker runner starting'
    );

    pollTimer = setInterval(() => {
      void fillSlots().catch((error) => {
        metrics.lastError =
          error instanceof Error ? error.message : String(error);
        logger.error({ err: error }, 'Worker poll failed');
      });
    }, config.pollIntervalMs);
    pollTimer.unref?.();

    sweepTimer = setInterval(() => {
      void ensureRecurringSweepJobs(config.pollIntervalMs).catch((error) => {
        logger.warn({ err: error }, 'Failed to ensure sweep jobs');
      });
    }, config.sweepIntervalMs);
    sweepTimer.unref?.();

    await fillSlots();
  }

  async function stop(): Promise<void> {
    if (!running) return;
    stopping = true;
    running = false;

    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    if (sweepTimer) {
      clearInterval(sweepTimer);
      sweepTimer = null;
    }

    logger.info(
      { inFlight: inFlight.size },
      'Worker runner stopping — releasing leases'
    );

    for (const [jobId, controller] of inFlight.entries()) {
      controller.abort();
      await releaseJobLease(jobId, workerId, 'graceful_shutdown');
    }
    inFlight.clear();
    metrics.activeJobs = 0;
    active = 0;
  }

  return {
    workerId,
    metrics,
    start,
    stop,
    getMetrics: () => metrics.snapshot(),
  };
}
