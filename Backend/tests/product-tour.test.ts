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
import { AuditLogModel } from '../src/shared/audit/audit.service.js';
import {
  HUNTLO_DASHBOARD_TOUR_VERSION,
  UserPreferenceModel,
} from '../src/modules/users/user-preference.model.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerOwner(agent: ReturnType<typeof request.agent>, suffix = '') {
  const email = `tour-${Date.now()}${suffix}@huntlo.ai`;
  const response = await agent.post('/api/v1/auth/register').send({
    email,
    password: 'Password123!',
    firstName: 'Tour',
    lastName: 'User',
    organizationName: `Tour Org ${Date.now()}${suffix}`,
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
    userId: response.body.data.user.id as string,
    email,
  };
}

describe('Dashboard product tour', () => {
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
      OrganizationModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      UserPreferenceModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
    ]);
  });

  it('lets an authenticated user get their own tour status', async () => {
    const auth = await registerOwner(agent);

    const res = await agent
      .get('/api/v1/users/me/product-tour/dashboard')
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      tour: 'dashboard',
      version: HUNTLO_DASHBOARD_TOUR_VERSION,
      status: 'not_started',
      lastStep: 0,
      startedAt: null,
      completedAt: null,
      skippedAt: null,
    });
  });

  it('scopes tour status to the authenticated user', async () => {
    const first = await registerOwner(agent, '-a');
    const second = await registerOwner(agent, '-b');

    await agent
      .patch('/api/v1/users/me/product-tour/dashboard')
      .set('Authorization', `Bearer ${first.token}`)
      .send({ version: 1, status: 'completed', lastStep: 7 });

    const secondStatus = await agent
      .get('/api/v1/users/me/product-tour/dashboard')
      .set('Authorization', `Bearer ${second.token}`);

    expect(secondStatus.status).toBe(200);
    expect(secondStatus.body.data.status).toBe('not_started');
    expect(secondStatus.body.data.completedAt).toBeNull();
  });

  it('does not require the recruiter tour for platform admins', async () => {
    const auth = await registerOwner(agent, '-admin');
    await UserModel.findByIdAndUpdate(auth.userId, { platformAdmin: true });

    const res = await agent
      .get('/api/v1/users/me/product-tour/dashboard')
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('not_started');
    // Admin accounts may call the endpoint, but product UI must not auto-start it.
    const user = await UserModel.findById(auth.userId);
    expect(user?.platformAdmin).toBe(true);
  });

  it('starts the tour as in_progress', async () => {
    const auth = await registerOwner(agent);

    const res = await agent
      .patch('/api/v1/users/me/product-tour/dashboard')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ version: 1, status: 'in_progress', lastStep: 0 });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('in_progress');
    expect(res.body.data.lastStep).toBe(0);
    expect(res.body.data.startedAt).toBeTruthy();

    const audit = await AuditLogModel.findOne({ action: 'product_tour_started' });
    expect(audit).toBeTruthy();
    expect(audit!.userId?.toString()).toBe(auth.userId);
  });

  it('updates lastStep while in progress', async () => {
    const auth = await registerOwner(agent);

    await agent
      .patch('/api/v1/users/me/product-tour/dashboard')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ version: 1, status: 'in_progress', lastStep: 0 });

    const res = await agent
      .patch('/api/v1/users/me/product-tour/dashboard')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ version: 1, status: 'in_progress', lastStep: 3 });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('in_progress');
    expect(res.body.data.lastStep).toBe(3);

    const stepAudit = await AuditLogModel.findOne({ action: 'product_tour_step_viewed' });
    expect(stepAudit).toBeTruthy();
    expect(stepAudit!.metadata).toMatchObject({ step: 3, tour: 'dashboard' });
  });

  it('sets completedAt on completion and is idempotent', async () => {
    const auth = await registerOwner(agent);

    const first = await agent
      .patch('/api/v1/users/me/product-tour/dashboard')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ version: 1, status: 'completed', lastStep: 7 });

    expect(first.status).toBe(200);
    expect(first.body.data.status).toBe('completed');
    expect(first.body.data.completedAt).toBeTruthy();
    const completedAt = first.body.data.completedAt as string;

    const second = await agent
      .patch('/api/v1/users/me/product-tour/dashboard')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ version: 1, status: 'completed', lastStep: 7 });

    expect(second.status).toBe(200);
    expect(second.body.data.completedAt).toBe(completedAt);
    expect(await AuditLogModel.countDocuments({ action: 'product_tour_completed' })).toBe(1);
  });

  it('sets skippedAt on skip and is idempotent', async () => {
    const auth = await registerOwner(agent);

    const first = await agent
      .patch('/api/v1/users/me/product-tour/dashboard')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ version: 1, status: 'skipped', lastStep: 2 });

    expect(first.status).toBe(200);
    expect(first.body.data.status).toBe('skipped');
    expect(first.body.data.skippedAt).toBeTruthy();
    const skippedAt = first.body.data.skippedAt as string;

    const second = await agent
      .patch('/api/v1/users/me/product-tour/dashboard')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ version: 1, status: 'skipped', lastStep: 4 });

    expect(second.status).toBe(200);
    expect(second.body.data.skippedAt).toBe(skippedAt);
    expect(await AuditLogModel.countDocuments({ action: 'product_tour_skipped' })).toBe(1);
  });

  it('resets the tour to not_started', async () => {
    const auth = await registerOwner(agent);

    await agent
      .patch('/api/v1/users/me/product-tour/dashboard')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ version: 1, status: 'completed', lastStep: 7 });

    const reset = await agent
      .post('/api/v1/users/me/product-tour/dashboard/reset')
      .set('Authorization', `Bearer ${auth.token}`);

    expect(reset.status).toBe(200);
    expect(reset.body.data).toMatchObject({
      status: 'not_started',
      lastStep: 0,
      startedAt: null,
      completedAt: null,
      skippedAt: null,
    });

    const audit = await AuditLogModel.findOne({ action: 'product_tour_restarted' });
    expect(audit).toBeTruthy();
  });

  it('rejects invalid status, version, and negative step', async () => {
    const auth = await registerOwner(agent);

    const badStatus = await agent
      .patch('/api/v1/users/me/product-tour/dashboard')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ version: 1, status: 'done', lastStep: 0 });
    expect(badStatus.status).toBe(422);
    expect(badStatus.body.error.code).toBe('PRODUCT_TOUR_INVALID_STATUS');

    const badVersion = await agent
      .patch('/api/v1/users/me/product-tour/dashboard')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ version: 99, status: 'in_progress', lastStep: 0 });
    expect(badVersion.status).toBe(422);
    expect(badVersion.body.error.code).toBe('PRODUCT_TOUR_INVALID_VERSION');

    const badStep = await agent
      .patch('/api/v1/users/me/product-tour/dashboard')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ version: 1, status: 'in_progress', lastStep: -1 });
    expect(badStep.status).toBe(422);
    expect(badStep.body.error.code).toBe('PRODUCT_TOUR_INVALID_STEP');
  });

  it('requires authentication', async () => {
    const res = await agent.get('/api/v1/users/me/product-tour/dashboard');
    expect(res.status).toBe(401);
  });
});
