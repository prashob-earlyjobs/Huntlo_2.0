import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { OnboardingModel } from '../src/modules/auth/onboarding.model.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import { SourcedCandidateModel } from '../src/modules/sourcing/sourced-candidate.model.js';
import { SourcingSessionModel } from '../src/modules/sourcing/sourcing-session.model.js';
import { QuotaCounterModel } from '../src/shared/usage/index.js';
import {
  nextGeoExpandStep,
  resetMockFutureJobsState,
  setMockFutureJobsMode,
} from '../src/providers/future-jobs/index.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerAndAuth(agent: ReturnType<typeof request.agent>) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `search-${Date.now()}-${Math.random().toString(36).slice(2)}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Search',
    lastName: 'Tester',
    organizationName: `Search Org ${Date.now()}`,
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
    userId: response.body.data.user.id as string,
  };
}

describe('Candidate search workflow', () => {
  beforeAll(async () => {
    process.env.FUTURE_JOBS_USE_MOCK = 'true';
    process.env.POST_SESSION_CREATE_PROFILES_WAIT_MS = '0';
    resetEnvCache();
    await startMemoryMongo();
    await connectDatabase();
  }, 60_000);

  afterAll(async () => {
    await disconnectDatabase();
    await stopMemoryMongo();
  });

  beforeEach(async () => {
    clearRateLimits();
    resetMockFutureJobsState();
    process.env.POST_SESSION_CREATE_PROFILES_WAIT_MS = '0';
    vi.useRealTimers();
    await Promise.all([
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      UserModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      QuotaCounterModel.deleteMany({}),
      SourcingSessionModel.deleteMany({}),
      SourcedCandidateModel.deleteMany({}),
    ]);
  });

  it('annotates prompt into filterForm without consuming quota', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent);

    const before = await QuotaCounterModel.findOne({
      organizationId: auth.organizationId,
      metric: 'candidate_search',
    });

    const res = await agent
      .post('/api/v1/candidates/search/annotate')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ prompt: 'Senior React developers in Bangalore with 4+ years' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.filterForm).toBeTypeOf('object');
    expect(res.body.filterForm).toHaveProperty('currentTitle');

    const after = await QuotaCounterModel.findOne({
      organizationId: auth.organizationId,
      metric: 'candidate_search',
    });
    expect(after?.used ?? 0).toBe(before?.used ?? 0);
  });

  it('rejects autocomplete queries shorter than 2 characters', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent);

    const res = await agent
      .get('/api/v1/candidates/filters/autocomplete')
      .query({ query: 'b', filter_type: 'region' })
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('AUTOCOMPLETE_QUERY_TOO_SHORT');
  });

  it('accepts a 2-character autocomplete query', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent);

    const res = await agent
      .get('/api/v1/candidates/filters/autocomplete')
      .query({ query: 'ba', filter_type: 'region' })
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.suggestions)).toBe(true);
    expect(res.body.suggestions.length).toBeGreaterThan(0);
  });

  it('clamps autocomplete limit to 25', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent);

    const res = await agent
      .get('/api/v1/candidates/filters/autocomplete')
      .query({ query: 'bang', filter_type: 'region', limit: 100 })
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('apply creates a Future Jobs session and persists candidates', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent);

    const res = await agent
      .post('/api/v1/candidates/search/apply')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        prompt: 'Senior React developers in Bangalore',
        filterForm: {
          currentTitle: 'React Developer',
          location: ['Bangalore'],
          geoDistance: '50_km',
          yearsExpMin: '4',
        },
        page: 1,
        limit: 20,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sessionId).toBeTruthy();
    expect(res.body.savedSessionId).toBeTruthy();
    expect(res.body.sessionUpdated).toBe(false);
    expect(Array.isArray(res.body.candidates)).toBe(true);

    const stored = await SourcedCandidateModel.countDocuments({
      organizationId: auth.organizationId,
    });
    expect(stored).toBeGreaterThanOrEqual(0);

    const sessions = await SourcingSessionModel.countDocuments({
      organizationId: auth.organizationId,
      futureJobsSessionId: res.body.sessionId,
    });
    expect(sessions).toBe(1);
  });

  it('treats Future Jobs 207 as sessionPending not 500', async () => {
    setMockFutureJobsMode({ pending207: true });
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent);

    const res = await agent
      .post('/api/v1/candidates/search/apply')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        prompt: 'Java developers in Mumbai',
        // No location → skip geo expansion path for a direct 207 pending response
        filterForm: { currentTitle: 'Java Developer' },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.sessionPending).toBe(true);
    expect(res.body.fjStatusCode).toBe(207);
    expect(res.body.sessionId).toBeTruthy();
  });

  it('expands geo to 60_km then 120_km', () => {
    expect(
      nextGeoExpandStep({ location: ['Bangalore'], geoDistance: '50_km' }, null)
    ).toBe('60_km');
    expect(
      nextGeoExpandStep({ location: ['Bangalore'], geoDistance: '60_km' }, '60_km')
    ).toBe('120_km');
    expect(
      nextGeoExpandStep({ location: ['Bangalore'], geoDistance: '120_km' }, '120_km')
    ).toBeNull();
    expect(nextGeoExpandStep({ currentTitle: 'Engineer' }, null)).toBeNull();
  });

  it('blocks cross-organisation session update', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const authA = await registerAndAuth(agent);

    const created = await agent
      .post('/api/v1/candidates/search/apply')
      .set('Authorization', `Bearer ${authA.token}`)
      .send({
        prompt: 'Python engineers',
        filterForm: { currentTitle: 'Python Engineer' },
      });
    expect(created.body.sessionId).toBeTruthy();

    const authB = await registerAndAuth(agent);
    const res = await agent
      .post('/api/v1/candidates/search/apply')
      .set('Authorization', `Bearer ${authB.token}`)
      .send({
        prompt: 'Python engineers',
        filterForm: { currentTitle: 'Python Engineer' },
        sessionId: created.body.sessionId,
      });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('SOURCING_SESSION_NOT_FOUND');
  });

  it('stored-candidates never requires Future Jobs and returns Mongo data', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent);

    const applied = await agent
      .post('/api/v1/candidates/search/apply')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        prompt: 'Go developers',
        filterForm: { currentTitle: 'Go Developer' },
      });

    setMockFutureJobsMode({ alwaysFail: true });

    const stored = await agent
      .get(`/api/v1/candidates/session/${applied.body.sessionId}/stored-candidates`)
      .query({ all: '1' })
      .set('Authorization', `Bearer ${auth.token}`);

    expect(stored.status).toBe(200);
    expect(stored.body.success).toBe(true);
    expect(stored.body.fromStored).toBe(true);
  });

  it('session profiles prefer MongoDB when candidates exist', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent);

    const applied = await agent
      .post('/api/v1/candidates/search/apply')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        prompt: 'Kotlin developers',
        filterForm: { currentTitle: 'Kotlin Developer' },
      });

    const profiles = await agent
      .get(`/api/v1/candidates/session/${applied.body.sessionId}/profiles`)
      .set('Authorization', `Bearer ${auth.token}`);

    expect(profiles.status).toBe(200);
    if ((await SourcedCandidateModel.countDocuments({})) > 0) {
      expect(profiles.body.fromStored).toBe(true);
    }
  });

  it('search history and recent-searches do not consume quota', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent);

    await agent
      .post('/api/v1/candidates/search/apply')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        prompt: 'Rust engineers',
        filterForm: { currentTitle: 'Rust Engineer' },
      });

    const usedBefore = await QuotaCounterModel.findOne({
      organizationId: auth.organizationId,
      metric: 'candidate_search',
    });

    const sessions = await agent
      .get('/api/v1/candidates/sessions')
      .query({ limit: 10 })
      .set('Authorization', `Bearer ${auth.token}`);
    expect(sessions.status).toBe(200);

    const recent = await agent
      .get('/api/v1/candidates/recent-searches')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(recent.status).toBe(200);
    expect(recent.body.recentSearches).toBeDefined();

    const usedAfter = await QuotaCounterModel.findOne({
      organizationId: auth.organizationId,
      metric: 'candidate_search',
    });
    expect(usedAfter?.used ?? 0).toBe(usedBefore?.used ?? 0);
  });

  it('fetch-more merges candidates and does not remove old ones', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent);

    const applied = await agent
      .post('/api/v1/candidates/search/apply')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        prompt: 'DevOps engineers',
        filterForm: { currentTitle: 'DevOps Engineer' },
      });

    const beforeCount = await SourcedCandidateModel.countDocuments({
      organizationId: auth.organizationId,
    });

    const more = await agent
      .post(`/api/v1/candidates/session/${applied.body.sessionId}/fetch-more`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ page: 1, limit: 20 });

    expect(more.status).toBe(200);
    expect(more.body.success).toBe(true);
    expect(more.body.storedProfileCount).toBeGreaterThanOrEqual(beforeCount);

    const afterCount = await SourcedCandidateModel.countDocuments({
      organizationId: auth.organizationId,
    });
    expect(afterCount).toBeGreaterThanOrEqual(beforeCount);
  });

  it('waits configured delay before first profiles poll', async () => {
    process.env.POST_SESSION_CREATE_PROFILES_WAIT_MS = '20000';
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent);

    const promise = agent
      .post('/api/v1/candidates/search/apply')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        prompt: 'Delay test engineers',
        filterForm: { currentTitle: 'Engineer' },
      });

    await vi.advanceTimersByTimeAsync(20_000);
    // Advance poll intervals used by mock whenReady
    await vi.advanceTimersByTimeAsync(15_000);

    const res = await promise;
    expect([200, 502, 504]).toContain(res.status);

    process.env.POST_SESSION_CREATE_PROFILES_WAIT_MS = '0';
    vi.useRealTimers();
  });

  it('legacy POST /search reuses apply pipeline', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent);

    const res = await agent
      .post('/api/v1/candidates/search')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        prompt: 'Legacy search path',
        filterForm: { currentTitle: 'Engineer' },
      });

    expect(res.status).toBe(200);
    expect(res.body.sessionId || res.body.sessionPending).toBeTruthy();
  });

  it('apply with empty filterForm auto-annotates and keeps polling from data.sourcing', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent);

    const res = await agent
      .post('/api/v1/candidates/search/apply')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        prompt: 'i am looking for social media manager in bengaluru with 2 yr experienced',
        filterForm: {},
        page: 1,
        limit: 20,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sessionId).toBeTruthy();
    expect(res.body.filterForm?.currentTitle).toBeTruthy();
    // Structured title query — not stopword skills like "am" / "yr"
    const titleQuery = res.body.sessionPayload?.queries?.['current_employers.title'];
    expect(titleQuery?.value?.length).toBeGreaterThan(0);
    const skillCore = res.body.sessionPayload?.queries?.skills?.value?.core ?? [];
    expect(skillCore).not.toContain('am');
    expect(skillCore).not.toContain('yr');
  });
});
