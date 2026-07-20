import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { getEnv, resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { OnboardingModel } from '../src/modules/auth/onboarding.model.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

describe('Auth API', () => {
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
    ]);
  });

  it('registers, returns access token, and sets refresh cookie', async () => {
    const response = await agent
      .post('/api/v1/auth/register')
      .send({
        email: 'ananya@huntlo.ai',
        password: 'Password123!',
        firstName: 'Ananya',
        lastName: 'Sharma',
        organizationName: 'Huntlo Talent',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeTruthy();
    expect(response.body.data.user.email).toBe('ananya@huntlo.ai');
    expect(response.headers['set-cookie']?.join(';')).toContain(getEnv().REFRESH_COOKIE_NAME);
  });

  it('rejects personal email providers at signup', async () => {
    const response = await agent
      .post('/api/v1/auth/register')
      .send({
        email: 'founder@gmail.com',
        password: 'Password123!',
        firstName: 'Founder',
        lastName: 'Personal',
        organizationName: 'Personal Co',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(String(response.body.error?.message || '')).toMatch(/Validation|work email|Personal/i);
  });

  it('logs in with valid credentials', async () => {
    await agent.post('/api/v1/auth/register').send({
      email: 'login@huntlo.ai',
      password: 'Password123!',
      firstName: 'Login',
      lastName: 'User',
    });

    const response = await agent
      .post('/api/v1/auth/login')
      .send({ email: 'login@huntlo.ai', password: 'Password123!' })
      .expect(200);

    expect(response.body.data.accessToken).toBeTruthy();
    expect(response.body.data.organization.name).toBeTruthy();
  });

  it('rejects invalid login credentials', async () => {
    await agent.post('/api/v1/auth/register').send({
      email: 'bad@huntlo.ai',
      password: 'Password123!',
      firstName: 'Bad',
      lastName: 'Login',
    });

    const response = await agent
      .post('/api/v1/auth/login')
      .send({ email: 'bad@huntlo.ai', password: 'wrong-password' })
      .expect(401);

    expect(response.body.success).toBe(false);
  });

  it('refreshes access token using cookie rotation', async () => {
    const register = await agent.post('/api/v1/auth/register').send({
      email: 'refresh@huntlo.ai',
      password: 'Password123!',
      firstName: 'Refresh',
      lastName: 'User',
    });

    const firstToken = register.body.data.accessToken as string;

    const refresh = await agent.post('/api/v1/auth/refresh').expect(200);
    expect(refresh.body.data.accessToken).toBeTruthy();
    expect(refresh.body.data.accessToken).not.toBe(firstToken);
  });

  it('returns current user from /auth/me', async () => {
    const register = await agent.post('/api/v1/auth/register').send({
      email: 'me@huntlo.ai',
      password: 'Password123!',
      firstName: 'Me',
      lastName: 'User',
    });

    const accessToken = register.body.data.accessToken as string;

    const me = await agent
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(me.body.data.user.firstName).toBe('Me');
    expect(me.body.data.permissions).toContain('*');
  });

  it('updates profile via PATCH /auth/me', async () => {
    const register = await agent.post('/api/v1/auth/register').send({
      email: 'patch@huntlo.ai',
      password: 'Password123!',
      firstName: 'Patch',
      lastName: 'User',
    });

    const accessToken = register.body.data.accessToken as string;

    const updated = await agent
      .patch('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ jobTitle: 'Lead Recruiter', phone: '+919876543210' })
      .expect(200);

    expect(updated.body.data.user.jobTitle).toBe('Lead Recruiter');
  });

  it('completes onboarding flow', async () => {
    const register = await agent.post('/api/v1/auth/register').send({
      email: 'onboard@huntlo.ai',
      password: 'Password123!',
      firstName: 'Onboard',
      lastName: 'User',
      organizationName: 'Acme Talent',
    });

    const accessToken = register.body.data.accessToken as string;
    const auth = { Authorization: `Bearer ${accessToken}` };

    const initial = await agent.get('/api/v1/onboarding').set(auth).expect(200);
    expect(initial.body.data.completed).toBe(false);

    const completed = await agent
      .patch('/api/v1/onboarding')
      .set(auth)
      .send({
        companyType: 'startup',
        hiringChallenges: ['screening'],
        outreachChannels: ['email'],
        hiringVolume: '1_5',
      })
      .expect(200);
    expect(completed.body.data.completed).toBe(true);
    expect(completed.body.data.user.onboardingCompleted).toBe(true);

    const me = await agent.get('/api/v1/auth/me').set(auth).expect(200);
    expect(me.body.data.user.onboardingStatus).toBe('completed');
    expect(me.body.data.user.onboardingCompleted).toBe(true);
  });

  it('never returns password hash from API', async () => {
    const register = await agent.post('/api/v1/auth/register').send({
      email: 'secure@huntlo.ai',
      password: 'Password123!',
      firstName: 'Secure',
      lastName: 'User',
    });

    expect(JSON.stringify(register.body)).not.toContain('passwordHash');
    expect(JSON.stringify(register.body)).not.toContain('Password123!');
  });
});
