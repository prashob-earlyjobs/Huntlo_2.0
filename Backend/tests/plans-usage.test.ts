import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { OnboardingModel } from '../src/modules/auth/onboarding.model.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import { PricingPlanModel } from '../src/modules/plans/pricing-plan.model.js';
import { WorkspaceSubscriptionModel } from '../src/modules/plans/subscription.model.js';
import {
  QuotaCounterModel,
  UsageLedgerModel,
  UsageReservationModel,
  currentPeriodKey,
  periodResetAt,
  quotaService,
} from '../src/shared/usage/index.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerAndAuth(
  agent: ReturnType<typeof request.agent>,
  suffix = ''
) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `plans-${Date.now()}${suffix}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Plans',
    lastName: 'Tester',
    organizationName: `Plans Org ${Date.now()}${suffix}`,
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
    userId: response.body.data.user.id as string,
  };
}

describe('Plans + usage API', () => {
  const app = createApp();
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    await startMemoryMongo();
    resetEnvCache();
    await connectDatabase();
    agent = request.agent(app);
  }, 60_000);

  afterAll(async () => {
    await disconnectDatabase();
    await stopMemoryMongo();
  });

  beforeEach(async () => {
    clearRateLimits();
    await Promise.all([
      UsageLedgerModel.deleteMany({}),
      UsageReservationModel.deleteMany({}),
      QuotaCounterModel.deleteMany({}),
      WorkspaceSubscriptionModel.deleteMany({}),
      PricingPlanModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);
  });

  it('lists plans and returns current plan + usage summary', async () => {
    const auth = await registerAndAuth(agent);

    const plans = await agent
      .get('/api/v1/plans')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(plans.status).toBe(200);
    expect(plans.body.data.length).toBeGreaterThanOrEqual(3);
    expect(plans.body.data[0].code).toBeTruthy();

    const current = await agent
      .get('/api/v1/plans/current')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(current.status).toBe(200);
    expect(current.body.data.name).toBeTruthy();
    expect(current.body.data.subscription.status).toBe('active');

    const usage = await agent
      .get('/api/v1/usage')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(usage.status).toBe(200);
    expect(Array.isArray(usage.body.data)).toBe(true);
    expect(usage.body.data.some((row: { metric: string }) => row.metric === 'candidate_search')).toBe(
      true
    );

    const summary = await agent
      .get('/api/v1/usage/summary')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(summary.status).toBe(200);
    expect(summary.body.data.periodKey).toBe(currentPeriodKey());

    const metric = await agent
      .get('/api/v1/usage/email_reveal')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(metric.status).toBe(200);
    expect(metric.body.data.metric).toBe('email_reveal');
  });

  it('admin can create and deactivate a plan', async () => {
    const auth = await registerAndAuth(agent, '-admin');

    const created = await agent
      .post('/api/v1/admin/plans')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Pilot',
        code: 'pilot',
        prices: { monthly: 1000, yearly: 10_000 },
        limits: { candidate_search: 10, team_seats: 2 },
        featureAccess: { sourcing: true },
      });
    expect(created.status).toBe(201);
    expect(created.body.data.code).toBe('pilot');

    const deactivated = await agent
      .patch(`/api/v1/admin/plans/${created.body.data.id}/status`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ active: false });
    expect(deactivated.status).toBe(200);
    expect(deactivated.body.data.active).toBe(false);
  });
});

describe('Shared quota concurrency', () => {
  beforeAll(async () => {
    await startMemoryMongo();
    resetEnvCache();
    await connectDatabase();
  }, 60_000);

  afterAll(async () => {
    await disconnectDatabase();
    await stopMemoryMongo();
  });

  beforeEach(async () => {
    await Promise.all([
      UsageLedgerModel.deleteMany({}),
      UsageReservationModel.deleteMany({}),
      QuotaCounterModel.deleteMany({}),
      PricingPlanModel.deleteMany({}),
      WorkspaceSubscriptionModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
    ]);
  });

  it('atomically prevents oversubscription under concurrent reserves', async () => {
    const org = await OrganizationModel.create({
      name: 'Concurrent Quota',
      slug: `cq-${Date.now()}`,
      initials: 'CQ',
      plan: 'Starter',
    });
    const orgId = org._id.toHexString();
    const periodKey = currentPeriodKey();

    await QuotaCounterModel.create({
      organizationId: org._id,
      periodKey,
      metric: 'candidate_search',
      used: 0,
      reserved: 0,
      limit: 5,
      resetAt: periodResetAt(periodKey),
      allowOverage: false,
    });

    const attempts = Array.from({ length: 12 }, (_, index) =>
      quotaService
        .reserveUsage({
          organizationId: orgId,
          metric: 'candidate_search',
          quantity: 1,
          idempotencyKey: `concurrent-${index}`,
          relatedEntityType: 'test',
          relatedEntityId: String(index),
        })
        .then(() => ({ ok: true as const }))
        .catch((error: { statusCode?: number; code?: string }) => ({
          ok: false as const,
          statusCode: error.statusCode,
          code: error.code,
        }))
    );

    const results = await Promise.all(attempts);
    const successes = results.filter((row) => row.ok);
    const failures = results.filter((row) => !row.ok);

    expect(successes).toHaveLength(5);
    expect(failures.length).toBe(7);
    expect(failures.every((row) => row.statusCode === 429 && row.code === 'QUOTA_EXCEEDED')).toBe(
      true
    );

    const counter = await QuotaCounterModel.findOne({
      organizationId: org._id,
      periodKey,
      metric: 'candidate_search',
    });
    expect(counter?.reserved).toBe(5);
    expect(counter!.used + counter!.reserved).toBeLessThanOrEqual(counter!.limit);

    // Commit one reserved unit and ensure ledger history exists.
    await quotaService.commitUsage({
      organizationId: orgId,
      metric: 'candidate_search',
      idempotencyKey: 'concurrent-0',
    });
    const after = await QuotaCounterModel.findOne({
      organizationId: org._id,
      periodKey,
      metric: 'candidate_search',
    });
    expect(after?.used).toBe(1);
    expect(after?.reserved).toBe(4);

    const history = await quotaService.getHistory(orgId, { limit: 20 });
    expect(history.items.length).toBeGreaterThan(0);
  });

  it('releases uncommitted reservation on provider-style refund path', async () => {
    const org = await OrganizationModel.create({
      name: 'Refund Quota',
      slug: `rq-${Date.now()}`,
      initials: 'RQ',
      plan: 'Starter',
    });
    const orgId = org._id.toHexString();

    await quotaService.reserveUsage({
      organizationId: orgId,
      metric: 'people_scout',
      quantity: 1,
      idempotencyKey: 'lookup-1',
    });
    let view = (await quotaService.getUsage(orgId, 'people_scout')) as {
      reserved: number;
      used: number;
    };
    expect(view.reserved).toBe(1);

    await quotaService.releaseUsage({
      organizationId: orgId,
      metric: 'people_scout',
      idempotencyKey: 'lookup-1',
    });
    view = (await quotaService.getUsage(orgId, 'people_scout')) as {
      reserved: number;
      used: number;
    };
    expect(view.reserved).toBe(0);
    expect(view.used).toBe(0);
  });

  it('returns structured quota meta on 429', async () => {
    const org = await OrganizationModel.create({
      name: 'Meta Quota',
      slug: `mq-${Date.now()}`,
      initials: 'MQ',
      plan: 'Starter',
    });
    const orgId = org._id.toHexString();
    await QuotaCounterModel.create({
      organizationId: org._id,
      periodKey: currentPeriodKey(),
      metric: 'email_reveal',
      used: 2,
      reserved: 0,
      limit: 2,
      resetAt: periodResetAt(currentPeriodKey()),
      allowOverage: false,
    });

    await expect(
      quotaService.reserveUsage({
        organizationId: orgId,
        metric: 'email_reveal',
        quantity: 2,
        idempotencyKey: 'email-block',
      })
    ).rejects.toMatchObject({
      statusCode: 429,
      code: 'QUOTA_EXCEEDED',
      meta: {
        quota: {
          metric: 'email_reveal',
          limit: 2,
          used: 2,
          remaining: 0,
        },
      },
    });
  });
});
