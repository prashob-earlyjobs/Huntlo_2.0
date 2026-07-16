import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { OnboardingModel } from '../src/modules/auth/onboarding.model.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import {
  CandidateContactCacheModel,
  EMAIL_REVEAL_COST,
  RevealedContactModel,
  revealQuotaService,
} from '../src/modules/candidates/index.js';
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import { SourcedCandidateModel } from '../src/modules/sourcing/sourced-candidate.model.js';
import { SourcingSessionModel } from '../src/modules/sourcing/sourcing-session.model.js';
import {
  extractRevealValues,
  normalizeLinkedinProfileUrl,
  resetMockFutureJobsState,
  setMockFutureJobsMode,
} from '../src/providers/future-jobs/index.js';
import { IdempotencyModel } from '../src/shared/idempotency/idempotency.model.js';
import {
  QuotaCounterModel,
  currentPeriodKey,
  periodResetAt,
} from '../src/shared/usage/index.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerAndAuth(
  agent: ReturnType<typeof request.agent>,
  suffix = ''
) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `cand-reveal-${Date.now()}${suffix}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Reveal',
    lastName: 'Tester',
    organizationName: `Reveal Org ${Date.now()}${suffix}`,
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
    userId: response.body.data.user.id as string,
  };
}

async function seedCandidate(organizationId: string, ownerUserId: string) {
  const session = await SourcingSessionModel.create({
    organizationId,
    ownerUserId,
    name: 'Reveal test session',
    naturalLanguageQuery: 'engineers',
    externalSessionId: 'mock-fj-session-reveal-1',
    status: 'completed',
  });

  const candidate = await SourcedCandidateModel.create({
    organizationId,
    sourcingSessionId: session._id,
    externalCandidateId: 'mock-fj-cand-1',
    basicProfile: {
      name: 'Aisha Rahman',
      headline: 'Senior Software Engineer',
      linkedinUrl: 'https://www.linkedin.com/in/AishaRahmanMock',
    },
    currentEmployment: { title: 'Senior Software Engineer', company: 'Nimbus Labs' },
    location: 'Bangalore',
    experienceYears: 7,
    skills: ['TypeScript', 'Node.js'],
    rank: 1,
    matchScore: 4.6,
  });

  return { session, candidate };
}

describe('extractRevealValues / normalizeLinkedinProfileUrl', () => {
  it('extracts email values from revealStatus shape', () => {
    const values = extractRevealValues(
      {
        data: {
          revealStatus: {
            email: { revealed: true, values: ['a@example.com', 'not-an-email'] },
            phone: { revealed: false, values: [] },
          },
        },
      },
      'EMAIL'
    );
    expect(values).toEqual(['a@example.com']);
  });

  it('normalizes linkedin URLs preserving slug case', () => {
    expect(normalizeLinkedinProfileUrl('linkedin.com/in/ACoAAExample/')).toBe(
      'https://www.linkedin.com/in/ACoAAExample'
    );
  });
});

describe('Candidates reveal API', () => {
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
      SourcingSessionModel.deleteMany({}),
      SourcedCandidateModel.deleteMany({}),
      CandidateContactCacheModel.deleteMany({}),
      RevealedContactModel.deleteMany({}),
      QuotaCounterModel.deleteMany({}),
      IdempotencyModel.deleteMany({}),
    ]);
  });

  it('same-user repeated reveal is not charged again', async () => {
    const { token, organizationId, userId } = await registerAndAuth(agent);
    const { candidate } = await seedCandidate(organizationId, userId);

    const first = await agent
      .post(`/api/v1/candidates/${candidate._id.toHexString()}/reveal/email`)
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', 'reveal-email-first-01')
      .expect(200);

    expect(first.body.data.charged).toBe(true);
    expect(first.body.data.source).toBe('provider');
    expect(first.body.data.values.length).toBeGreaterThan(0);

    const quotaAfterFirst = await revealQuotaService.getStatus(organizationId);
    expect(quotaAfterFirst.email.used).toBe(EMAIL_REVEAL_COST);

    const second = await agent
      .post(`/api/v1/candidates/${candidate._id.toHexString()}/reveal/email`)
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', 'reveal-email-second-01')
      .expect(200);

    expect(second.body.data.charged).toBe(false);
    expect(second.body.data.source).toBe('previous_reveal');
    expect(second.body.data.values).toEqual(first.body.data.values);

    const quotaAfterSecond = await revealQuotaService.getStatus(organizationId);
    expect(quotaAfterSecond.email.used).toBe(EMAIL_REVEAL_COST);
  });

  it('shared cache hit does not charge a second user', async () => {
    const firstUser = await registerAndAuth(agent, '-a');
    const { candidate } = await seedCandidate(firstUser.organizationId, firstUser.userId);

    await agent
      .post(`/api/v1/candidates/${candidate._id.toHexString()}/reveal/email`)
      .set('Authorization', `Bearer ${firstUser.token}`)
      .set('Idempotency-Key', 'reveal-shared-a-01')
      .expect(200);

    // Second member in the same org
    const inviteEmail = `cand-reveal-b-${Date.now()}@huntlo.ai`;
    const password = 'Password123!';
    const regB = await agent.post('/api/v1/auth/register').send({
      email: inviteEmail,
      password,
      firstName: 'Second',
      lastName: 'User',
      organizationName: `Other Org ${Date.now()}`,
    });
    expect(regB.status).toBe(201);

    // Attach user B to first user's org as recruiter
    const userB = await UserModel.findOne({ email: inviteEmail });
    expect(userB).toBeTruthy();
    await OrganizationMemberModel.create({
      organizationId: firstUser.organizationId,
      userId: userB!._id,
      role: 'recruiter',
      permissions: [],
      status: 'active',
      joinedAt: new Date(),
    });

    // Login as B with org context: switch by logging in then using token from register (different org).
    // Create a fresh access by logging in and manually issuing via auth login won't switch org.
    // Instead: use member path — re-login won't help. Seed a JWT by logging in after updating
    // the register org... Simpler: call revealService path via inviting into same org and
    // using login after we change the user's active org is hard. Use API with a second
    // registration that we then add to org, and login won't have correct orgId in token.

    // Workaround: use revealService directly for user B (same org), asserting HTTP for user A.
    const { revealService } = await import('../src/modules/candidates/reveal.service.js');
    const resultB = await revealService.reveal(
      {
        userId: userB!._id.toHexString(),
        organizationId: firstUser.organizationId,
      },
      candidate._id.toHexString(),
      'email'
    );

    expect(resultB.charged).toBe(false);
    expect(resultB.source).toBe('shared_cache');
    expect(resultB.values.length).toBeGreaterThan(0);

    const quota = await revealQuotaService.getStatus(firstUser.organizationId);
    expect(quota.email.used).toBe(EMAIL_REVEAL_COST);
  });

  it('cache miss charges, returns values, and stores encrypted ciphertext', async () => {
    const { token, organizationId, userId } = await registerAndAuth(agent);
    const { candidate } = await seedCandidate(organizationId, userId);

    const response = await agent
      .post(`/api/v1/candidates/${candidate._id.toHexString()}/reveal/email`)
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', 'reveal-encrypt-01')
      .expect(200);

    expect(response.body.data.charged).toBe(true);
    expect(response.body.data.source).toBe('provider');
    const plaintext = response.body.data.values[0] as string;
    expect(plaintext).toContain('@');

    const cache = await CandidateContactCacheModel.findOne({
      provider: 'future_jobs',
      externalCandidateId: candidate.externalCandidateId,
    });
    expect(cache).toBeTruthy();
    expect(cache!.encryptedEmails.length).toBeGreaterThan(0);
    const stored = JSON.stringify(cache!.encryptedEmails);
    expect(stored).not.toContain(plaintext);
    expect(cache!.encryptedEmails[0]!.ciphertext).toBeTruthy();
  });

  it('returns 429 when reveal quota is exhausted', async () => {
    const { token, organizationId, userId } = await registerAndAuth(agent);
    const { candidate } = await seedCandidate(organizationId, userId);

    await QuotaCounterModel.create({
      organizationId,
      periodKey: currentPeriodKey(),
      metric: 'email_reveal',
      used: EMAIL_REVEAL_COST,
      reserved: 0,
      limit: EMAIL_REVEAL_COST,
      resetAt: periodResetAt(currentPeriodKey()),
      allowOverage: false,
    });

    const response = await agent
      .post(`/api/v1/candidates/${candidate._id.toHexString()}/reveal/email`)
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', 'reveal-quota-fail-01')
      .expect(429);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('QUOTA_EXCEEDED');
    expect(response.body.error.meta.quota.metric).toBe('email_reveal');
    expect(response.body.error.meta.quota.remaining).toBe(0);
  });

  it('provider failure refunds reserved quota', async () => {
    const { token, organizationId, userId } = await registerAndAuth(agent);
    const { candidate } = await seedCandidate(organizationId, userId);

    setMockFutureJobsMode({ alwaysFail: true });

    await agent
      .post(`/api/v1/candidates/${candidate._id.toHexString()}/reveal/email`)
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', 'reveal-provider-fail-01')
      .expect(503);

    const quota = await revealQuotaService.getStatus(organizationId);
    expect(quota.email.used).toBe(0);
    expect(quota.email.reserved).toBe(0);
  });

  it('concurrent reveals only charge once', async () => {
    const { token, organizationId, userId } = await registerAndAuth(agent);
    const { candidate } = await seedCandidate(organizationId, userId);
    const candidateId = candidate._id.toHexString();

    const [a, b] = await Promise.all([
      agent
        .post(`/api/v1/candidates/${candidateId}/reveal/email`)
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', 'reveal-concurrent-a-01'),
      agent
        .post(`/api/v1/candidates/${candidateId}/reveal/email`)
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', 'reveal-concurrent-b-01'),
    ]);

    expect([a.status, b.status].every((s) => s === 200)).toBe(true);
    expect(a.body.data.values.length).toBeGreaterThan(0);
    expect(b.body.data.values.length).toBeGreaterThan(0);

    const quota = await revealQuotaService.getStatus(organizationId);
    expect(quota.email.used).toBe(EMAIL_REVEAL_COST);
    expect(quota.email.reserved).toBe(0);

    const ledgerCount = await RevealedContactModel.countDocuments({
      organizationId,
      userId,
      candidateId: candidate._id,
      contactType: 'email',
    });
    expect(ledgerCount).toBe(1);
  });

  it('enriches candidate profile without exposing contacts', async () => {
    const { token, organizationId, userId } = await registerAndAuth(agent);
    const { candidate } = await seedCandidate(organizationId, userId);

    const response = await agent
      .post(`/api/v1/candidates/${candidate._id.toHexString()}/enrich`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.enrichedProfile).toBeTruthy();
    expect(response.body.data.revealStatus.email.revealed).toBe(false);
    expect(response.body.data.revealStatus.email.values).toBeUndefined();
  });
});
