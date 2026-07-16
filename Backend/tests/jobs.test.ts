import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { OnboardingModel } from '../src/modules/auth/onboarding.model.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { JobActivityModel } from '../src/modules/jobs/job-activity.model.js';
import { JobModel } from '../src/modules/jobs/job.model.js';
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function register(agent: ReturnType<typeof request.agent>, email: string, org: string) {
  return agent.post('/api/v1/auth/register').send({
    email,
    password: 'Password123!',
    firstName: 'Job',
    lastName: 'Owner',
    organizationName: org,
  });
}

describe('Jobs API', () => {
  const app = createApp();
  let agentA: ReturnType<typeof request.agent>;
  let agentB: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    await startMemoryMongo();
    resetEnvCache();
    await connectDatabase();
    agentA = request.agent(app);
    agentB = request.agent(app);
  }, 60_000);

  afterAll(async () => {
    await disconnectDatabase();
    await stopMemoryMongo();
  });

  beforeEach(async () => {
    clearRateLimits();
    await Promise.all([
      JobActivityModel.deleteMany({}),
      JobModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      UserModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
    ]);
  });

  it('creates, lists, and fetches a job within an organisation', async () => {
    const reg = await register(agentA, 'jobs-a@huntlo.ai', 'Jobs Alpha');
    const token = reg.body.data.accessToken as string;

    const created = await agentA
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Senior Backend Engineer',
        department: 'Engineering',
        location: 'Bengaluru',
        experienceMin: 4,
        experienceMax: 8,
        requiredSkills: ['Node.js', 'MongoDB'],
        openings: 2,
        publish: false,
      })
      .expect(201);

    expect(created.body.data.title).toBe('Senior Backend Engineer');
    expect(created.body.data.status).toBe('draft');
    expect(created.body.data.locations).toContain('Bengaluru');

    const listed = await agentA
      .get('/api/v1/jobs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(listed.body.data.items).toHaveLength(1);
    expect(listed.body.data.pagination.total).toBe(1);

    const detail = await agentA
      .get(`/api/v1/jobs/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(detail.body.data.requiredSkills).toContain('Node.js');
  });

  it('publishes, pauses, reopens, closes, and archives with activity history', async () => {
    const reg = await register(agentA, 'jobs-flow@huntlo.ai', 'Jobs Flow');
    const token = reg.body.data.accessToken as string;

    const created = await agentA
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Product Designer', department: 'Design', location: 'Remote' })
      .expect(201);

    const id = created.body.data.id as string;

    await agentA
      .post(`/api/v1/jobs/${id}/publish`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => expect(res.body.data.status).toBe('active'));

    await agentA
      .post(`/api/v1/jobs/${id}/pause`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => expect(res.body.data.status).toBe('paused'));

    await agentA
      .post(`/api/v1/jobs/${id}/reopen`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => expect(res.body.data.status).toBe('active'));

    await agentA
      .post(`/api/v1/jobs/${id}/close`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => expect(res.body.data.status).toBe('closed'));

    await agentA
      .post(`/api/v1/jobs/${id}/archive`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => expect(res.body.data.status).toBe('archived'));

    const activity = await agentA
      .get(`/api/v1/jobs/${id}/activity`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(activity.body.data.items.length).toBeGreaterThanOrEqual(5);
  });

  it('duplicates a job as a draft with reset counters', async () => {
    const reg = await register(agentA, 'jobs-dup@huntlo.ai', 'Jobs Dup');
    const token = reg.body.data.accessToken as string;

    const created = await agentA
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'QA Engineer', department: 'Engineering', publish: true })
      .expect(201);

    const duplicated = await agentA
      .post(`/api/v1/jobs/${created.body.data.id}/duplicate`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(duplicated.body.data.title).toContain('(Copy)');
    expect(duplicated.body.data.status).toBe('draft');
    expect(duplicated.body.data.stats.candidatesSourced).toBe(0);
  });

  it('returns summary and pipeline without storing derived counts as primary fields', async () => {
    const reg = await register(agentA, 'jobs-sum@huntlo.ai', 'Jobs Sum');
    const token = reg.body.data.accessToken as string;

    const created = await agentA
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Data Analyst', openings: 3 })
      .expect(201);

    const summary = await agentA
      .get(`/api/v1/jobs/${created.body.data.id}/summary`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(summary.body.data.openings).toBe(3);
    expect(summary.body.data.candidatesSourced).toBe(0);
    expect(summary.body.data.pipeline).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'sourced' }),
        expect.objectContaining({ id: 'hired' }),
      ])
    );
  });

  it('prevents one organisation from accessing another organisation job', async () => {
    const regA = await register(agentA, 'jobs-iso-a@huntlo.ai', 'Iso Jobs A');
    const regB = await register(agentB, 'jobs-iso-b@huntlo.ai', 'Iso Jobs B');
    const tokenA = regA.body.data.accessToken as string;
    const tokenB = regB.body.data.accessToken as string;

    const created = await agentA
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Secret Role', department: 'Security' })
      .expect(201);

    await agentB
      .get(`/api/v1/jobs/${created.body.data.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);

    await agentB
      .patch(`/api/v1/jobs/${created.body.data.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'Hijacked' })
      .expect(404);
  });

  it('filters jobs by status and department', async () => {
    const reg = await register(agentA, 'jobs-filter@huntlo.ai', 'Jobs Filter');
    const token = reg.body.data.accessToken as string;

    await agentA
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Eng Role', department: 'Engineering', publish: true })
      .expect(201);

    await agentA
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Sales Role', department: 'Sales', publish: false })
      .expect(201);

    const active = await agentA
      .get('/api/v1/jobs?status=active')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(active.body.data.items).toHaveLength(1);
    expect(active.body.data.items[0].department).toBe('Engineering');

    const sales = await agentA
      .get('/api/v1/jobs?department=Sales')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(sales.body.data.items).toHaveLength(1);
    expect(sales.body.data.items[0].status).toBe('draft');
  });
});
