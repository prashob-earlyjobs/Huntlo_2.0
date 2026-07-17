import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { OnboardingModel } from '../src/modules/auth/onboarding.model.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import {
  BackgroundJobModel,
  acquireJobLease,
  cancelJob,
  clearJobHandlers,
  completeJob,
  enqueueJob,
  failOrRetryJob,
  heartbeatJobLease,
  registerJobHandler,
} from '../src/workers/index.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerAndAuth(
  agent: ReturnType<typeof request.agent>,
  opts?: { platformAdmin?: boolean }
) {
  const email = `worker-${Date.now()}-${Math.random().toString(16).slice(2)}@huntlo.ai`;
  const response = await agent.post('/api/v1/auth/register').send({
    email,
    password: 'Password123!',
    firstName: 'Worker',
    lastName: 'Admin',
    organizationName: `Worker Org ${Date.now()}`,
  });
  expect(response.status).toBe(201);
  const userId = response.body.data.user.id as string;
  if (opts?.platformAdmin) {
    await UserModel.updateOne({ _id: userId }, { $set: { platformAdmin: true } });
    const login = await agent.post('/api/v1/auth/login').send({
      email,
      password: 'Password123!',
    });
    expect(login.status).toBe(200);
    return {
      token: login.body.data.accessToken as string,
      organizationId: login.body.data.organization.id as string,
      userId,
    };
  }
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
    userId,
  };
}

