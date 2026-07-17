import { createHmac } from 'node:crypto';

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
import { verifyCalendlySignature } from '../src/providers/calendly/calendly.client.js';
import { verifyHunarWebhookAuthenticity } from '../src/providers/hunar/hunar.webhook.js';
import { passwordSchema } from '../src/shared/validation/password.js';
import { escapeRegex } from '../src/shared/validation/regex.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerUser(agent: ReturnType<typeof request.agent>, email: string) {
  const response = await agent.post('/api/v1/auth/register').send({
    email,
    password: 'Password123!',
    firstName: 'Sec',
    lastName: 'Tester',
    organizationName: `Sec Org ${Date.now()}`,
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    userId: response.body.data.user.id as string,
    organizationId: response.body.data.organization.id as string,
    email,
  };
}

describe('Security hardening', () => {
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
    ]);
  });

  it('rejects weak passwords at registration', async () => {
    expect(passwordSchema.safeParse('short').success).toBe(false);
    expect(passwordSchema.safeParse('alllowercase1').success).toBe(false);
    expect(passwordSchema.safeParse('Password123!').success).toBe(true);

    const weak = await agent.post('/api/v1/auth/register').send({
      email: `weak-${Date.now()}@huntlo.ai`,
      password: 'password',
      firstName: 'Weak',
      lastName: 'Pass',
      organizationName: 'Weak Org',
    });
    expect(weak.status).toBe(400);
  });

  it('invalidates access tokens after logout', async () => {
    const user = await registerUser(agent, `logout-${Date.now()}@huntlo.ai`);

    const meBefore = await agent
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${user.token}`);
    expect(meBefore.status).toBe(200);

    const logout = await agent.post('/api/v1/auth/logout');
    expect(logout.status).toBe(200);

    const meAfter = await agent
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${user.token}`);
    expect(meAfter.status).toBe(401);
  });

  it('does not auto-rejoin removed organization members', async () => {
    const member = await registerUser(agent, `member-${Date.now()}@huntlo.ai`);

    await OrganizationMemberModel.updateOne(
      { userId: member.userId },
      { $set: { status: 'deactivated' } }
    );

    const denied = await agent
      .get('/api/v1/jobs')
      .set('Authorization', `Bearer ${member.token}`);
    expect(denied.status).toBe(403);
  });

  it('requires candidates:export for bulk export (not view alone)', async () => {
    const user = await registerUser(agent, `export-${Date.now()}@huntlo.ai`);
    await OrganizationMemberModel.updateOne(
      { userId: user.userId },
      { $set: { role: 'interviewer', permissions: [] } }
    );

    const login = await agent.post('/api/v1/auth/login').send({
      email: user.email,
      password: 'Password123!',
    });
    expect(login.status).toBe(200);

    const exportRes = await agent
      .post('/api/v1/candidate-pool/bulk/export')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .send({ format: 'csv' });
    expect(exportRes.status).toBe(403);
  });

  it('fails closed for Calendly when signature header is missing', () => {
    const key = 'calendly-signing-key';
    const body = JSON.stringify({ event: 'invitee.created' });
    expect(verifyCalendlySignature(body, undefined, key)).toBe(false);
    expect(verifyCalendlySignature(body, '', key)).toBe(false);

    const timestamp = String(Math.floor(Date.now() / 1000));
    const digest = createHmac('sha256', key).update(`${timestamp}.${body}`).digest('hex');
    expect(verifyCalendlySignature(body, `t=${timestamp},v1=${digest}`, key)).toBe(true);
  });

  it('fails closed for Hunar webhooks without secret in production-like envs', () => {
    const previous = process.env.APP_ENV;
    const previousSecret = process.env.HUNAR_WEBHOOK_SECRET;
    delete process.env.HUNAR_WEBHOOK_SECRET;
    process.env.APP_ENV = 'production';

    const denied = verifyHunarWebhookAuthenticity({
      headers: {},
      rawBody: Buffer.from('{}'),
      screeningId: '507f1f77bcf86cd799439011',
    });
    expect(denied.ok).toBe(false);

    process.env.APP_ENV = 'test';
    const allowed = verifyHunarWebhookAuthenticity({
      headers: {},
      rawBody: Buffer.from('{}'),
      screeningId: '507f1f77bcf86cd799439011',
    });
    expect(allowed.ok).toBe(true);

    process.env.APP_ENV = previous;
    if (previousSecret) process.env.HUNAR_WEBHOOK_SECRET = previousSecret;
    else delete process.env.HUNAR_WEBHOOK_SECRET;
  });

  it('escapes regex metacharacters for safe Mongo queries', () => {
    expect(escapeRegex('a+b*(c)')).toBe('a\\+b\\*\\(c\\)');
  });

  it('charges a second organization on shared contact-cache hits', async () => {
    const { revealService } = await import('../src/modules/candidates/reveal.service.js');
    const { CandidateContactCacheModel } = await import(
      '../src/modules/candidates/candidate-contact-cache.model.js'
    );
    const { encryptField } = await import('../src/shared/encryption/cipher.js');
    const { SourcedCandidateModel } = await import(
      '../src/modules/sourcing/sourced-candidate.model.js'
    );
    const { SourcingSessionModel } = await import(
      '../src/modules/sourcing/sourcing-session.model.js'
    );
    const { QuotaCounterModel } = await import('../src/shared/usage/quota-counter.model.js');
    const { currentPeriodKey } = await import('../src/shared/usage/metrics.js');

    const orgA = await registerUser(agent, `cache-a-${Date.now()}@huntlo.ai`);
    const orgB = await registerUser(agent, `cache-b-${Date.now()}@huntlo.ai`);

    const linkedinKey = 'https://www.linkedin.com/in/shared-candidate';
    const encrypted = encryptField('shared@example.com');
    await CandidateContactCacheModel.create({
      provider: 'future_jobs',
      linkedinUrlKey: linkedinKey,
      externalCandidateId: 'ext-shared-1',
      encryptedEmails: [encrypted],
      encryptedPhones: [],
      fetchedAt: new Date(),
      expiresAt: new Date(Date.now() + 86_400_000),
    });

    const session = await SourcingSessionModel.create({
      organizationId: orgB.organizationId,
      ownerUserId: orgB.userId,
      name: 'Cross-org cache session',
      naturalLanguageQuery: 'engineers',
      status: 'completed',
    });

    const candidateB = await SourcedCandidateModel.create({
      organizationId: orgB.organizationId,
      sourcingSessionId: session._id,
      externalCandidateId: 'ext-shared-1',
      basicProfile: {
        name: 'Shared Candidate',
        linkedinUrl: linkedinKey,
      },
      rank: 1,
      matchScore: 4,
    });

    await QuotaCounterModel.create({
      organizationId: orgB.organizationId,
      periodKey: currentPeriodKey(),
      metric: 'email_reveal',
      used: 0,
      reserved: 0,
      limit: 1000,
      resetAt: new Date(Date.now() + 86_400_000),
      allowOverage: false,
    });

    const result = await revealService.reveal(
      { userId: orgB.userId, organizationId: orgB.organizationId },
      candidateB._id.toHexString(),
      'email'
    );

    expect(result.source).toBe('shared_cache');
    expect(result.charged).toBe(true);

    const counter = await QuotaCounterModel.findOne({
      organizationId: orgB.organizationId,
      periodKey: currentPeriodKey(),
      metric: 'email_reveal',
    });
    expect((counter?.used || 0) + (counter?.reserved || 0)).toBeGreaterThan(0);
    void orgA;
  });
});
