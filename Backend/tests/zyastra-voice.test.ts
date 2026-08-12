import { createHmac } from 'node:crypto';
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
import { OutreachCampaignModel } from '../src/modules/outreach/campaign.model.js';
import { OutreachEnrollmentModel } from '../src/modules/outreach/enrollment.model.js';
import {
  ScreeningModel,
  ScreeningCandidateModel,
} from '../src/modules/screening/index.js';
import { VoiceCallModel } from '../src/modules/voice/voice-call.model.js';
import {
  isIndianE164,
  partitionVoiceContacts,
} from '../src/modules/voice/voice-dialer.service.js';
import { zyastraToHunarWebhookBodies, normalizeZyastraResultVariables } from '../src/modules/voice/zyastra-voice-webhook.service.js';
import { applyVoiceResultToQualificationState } from '../src/modules/voice/voice-qualification-sync.js';
import { AuditLogModel } from '../src/shared/audit/audit.service.js';
import * as hunarClient from '../src/providers/hunar/hunar.client.js';
import * as zyastraClient from '../src/providers/zyastra/zyastra.client.js';
import {
  parseZyastraWebhookPayload,
  verifyZyastraWebhook,
} from '../src/providers/zyastra/zyastra.webhook.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

const HUNAR_TEST_API_KEY = 'test-hunar-key';
const ZYASTRA_WEBHOOK_SECRET = 'zyastra-webhook-secret';

function signZyastraBody(rawBody: string, secret = ZYASTRA_WEBHOOK_SECRET) {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const v1 = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  return { timestamp, header: `t=${timestamp},v1=${v1}` };
}

function postSignedZyastraWebhook(
  agent: ReturnType<typeof request.agent>,
  path: string,
  payload: Record<string, unknown>
) {
  const body = JSON.stringify(payload);
  const { header } = signZyastraBody(body);
  return agent
    .post(path)
    .set('Content-Type', 'application/json')
    .set('x-zyastra-signature', header)
    .send(body);
}

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
    createHunarBulkCalls: vi.fn(
      async (input: { screeningId?: string; campaignId?: string; callees?: unknown[] }) => ({
        requestId: `${input.screeningId || input.campaignId || 'req'}-hunar-1`,
        dialedCount: input.callees?.length || 1,
        response: { ok: true },
      })
    ),
  };
});

vi.mock('../src/providers/zyastra/zyastra.client.js', async () => {
  const actual = await vi.importActual<
    typeof import('../src/providers/zyastra/zyastra.client.js')
  >('../src/providers/zyastra/zyastra.client.js');

  const triggerZyastraVoiceCall = vi.fn(
    async (input: { candidate: { phoneNumber: string } }) => ({
      requestId: `zy-req-${input.candidate.phoneNumber.replace(/\D/g, '')}`,
      callId: `zy-call-${input.candidate.phoneNumber.replace(/\D/g, '')}`,
      callReferenceId: `zy-ref-${input.candidate.phoneNumber.replace(/\D/g, '')}`,
      status: 'queued',
      response: { ok: true },
    })
  );

  const resolveZyastraRecordingUrl = vi.fn(
    async (input: { callId: string; webhookRecordingUrl?: string | null }) => {
      const fallback = String(input.webhookRecordingUrl || '').trim();
      if (fallback && !fallback.includes('/voice/recording/')) return fallback;
      return `http://localhost:4000/api/integrations/voice/zyastra/recording/${input.callId}`;
    }
  );

  const fetchZyastraRecording = vi.fn(async () => ({
    ok: true as const,
    kind: 'binary' as const,
    contentType: 'audio/mpeg',
    body: Buffer.from('fake-mp3'),
    statusCode: 200,
  }));

  return {
    ...actual,
    triggerZyastraVoiceCall,
    resolveZyastraRecordingUrl,
    fetchZyastraRecording,
    zyastraClient: {
      ...actual.zyastraClient,
      triggerZyastraVoiceCall,
      resolveZyastraRecordingUrl,
      fetchZyastraRecording,
    },
  };
});

