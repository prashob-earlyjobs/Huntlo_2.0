import { getLogger } from '../config/logger.js';
import { processDueAssessmentJobs } from '../modules/assessments/index.js';
import {
  processQueuedBulkRevealJobs,
  processQueuedImportJobs,
} from '../modules/candidates/index.js';
import { processDueSchedulingJobs } from '../modules/scheduling/index.js';
import { pollSourcingSessions } from '../modules/sourcing/index.js';
import { reportsService } from '../modules/analytics/reports.service.js';
import type { BackgroundJobType } from './job.model.js';
import { enqueueJob } from './queue.js';
import {
  registerJobHandler,
  type JobHandler,
  type JobHandlerContext,
} from './registry.js';

const logger = () => getLogger().child({ component: 'job-handlers' });

const HANDLERS: Record<BackgroundJobType, JobHandler> = {
  async 'sourcing.poll'(ctx) {
    const payload = ctx.payload ?? {};
    const sourcingSessionId =
      typeof payload.sourcingSessionId === 'string' ? payload.sourcingSessionId : null;
    const futureJobsSessionId =
      typeof payload.futureJobsSessionId === 'string' ? payload.futureJobsSessionId : null;
    const deadlineAt =
      typeof payload.deadlineAt === 'string' ? Date.parse(payload.deadlineAt) : NaN;

    // Per-session poll job (enqueue from apply / fetch-more)
    if (sourcingSessionId || futureJobsSessionId) {
      const { pollSourcingSessionById, pollSourcingSessionByFutureJobsId } = await import(
        '../modules/sourcing/index.js'
      );

      if (Number.isFinite(deadlineAt) && Date.now() > deadlineAt) {
        logger().info(
          { jobId: ctx.jobId, sourcingSessionId, futureJobsSessionId },
          'sourcing.poll deadline reached — stopping'
        );
        return { result: { stopped: true, reason: 'deadline' } };
      }

      if (sourcingSessionId) {
        await pollSourcingSessionById(sourcingSessionId);
      } else if (futureJobsSessionId) {
        await pollSourcingSessionByFutureJobsId(futureJobsSessionId);
      }

      // Reschedule while session still polling (idempotent key prevents duplicates)
      const { SourcingSessionModel } = await import(
        '../modules/sourcing/sourcing-session.model.js'
      );
      const session = sourcingSessionId
        ? await SourcingSessionModel.findById(sourcingSessionId)
        : await SourcingSessionModel.findOne({
            $or: [
              { futureJobsSessionId },
              { externalSessionId: futureJobsSessionId },
            ],
          });

      const stillActive =
        session &&
        ['creating', 'pending', 'queued', 'running', 'polling'].includes(session.status) &&
        session.polling !== false;

      if (stillActive) {
        return {
          result: { processed: 1, sessionId: session._id.toHexString() },
          rescheduleInMs: Number(payload.intervalMs ?? 3_000),
        };
      }

      return {
        result: {
          processed: 1,
          sessionId: session?._id.toHexString() ?? sourcingSessionId,
          status: session?.status ?? 'unknown',
        },
      };
    }

    // Sweep fallback for sessions without a dedicated job
    const processed = await pollSourcingSessions();
    logger().debug({ jobId: ctx.jobId, processed }, 'sourcing.poll sweep completed');
    return {
      result: { processed },
      rescheduleInMs: Number(payload.intervalMs ?? 5_000),
    };
  },

  async 'candidate.bulk_reveal'(ctx) {
    const processed = await processQueuedBulkRevealJobs(
      Number(ctx.payload.limit ?? 5)
    );
    return {
      result: { processed },
      rescheduleInMs: Number(ctx.payload.intervalMs ?? 5_000),
    };
  },

  async 'candidate.import'(ctx) {
    const processed = await processQueuedImportJobs(Number(ctx.payload.limit ?? 5));
    return {
      result: { processed },
      rescheduleInMs: Number(ctx.payload.intervalMs ?? 5_000),
    };
  },

  async 'outreach.execute_step'(ctx) {
    // Old Mongo campaign queue disconnected — BullMQ cron/worker handles outreach sends.
    const assessments = await processDueAssessmentJobs(
      Number(ctx.payload.assessmentLimit ?? 50)
    );
    return {
      result: { processed: 0, assessments },
      rescheduleInMs: Number(ctx.payload.intervalMs ?? 5_000),
    };
  },

  async 'outreach.sync_email_replies'(ctx) {
    // Reply sync moved to bull-outreach cron (every minute).
    void ctx;
    return {
      result: { synced: 0 },
      rescheduleInMs: Number(ctx.payload.intervalMs ?? 60_000),
    };
  },

  async 'outreach.retry_delivery'(ctx) {
    // Old Mongo campaign queue disconnected — BullMQ handles retries via pending jobs.
    void ctx;
    return {
      result: { processed: 0 },
      rescheduleInMs: Number(ctx.payload.intervalMs ?? 60_000),
    };
  },

  async 'screening.launch_calls'(ctx) {
    void ctx;
    return {
      result: { launched: 0 },
      rescheduleInMs: Number(ctx.payload.intervalMs ?? 15_000),
    };
  },

  async 'scheduling.sync_bookings'(ctx) {
    const processed = await processDueSchedulingJobs(
      Number(ctx.payload.limit ?? 50)
    );
    return {
      result: { processed },
      rescheduleInMs: Number(ctx.payload.intervalMs ?? 15_000),
    };
  },

  async 'scheduling.send_reminder'(ctx) {
    const processed = await processDueSchedulingJobs(
      Number(ctx.payload.limit ?? 50)
    );
    return {
      result: { processed },
      rescheduleInMs: Number(ctx.payload.intervalMs ?? 15_000),
    };
  },

  async 'usage.reset_period'(ctx) {
    void ctx;
    return { result: { reset: false } };
  },

  async 'report.generate'(ctx) {
    const organizationId = ctx.organizationId;
    const reportId = ctx.entityId || String(ctx.payload.reportId ?? '');
    if (!organizationId || !reportId) {
      throw new Error(
        'report.generate requires organizationId and entityId/reportId'
      );
    }
    await reportsService.get(organizationId, reportId);
    return { result: { reportId, status: 'ready' } };
  },

  async 'integration.health_check'(ctx) {
    void ctx;
    return {
      result: { checked: 0 },
      rescheduleInMs: Number(ctx.payload.intervalMs ?? 60_000),
    };
  },

  async 'webhook.retry'(ctx) {
    const webhookEventId = String(
      ctx.payload.webhookEventId || ctx.entityId || ''
    );
    if (!webhookEventId) {
      return { result: { retried: 0, reason: 'missing_webhook_event_id' } };
    }
    const { processWebhookEvent } = await import(
      '../modules/webhooks/process.service.js'
    );
    const outcome = await processWebhookEvent(webhookEventId);
    return { result: { retried: 1, ...outcome } };
  },
};

