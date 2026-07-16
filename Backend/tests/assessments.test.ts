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
  AssessmentCampaignModel,
  AssessmentCandidateModel,
  AssessmentTemplateModel,
  AssessmentWebhookEventModel,
} from '../src/modules/assessments/index.js';
import { clearMockAssessmentStore } from '../src/providers/assessments/index.js';
import { AuditLogModel } from '../src/shared/audit/audit.service.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerAndAuth(agent: ReturnType<typeof request.agent>) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `assess-${Date.now()}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Assess',
    lastName: 'Tester',
    organizationName: `Assess Org ${Date.now()}`,
  });
  expect(response.status).toBe(201);
  const organizationId = response.body.data.organization.id as string;
  await OrganizationModel.findByIdAndUpdate(organizationId, { plan: 'Scale' });
  return {
    token: response.body.data.accessToken as string,
    organizationId,
    userId: response.body.data.user.id as string,
  };
}

describe('Assessments module', () => {
  const app = createApp();
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    process.env.ASSESSMENT_PROVIDER = 'mock';
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
    clearMockAssessmentStore();
    await Promise.all([
      AssessmentWebhookEventModel.deleteMany({}),
      AssessmentCandidateModel.deleteMany({}),
      AssessmentCampaignModel.deleteMany({}),
      AssessmentTemplateModel.deleteMany({}),
      SavedCandidateModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);
  });

  it('creates template + campaign, launches invites, and syncs webhook results', async () => {
    const auth = await registerAndAuth(agent);

    const candidate = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Neha Kapoor',
        email: 'neha@example.com',
        phone: '9876501234',
        status: 'saved',
      });
    expect(candidate.status).toBe(201);
    const candidateId = candidate.body.data.id as string;

    const template = await agent
      .post('/api/v1/assessments/templates')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Backend systems design',
        title: 'Go systems design',
        durationMinutes: 60,
        skills: ['Go', 'System design'],
        passingScore: 70,
        sections: [{ id: 's1', title: 'Coding', questionCount: 3 }],
        status: 'active',
      });
    expect(template.status).toBe(201);
    const templateId = template.body.data.id as string;

    const campaign = await agent
      .post('/api/v1/assessments/campaigns')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        templateId,
        name: 'Backend design — Wave 1',
        candidateIds: [candidateId],
        invitationConfig: { channel: 'email' },
        expiryHours: 48,
      });
    expect(campaign.status).toBe(201);
    const campaignId = campaign.body.data.id as string;
    expect(campaign.body.data.status).toBe('Draft');

    const launched = await agent
      .post(`/api/v1/assessments/campaigns/${campaignId}/launch`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({});
    expect(launched.status).toBe(200);
    expect(launched.body.data.status).toBe('Active');
    expect(launched.body.data.invited).toBeGreaterThanOrEqual(1);

    const results = await agent
      .get('/api/v1/assessments/results')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(results.status).toBe(200);
    expect(results.body.data.length).toBe(1);
    const resultId = results.body.data[0].id as string;
    const providerAttemptId = results.body.data[0].providerAttemptId as string;
    expect(providerAttemptId).toBeTruthy();

    const webhook = await agent.post('/api/v1/webhooks/assessments').send({
      eventId: `evt-${Date.now()}`,
      eventType: 'attempt.completed',
      providerAttemptId,
      status: 'completed',
      score: 88,
      result: 'pass',
      sectionScores: { coding: 90, design: 86 },
      completedAt: new Date().toISOString(),
    });
    expect(webhook.status).toBe(200);
    expect(webhook.body.data.score).toBe(88);

    const detail = await agent
      .get(`/api/v1/assessments/results/${resultId}`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.invitationStatus).toBe('completed');
    expect(detail.body.data.score).toBe(88);
    expect(detail.body.data.result).toBe('pass');

    // Idempotent webhook replay
    const replay = await agent.post('/api/v1/webhooks/assessments').send({
      eventId: webhook.body.data.eventId,
      eventType: 'attempt.completed',
      providerAttemptId,
      status: 'completed',
      score: 88,
    });
    expect(replay.status).toBe(200);
    expect(replay.body.data.duplicate).toBe(true);

    const summary = await agent
      .get('/api/v1/assessments')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(summary.status).toBe(200);
    expect(summary.body.data[0].name).toContain('Backend');
  });

  it('cancels a running campaign and marks candidates cancelled', async () => {
    const auth = await registerAndAuth(agent);
    const candidate = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Ravi Shah',
        email: 'ravi@example.com',
        status: 'saved',
      });
    const candidateId = candidate.body.data.id as string;

    const template = await agent
      .post('/api/v1/assessments/templates')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ name: 'SQL basics', title: 'SQL', status: 'active' });
    const templateId = template.body.data.id as string;

    const campaign = await agent
      .post('/api/v1/assessments/campaigns')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ templateId, candidateIds: [candidateId] });
    const campaignId = campaign.body.data.id as string;

    await agent
      .post(`/api/v1/assessments/campaigns/${campaignId}/launch`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({});

    const cancelled = await agent
      .post(`/api/v1/assessments/campaigns/${campaignId}/cancel`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({});
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.status).toBe('Cancelled');

    const results = await agent
      .get('/api/v1/assessments/results')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(results.body.data[0].invitationStatus).toBe('cancelled');
  });
});
