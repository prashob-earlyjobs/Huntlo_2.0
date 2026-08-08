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
import { WorkspaceSubscriptionModel } from '../src/modules/plans/subscription.model.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerAndAuth(agent: ReturnType<typeof request.agent>) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `trial-gate-${Date.now()}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Trial',
    lastName: 'Gate',
    organizationName: `Trial Gate Org ${Date.now()}`,
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
  };
}

describe('Trial expiry force-upgrade gate', () => {
  const app = createApp();
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    await startMemoryMongo();
    resetEnvCache();
    await connectDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
    await stopMemoryMongo();
  });

  beforeEach(async () => {
    clearRateLimits();
    agent = request.agent(app);
    await Promise.all([
      UserModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      WorkspaceSubscriptionModel.deleteMany({}),
    ]);
  });

  it('blocks product APIs and marks trialExpired after period end', async () => {
    const auth = await registerAndAuth(agent);

    await WorkspaceSubscriptionModel.updateOne(
      { organizationId: auth.organizationId, status: 'trialing' },
      {
        $set: {
          currentPeriodEnd: new Date(Date.now() - 60_000),
        },
      }
    );

    const me = await agent
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.organization.trialExpired).toBe(true);

    const current = await agent
      .get('/api/v1/plans/current')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(current.status).toBe(200);
    expect(current.body.data.trialExpired).toBe(true);
    expect(current.body.data.status).toBe('Trial ended');

    const blocked = await agent
      .get('/api/v1/jobs')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(blocked.status).toBe(402);
    expect(blocked.body.error.code).toBe('TRIAL_EXPIRED');

    // Upgrade surfaces remain reachable.
    const plans = await agent
      .get('/api/v1/plans')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(plans.status).toBe(200);
  });

  it('does not recreate a fresh trial after expiry', async () => {
    const auth = await registerAndAuth(agent);

    await WorkspaceSubscriptionModel.updateOne(
      { organizationId: auth.organizationId, status: 'trialing' },
      {
        $set: {
          currentPeriodEnd: new Date(Date.now() - 60_000),
        },
      }
    );

    await agent
      .get('/api/v1/plans/current')
      .set('Authorization', `Bearer ${auth.token}`);

    const count = await WorkspaceSubscriptionModel.countDocuments({
      organizationId: auth.organizationId,
    });
    expect(count).toBe(1);

    const sub = await WorkspaceSubscriptionModel.findOne({
      organizationId: auth.organizationId,
    });
    expect(sub?.status).toBe('cancelled');
  });
});
