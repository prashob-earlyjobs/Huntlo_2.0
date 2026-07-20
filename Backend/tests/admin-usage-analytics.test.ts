import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { OnboardingModel } from '../src/modules/auth/onboarding.model.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { CandidateActivityModel } from '../src/modules/candidates/candidate-activity.model.js';
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import { PeopleScoutLookupModel } from '../src/modules/people-scout/lookup.model.js';
import { UsageLedgerModel } from '../src/shared/usage/usage-ledger.model.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerUser(
  agent: ReturnType<typeof request.agent>,
  email: string,
  opts?: { platformAdmin?: boolean }
) {
  const response = await agent.post('/api/v1/auth/register').send({
    email,
    password: 'Password123!',
    firstName: 'Admin',
    lastName: 'Tester',
    organizationName: `Admin Org ${Date.now()}`,
  });
  expect(response.status).toBe(201);
  const userId = response.body.data.user.id as string;
  const organizationId = response.body.data.organization.id as string;
  if (opts?.platformAdmin) {
    await UserModel.updateOne({ _id: userId }, { $set: { platformAdmin: true } });
  }
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

describe('Admin usage analytics', () => {
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
      PeopleScoutLookupModel.deleteMany({}),
      CandidateActivityModel.deleteMany({}),
      UsageLedgerModel.deleteMany({}),
    ]);
  });

  it('returns usage analytics summary for platform admins', async () => {
    const admin = await registerUser(agent, `admin-analytics-${Date.now()}@huntlo.ai`, {
      platformAdmin: true,
    });

    await PeopleScoutLookupModel.create({
      organizationId: admin.organizationId,
      userId: admin.userId,
      lookupType: 'linkedin_url',
      normalizedInputHash: 'hash-1',
      displayInput: 'https://linkedin.com/in/test',
      maskedInput: 'https://linkedin.com/in/test',
      resultStatus: 'found',
      cacheSource: 'shared_cache',
      charged: true,
    });

    await CandidateActivityModel.create({
      organizationId: admin.organizationId,
      userId: admin.userId,
      candidateId: admin.userId,
      action: 'email_revealed',
      metadata: { source: 'provider', charged: true },
    });

    await UsageLedgerModel.create({
      organizationId: admin.organizationId,
      userId: admin.userId,
      metric: 'email_outreach',
      quantity: 3,
      action: 'commit',
      status: 'committed',
      periodKey: '2026-07',
    });

    const res = await agent
      .get('/api/v1/admin/usage-analytics/summary')
      .set('Authorization', `Bearer ${admin.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.breakdown).toHaveLength(3);
    expect(res.body.data.breakdown[0].eventType).toBe('people_scout_lookup');
    expect(res.body.data.breakdown[0].sources.shared_cache.count).toBe(1);
    expect(res.body.data.breakdown[1].eventType).toBe('email_unveil');
    expect(res.body.data.breakdown[1].sources.futurejobs.count).toBe(1);
    expect(res.body.data.outreachCredits.some((row: { metric: string }) => row.metric === 'email_outreach')).toBe(
      true
    );
  });

  it('filters analytics summary by user id', async () => {
    const admin = await registerUser(agent, `admin-filter-${Date.now()}@huntlo.ai`, {
      platformAdmin: true,
    });
    const other = await registerUser(agent, `other-filter-${Date.now()}@huntlo.ai`);

    await PeopleScoutLookupModel.create({
      organizationId: admin.organizationId,
      userId: admin.userId,
      lookupType: 'linkedin_url',
      normalizedInputHash: 'hash-admin',
      displayInput: 'admin',
      maskedInput: 'admin',
      resultStatus: 'found',
      cacheSource: 'user_cache',
      charged: false,
    });
    await PeopleScoutLookupModel.create({
      organizationId: other.organizationId,
      userId: other.userId,
      lookupType: 'linkedin_url',
      normalizedInputHash: 'hash-other',
      displayInput: 'other',
      maskedInput: 'other',
      resultStatus: 'found',
      cacheSource: 'futurejobs',
      charged: true,
    });

    const res = await agent
      .get(`/api/v1/admin/usage-analytics/summary?userId=${admin.userId}`)
      .set('Authorization', `Bearer ${admin.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.breakdown[0].total.count).toBe(1);
    expect(res.body.data.breakdown[0].sources.user_cache.count).toBe(1);
    expect(res.body.data.breakdown[0].sources.futurejobs.count).toBe(0);
  });

  it('returns committed usage history for platform admins', async () => {
    const admin = await registerUser(agent, `admin-history-${Date.now()}@huntlo.ai`, {
      platformAdmin: true,
    });

    await UsageLedgerModel.create({
      organizationId: admin.organizationId,
      userId: admin.userId,
      metric: 'people_scout',
      quantity: 2,
      action: 'commit',
      status: 'committed',
      periodKey: '2026-07',
      relatedEntityType: 'people_scout_lookup',
      relatedEntityId: 'lookup_1',
    });

    const res = await agent
      .get('/api/v1/admin/usage-analytics/history')
      .set('Authorization', `Bearer ${admin.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.history).toHaveLength(1);
    expect(res.body.data.history[0].activity).toBe('People Scout lookups');
    expect(res.body.data.history[0].units).toBe(2);
    expect(res.body.meta.pagination.total).toBe(1);
  });

  it('denies non-admin users from usage analytics endpoints', async () => {
    const owner = await registerUser(agent, `owner-analytics-${Date.now()}@huntlo.ai`);

    const summary = await agent
      .get('/api/v1/admin/usage-analytics/summary')
      .set('Authorization', `Bearer ${owner.token}`);
    expect(summary.status).toBe(403);

    const history = await agent
      .get('/api/v1/admin/usage-analytics/history')
      .set('Authorization', `Bearer ${owner.token}`);
    expect(history.status).toBe(403);
  });
});
