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
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerAdmin(agent: ReturnType<typeof request.agent>) {
  const email = `feature-admin-${Date.now()}@huntlo.ai`;
  const response = await agent.post('/api/v1/auth/register').send({
    email,
    password: 'Password123!',
    firstName: 'Feature',
    lastName: 'Admin',
    organizationName: `Feature Org ${Date.now()}`,
  });
  expect(response.status).toBe(201);
  const userId = response.body.data.user.id as string;
  const organizationId = response.body.data.organization.id as string;
  await UserModel.updateOne({ _id: userId }, { $set: { platformAdmin: true } });
  const login = await agent.post('/api/v1/auth/login').send({
    email,
    password: 'Password123!',
  });
  expect(login.status).toBe(200);
  return {
    token: login.body.data.accessToken as string,
    userId,
    organizationId,
    email,
  };
}

describe('Feature access admin + middleware', () => {
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
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      UserModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      WorkspaceSubscriptionModel.deleteMany({}),
      PricingPlanModel.deleteMany({}),
    ]);
  });

  it('returns the plan matrix and blocks gated APIs until an exception is granted', async () => {
    const admin = await registerAdmin(agent);
    const auth = { Authorization: `Bearer ${admin.token}` };

    const overview = await agent.get('/api/v1/admin/feature-access').set(auth);
    expect(overview.status).toBe(200);
    expect(overview.body.data.features.some((row: { key: string }) => row.key === 'huntlo360')).toBe(
      true
    );
    const trial = overview.body.data.plans.find((plan: { code: string }) => plan.code === 'trial');
    expect(trial).toBeTruthy();
    expect(trial.featureAccess.huntlo360).toBe(false);
    expect(trial.featureAccess.sourcing).toBe(true);

    const blocked = await agent.get('/api/v1/huntlo-360/workflows').set(auth);
    expect(blocked.status).toBe(403);
    expect(blocked.body.error.code).toBe('FEATURE_DISABLED');

    const granted = await agent
      .put(`/api/v1/admin/feature-access/workspaces/${admin.organizationId}`)
      .set(auth)
      .send({
        overrides: {
          huntlo360: { enabled: true, note: 'Pilot workspace' },
        },
      });
    expect(granted.status).toBe(200);
    expect(granted.body.data.overrides.huntlo360.enabled).toBe(true);
    expect(granted.body.data.effectiveAccess.huntlo360).toBe(true);

    const allowed = await agent.get('/api/v1/huntlo-360/workflows').set(auth);
    expect(allowed.status).toBe(200);

    const revoked = await agent
      .put(`/api/v1/admin/feature-access/workspaces/${admin.organizationId}`)
      .set(auth)
      .send({
        overrides: {
          sourcing: { enabled: false },
        },
      });
    expect(revoked.status).toBe(200);
    expect(revoked.body.data.effectiveAccess.sourcing).toBe(false);

    const sourcingBlocked = await agent.get('/api/v1/sourcing/sessions').set(auth);
    expect(sourcingBlocked.status).toBe(403);
    expect(sourcingBlocked.body.error.code).toBe('FEATURE_DISABLED');

    const cleared = await agent
      .delete(`/api/v1/admin/feature-access/workspaces/${admin.organizationId}`)
      .set(auth);
    expect(cleared.status).toBe(200);
    expect(cleared.body.data.overrides).toEqual({});
    expect(cleared.body.data.effectiveAccess.sourcing).toBe(true);

    const sourcingAllowed = await agent.get('/api/v1/sourcing/sessions').set(auth);
    expect(sourcingAllowed.status).toBe(200);
  });

  it('updates plan-level feature access from the admin matrix', async () => {
    const admin = await registerAdmin(agent);
    const auth = { Authorization: `Bearer ${admin.token}` };

    const overview = await agent.get('/api/v1/admin/feature-access').set(auth);
    const trial = overview.body.data.plans.find((plan: { code: string }) => plan.code === 'trial');

    const updated = await agent
      .patch(`/api/v1/admin/feature-access/plans/${trial.id}`)
      .set(auth)
      .send({ feature: 'huntlo360', enabled: true });
    expect(updated.status).toBe(200);
    expect(updated.body.data.featureAccess.huntlo360).toBe(true);

    const allowed = await agent.get('/api/v1/huntlo-360/workflows').set(auth);
    expect(allowed.status).toBe(200);
  });

  it('switches candidate-search vendor per email from Feature access', async () => {
    const admin = await registerAdmin(agent);
    const auth = { Authorization: `Bearer ${admin.token}` };

    const switched = await agent
      .patch(`/api/v1/admin/feature-access/users/${admin.userId}/search-vendor`)
      .set(auth)
      .send({ vendor: 'brightdata' });
    expect(switched.status).toBe(200);
    expect(switched.body.data.candidateSearchVendor).toBe('brightdata');
    expect(switched.body.data.email).toBe(admin.email);

    const overview = await agent.get('/api/v1/admin/feature-access').set(auth);
    expect(overview.status).toBe(200);
    expect(overview.body.data.searchVendor.defaultVendor).toBe('future-jobs');
    expect(
      overview.body.data.searchVendor.exceptions.some(
        (row: { id: string }) => row.id === admin.userId
      )
    ).toBe(true);

    const searched = await agent
      .get('/api/v1/admin/feature-access/users')
      .query({ q: admin.email })
      .set(auth);
    expect(searched.status).toBe(200);
    expect(searched.body.data.items[0].candidateSearchVendor).toBe('brightdata');
  });
});
