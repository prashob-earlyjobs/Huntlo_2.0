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
  FUTURE_JOBS_INVALID_LINKEDIN_URL_CODE,
  FUTURE_JOBS_PROFILE_NOT_FOUND_CODE,
  linkedinUrlsForContactReveal,
  linkedinUrlsFromScoutLookup,
  normalizeFjProfileDoc,
  normalizeLinkedinProfileUrl,
  resetMockFutureJobsState,
  setMockFutureJobsMode,
  throwIfFjHttpNotOk,
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

async function seedCandidate(
  organizationId: string,
  ownerUserId: string,
  options: {
    externalSessionId?: string;
    linkedinUrl?: string;
    externalCandidateId?: string;
    rawDoc?: unknown;
  } = {}
) {
  const session = await SourcingSessionModel.create({
    organizationId,
    ownerUserId,
    name: 'Reveal test session',
    naturalLanguageQuery: 'engineers',
    externalSessionId: options.externalSessionId ?? 'mock-fj-session-reveal-1',
    status: 'completed',
  });

  const linkedinUrl =
    options.linkedinUrl ?? 'https://www.linkedin.com/in/AishaRahmanMock';

  const candidate = await SourcedCandidateModel.create({
    organizationId,
    sourcingSessionId: session._id,
    externalCandidateId: options.externalCandidateId ?? 'mock-fj-cand-1',
    linkedinProfileUrl: linkedinUrl,
    basicProfile: {
      name: 'Aisha Rahman',
      headline: 'Senior Software Engineer',
      linkedinUrl,
    },
    currentEmployment: { title: 'Senior Software Engineer', company: 'Nimbus Labs' },
    location: 'Bangalore',
    experienceYears: 7,
    skills: ['TypeScript', 'Node.js'],
    rawDoc: options.rawDoc ?? null,
    rank: 1,
    matchScore: 4.6,
  });

  return { session, candidate };
}