async function registerAndAuth(agent: ReturnType<typeof request.agent>) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `zyastra-${Date.now()}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Zyastra',
    lastName: 'Tester',
    organizationName: `Zyastra Org ${Date.now()}`,
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

describe('Zyastra routing + webhook', () => {
  const app = createApp();
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    process.env.HUNAR_VOICE_API_KEY = HUNAR_TEST_API_KEY;
    process.env.ZYASTRA_API_KEY = 'zy-key';
    process.env.ZYASTRA_API_SECRET = 'zy-secret';
    process.env.ZYASTRA_WEBHOOK_SECRET = ZYASTRA_WEBHOOK_SECRET;
    delete process.env.HUNAR_WEBHOOK_SECRET;
    process.env.PUBLIC_API_BASE_URL = 'http://localhost:4000';
    process.env.APP_ENV = 'test';
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
    vi.mocked(hunarClient.createHunarBulkCalls).mockClear();
    vi.mocked(hunarClient.createHunarVoiceAgent).mockClear();
    vi.mocked(zyastraClient.triggerZyastraVoiceCall).mockClear();
    vi.mocked(zyastraClient.resolveZyastraRecordingUrl).mockClear();
    vi.mocked(zyastraClient.fetchZyastraRecording).mockClear();
    await Promise.all([
      UserModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      SavedCandidateModel.deleteMany({}),
      OutreachCampaignModel.deleteMany({}),
      OutreachEnrollmentModel.deleteMany({}),
      ScreeningModel.deleteMany({}),
      ScreeningCandidateModel.deleteMany({}),
      VoiceCallModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
    ]);
  });

  describe('unit helpers', () => {
    it('isIndianE164 and partitionVoiceContacts', () => {
      expect(isIndianE164('+919876543210')).toBe(true);
      expect(isIndianE164('+14155552671')).toBe(false);
      // US NANP with area code 620 contains digits "91" but must NOT route to Hunar
      expect(isIndianE164('+16209129239')).toBe(false);
      expect(isIndianE164('+14066922124')).toBe(false);
      expect(isIndianE164('not-a-phone')).toBe(false);

      const { indian, international, skippedInvalid } = partitionVoiceContacts([
        { name: 'IN', phone: '+919876543210' },
        { name: 'US', phone: '+14155552671' },
        { name: 'US620', phone: '+16209129239' },
        { name: 'Bad', phone: 'abc' },
        { name: 'Dup', phone: '+919876543210' },
      ]);
      expect(indian).toHaveLength(1);
      expect(international).toHaveLength(2);
      expect(skippedInvalid).toBe(2);
      expect(international.map((c) => c.mobile).sort()).toEqual([
        '+14155552671',
        '+16209129239',
      ]);
    });

    it('verifies Zyastra webhook signature', () => {
      const rawBody = JSON.stringify({ event: 'call.completed', data: { callId: 'c1' } });
      const { header } = signZyastraBody(rawBody);
      expect(verifyZyastraWebhook(rawBody, header, ZYASTRA_WEBHOOK_SECRET)).toBe(true);
      expect(verifyZyastraWebhook(rawBody, 't=1,v1=deadbeef', ZYASTRA_WEBHOOK_SECRET)).toBe(
        false
      );
    });

    it('maps Zyastra payload into Hunar-shaped bodies', () => {
      const parsed = parseZyastraWebhookPayload({
        event: 'call.completed',
        eventId: 'evt-1',
        data: {
          callId: 'zy-1',
          callReferenceId: 'ref-1',
          status: 'completed',
          durationSeconds: 95,
          candidate: { phoneNumber: '+14155552671', firstName: 'Ada' },
          transcript: 'Hello',
          recordingUrl: 'https://example.com/r.mp3',
          summary: 'Interested',
          variables: {
            notice_period_days: 1000,
            relocation_willingness: 'No',
            expected_ctc_lpa: null,
            current_ctc_lpa: 18,
          },
          metadata: { campaignId: 'abc' },
        },
      });
      const bodies = zyastraToHunarWebhookBodies(parsed);
      expect(bodies.map((b) => b.kind)).toEqual(
        expect.arrayContaining(['call-status', 'call-result', 'call-recording', 'call-summary'])
      );
      const resultBody = bodies.find((b) => b.kind === 'call-result')!.body;
      expect(resultBody.call_id).toBe('zy-1');
      const result = resultBody.result as Record<string, unknown>;
      expect(result.notice_period).toBe('1000');
      expect(result.location).toBe('No');
      expect(result.ctc).toBe('18');
      expect(result.relocation_willingness).toBe('No');
    });

    it('maps Zyastra analysis variables into qualification answers', () => {
      const enrollment = {
        qualificationState: { status: 'pending', answers: {} },
      } as unknown as import('../src/modules/outreach/enrollment.model.js').OutreachEnrollmentDocument;

      const updated = applyVoiceResultToQualificationState({
        campaign: {
          qualificationConfig: {
            questions: [
              {
                id: 'q-1',
                prompt: 'What is your notice period (in days)?',
                answerType: 'Number',
                knockout: true,
                knockoutCondition: 'Reject if more than 60',
              },
              {
                id: 'q-2',
                prompt: 'Are you open to working from Bengaluru (hybrid, 2 days a week)?',
                answerType: 'Yes / No',
                knockout: true,
                knockoutCondition: 'Reject if No',
              },
              {
                id: 'q-3',
                prompt: 'What is your expected annual compensation?',
                answerType: 'Short text',
                knockout: false,
              },
            ],
          },
        },
        enrollment,
        result: normalizeZyastraResultVariables({
          notice_period_days: 1000,
          relocation_willingness: 'No',
          expected_ctc_lpa: null,
        }),
      });

      expect(updated).toBe(true);
      expect(enrollment.qualificationState.status).toBe('rejected');
      const answers = enrollment.qualificationState.answers as Record<
        string,
        { value?: string }
      >;
      expect(answers['q-1']?.value).toBe('1000');
      expect(answers['q-2']?.value).toBe('No');
    });

    it('resolves auth-gated recording URL to Huntlo proxy', async () => {
      const actual = await vi.importActual<
        typeof import('../src/providers/zyastra/zyastra.client.js')
      >('../src/providers/zyastra/zyastra.client.js');

      const callId = 'cmsih9grs09zxlmi7bl5up0nb';
      const authUrl = `https://astraapi.zyvka.com/api/v1/external/voice/recording/${callId}`;
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(
          new Response(JSON.stringify({ message: 'unauthorized without follow' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        );

      try {
        const resolved = await actual.resolveZyastraRecordingUrl({
          callId,
          webhookRecordingUrl: authUrl,
        });
        expect(resolved).toBe(
          `http://localhost:4000/api/integrations/voice/zyastra/recording/${callId}`
        );
        expect(fetchSpy).toHaveBeenCalled();
        const [url, init] = fetchSpy.mock.calls[0]!;
        expect(String(url)).toContain(`/voice/recording/${callId}`);
        expect((init as RequestInit).headers).toMatchObject({
          'x-api-key': 'zy-key',
          'x-api-secret': 'zy-secret',
        });
      } finally {
        fetchSpy.mockRestore();
      }
    });

    it('returns empty recording URL when Zyastra has no recording', async () => {
      const actual = await vi.importActual<
        typeof import('../src/providers/zyastra/zyastra.client.js')
      >('../src/providers/zyastra/zyastra.client.js');

      const callId = 'cmsino-recording';
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ error: 'No recording available for this call' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      try {
        const resolved = await actual.resolveZyastraRecordingUrl({
          callId,
          webhookRecordingUrl: '',
        });
        expect(resolved).toBe('');
      } finally {
        fetchSpy.mockRestore();
      }
    });
  });

  it('launch-voice dials non-IN via Zyastra and skips Hunar bulk', async () => {
    const { token, organizationId, userId } = await registerAndAuth(agent);

    const candidate = await SavedCandidateModel.create({
      organizationId,
      ownerUserId: userId,
      name: 'US Candidate',
      phone: '+14155552671',
      sourceType: 'manual',
      status: 'saved',
    });

    const campaign = await OutreachCampaignModel.create({
      organizationId,
      ownerUserId: userId,
      name: 'Zyastra campaign',
      status: 'draft',
      channelConfig: {
        email: { enabled: false, integrationId: null, senderEmail: null },
        whatsapp: { enabled: false, integrationId: null },
        ai_voice: { enabled: true, integrationId: null },
        timezone: 'Asia/Kolkata',
        sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
      },
      sequenceSteps: [{ id: 'v1', order: 0, type: 'ai_voice', body: 'Hello' }],
      voiceAgentConfig: {
        agentId: 'should-not-matter-for-us-only',
        agentPrompt: 'Screen for the role.',
        introduction: 'Hello, am I speaking with {callee_name}?',
      },
    });

    await OutreachEnrollmentModel.create({
      organizationId,
      campaignId: campaign._id,
      candidateId: candidate._id,
      status: 'active',
      contactAvailability: { email: true, phone: true, optedOut: false },
    });

    const res = await agent
      .post(`/api/v1/outreach/campaigns/${campaign._id}/launch-voice`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(200);
    expect(zyastraClient.triggerZyastraVoiceCall).toHaveBeenCalledTimes(1);
    expect(hunarClient.createHunarBulkCalls).not.toHaveBeenCalled();

    const calls = await VoiceCallModel.find({ campaignId: campaign._id }).lean();
    expect(calls).toHaveLength(1);
    expect(calls[0]?.provider).toBe('zyastra');
    expect(calls[0]?.callId).toContain('zy-call-');
  });

  it('launch-voice dials +91 via Hunar and US via Zyastra', async () => {
    const { token, organizationId, userId } = await registerAndAuth(agent);

    const indian = await SavedCandidateModel.create({
      organizationId,
      ownerUserId: userId,
      name: 'IN Candidate',
      phone: '+919876543210',
      sourceType: 'manual',
      status: 'saved',
    });
    const us = await SavedCandidateModel.create({
      organizationId,
      ownerUserId: userId,
      name: 'US Candidate',
      phone: '+14155552671',
      sourceType: 'manual',
      status: 'saved',
    });

    const campaign = await OutreachCampaignModel.create({
      organizationId,
      ownerUserId: userId,
      name: 'Mixed campaign',
      status: 'draft',
      channelConfig: {
        email: { enabled: false, integrationId: null, senderEmail: null },
        whatsapp: { enabled: false, integrationId: null },
        ai_voice: { enabled: true, integrationId: null },
        timezone: 'Asia/Kolkata',
        sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
      },
      sequenceSteps: [{ id: 'v1', order: 0, type: 'ai_voice', body: 'Hello' }],
      voiceAgentConfig: {
        agentId: 'agent-mixed-1',
        agentPrompt: 'Screen for the role.',
        introduction: 'Hello?',
      },
    });

    await OutreachEnrollmentModel.create([
      {
        organizationId,
        campaignId: campaign._id,
        candidateId: indian._id,
        status: 'active',
        contactAvailability: { email: true, phone: true, optedOut: false },
      },
      {
        organizationId,
        campaignId: campaign._id,
        candidateId: us._id,
        status: 'active',
        contactAvailability: { email: true, phone: true, optedOut: false },
      },
    ]);

    const res = await agent
      .post(`/api/v1/outreach/campaigns/${campaign._id}/launch-voice`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(200);
    expect(hunarClient.createHunarBulkCalls).toHaveBeenCalledTimes(1);
    expect(zyastraClient.triggerZyastraVoiceCall).toHaveBeenCalledTimes(1);

    const callees = vi.mocked(hunarClient.createHunarBulkCalls).mock.calls[0]![0] as {
      callees: Array<{ mobile_number: string }>;
    };
    expect(callees.callees.map((c) => c.mobile_number)).toEqual(['+919876543210']);
  });

  it('screening launch uses Zyastra for non-IN and applies webhook', async () => {
    const { token, organizationId, userId } = await registerAndAuth(agent);

    const candidate = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '+14155552671',
        status: 'saved',
      });
    expect(candidate.status).toBe(201);
    const candidateId = candidate.body.data.id as string;

    const created = await agent
      .post('/api/v1/screenings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'US screening',
        ownerUserId: userId,
        objective: 'Assess fit',
        language: 'ENGLISH',
        voice: 'NEHA',
        introductionScript: 'Hello, am I speaking with {callee_name}?',
        candidateIds: [candidateId],
        callSettings: { maxAttempts: 1, maxRetryCount: 0, retryIntervalHours: 6 },
      });
    expect(created.status).toBe(201);
    const screeningId = created.body.data.id as string;

    const launch = await agent
      .post(`/api/v1/screenings/${screeningId}/launch`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(launch.status).toBe(200);
    expect(zyastraClient.triggerZyastraVoiceCall).toHaveBeenCalled();
    expect(hunarClient.createHunarBulkCalls).not.toHaveBeenCalled();
    expect(hunarClient.createHunarVoiceAgent).not.toHaveBeenCalled();

    const row = await ScreeningCandidateModel.findOne({ screeningId }).lean();
    expect(row?.providerCallId).toMatch(/^zy-call-/);

    const webhookPayload = {
      event: 'call.completed',
      eventId: `evt-${Date.now()}`,
      data: {
        callId: row!.providerCallId,
        callReferenceId: row!.providerRequestId,
        status: 'completed',
        durationSeconds: 120,
        candidate: { phoneNumber: '+14155552671', firstName: 'Ada' },
        transcript: 'I can join in 30 days.',
        recordingUrl: 'https://example.com/rec.mp3',
        summary: 'Strong fit',
        variables: {
          communication: 80,
          notice_period: '30 days',
          ctc: '25 LPA',
        },
        metadata: {
          source: 'screening',
          screeningId,
          organizationId,
          candidateId,
        },
      },
    };

    const wh = await postSignedZyastraWebhook(
      agent,
      '/api/integrations/voice/zyastra',
      webhookPayload
    );
    expect(wh.status).toBe(200);

    const updated = await ScreeningCandidateModel.findOne({ screeningId }).lean();
    expect(updated?.callStatus).toBe('completed');
    expect(updated?.durationSeconds).toBe(120);
    expect(updated?.transcript).toContain('30 days');
    expect(zyastraClient.resolveZyastraRecordingUrl).toHaveBeenCalled();
  });

  it('proxies Zyastra recording via authenticated GET', async () => {
    const mongoose = await import('mongoose');
    const callId = 'zy-rec-proxy-1';
    await VoiceCallModel.create({
      organizationId: new mongoose.Types.ObjectId(),
      source: 'screening',
      callId,
      requestId: 'zy-req-proxy-1',
      provider: 'zyastra',
      status: 'completed',
      toNumber: '+14155552671',
      toNumberDigits: '14155552671',
    });

    const res = await agent.get(`/api/integrations/voice/zyastra/recording/${callId}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/audio\/mpeg/);
    expect(Buffer.from(res.body).toString()).toBe('fake-mp3');
    expect(zyastraClient.fetchZyastraRecording).toHaveBeenCalledWith(callId);
  });

  it('rejects invalid Zyastra signature in prod-like env', async () => {
    const prev = process.env.APP_ENV;
    process.env.APP_ENV = 'staging';
    try {
      const res = await agent
        .post('/api/integrations/voice/zyastra')
        .set('Content-Type', 'application/json')
        .set('x-zyastra-signature', 't=1,v1=00')
        .send(JSON.stringify({ event: 'call.failed', data: { callId: 'x' } }));
      expect(res.status).toBe(401);
    } finally {
      process.env.APP_ENV = prev;
    }
  });
});
