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
import { OutreachTemplateModel } from '../src/modules/outreach/outreach-template.model.js';
import { SequenceTemplateModel } from '../src/modules/outreach/sequence-template.model.js';
import {
  extractVariables,
  validateMessageVariables,
} from '../src/modules/outreach/variables.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerAndAuth(agent: ReturnType<typeof request.agent>) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `outreach-${Date.now()}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Outreach',
    lastName: 'Tester',
    organizationName: `Outreach Org ${Date.now()}`,
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
    userId: response.body.data.user.id as string,
  };
}

describe('Outreach templates + AI', () => {
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
      OutreachTemplateModel.deleteMany({}),
      SequenceTemplateModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);
  });

  it('extracts and validates allowed variables', () => {
    const vars = extractVariables(
      'Hi {{first_name}} at {{current_company}}',
      'Role {{job_title}} — unknown {{calendly_link}}'
    );
    expect(vars).toContain('first_name');
    expect(vars).toContain('calendly_link');

    const result = validateMessageVariables({
      body: 'Hi {{first_name}}, {{calendly_link}}',
      sampleValues: { first_name: 'Ada' },
    });
    expect(result.valid).toBe(false);
    expect(result.unknown).toEqual(['calendly_link']);
    expect(result.preview).toContain('Ada');
  });

  it('creates, lists, previews, duplicates, and deletes templates', async () => {
    const auth = await registerAndAuth(agent);

    const created = await agent
      .post('/api/v1/outreach/templates')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Intro — role pitch',
        channel: 'email',
        category: 'opening',
        subject: 'Quick question, {{first_name}}',
        body: 'Hi {{first_name}}, role {{job_title}} at {{company_name}} — {{recruiter_name}}',
        status: 'active',
      });
    expect(created.status).toBe(201);
    expect(created.body.data.variables).toEqual(
      expect.arrayContaining(['first_name', 'job_title', 'company_name', 'recruiter_name'])
    );
    expect(created.body.data.generation).toBeNull();

    const bad = await agent
      .post('/api/v1/outreach/templates')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Bad vars',
        channel: 'whatsapp',
        category: 'follow_up',
        body: 'See {{calendly_link}}',
      });
    expect(bad.status).toBe(400);
    expect(bad.body.error.code).toBe('INVALID_VARIABLES');

    const list = await agent
      .get('/api/v1/outreach/templates')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);

    const preview = await agent
      .post(`/api/v1/outreach/templates/${created.body.data.id}/preview`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ sampleValues: { first_name: 'Ada', job_title: 'Engineer', company_name: 'Acme', recruiter_name: 'Neha' } });
    expect(preview.status).toBe(200);
    expect(preview.body.data.body).toContain('Ada');
    expect(preview.body.data.body).not.toContain('{{first_name}}');

    const dup = await agent
      .post(`/api/v1/outreach/templates/${created.body.data.id}/duplicate`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(dup.status).toBe(201);
    expect(dup.body.data.name).toContain('(copy)');
    expect(dup.body.data.status).toBe('draft');

    const del = await agent
      .delete(`/api/v1/outreach/templates/${dup.body.data.id}`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(del.status).toBe(200);
  });

  it('creates and updates sequence templates with variable checks', async () => {
    const auth = await registerAndAuth(agent);

    const created = await agent
      .post('/api/v1/outreach/sequence-templates')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Email then WhatsApp',
        channels: ['email', 'whatsapp'],
        steps: [
          {
            id: 's1',
            order: 0,
            type: 'Send Email',
            channel: 'email',
            delayDays: 0,
            subject: 'Hi {{first_name}}',
            body: 'About {{job_title}}',
            stopOnReply: true,
          },
          {
            id: 's2',
            order: 1,
            type: 'Wait',
            channel: 'wait',
            delayDays: 2,
            body: null,
          },
        ],
        status: 'active',
      });
    expect(created.status).toBe(201);
    expect(created.body.data.steps).toHaveLength(2);

    const patched = await agent
      .patch(`/api/v1/outreach/sequence-templates/${created.body.data.id}`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ name: 'Updated sequence' });
    expect(patched.status).toBe(200);
    expect(patched.body.data.name).toBe('Updated sequence');
  });

  it('generates and rewrites AI drafts without auto-launch', async () => {
    const auth = await registerAndAuth(agent);

    const generated = await agent
      .post('/api/v1/outreach/generate')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        mode: 'sequence',
        jobTitle: 'Backend Engineer',
        channels: ['email', 'whatsapp'],
        saveAsDraft: true,
      });
    expect(generated.status).toBe(200);
    expect(generated.body.data.kind).toBe('sequence');
    expect(generated.body.data.draft.status).toBe('draft');
    expect(generated.body.data.draft.autoLaunch).toBe(false);
    expect(generated.body.data.draft.generation.isDraft).toBe(true);
    expect(generated.body.data.saved?.status).toBe('draft');
    expect(JSON.stringify(generated.body)).not.toMatch(/system prompt|apiKey/i);

    const rewrite = await agent
      .post('/api/v1/outreach/rewrite')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        action: 'shorten',
        body: 'Hi {{first_name}},\n\nLong paragraph about {{job_title}}.\n\nMore text.\n\n{{recruiter_name}}',
        channel: 'email',
        category: 'opening',
        saveAsDraft: true,
      });
    expect(rewrite.status).toBe(200);
    expect(rewrite.body.data.draft.status).toBe('draft');
    expect(rewrite.body.data.draft.autoLaunch).toBe(false);
    expect(rewrite.body.data.saved?.generation?.isDraft).toBe(true);

    const validate = await agent
      .post('/api/v1/outreach/validate-variables')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ body: 'Hello {{first_name}} and {{foo}}' });
    expect(validate.status).toBe(200);
    expect(validate.body.data.valid).toBe(false);
    expect(validate.body.data.unknown).toContain('foo');
  });
});
