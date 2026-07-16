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
import { SearchQuotaModel } from '../src/modules/sourcing/quota.model.js';
import {
  PLAN_SEARCH_LIMITS,
  SOURCING_QUOTA_COST,
  quotaService,
} from '../src/modules/sourcing/quota.service.js';
import { SourcedCandidateModel } from '../src/modules/sourcing/sourced-candidate.model.js';
import { SourcingSessionModel } from '../src/modules/sourcing/sourcing-session.model.js';
import { pollSourcingSessions } from '../src/modules/sourcing/sourcing.poller.js';
import {
  resetMockFutureJobsState,
  setMockFutureJobsMode,
} from '../src/providers/future-jobs/index.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerAndAuth(agent: ReturnType<typeof request.agent>) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `sourcing-${Date.now()}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Sourcing',
    lastName: 'Tester',
    organizationName: 'Sourcing Org',
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
    userId: response.body.data.user.id as string,
  };
}

describe('Sourcing quota', () => {
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
    clearRateLimits();
    resetMockFutureJobsState();
    await Promise.all([
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      UserModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      SearchQuotaModel.deleteMany({}),
      SourcingSessionModel.deleteMany({}),
      SourcedCandidateModel.deleteMany({}),
    ]);
  });

  it('reserves, commits, and refunds atomically', async () => {
    const org = await OrganizationModel.create({
      name: 'Quota Co',
      slug: `quota-${Date.now()}`,
      initials: 'QC',
      plan: 'Starter',
    });
    const orgId = org._id.toHexString();
    const sessionA = 'aaaaaaaaaaaaaaaaaaaaaaaa';
    const sessionB = 'bbbbbbbbbbbbbbbbbbbbbbbb';

    const reserved = await quotaService.reserve(orgId, sessionA, SOURCING_QUOTA_COST);
    expect(reserved.reserved).toBe(SOURCING_QUOTA_COST);
    expect(reserved.remaining).toBe(PLAN_SEARCH_LIMITS.Starter - SOURCING_QUOTA_COST);

    await quotaService.commit(orgId, sessionA);
    const afterCommit = await quotaService.getQuotaStatus(orgId);
    expect(afterCommit.used).toBe(SOURCING_QUOTA_COST);
    expect(afterCommit.reserved).toBe(0);

    await quotaService.reserve(orgId, sessionB, SOURCING_QUOTA_COST);
    await quotaService.refund(orgId, sessionB);
    const afterRefund = await quotaService.getQuotaStatus(orgId);
    expect(afterRefund.used).toBe(SOURCING_QUOTA_COST);
    expect(afterRefund.reserved).toBe(0);
    expect(afterRefund.remaining).toBe(PLAN_SEARCH_LIMITS.Starter - SOURCING_QUOTA_COST);
  });

  it('rejects reserve when quota is exhausted', async () => {
    const org = await OrganizationModel.create({
      name: 'Empty Quota',
      slug: `empty-${Date.now()}`,
      initials: 'EQ',
      plan: 'Starter',
    });
    const orgId = org._id.toHexString();

    await SearchQuotaModel.create({
      organizationId: org._id,
      periodKey: `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}`,
      plan: 'Starter',
      limit: 1,
      used: 1,
      reserved: 0,
      reservations: [],
    });

    await expect(
      quotaService.reserve(orgId, 'cccccccccccccccccccccccc', 1)
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe('Sourcing API + poller', () => {
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
    resetMockFutureJobsState();
    await Promise.all([
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      UserModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      SearchQuotaModel.deleteMany({}),
      SourcingSessionModel.deleteMany({}),
      SourcedCandidateModel.deleteMany({}),
    ]);
  });

  it('interprets NL query and gates run until filters confirmed', async () => {
    const { token } = await registerAndAuth(agent);

    const interpret = await agent
      .post('/api/v1/sourcing/interpret')
      .set('Authorization', `Bearer ${token}`)
      .send({ query: 'Backend engineers in Bengaluru with Node.js' })
      .expect(200);

    expect(interpret.body.data.requiresConfirmation).toBe(true);
    expect(Array.isArray(interpret.body.data.interpretedCriteria)).toBe(true);

    const gated = await agent
      .post('/api/v1/sourcing/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: 'Backend engineers in Bengaluru with Node.js',
        run: true,
      })
      .expect(201);

    expect(gated.body.data.status).toBe('draft');
    expect(gated.body.data.requiresConfirmation).toBe(true);
  });

  it('runs a session, polls progressive results, and completes', async () => {
    const { token } = await registerAndAuth(agent);

    const created = await agent
      .post('/api/v1/sourcing/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: 'Backend engineers in Bengaluru with Node.js and AWS',
        confirmFilters: true,
        run: true,
        filters: {
          currentTitle: 'Backend Engineer',
          keywordSkills: 'Node.js, AWS',
          location: ['Bengaluru'],
          yearsExpMin: '4',
          yearsExpMax: '7',
        },
      })
      .expect(201);

    const sessionId = created.body.data.id as string;
    expect(['queued', 'running', 'polling']).toContain(created.body.data.status);
    expect(created.body.data.externalSessionId).toBeTruthy();

    // Poll until mock yields profiles (empty → ready).
    for (let i = 0; i < 5; i += 1) {
      await pollSourcingSessions();
    }

    const progress = await agent
      .get(`/api/v1/sourcing/sessions/${sessionId}/progress`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(['completed', 'partial', 'polling', 'running']).toContain(progress.body.data.status);

    const results = await agent
      .get(`/api/v1/sourcing/sessions/${sessionId}/results`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const items = results.body.data.items ?? results.body.data;
    expect(Array.isArray(items)).toBe(true);
    if (progress.body.data.status === 'completed' || progress.body.data.status === 'partial') {
      expect(items.length).toBeGreaterThan(0);
    }
  });

  it('marks partial when provider fails after some candidates exist', async () => {
    const { token, organizationId, userId } = await registerAndAuth(agent);

    const session = await SourcingSessionModel.create({
      organizationId,
      ownerUserId: userId,
      name: 'Partial session',
      naturalLanguageQuery: 'engineers',
      status: 'polling',
      progress: 40,
      externalSessionId: 'mock-fj-partial-1',
      estimatedResults: 10,
      totalResults: 2,
      startedAt: new Date(),
      quotaConsumed: SOURCING_QUOTA_COST,
    });

    await quotaService.reserve(organizationId, session._id.toHexString(), SOURCING_QUOTA_COST);

    await SourcedCandidateModel.create({
      organizationId,
      sourcingSessionId: session._id,
      externalCandidateId: 'cand-partial-1',
      basicProfile: { name: 'Partial Cand' },
      currentEmployment: { title: 'Engineer', company: 'Acme' },
      location: 'Bengaluru',
      experienceYears: 5,
      skills: ['Node.js'],
      educationPreview: [],
      profileSignals: [],
      rawProviderReference: { id: 'cand-partial-1' },
      rank: 1,
      matchScore: 4,
    });

    setMockFutureJobsMode({ alwaysFail: true });
    await pollSourcingSessions();

    const refreshed = await SourcingSessionModel.findById(session._id);
    expect(refreshed?.status).toBe('partial');

    const quota = await quotaService.getQuotaStatus(organizationId);
    expect(quota.used).toBeGreaterThanOrEqual(SOURCING_QUOTA_COST);
    expect(quota.reserved).toBe(0);
  });

  it('lists sessions for history', async () => {
    const { token } = await registerAndAuth(agent);

    await agent
      .post('/api/v1/sourcing/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: 'Product designers remote India',
        confirmFilters: true,
        filters: { currentTitle: 'Product Designer' },
      })
      .expect(201);

    const list = await agent
      .get('/api/v1/sourcing/sessions')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body.data.items.length).toBeGreaterThanOrEqual(1);
  });
});
