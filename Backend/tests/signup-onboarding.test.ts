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

const ONBOARDING_ANSWERS = {
  companyType: 'recruitment_agency',
  hiringChallenges: ['finding_qualified', 'low_response'],
  outreachChannels: ['email', 'whatsapp'],
  hiringVolume: '5_20',
};

describe('Signup and owner onboarding', () => {
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
      OrganizationMemberModel.deleteMany({}),
      UserModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      WorkspaceSubscriptionModel.deleteMany({}),
      PricingPlanModel.deleteMany({}),
    ]);
  });

  it('requires fullName for modern signup payload', async () => {
    const response = await agent
      .post('/api/v1/auth/register')
      .send({
        companyName: 'Acme Talent',
        email: 'missing-name@huntlo.ai',
        mobile: '+919876543210',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('requires companyName for modern signup payload', async () => {
    const response = await agent
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Ananya Sharma',
        email: 'missing-company@huntlo.ai',
        mobile: '+919876543210',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('lowercases email, hashes password, assigns default plan, and leaves onboarding incomplete', async () => {
    const response = await agent
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Ananya Sharma',
        companyName: 'Acme Talent Partners',
        email: 'Ananya@AcmeTalent.IN',
        mobile: '9876543210',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      })
      .expect(201);

    expect(response.body.data.user.email).toBe('ananya@acmetalent.in');
    expect(response.body.data.user.fullName).toBe('Ananya Sharma');
    expect(response.body.data.user.companyName).toBe('Acme Talent Partners');
    expect(response.body.data.user.mobile).toBe('+919876543210');
    expect(response.body.data.user.accountRole).toBe('owner');
    expect(response.body.data.user.onboardingCompleted).toBe(false);
    expect(response.body.data.user.onboardingStatus).toBe('not_started');
    expect(response.body.data.accessToken).toBeTruthy();
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');

    const stored = await UserModel.findOne({ email: 'ananya@acmetalent.in' }).select('+passwordHash');
    expect(stored?.passwordHash).toBeTruthy();
    expect(stored?.passwordHash).not.toBe('Password123!');
    expect(stored?.planId).toBeTruthy();

    const org = await OrganizationModel.findById(stored!.organizationId);
    expect(org?.plan).toBe('Trial');

    const subscription = await WorkspaceSubscriptionModel.findOne({
      organizationId: stored!.organizationId,
    });
    expect(subscription?.status).toBe('trialing');

    const trialPlan = await PricingPlanModel.findById(subscription!.planId);
    expect(trialPlan?.code).toBe('trial');
    expect(trialPlan?.isDefaultSignup).toBe(true);
  });

  it('rejects duplicate email', async () => {
    const payload = {
      fullName: 'Ananya Sharma',
      companyName: 'Acme Talent',
      email: 'dup@huntlo.ai',
      mobile: '+919876543210',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };
    await agent.post('/api/v1/auth/register').send(payload).expect(201);
    const response = await agent.post('/api/v1/auth/register').send(payload).expect(409);
    expect(response.body.error.code).toBe('AUTH_EMAIL_ALREADY_EXISTS');
  });

  it('rejects invalid mobile', async () => {
    const response = await agent
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Ananya Sharma',
        companyName: 'Acme Talent',
        email: 'bad-mobile@huntlo.ai',
        mobile: '123',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('rejects password mismatch', async () => {
    const response = await agent
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Ananya Sharma',
        companyName: 'Acme Talent',
        email: 'mismatch@huntlo.ai',
        mobile: '+919876543210',
        password: 'Password123!',
        confirmPassword: 'Password456!',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('completes onboarding, links owner organisation, and is idempotent', async () => {
    const register = await agent
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Onboard User',
        companyName: 'Acme Talent',
        email: 'onboard-flow@huntlo.ai',
        mobile: '+919876543210',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      })
      .expect(201);

    const accessToken = register.body.data.accessToken as string;
    const auth = { Authorization: `Bearer ${accessToken}` };
    const orgIdBefore = register.body.data.user.organizationId as string;

    const completed = await agent
      .patch('/api/v1/onboarding')
      .set(auth)
      .send(ONBOARDING_ANSWERS)
      .expect(200);

    expect(completed.body.data.user.onboardingCompleted).toBe(true);
    expect(completed.body.data.user.onboardingCompanyType).toBe('recruitment_agency');
    expect(completed.body.data.user.onboardingHiringChallenges).toEqual([
      'finding_qualified',
      'low_response',
    ]);
    expect(completed.body.data.organization.id).toBe(orgIdBefore);
    expect(completed.body.data.redirectPath).toBe('/dashboard');

    const orgCount = await OrganizationModel.countDocuments({});
    expect(orgCount).toBe(1);

    const again = await agent.patch('/api/v1/onboarding').set(auth).send(ONBOARDING_ANSWERS).expect(200);
    expect(again.body.data.user.onboardingCompleted).toBe(true);
    expect(await OrganizationModel.countDocuments({})).toBe(1);

    const stored = await UserModel.findOne({ email: 'onboard-flow@huntlo.ai' });
    expect(stored?.onboardingHiringVolume).toBe('5_20');
    // Hiring volume must not mutate plan quotas / subscription
    expect(stored?.planId).toBeTruthy();
    expect(await WorkspaceSubscriptionModel.countDocuments({ organizationId: stored!.organizationId })).toBe(1);
  });

  it('requires hiring challenges and outreach channels', async () => {
    const register = await agent
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Validate User',
        companyName: 'Acme Talent',
        email: 'validate-onboarding@huntlo.ai',
        mobile: '+919876543210',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      })
      .expect(201);

    const auth = { Authorization: `Bearer ${register.body.data.accessToken}` };

    await agent
      .patch('/api/v1/onboarding')
      .set(auth)
      .send({ ...ONBOARDING_ANSWERS, hiringChallenges: [] })
      .expect(400);

    await agent
      .patch('/api/v1/onboarding')
      .set(auth)
      .send({ ...ONBOARDING_ANSWERS, outreachChannels: [] })
      .expect(400);

    await agent
      .patch('/api/v1/onboarding')
      .set(auth)
      .send({ ...ONBOARDING_ANSWERS, companyType: 'not_a_type' })
      .expect(400);

    await agent
      .patch('/api/v1/onboarding')
      .set(auth)
      .send({ ...ONBOARDING_ANSWERS, hiringVolume: 'unlimited' })
      .expect(400);
  });

  it('blocks team members from owner onboarding', async () => {
    const owner = await agent
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Owner User',
        companyName: 'Acme Talent',
        email: 'owner-onboard@huntlo.ai',
        mobile: '+919876543210',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      })
      .expect(201);

    await agent
      .patch('/api/v1/onboarding')
      .set({ Authorization: `Bearer ${owner.body.data.accessToken}` })
      .send(ONBOARDING_ANSWERS)
      .expect(200);

    const created = await agent
      .post('/api/v1/team/members')
      .set({ Authorization: `Bearer ${owner.body.data.accessToken}` })
      .send({
        name: 'Team Member',
        email: 'member-onboard@huntlo.ai',
        role: 'recruiter',
      })
      .expect(201);

    const login = await agent
      .post('/api/v1/auth/login')
      .send({
        email: 'member-onboard@huntlo.ai',
        password: created.body.data.credentials.temporaryPassword,
      })
      .expect(200);

    expect(login.body.data.user.accountRole).toBe('member');
    expect(login.body.data.user.onboardingCompleted).toBe(true);

    const blocked = await agent
      .patch('/api/v1/onboarding')
      .set({ Authorization: `Bearer ${login.body.data.accessToken}` })
      .send(ONBOARDING_ANSWERS)
      .expect(403);

    expect(blocked.body.error.code).toBe('ONBOARDING_FORBIDDEN_FOR_MEMBER');
  });

  it('does not create integrations during onboarding completion', async () => {
    const register = await agent
      .post('/api/v1/auth/register')
      .send({
        fullName: 'No Integrations',
        companyName: 'Acme Talent',
        email: 'no-integrations@huntlo.ai',
        mobile: '+919876543210',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      })
      .expect(201);

    const before = await import('../src/modules/integrations/user-integration.model.js').then((m) =>
      m.UserIntegrationModel.countDocuments({ organizationId: register.body.data.organization.id })
    );

    await agent
      .patch('/api/v1/onboarding')
      .set({ Authorization: `Bearer ${register.body.data.accessToken}` })
      .send(ONBOARDING_ANSWERS)
      .expect(200);

    const after = await import('../src/modules/integrations/user-integration.model.js').then((m) =>
      m.UserIntegrationModel.countDocuments({ organizationId: register.body.data.organization.id })
    );

    expect(after).toBe(before);
  });
});