export function registerAllJobHandlers(): void {
  for (const [type, handler] of Object.entries(HANDLERS) as Array<
    [BackgroundJobType, JobHandler]
  >) {
    registerJobHandler(type, handler);
  }
}

/** Ensure recurring sweep jobs exist so the worker has work without Redis. */
export async function ensureRecurringSweepJobs(intervalMs: number): Promise<void> {
  const sweeps: Array<{
    type: BackgroundJobType;
    idempotencyKey: string;
    intervalMs: number;
  }> = [
    { type: 'sourcing.poll', idempotencyKey: 'sweep:sourcing.poll', intervalMs },
    {
      type: 'candidate.bulk_reveal',
      idempotencyKey: 'sweep:candidate.bulk_reveal',
      intervalMs,
    },
    { type: 'candidate.import', idempotencyKey: 'sweep:candidate.import', intervalMs },
    {
      type: 'outreach.execute_step',
      idempotencyKey: 'sweep:outreach.execute_step',
      intervalMs,
    },
    {
      type: 'outreach.sync_email_replies',
      idempotencyKey: 'sweep:outreach.sync_email_replies',
      intervalMs: Math.max(intervalMs, 30_000),
    },
    {
      type: 'outreach.retry_delivery',
      idempotencyKey: 'sweep:outreach.retry_delivery',
      intervalMs: Math.max(intervalMs, 15_000),
    },
    {
      type: 'screening.launch_calls',
      idempotencyKey: 'sweep:screening.launch_calls',
      intervalMs: Math.max(intervalMs, 15_000),
    },
    {
      type: 'scheduling.sync_bookings',
      idempotencyKey: 'sweep:scheduling.sync_bookings',
      intervalMs: Math.max(intervalMs, 15_000),
    },
    {
      type: 'scheduling.send_reminder',
      idempotencyKey: 'sweep:scheduling.send_reminder',
      intervalMs: Math.max(intervalMs, 15_000),
    },
    {
      type: 'integration.health_check',
      idempotencyKey: 'sweep:integration.health_check',
      intervalMs: Math.max(intervalMs, 60_000),
    },
    {
      type: 'webhook.retry',
      idempotencyKey: 'sweep:webhook.retry',
      intervalMs: Math.max(intervalMs, 30_000),
    },
  ];

  for (const sweep of sweeps) {
    await enqueueJob({
      type: sweep.type,
      idempotencyKey: sweep.idempotencyKey,
      priority: 50,
      payload: { intervalMs: sweep.intervalMs, sweep: true },
      maxAttempts: 25,
    });
  }
}

export type { JobHandlerContext };
