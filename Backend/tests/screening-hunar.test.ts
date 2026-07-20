import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

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
import { UserIntegrationModel } from '../src/modules/integrations/user-integration.model.js';
import {
  ScreeningModel,
  ScreeningCandidateModel,
  VoiceWebhookEventModel,
} from '../src/modules/screening/index.js';
import { AuditLogModel } from '../src/shared/audit/audit.service.js';
import * as hunarClient from '../src/providers/hunar/hunar.client.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

vi.mock('../src/providers/hunar/hunar.client.js', async () => {
  const actual = await vi.importActual<typeof import('../src/providers/hunar/hunar.client.js')>(
    '../src/providers/hunar/hunar.client.js'
  );
  return {
    ...actual,
    createHunarVoiceAgent: vi.fn(async () => ({
      agentId: 'agent-test-1',
      response: { id: 'agent-test-1' },
    })),
    updateHunarVoiceAgent: vi.fn(async (id: string) => ({
      agentId: id,
      response: { id },
    })),
    createHunarBulkCalls: vi.fn(async (input: { screeningId: string }) => ({
      requestId: `${input.screeningId}-req-1`,
      dialedCount: 1,
      response: { ok: true },
    })),
  };
});

async function registerAndAuth(agent: ReturnType<typeof request.agent>) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `screen-${Date.now()}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Screen',
    lastName: 'Tester',
    organizationName: `Screen Org ${Date.now()}`,
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

describe('AI voice screening (Hunar)', () => {
  const app = createApp();
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    process.env.HUNAR_VOICE_API_KEY = 'test-hunar-key';
    process.env.HUNAR_WEBHOOK_SECRET = 'whsec_test_secret';
    process.env.PUBLIC_API_BASE_URL = 'http://localhost:4000';
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
    vi.clearAllMocks();
    await Promise.all([
      VoiceWebhookEventModel.deleteMany({}),
      ScreeningCandidateModel.deleteMany({}),
      ScreeningModel.deleteMany({}),
      SavedCandidateModel.deleteMany({}),
      UserIntegrationModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);
  });

  it('creates, validates, and launches a screening with mocked Hunar provider', async () => {
    const auth = await registerAndAuth(agent);
    await agent
      .post('/api/v1/integrations/hunar/connect')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({});

    const candidate = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Asha Verma',
        email: 'asha@example.com',
        phone: '9876543210',
        status: 'saved',
      });
    expect(candidate.status).toBe(201);
    const candidateId = candidate.body.data.id as string;

    const created = await agent
      .post('/api/v1/screenings')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Backend voice screen',
        ownerUserId: auth.userId,
        description: 'Internal screening notes',
        objective: 'Assess backend fit',
        language: 'ENGLISH',
        voice: 'NEHA',
        introductionScript: 'Hi, this is a screening call.',
        questions: [
          {
            id: 'q1',
            prompt: 'Tell me about your Node experience',
            type: 'Experience',
            required: true,
            followUp: 'Probe for production scale if vague',
            expectedVariable: 'node_experience',
            evaluationEnabled: true,
          },
        ],
        evaluationCriteria: [
          { id: 'communication', label: 'Communication', weight: 1 },
          {
            id: 'node_experience',
            label: 'Node experience',
            weight: 2,
            description: 'Score based on Node answer',
          },
        ],
        candidateIds: [candidateId],
        callSettings: { maxAttempts: 2, maxRetryCount: 2, retryIntervalHours: 6 },
      });
    expect(created.status).toBe(201);
    expect(created.body.data.ownerUserId).toBe(auth.userId);
    expect(created.body.data.owner).toBe('Screen Tester');
    expect(created.body.data.description).toBe('Internal screening notes');
    expect(created.body.data.questions?.[0]).toMatchObject({
      id: 'q1',
      prompt: 'Tell me about your Node experience',
      type: 'Experience',
      required: true,
      followUp: 'Probe for production scale if vague',
      expectedVariable: 'node_experience',
      evaluationEnabled: true,
    });
    const screeningId = created.body.data.id as string;

    const validated = await agent
      .post(`/api/v1/screenings/${screeningId}/validate`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(validated.status).toBe(200);
    expect(validated.body.data.ok).toBe(true);

    const launched = await agent
      .post(`/api/v1/screenings/${screeningId}/launch`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(launched.status).toBe(200);
    expect(launched.body.data.status).toBe('Running');

    expect(hunarClient.createHunarVoiceAgent).toHaveBeenCalled();
    const agentArg = vi.mocked(hunarClient.createHunarVoiceAgent).mock.calls[0]![0] as {
      agentPrompt: string;
      introduction: string;
      resultPrompt: string;
      resultSchema?: { properties?: Record<string, unknown> };
    };
    expect(agentArg.agentPrompt).toContain('You are Roshni');
    expect(agentArg.agentPrompt).toContain('Tell me about your Node experience');
    expect(agentArg.agentPrompt).toContain('Probe for production scale if vague');
    expect(agentArg.agentPrompt).toContain('node_experience');
    expect(agentArg.introduction).toBe('Hi, this is a screening call.');
    expect(agentArg.resultPrompt).toContain('experience');
    expect(agentArg.resultPrompt).toContain('node_experience_answer');
    expect(agentArg.resultSchema?.properties).toHaveProperty('node_experience_answer');
    expect(launched.body.data.providerAgentId).toBe('agent-test-1');
    expect(hunarClient.createHunarVoiceAgent).toHaveBeenCalled();
    expect(hunarClient.createHunarBulkCalls).toHaveBeenCalled();

    const row = await ScreeningCandidateModel.findOne({ screeningId });
    expect(row).toBeTruthy();
    expect(row!.attempts).toBe(1);
    expect(row!.quotaReservationKey).toContain('screening:');
  });

  it('processes Hunar webhook fixtures idempotently and maps scores', async () => {
    const auth = await registerAndAuth(agent);
    process.env.HUNAR_VOICE_API_KEY = 'test-hunar-key';

    const candidate = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Ravi Kumar',
        phone: '9988776655',
        status: 'saved',
      });
    const candidateId = candidate.body.data.id as string;

    const created = await agent
      .post('/api/v1/screenings')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Webhook screen',
        introductionScript: 'Hello',
        questions: [{ id: 'q1', prompt: 'Experience?' }],
        evaluationCriteria: [{ id: 'communication', label: 'Communication', weight: 1 }],
        candidateIds: [candidateId],
      });
    const screeningId = created.body.data.id as string;

    await agent
      .post(`/api/v1/screenings/${screeningId}/launch`)
      .set('Authorization', `Bearer ${auth.token}`);

    const statusBody = {
      call_id: 'call-fixture-1',
      request_id: `${screeningId}-req-1`,
      agent_id: 'agent-test-1',
      to_number: '919988776655',
      status: 'COMPLETED',
      lifecycle_status: 'COMPLETED',
      event_type: 'call_status_updated',
      duration_seconds: 95,
      answered_by: 'human',
    };

    const first = await agent
      .post(`/api/v1/webhooks/hunar/call-status?screeningId=${screeningId}`)
      .set('X-Webhook-Secret', 'whsec_test_secret')
      .send(statusBody);
    expect(first.status).toBe(200);
    expect(first.body.data.duplicate).toBe(false);
    expect(first.body.data.callStatus).toBe('completed');

    const dup = await agent
      .post(`/api/v1/webhooks/hunar/call-status?screeningId=${screeningId}`)
      .set('X-Webhook-Secret', 'whsec_test_secret')
      .send(statusBody);
    expect(dup.status).toBe(200);
    expect(dup.body.data.duplicate).toBe(true);

    const resultBody = {
      call_id: 'call-fixture-1',
      request_id: `${screeningId}-req-1`,
      to_number: '919988776655',
      status: 'COMPLETED',
      event_type: 'call_result_done',
      result: {
        summary: 'Strong communicator',
        final_outcome: 'interested',
        interest_level: 'high',
        communication: 88,
      },
      recording_url: 'https://recordings.example/call-fixture-1.mp3',
    };

    const result = await agent
      .post(`/api/v1/webhooks/hunar/call-result?screeningId=${screeningId}`)
      .set('X-Webhook-Secret', 'whsec_test_secret')
      .send(resultBody);
    expect(result.status).toBe(200);

    const recording = await agent
      .post(`/api/v1/webhooks/hunar/call-recording?screeningId=${screeningId}`)
      .set('X-Webhook-Secret', 'whsec_test_secret')
      .send({
        call_id: 'call-fixture-1',
        to_number: '919988776655',
        event_type: 'call_recording_done',
        recording_url: 'https://recordings.example/call-fixture-1.mp3',
      });
    expect(recording.status).toBe(200);

    const row = await ScreeningCandidateModel.findOne({ providerCallId: 'call-fixture-1' });
    expect(row!.summary).toBe('Strong communicator');
    expect(row!.overallScore).toBe(88);
    expect(row!.recommendation).toBe('shortlist');
    expect(row!.recordingReference).toContain('call-fixture-1.mp3');
    expect(row!.extractedVariables.final_outcome).toBe('interested');
    expect(row!.quotaCommittedMinutes).toBeGreaterThanOrEqual(1);

    const events = await VoiceWebhookEventModel.countDocuments({
      provider: 'hunar',
      screeningId,
    });
    expect(events).toBeGreaterThanOrEqual(3);

    const shortlist = await agent
      .post(`/api/v1/screenings/results/${String(row!._id)}/shortlist`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(shortlist.status).toBe(200);
    expect(shortlist.body.data.recruiterDecision).toBe('shortlisted');

    const unauthorized = await agent
      .post(`/api/v1/webhooks/hunar/call-status?screeningId=${screeningId}`)
      .send({ ...statusBody, call_id: 'call-other' });
    expect(unauthorized.status).toBe(401);
  });
});