describe('Background jobs — leases and concurrency', () => {
  const app = createApp();
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    resetEnvCache();
    await startMemoryMongo();
    await connectDatabase();
    agent = request.agent(app);
  }, 60_000);

  afterAll(async () => {
    await disconnectDatabase();
    await stopMemoryMongo();
  });

  beforeEach(async () => {
    clearRateLimits();
    clearJobHandlers();
    await Promise.all([
      BackgroundJobModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);
  });

  it(
    'acquires leases atomically — only one worker wins for the same job',
    async () => {
      const { job } = await enqueueJob({
        type: 'usage.reset_period',
        payload: { test: true },
        maxAttempts: 3,
      });

      const results = await Promise.all(
        Array.from({ length: 12 }, (_, i) =>
          acquireJobLease({
            workerId: `worker-a-${i}`,
            leaseMs: 30_000,
          })
        )
      );

      const winners = results.filter(Boolean);
      expect(winners).toHaveLength(1);
      expect(String(winners[0]!._id)).toBe(job.id);
      expect(winners[0]!.status).toBe('leased');
      expect(winners[0]!.attempts).toBe(1);

      const stillPending = await BackgroundJobModel.countDocuments({
        status: 'pending',
      });
      expect(stillPending).toBe(0);
    },
    20_000
  );

  it(
    'reclaims jobs after lease expiration without duplicate owners',
    async () => {
      const { job } = await enqueueJob({
        type: 'usage.reset_period',
        payload: { lease: true },
        maxAttempts: 5,
      });

      const first = await acquireJobLease({
        workerId: 'worker-1',
        leaseMs: 60_000,
      });
      expect(first).toBeTruthy();
      expect(first!.leaseOwner).toBe('worker-1');

      // Another acquire while lease is live should fail
      const blocked = await acquireJobLease({
        workerId: 'worker-2',
        leaseMs: 30_000,
      });
      expect(blocked).toBeNull();

      // Force lease expiry
      await BackgroundJobModel.updateOne(
        { _id: job.id },
        { $set: { leaseExpiresAt: new Date(Date.now() - 1_000) } }
      );

      const reclaimed = await acquireJobLease({
        workerId: 'worker-2',
        leaseMs: 30_000,
      });
      expect(reclaimed).toBeTruthy();
      expect(String(reclaimed!._id)).toBe(job.id);
      expect(reclaimed!.leaseOwner).toBe('worker-2');
      expect(reclaimed!.attempts).toBe(2);

      const heartbeats = await heartbeatJobLease(job.id, 'worker-2', 30_000);
      expect(heartbeats).toBe(true);

      const stolen = await heartbeatJobLease(job.id, 'worker-1', 30_000);
      expect(stolen).toBe(false);

      await completeJob(job.id, 'worker-2');
      const done = await BackgroundJobModel.findById(job.id);
      expect(done?.status).toBe('completed');
    },
    20_000
  );

  it('retries with backoff then fails after maxAttempts', async () => {
    const { job } = await enqueueJob({
      type: 'webhook.retry',
      maxAttempts: 2,
    });

    const leased = await acquireJobLease({
      workerId: 'worker-retry',
      leaseMs: 30_000,
    });
    expect(leased).toBeTruthy();

    const retried = await failOrRetryJob({
      jobId: job.id,
      workerId: 'worker-retry',
      error: 'temporary failure',
      baseBackoffMs: 10,
    });
    expect(retried?.status).toBe('retrying');
    expect(retried?.runAt.getTime()).toBeGreaterThan(Date.now() - 1_000);

    await BackgroundJobModel.updateOne(
      { _id: job.id },
      { $set: { runAt: new Date() } }
    );

    const leased2 = await acquireJobLease({
      workerId: 'worker-retry',
      leaseMs: 30_000,
    });
    expect(leased2?.attempts).toBe(2);

    const failed = await failOrRetryJob({
      jobId: job.id,
      workerId: 'worker-retry',
      error: 'permanent failure',
    });
    expect(failed?.status).toBe('failed');
    expect(failed?.lastError).toContain('permanent failure');
  });

  it('honors idempotency keys and cancellation', async () => {
    const first = await enqueueJob({
      type: 'integration.health_check',
      idempotencyKey: 'idem-1',
    });
    const second = await enqueueJob({
      type: 'integration.health_check',
      idempotencyKey: 'idem-1',
    });
    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.job.id).toBe(first.job.id);

    const cancelled = await cancelJob(first.job.id);
    expect(cancelled?.status).toBe('cancelled');

    const lease = await acquireJobLease({
      workerId: 'worker-x',
      leaseMs: 30_000,
    });
    expect(lease).toBeNull();
  });

  it(
    'admin can list failed jobs, retry, and cancel',
    async () => {
      const auth = await registerAndAuth(agent, { platformAdmin: true });

      const { job } = await enqueueJob({
        type: 'report.generate',
        organizationId: auth.organizationId,
        entityId: '000000000000000000000001',
        maxAttempts: 1,
      });

      const leased = await acquireJobLease({
        workerId: 'admin-test',
        leaseMs: 30_000,
      });
      expect(leased).toBeTruthy();
      await failOrRetryJob({
        jobId: job.id,
        workerId: 'admin-test',
        error: 'boom',
      });

      const listed = await agent
        .get('/api/v1/admin/jobs?status=failed')
        .set('Authorization', `Bearer ${auth.token}`);
      expect(listed.status).toBe(200);
      expect(listed.body.data.items.length).toBeGreaterThanOrEqual(1);

      const detail = await agent
        .get(`/api/v1/admin/jobs/${job.id}`)
        .set('Authorization', `Bearer ${auth.token}`);
      expect(detail.status).toBe(200);
      expect(detail.body.data.status).toBe('failed');

      const retried = await agent
        .post(`/api/v1/admin/jobs/${job.id}/retry`)
        .set('Authorization', `Bearer ${auth.token}`);
      expect(retried.status).toBe(200);
      expect(retried.body.data.status).toBe('pending');

      const cancelled = await agent
        .post(`/api/v1/admin/jobs/${job.id}/cancel`)
        .set('Authorization', `Bearer ${auth.token}`);
      expect(cancelled.status).toBe(200);
      expect(cancelled.body.data.status).toBe('cancelled');
    },
    20_000
  );

  it(
    'runs concurrent slots without double-executing the same job',
    async () => {
      const executions: string[] = [];
      registerJobHandler('usage.reset_period', async (ctx) => {
        executions.push(ctx.jobId);
        await new Promise((r) => setTimeout(r, 50));
        return { result: { ok: true } };
      });

      const jobs = await Promise.all(
        Array.from({ length: 6 }, (_, i) =>
          enqueueJob({
            type: 'usage.reset_period',
            payload: { i },
            idempotencyKey: `conc-${i}`,
          })
        )
      );

      const workerIds = ['w-conc-1', 'w-conc-2', 'w-conc-3'];
      const leased = await Promise.all(
        workerIds.flatMap((workerId) =>
          Array.from({ length: 4 }, () =>
            acquireJobLease({ workerId, leaseMs: 30_000 })
          )
        )
      );

      const claimed = leased.filter(Boolean);
      expect(claimed.length).toBe(6);

      const owners = new Map<string, string>();
      for (const doc of claimed) {
        const id = String(doc!._id);
        expect(owners.has(id)).toBe(false);
        owners.set(id, doc!.leaseOwner!);
      }

      await Promise.all(
        claimed.map(async (doc) => {
          executions.push(String(doc!._id));
          await completeJob(String(doc!._id), doc!.leaseOwner!);
        })
      );

      const unique = new Set(jobs.map((j) => j.job.id));
      expect(unique.size).toBe(6);
      expect(await BackgroundJobModel.countDocuments({ status: 'completed' })).toBe(
        6
      );
    },
    20_000
  );
});
