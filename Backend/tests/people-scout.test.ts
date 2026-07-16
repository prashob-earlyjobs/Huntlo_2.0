import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { OnboardingModel } from '../src/modules/auth/onboarding.model.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { SavedCandidateModel } from '../src/modules/candidates/saved-candidate.model.js';
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import {
  PeopleScoutContactRevealModel,
  PeopleScoutLookupModel,
} from '../src/modules/people-scout/index.js';
import { SearchQuotaModel } from '../src/modules/sourcing/quota.model.js';
import { QuotaCounterModel } from '../src/shared/usage/index.js';
import {
  normalizeLookupInput,
} from '../src/modules/people-scout/lookup.normalize.js';
import {
  resetMockFutureJobsState,
  setMockFutureJobsMode,
} from '../src/providers/future-jobs/index.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerAndAuth(
  agent: ReturnType<typeof request.agent>,
  suffix = ''
) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `people-scout-${Date.now()}${suffix}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Scout',
    lastName: 'Tester',
    organizationName: `Scout Org ${Date.now()}${suffix}`,
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
    userId: response.body.data.user.id as string,
  };
}

describe('normalizeLookupInput', () => {
  it('normalizes email, linkedin url, and username', () => {
    const email = normalizeLookupInput({ type: 'email', input: 'Ada@Example.com' });
    expect('error' in email).toBe(false);
    if (!('error' in email)) {
      expect(email.lookupType).toBe('email');
      expect(email.providerPayload).toEqual({ email: 'ada@example.com' });
      expect(email.maskedInput).toContain('••');
    }

    const url = normalizeLookupInput({
      type: 'linkedin-url',
      input: 'https://www.linkedin.com/in/AishaRahman/',
    });
    expect('error' in url).toBe(false);
    if (!('error' in url)) {
      expect(url.lookupType).toBe('linkedin_url');
      expect(url.providerPayload).toEqual({
        linkedin_url: 'https://www.linkedin.com/in/AishaRahman',
      });
    }

    const username = normalizeLookupInput({
      type: 'linkedin-username',
      input: 'aisha-rahman',
    });
    expect('error' in username).toBe(false);
    if (!('error' in username)) {
      expect(username.lookupType).toBe('linkedin_username');
      expect(username.providerPayload).toEqual({
        linkedin_url: 'https://www.linkedin.com/in/aisha-rahman',
      });
    }
  });

  it('rejects invalid input', () => {
    const bad = normalizeLookupInput({ type: 'email', input: 'not-an-email' });
    expect('error' in bad).toBe(true);
  });
});

describe('People Scout lookups', () => {
  beforeAll(async () => {
    resetEnvCache();
    process.env.NODE_ENV = 'test';
    process.env.FUTURE_JOBS_USE_MOCK = 'true';
    await startMemoryMongo();
    await connectDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
    await stopMemoryMongo();
  });

  beforeEach(async () => {
    clearRateLimits();
    resetMockFutureJobsState();
    setMockFutureJobsMode({});
    await Promise.all([
      PeopleScoutLookupModel.deleteMany({}),
      PeopleScoutContactRevealModel.deleteMany({}),
      SavedCandidateModel.deleteMany({}),
      SearchQuotaModel.deleteMany({}),
      QuotaCounterModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);
  });

  it('looks up by LinkedIn URL, caches for same user, and lists history', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent);

    const first = await agent
      .post('/api/v1/people-scout/lookups')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        type: 'linkedin-url',
        input: 'https://www.linkedin.com/in/aisha-rahman-mock',
      });

    expect(first.status).toBe(200);
    expect(first.body.data.resultStatus).toBe('found');
    expect(first.body.data.charged).toBe(true);
    expect(first.body.data.cacheHit).toBe(false);
    expect(first.body.data.profile?.name).toBe('Aisha Rahman');
    expect(first.body.data.profile?.experience?.length).toBeGreaterThanOrEqual(2);
    expect(first.body.data.profile?.education?.[0]?.school).toBe('IISc Bangalore');
    expect(first.body.data.profile?.languages?.length).toBeGreaterThanOrEqual(1);
    expect(first.body.data.candidateSnapshot?.linkedinProfileUrl).toContain(
      'linkedin.com/in/'
    );
    expect(first.body.data.candidateSnapshot?.experience?.length).toBeGreaterThanOrEqual(2);
    expect(first.body.data.candidateSnapshot?.education?.length).toBeGreaterThanOrEqual(1);
    // Safe snapshot must not include raw contact values.
    expect(JSON.stringify(first.body.data.candidateSnapshot)).not.toMatch(/@nimbus/);

    const second = await agent
      .post('/api/v1/people-scout/lookups')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        type: 'linkedin-url',
        input: 'https://www.linkedin.com/in/aisha-rahman-mock',
      });

    expect(second.status).toBe(200);
    expect(second.body.data.id).toBe(first.body.data.id);
    expect(second.body.data.charged).toBe(false);
    expect(second.body.data.cacheHit).toBe(true);

    const list = await agent
      .get('/api/v1/people-scout/lookups')
      .set('Authorization', `Bearer ${auth.token}`);

    expect(list.status).toBe(200);
    expect(list.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(list.body.meta.pagination.total).toBeGreaterThanOrEqual(1);

    const detail = await agent
      .get(`/api/v1/people-scout/lookups/${first.body.data.id}`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.id).toBe(first.body.data.id);
  });

  it('returns not_found without charging and multiple_matches for multi slug', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent, '-nf');

    const missing = await agent
      .post('/api/v1/people-scout/lookups')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ type: 'email', input: 'notfound@example.com' });

    expect(missing.status).toBe(200);
    expect(missing.body.data.resultStatus).toBe('not_found');
    expect(missing.body.data.charged).toBe(false);

    const multi = await agent
      .post('/api/v1/people-scout/lookups')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ type: 'linkedin-username', input: 'arjun-multi' });

    expect(multi.status).toBe(200);
    expect(multi.body.data.resultStatus).toBe('multiple_matches');
    expect(multi.body.data.matches.length).toBeGreaterThanOrEqual(2);
    expect(multi.body.data.charged).toBe(false);
  });

  it('isolates lookups by organization', async () => {
    const app = createApp();
    const agentA = request.agent(app);
    const agentB = request.agent(app);
    const a = await registerAndAuth(agentA, '-a');
    const b = await registerAndAuth(agentB, '-b');

    const created = await agentA
      .post('/api/v1/people-scout/lookups')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ type: 'email', input: 'shared-check@example.com' });
    expect(created.status).toBe(200);

    const denied = await agentB
      .get(`/api/v1/people-scout/lookups/${created.body.data.id}`)
      .set('Authorization', `Bearer ${b.token}`);
    expect(denied.status).toBe(404);
  });

  it('reveals contact via lookup endpoint and saves to pool', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent, '-save');

    const lookup = await agent
      .post('/api/v1/people-scout/lookups')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        type: 'linkedin-url',
        input: 'https://www.linkedin.com/in/save-me-candidate',
      });
    expect(lookup.body.data.resultStatus).toBe('found');
    const lookupId = lookup.body.data.id as string;

    const reveal = await agent
      .post(`/api/v1/people-scout/lookups/${lookupId}/reveal/email`)
      .set('Authorization', `Bearer ${auth.token}`)
      .set('Idempotency-Key', `scout-reveal-${lookupId}`)
      .send({});
    expect(reveal.status).toBe(200);
    expect(reveal.body.data.found).toBe(true);
    expect(reveal.body.data.values.length).toBeGreaterThan(0);

    const again = await agent
      .post(`/api/v1/people-scout/lookups/${lookupId}/reveal/email`)
      .set('Authorization', `Bearer ${auth.token}`)
      .set('Idempotency-Key', `scout-reveal-${lookupId}-2`)
      .send({});
    expect(again.status).toBe(200);
    expect(again.body.data.charged).toBe(false);

    const saved = await agent
      .post(`/api/v1/people-scout/lookups/${lookupId}/save`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({});
    expect(saved.status).toBe(200);
    expect(saved.body.data.created).toBe(true);
    expect(saved.body.data.candidate.sourceType).toBe('people_scout');
    expect(saved.body.data.lookup.saved).toBe(true);

    const savedAgain = await agent
      .post(`/api/v1/people-scout/lookups/${lookupId}/save`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({});
    expect(savedAgain.body.data.created).toBe(false);
  });

  it('returns provider_unavailable when Future Jobs is down', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent, '-down');
    setMockFutureJobsMode({ alwaysFail: true });

    const response = await agent
      .post('/api/v1/people-scout/lookups')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ type: 'email', input: 'offline@example.com' });

    expect(response.status).toBe(200);
    expect(response.body.data.resultStatus).toBe('provider_unavailable');
    expect(response.body.data.charged).toBe(false);
  });

  it('returns quota status', async () => {
    const app = createApp();
    const agent = request.agent(app);
    const auth = await registerAndAuth(agent, '-quota');

    const response = await agent
      .get('/api/v1/people-scout/quota')
      .set('Authorization', `Bearer ${auth.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.remaining).toBeGreaterThan(0);
    expect(response.body.data.costPerLookup).toBe(1);
  });
});