describe('extractRevealValues / LinkedIn reveal URLs', () => {
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

  it('prefers opaque ACoAA member URLs over vanity/flagship for reveal-contacts', () => {
    const vanity = 'https://www.linkedin.com/in/anita-sharma';
    const memberId = 'ACoAAClExampleId49charsxx';
    const doc = normalizeFjProfileDoc({
      profile: {
        id: memberId,
        linkedin_flagship_url: vanity,
        linkedin_profile_url: vanity,
      },
    });

    const urls = linkedinUrlsForContactReveal({
      rawDoc: doc,
      linkedinProfileUrl: vanity,
      externalCandidateId: memberId,
    });

    expect(urls[0]).toBe(`https://www.linkedin.com/in/${memberId}`);
    expect(urls).toContain(vanity);
  });

  it('extracts member URN from scout-people lookup so reveal can use the scouted profile', () => {
    const vanity = 'https://www.linkedin.com/in/jane-doe-us';
    const memberId = 'ACoAAClUsProfileId49charsxxxx';
    const urls = linkedinUrlsFromScoutLookup({
      data: {
        scoutId: 'scout-1',
        profile: {
          id: memberId,
          linkedin_flagship_url: vanity,
          linkedin_profile_url: vanity,
        },
      },
    });
    expect(urls[0]).toBe(`https://www.linkedin.com/in/${memberId}`);
    expect(urls).toContain(vanity);
  });

  it('uses lookup linkedin_profile_url ACoAA even when _id is a mongo id and flagship is vanity', () => {
    const vanity = 'https://www.linkedin.com/in/nilantha-dambadeniya-1a66b91a0';
    const memberUrl =
      'https://www.linkedin.com/in/ACoAAC8XAM4BkUNcAqy1cUe9jtUvV3YdwLF-cZw';
    const urls = linkedinUrlsFromScoutLookup({
      status: 'SUCCESS',
      data: {
        scoutId: '6a92c931a5de5fccdfabccaf',
        profile: {
          _id: '6a92c93191285a914952c44c',
          linkedin_flagship_url: vanity,
          linkedin_profile_url: memberUrl,
        },
      },
    });
    expect(urls[0]).toBe(memberUrl);
    expect(urls).toContain(vanity);
  });

  it('reads unwrapped scout lookup payloads (data.profile already unpacked)', () => {
    const memberUrl = 'https://www.linkedin.com/in/ACoAAUnwrappedMemberIdxx';
    const urls = linkedinUrlsFromScoutLookup({
      scoutId: 'scout-unwrapped',
      profile: {
        linkedin_profile_url: memberUrl,
        linkedin_flagship_url: 'https://www.linkedin.com/in/jane-doe-us',
      },
    });
    expect(urls[0]).toBe(memberUrl);
  });

  it('skips name-like ids and does not send LinkedIn URLs that contain spaces', () => {
    expect(normalizeLinkedinProfileUrl('Amit Shah')).toBe('');
    expect(normalizeLinkedinProfileUrl('https://www.linkedin.com/in/John Doe')).toBe(
      'https://www.linkedin.com/in/John%20Doe'
    );

    const urls = linkedinUrlsForContactReveal({
      rawDoc: {
        profile: {
          id: 'Amit Shah',
          linkedin_profile_url: 'https://www.linkedin.com/in/amit-shah',
        },
      },
      linkedinProfileUrl: 'Amit Shah',
      externalCandidateId: 'Amit Shah',
    });

    expect(urls).toEqual(['https://www.linkedin.com/in/amit-shah']);
    expect(urls.every((url) => !/\s/.test(url))).toBe(true);
  });

  it('maps reveal-contacts 404 to FUTURE_JOBS_PROFILE_NOT_FOUND instead of 502', () => {
    try {
      throwIfFjHttpNotOk(
        { ok: false, status: 404 },
        { message: 'No profile found for the given linkedin_profile_url' },
        { fjOperation: 'POST /wl/scout-people/reveal-contacts' }
      );
      throw new Error('expected throwIfFjHttpNotOk to throw');
    } catch (error) {
      expect(error).toMatchObject({
        code: FUTURE_JOBS_PROFILE_NOT_FOUND_CODE,
        fjHttpStatus: 404,
        statusCode: 404,
      });
    }
  });

  it('maps reveal-contacts 422 invalid URL to FUTURE_JOBS_INVALID_LINKEDIN_URL instead of 502', () => {
    try {
      throwIfFjHttpNotOk(
        { ok: false, status: 422 },
        {
          message: 'Received Data is not valid',
          statusCode: 422,
          success: false,
          errors: [
            { linkedin_profile_url: 'Invalid LinkedIn profile URL (spaces are not allowed in the URL)' },
          ],
        },
        { fjOperation: 'POST /wl/scout-people/reveal-contacts' }
      );
      throw new Error('expected throwIfFjHttpNotOk to throw');
    } catch (error) {
      expect(error).toMatchObject({
        code: FUTURE_JOBS_INVALID_LINKEDIN_URL_CODE,
        fjHttpStatus: 422,
        statusCode: 422,
      });
    }
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

  it('reveals /wl/search candidates via scout-people instead of sourcing-session', async () => {
    const { token, organizationId, userId } = await registerAndAuth(agent);
    const memberId = 'ACoAAClWlSearchRevealId';
    const vanity = 'https://www.linkedin.com/in/aisha-rahman-search';
    const { candidate } = await seedCandidate(organizationId, userId, {
      externalSessionId: `wl-search-${Date.now()}`,
      linkedinUrl: vanity,
      externalCandidateId: memberId,
      rawDoc: {
        _id: memberId,
        profile: {
          id: memberId,
          linkedin_flagship_url: vanity,
          linkedin_profile_url: vanity,
        },
      },
    });

    const email = await agent
      .post(`/api/v1/candidates/${candidate._id.toHexString()}/reveal/email`)
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', 'reveal-wl-search-email-01')
      .expect(200);

    expect(email.body.data.found).toBe(true);
    expect(email.body.data.values.length).toBeGreaterThan(0);
    expect(email.body.data.values[0]).toMatch(/@/);

    const phone = await agent
      .post(`/api/v1/candidates/${candidate._id.toHexString()}/reveal/mobile`)
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', 'reveal-wl-search-mobile-01')
      .expect(200);

    expect(phone.body.data.found).toBe(true);
    expect(phone.body.data.values.length).toBeGreaterThan(0);
  });

  it('scouts US vanity URLs via lookup before reveal-contacts', async () => {
    const { token, organizationId, userId } = await registerAndAuth(agent, '-us');
    const vanity = 'https://www.linkedin.com/in/jane-doe-seattle';
    const { candidate } = await seedCandidate(organizationId, userId, {
      externalSessionId: `wl-search-${Date.now()}`,
      linkedinUrl: vanity,
      externalCandidateId: 'jane-doe-seattle',
      rawDoc: {
        profile: {
          linkedin_flagship_url: vanity,
          linkedin_profile_url: vanity,
        },
      },
    });

    const email = await agent
      .post(`/api/v1/candidates/${candidate._id.toHexString()}/reveal/email`)
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', 'reveal-us-vanity-email-01')
      .expect(200);

    expect(email.body.data.found).toBe(true);
    expect(email.body.data.values.length).toBeGreaterThan(0);
    expect(email.body.data.values[0]).toMatch(/@/);
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
