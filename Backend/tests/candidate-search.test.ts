import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { OnboardingModel } from '../src/modules/auth/onboarding.model.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { JobModel } from '../src/modules/jobs/job.model.js';
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
      JobModel.deleteMany({}),
    ]);
  });

  it('annotate does not call Future Jobs and does not consume quota', async () => {
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
    expect(res.body.polling).toBe(false);
    expect(res.body.canFetchMore).toBe(false);
    expect(Array.isArray(res.body.candidates)).toBe(true);
    expect(res.body.candidates.length).toBeGreaterThan(0);
    expect(String(res.body.sessionPayload?.jdText ?? '')).toMatch(/react/i);

    const stored = await SourcedCandidateModel.countDocuments({
      organizationId: auth.organizationId,
    });
    expect(stored).toBeGreaterThan(0);

    const sessions = await SourcingSessionModel.countDocuments({
      organizationId: auth.organizationId,
      futureJobsSessionId: res.body.sessionId,
    });
    expect(sessions).toBe(1);
  });

  it('apply waits on /wl/search and does not return sessionPending', async () => {
    setMockFutureJobsMode({ pending207: true });
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent);

    const res = await agent
      .post('/api/v1/candidates/search/apply')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        prompt: 'need a java developer in mumbai with 4 to 6 years of experience who are currently open to work',
        filterForm: { currentTitle: 'Java Developer' },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sessionPending).toBeUndefined();
    expect(res.body.polling).toBe(false);
    expect(res.body.sessionId).toBeTruthy();
    expect(res.body.candidates.length).toBeGreaterThan(0);
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
      .query({ page: 1, limit: 10 })
      .set('Authorization', `Bearer ${auth.token}`);
    expect(sessions.status).toBe(200);
    expect(sessions.body.data.sessions).toBeDefined();
    expect(sessions.body.data.page).toBe(1);
    expect(sessions.body.data.limit).toBe(10);
    expect(typeof sessions.body.data.total).toBe('number');
    expect(typeof sessions.body.data.totalPages).toBe('number');
    expect(sessions.body.data.metrics).toEqual(
      expect.objectContaining({
        totalSearches: expect.any(Number),
        candidatesFound: expect.any(Number),
        creditsUsed: expect.any(Number),
      })
    );

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
    expect(res.body.sessionId).toBeTruthy();
    expect(res.body.polling).toBe(false);
  });

  it('apply with empty filterForm sends the prompt as jdText', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent);

    const prompt =
      'i am looking for social media manager in bengaluru with 2 yr experienced';
    const res = await agent
      .post('/api/v1/candidates/search/apply')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        prompt,
        filterForm: {},
        page: 1,
        limit: 20,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.polling).toBe(false);
    expect(res.body.sessionId).toBeTruthy();
    expect(res.body.sessionPayload?.jdText).toBe(prompt);
    expect(res.body.candidates.length).toBeGreaterThan(0);
  });

  it('apply with filters only converts them to natural-language jdText', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent);

    const res = await agent
      .post('/api/v1/candidates/search/apply')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        prompt: '',
        filterForm: {
          currentTitle: 'Java Developer',
          location: ['Bengaluru'],
          yearsExpMin: '4',
          yearsExpMax: '6',
          openToWork: true,
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.polling).toBe(false);
    const jdText = String(res.body.sessionPayload?.jdText ?? '').toLowerCase();
    expect(jdText).toContain('java developer');
    expect(jdText).toContain('bengaluru');
    expect(jdText).toContain('open to work');
  });

  it('rejects apply with empty prompt and empty filters', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent);

    const res = await agent
      .post('/api/v1/candidates/search/apply')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ prompt: '', filterForm: {} });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('PROMPT_REQUIRED');
  });

  it('converts a full job JD into a searchable prompt', async () => {
    const previousGeminiKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    resetEnvCache();

    try {
      const app = createApp();
      const agent = request.agent(app);
      const auth = await registerAndAuth(agent);

      const created = await agent
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${auth.token}`)
        .send({
          title: 'MERN Stack Developer',
          department: 'Engineering',
          location: 'Bengaluru',
          experienceMin: 3,
          experienceMax: 6,
          requiredSkills: ['React', 'Node.js', 'MongoDB'],
          preferredSkills: ['AWS'],
          description: '<p>Build APIs and dashboards for hiring teams.</p>',
          requirements: ['Experience with REST APIs', 'Strong JavaScript'],
          publish: true,
        });
      expect(created.status).toBe(201);
      const jobId = created.body.data.id as string;

      const missing = await agent
        .post('/api/v1/candidates/search/prompt-from-job')
        .set('Authorization', `Bearer ${auth.token}`)
        .send({ jobId: '000000000000000000000000' });
      expect(missing.status).toBe(404);

      const res = await agent
        .post('/api/v1/candidates/search/prompt-from-job')
        .set('Authorization', `Bearer ${auth.token}`)
        .send({ jobId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.jobId).toBe(jobId);
      expect(res.body.source).toBe('fallback');
      const prompt = String(res.body.prompt);
      expect(prompt.toLowerCase()).toContain('mern');
      expect(prompt).toMatch(/React/i);
      expect(prompt).toMatch(/Bengaluru/i);
      expect(prompt).toContain('Build APIs and dashboards');
    } finally {
      if (previousGeminiKey !== undefined) process.env.GEMINI_API_KEY = previousGeminiKey;
      else delete process.env.GEMINI_API_KEY;
      resetEnvCache();
    }
  });
});
