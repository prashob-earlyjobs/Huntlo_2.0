import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/modules/outreach/campaign-delivery.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/modules/outreach/campaign-delivery.js')>();
  return {
    ...actual,
    sendHiringFlowWhatsAppTemplate: vi.fn().mockResolvedValue({
      providerMessageId: 'wa-hiring-flow-1',
      provider: 'meta',
    }),
    sendPostQualificationWhatsAppViaGateway: vi.fn().mockResolvedValue({
      providerMessageId: 'wa-hiring-flow-1',
      provider: 'huntlo-whatsapp',
      threadId: 'hcg-wa-post-qual-1',
    }),
  };
});

import { createApp } from '../src/app.js';
import { sendHiringFlowWhatsAppTemplate, sendPostQualificationWhatsAppViaGateway } from '../src/modules/outreach/campaign-delivery.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { OnboardingModel } from '../src/modules/auth/onboarding.model.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import { OutreachCampaignModel } from '../src/modules/outreach/campaign.model.js';
import { OutreachEnrollmentModel } from '../src/modules/outreach/enrollment.model.js';
import { SavedCandidateModel } from '../src/modules/candidates/saved-candidate.model.js';
import {
  isVoiceCallTerminal,
  pendingVoiceCallId,
  VoiceCallModel,
} from '../src/modules/voice/voice-call.model.js';
import { AuditLogModel } from '../src/shared/audit/audit.service.js';
import {
  QuotaCounterModel,
  UsageReservationModel,
  quotaService,
} from '../src/shared/usage/index.js';
import { computeHunarWebhookSignature } from '../src/providers/hunar/hunar.webhook.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

const HUNAR_TEST_API_KEY = 'test-hunar-key';

function postSignedHunarWebhook(
  agent: ReturnType<typeof request.agent>,
  path: string,
  payload: Record<string, unknown>,
  apiKey = HUNAR_TEST_API_KEY
) {
  const body = JSON.stringify(payload);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = computeHunarWebhookSignature({
    apiKey,
    requestBody: Buffer.from(body, 'utf8'),
    timestamp,
  });
  return agent
    .post(path)
    .set('Content-Type', 'application/json')
    .set('x-hunar-timestamp', timestamp)
    .set('x-hunar-signature', signature)
    .send(body);
}

async function registerAndAuth(agent: ReturnType<typeof request.agent>) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `voice-${Date.now()}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Voice',
    lastName: 'Tester',
    organizationName: `Voice Org ${Date.now()}`,
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.user.organizationId as string,
    userId: response.body.data.user.id as string,
  };
}

describe('AI voice — campaign webhooks + VoiceCall stubs', () => {
  const agent = request.agent(createApp());

  beforeAll(async () => {
    await startMemoryMongo();
    process.env.HUNAR_VOICE_API_KEY = HUNAR_TEST_API_KEY;
    delete process.env.HUNAR_WEBHOOK_SECRET;
    process.env.PUBLIC_API_BASE_URL = 'http://localhost:4000';
    resetEnvCache();
    await connectDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
    await stopMemoryMongo();
  });

  beforeEach(async () => {
    clearRateLimits();
    vi.mocked(sendHiringFlowWhatsAppTemplate).mockClear();
    vi.mocked(sendPostQualificationWhatsAppViaGateway).mockClear();
    await Promise.all([
      UserModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OutreachCampaignModel.deleteMany({}),
      OutreachEnrollmentModel.deleteMany({}),
      SavedCandidateModel.deleteMany({}),
      VoiceCallModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
      QuotaCounterModel.deleteMany({}),
      UsageReservationModel.deleteMany({}),
    ]);
  });

  it('treats completed/cancelled as terminal even when retriesLeft remains', () => {
    expect(
      isVoiceCallTerminal({ status: 'completed', retriesLeft: 2, nextRetryAt: null })
    ).toBe(true);
    expect(
      isVoiceCallTerminal({ status: 'cancelled', retriesLeft: 1, nextRetryAt: null })
    ).toBe(true);
    expect(
      isVoiceCallTerminal({
        status: 'no_answer',
        retriesLeft: 2,
        nextRetryAt: null,
      })
    ).toBe(false);
    expect(
      isVoiceCallTerminal({
        status: 'no_answer',
        retriesLeft: 0,
        nextRetryAt: null,
      })
    ).toBe(true);
    expect(
      isVoiceCallTerminal({
        status: 'failed',
        retriesLeft: 0,
        nextRetryAt: new Date(),
      })
    ).toBe(false);
  });

  it('promotes pending VoiceCall stub on campaign call-status webhook', async () => {
    const auth = await registerAndAuth(agent);
    const candidate = await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+919876543210',
      source: 'manual',
      status: 'saved',
    });

    const campaign = await OutreachCampaignModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'Voice Campaign',
      status: 'running',
      channelConfig: {
        email: { enabled: false, integrationId: null, senderEmail: null },
        whatsapp: { enabled: false, integrationId: null },
        ai_voice: { enabled: true, integrationId: null },
        timezone: 'Asia/Kolkata',
        sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
      },
      sequenceSteps: [{ id: 'v1', order: 0, type: 'ai_voice', body: 'Hello' }],
    });

    const enrollment = await OutreachEnrollmentModel.create({
      organizationId: auth.organizationId,
      campaignId: campaign._id,
      candidateId: candidate._id,
      status: 'active',
      contactAvailability: { email: true, phone: true, optedOut: false },
    });

    const requestId = `${String(campaign._id)}-req-1`;
    const digits = '919876543210';
    await VoiceCallModel.create({
      organizationId: auth.organizationId,
      source: 'outreach',
      campaignId: campaign._id,
      enrollmentId: enrollment._id,
      candidateId: candidate._id,
      callId: pendingVoiceCallId(requestId, digits),
      requestId,
      agentId: 'agent-1',
      contactName: 'Jane Doe',
      toNumber: digits,
      toNumberDigits: digits,
      status: 'pending',
      quotaReservationKey: `voice:${requestId}:${digits}`,
    });

    const res = await postSignedHunarWebhook(
      agent,
      `/api/integrations/voice/hunar/call-status?campaignId=${String(campaign._id)}`,
      {
        call_id: 'hunar-call-99',
        request_id: requestId,
        agent_id: 'agent-1',
        to_number: '+919876543210',
        status: 'COMPLETED',
        duration_seconds: 95,
        result: {
          interest_level: 'interested',
          summary: 'Strong fit',
          final_outcome: 'shortlist',
        },
      }
    );

    expect(res.status).toBe(200);
    expect(res.body.data.callId).toBe('hunar-call-99');

    const row = await VoiceCallModel.findOne({
      campaignId: campaign._id,
      callId: 'hunar-call-99',
    });
    expect(row).toBeTruthy();
    expect(row!.status).toBe('completed');
    expect(row!.callResult.interestLevel).toBe('interested');
    expect(row!.durationMinutes).toBe(2);

    const pendingGone = await VoiceCallModel.findOne({
      callId: pendingVoiceCallId(requestId, digits),
    });
    expect(pendingGone).toBeNull();
  });

  it('writes Hunar call-result answers into enrollment qualificationState', async () => {
    const auth = await registerAndAuth(agent);
    const candidate = await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'Gokul',
      email: 'gokul@example.com',
      phone: '+919876543211',
      source: 'manual',
      status: 'saved',
    });

    const campaign = await OutreachCampaignModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'Voice Qualification Campaign',
      status: 'running',
      channelConfig: {
        email: { enabled: false, integrationId: null, senderEmail: null },
        whatsapp: { enabled: false, integrationId: null },
        ai_voice: { enabled: true, integrationId: null },
        timezone: 'Asia/Kolkata',
        sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
      },
      sequenceSteps: [{ id: 'v1', order: 0, type: 'ai_voice', body: 'Hello' }],
      qualificationConfig: {
        enabled: true,
        questions: [
          {
            id: 'q-notice',
            title: 'notice period',
            prompt: 'What is your notice period?',
            answerType: 'text',
          },
          {
            id: 'q-location',
            title: 'location / hybrid',
            prompt: 'Are you open to hybrid work from Bangalore?',
            answerType: 'text',
          },
          {
            id: 'q-marriage',
            title: 'marrage status',
            prompt: 'What is your marital status?',
            answerType: 'text',
          },
        ],
      },
    });

    const enrollment = await OutreachEnrollmentModel.create({
      organizationId: auth.organizationId,
      campaignId: campaign._id,
      candidateId: candidate._id,
      status: 'active',
      contactAvailability: { email: true, phone: true, optedOut: false },
      qualificationState: { status: 'pending', answers: {} },
    });

    const requestId = `${String(campaign._id)}-req-qual`;
    const digits = '919876543211';
    await VoiceCallModel.create({
      organizationId: auth.organizationId,
      source: 'outreach',
      campaignId: campaign._id,
      enrollmentId: enrollment._id,
      candidateId: candidate._id,
      callId: pendingVoiceCallId(requestId, digits),
      requestId,
      agentId: 'agent-1',
      contactName: 'Gokul',
      toNumber: digits,
      toNumberDigits: digits,
      status: 'ringing',
    });

    const res = await postSignedHunarWebhook(
      agent,
      `/api/integrations/voice/hunar/call-result?campaignId=${String(campaign._id)}`,
      {
        call_id: 'hunar-call-qual-1',
        request_id: requestId,
        agent_id: 'agent-1',
        to_number: '+919876543211',
        status: 'COMPLETED',
        duration_seconds: 120,
        result: {
          interest_level: 'Interested',
          summary: 'Answered screening questions',
          final_outcome: 'Interested',
          notice_period: '30 days',
          location: 'Bangalore, open to hybrid',
          q_marriage_answer: 'Single',
        },
      }
    );

    expect(res.status).toBe(200);

    const updated = await OutreachEnrollmentModel.findById(enrollment._id);
    expect(updated).toBeTruthy();
    expect(updated!.qualificationState.status).toBe('qualified');
    expect(updated!.qualificationState.answers['q-notice']?.value).toBe('30 days');
    expect(updated!.qualificationState.answers['q-location']?.value).toBe(
      'Bangalore, open to hybrid'
    );
    expect(updated!.qualificationState.answers['q-marriage']?.value).toBe('Single');
    expect(sendHiringFlowWhatsAppTemplate).not.toHaveBeenCalled();
    expect(sendPostQualificationWhatsAppViaGateway).not.toHaveBeenCalled();
  });

  it('starts post-qualification WhatsApp when voice screening qualifies the candidate', async () => {
    const auth = await registerAndAuth(agent);
    const candidate = await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'Prashob',
      email: 'prashob@example.com',
      phone: '+919876543213',
      source: 'manual',
      status: 'saved',
    });

    const campaign = await OutreachCampaignModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'Voice Post-Qual WhatsApp Campaign',
      status: 'running',
      channelConfig: {
        email: { enabled: false, integrationId: null, senderEmail: null },
        whatsapp: { enabled: true, integrationId: null },
        ai_voice: { enabled: true, integrationId: null },
        timezone: 'Asia/Kolkata',
        sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
      },
      sequenceSteps: [{ id: 'v1', order: 0, type: 'ai_voice', body: 'Hello' }],
      qualificationConfig: {
        enabled: true,
        autoWhatsAppAfterQualification: true,
        autoWhatsAppTemplateId: 'resume_share',
        questions: [
          {
            id: 'q-notice',
            title: 'notice period',
            prompt: 'What is your notice period?',
            answerType: 'text',
          },
        ],
      },
    });

    const enrollment = await OutreachEnrollmentModel.create({
      organizationId: auth.organizationId,
      campaignId: campaign._id,
      candidateId: candidate._id,
      status: 'active',
      contactAvailability: { email: true, phone: true, optedOut: false },
      qualificationState: { status: 'pending', answers: {} },
    });

    const requestId = `${String(campaign._id)}-req-post-qual`;
    const digits = '919876543213';
    await VoiceCallModel.create({
      organizationId: auth.organizationId,
      source: 'outreach',
      campaignId: campaign._id,
      enrollmentId: enrollment._id,
      candidateId: candidate._id,
      callId: pendingVoiceCallId(requestId, digits),
      requestId,
      agentId: 'agent-1',
      contactName: 'Prashob',
      toNumber: digits,
      toNumberDigits: digits,
      status: 'ringing',
    });

    const res = await postSignedHunarWebhook(
      agent,
      `/api/integrations/voice/hunar/call-result?campaignId=${String(campaign._id)}`,
      {
        call_id: 'hunar-call-post-qual-1',
        request_id: requestId,
        agent_id: 'agent-1',
        to_number: '+919876543213',
        status: 'COMPLETED',
        duration_seconds: 90,
        result: {
          interest_level: 'Interested',
          summary: 'Screening questions were completed. Notice period of ten days.',
          final_outcome: 'Interested',
          notice_period: '10 days',
        },
      }
    );

    expect(res.status).toBe(200);
    expect(sendHiringFlowWhatsAppTemplate).not.toHaveBeenCalled();
    expect(sendPostQualificationWhatsAppViaGateway).toHaveBeenCalledTimes(1);
    expect(vi.mocked(sendPostQualificationWhatsAppViaGateway).mock.calls[0][0]).toMatchObject({
      campaignId: String(campaign._id),
      enrollmentId: String(enrollment._id),
      to: '+919876543213',
      templateId: 'resume_share',
    });
    expect(String(vi.mocked(sendPostQualificationWhatsAppViaGateway).mock.calls[0][0].prompt)).toContain(
      'already completed a voice screening call'
    );

    const updated = await OutreachEnrollmentModel.findById(enrollment._id);
    expect(updated!.qualificationState.status).toBe('qualified');
    expect(updated!.hiringFlowState?.status).toBe('completed');
  });

  it('starts post-qualification WhatsApp on a later webhook if the candidate is already qualified', async () => {
    const auth = await registerAndAuth(agent);
    const candidate = await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'Prashob',
      email: 'prashob-late@example.com',
      phone: '+919876543214',
      source: 'manual',
      status: 'saved',
    });

    const campaign = await OutreachCampaignModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'Voice Late Post-Qual WhatsApp Campaign',
      status: 'running',
      channelConfig: {
        email: { enabled: false, integrationId: null, senderEmail: null },
        whatsapp: { enabled: true, integrationId: null },
        ai_voice: { enabled: true, integrationId: null },
        timezone: 'Asia/Kolkata',
        sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
      },
      sequenceSteps: [{ id: 'v1', order: 0, type: 'ai_voice', body: 'Hello' }],
      qualificationConfig: {
        enabled: true,
        autoWhatsAppAfterQualification: true,
        autoWhatsAppTemplateId: 'resume_share',
        questions: [
          {
            id: 'q-notice',
            title: 'notice period',
            prompt: 'What is your notice period?',
            answerType: 'text',
          },
        ],
      },
    });

    const enrollment = await OutreachEnrollmentModel.create({
      organizationId: auth.organizationId,
      campaignId: campaign._id,
      candidateId: candidate._id,
      status: 'completed',
      contactAvailability: { email: true, phone: true, optedOut: false },
      qualificationState: {
        status: 'qualified',
        answers: { 'q-notice': { value: 'Ten days.', source: 'ai', at: new Date() } },
      },
      hiringFlowState: null,
    });

    const requestId = `${String(campaign._id)}-req-late-post-qual`;
    const digits = '919876543214';
    await VoiceCallModel.create({
      organizationId: auth.organizationId,
      source: 'outreach',
      campaignId: campaign._id,
      enrollmentId: enrollment._id,
      candidateId: candidate._id,
      callId: pendingVoiceCallId(requestId, digits),
      requestId,
      agentId: 'agent-1',
      contactName: 'Prashob',
      toNumber: digits,
      toNumberDigits: digits,
      status: 'completed',
    });

    vi.mocked(sendHiringFlowWhatsAppTemplate).mockClear();
    vi.mocked(sendPostQualificationWhatsAppViaGateway).mockClear();
    const res = await postSignedHunarWebhook(
      agent,
      `/api/integrations/voice/hunar/call-summary?campaignId=${String(campaign._id)}`,
      {
        call_id: 'hunar-call-late-post-qual-1',
        request_id: requestId,
        agent_id: 'agent-1',
        to_number: '+919876543214',
        status: 'COMPLETED',
        result: {
          interest_level: 'Interested',
          summary: 'Already qualified on a previous webhook.',
          final_outcome: 'Interested',
          notice_period: 'Ten days.',
        },
      }
    );

    expect(res.status).toBe(200);
    expect(sendPostQualificationWhatsAppViaGateway).toHaveBeenCalledTimes(1);

    const updated = await OutreachEnrollmentModel.findById(enrollment._id);
    expect(updated!.hiringFlowState?.status).toBe('completed');
  });

  it('starts post-qualification WhatsApp when voice is interested even if some answers are missing', async () => {
    const auth = await registerAndAuth(agent);
    const candidate = await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'Prashob',
      email: 'prashob-partial@example.com',
      phone: '+919876543215',
      source: 'manual',
      status: 'saved',
    });

    const campaign = await OutreachCampaignModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'Voice Partial Qual WhatsApp Campaign',
      status: 'running',
      channelConfig: {
        email: { enabled: false, integrationId: null, senderEmail: null },
        whatsapp: { enabled: true, integrationId: null },
        ai_voice: { enabled: true, integrationId: null },
        timezone: 'Asia/Kolkata',
        sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
      },
      sequenceSteps: [{ id: 'v1', order: 0, type: 'ai_voice', body: 'Hello' }],
      qualificationConfig: {
        enabled: true,
        autoWhatsAppAfterQualification: true,
        autoWhatsAppTemplateId: 'resume_share',
        questions: [
          {
            id: 'q-notice',
            title: 'notice period',
            prompt: 'What is your notice period?',
            answerType: 'text',
          },
          {
            id: 'q-comp',
            title: 'compensation',
            prompt: 'What is your expected compensation?',
            answerType: 'text',
          },
        ],
      },
    });

    const enrollment = await OutreachEnrollmentModel.create({
      organizationId: auth.organizationId,
      campaignId: campaign._id,
      candidateId: candidate._id,
      status: 'active',
      contactAvailability: { email: true, phone: true, optedOut: false },
      qualificationState: { status: 'pending', answers: {} },
    });

    const requestId = `${String(campaign._id)}-req-partial-qual`;
    const digits = '919876543215';
    await VoiceCallModel.create({
      organizationId: auth.organizationId,
      source: 'outreach',
      campaignId: campaign._id,
      enrollmentId: enrollment._id,
      candidateId: candidate._id,
      callId: pendingVoiceCallId(requestId, digits),
      requestId,
      agentId: 'agent-1',
      contactName: 'Prashob',
      toNumber: digits,
      toNumberDigits: digits,
      status: 'ringing',
    });

    vi.mocked(sendHiringFlowWhatsAppTemplate).mockClear();
    vi.mocked(sendPostQualificationWhatsAppViaGateway).mockClear();
    const res = await postSignedHunarWebhook(
      agent,
      `/api/integrations/voice/hunar/call-result?campaignId=${String(campaign._id)}`,
      {
        call_id: 'hunar-call-partial-qual-1',
        request_id: requestId,
        agent_id: 'agent-1',
        to_number: '+919876543215',
        status: 'COMPLETED',
        duration_seconds: 80,
        result: {
          interest_level: 'Interested',
          summary: 'Candidate is interested. Compensation was not mentioned.',
          final_outcome: 'Interested',
          notice_period: '10 days',
        },
      }
    );

    expect(res.status).toBe(200);
    expect(sendPostQualificationWhatsAppViaGateway).toHaveBeenCalledTimes(1);

    const updated = await OutreachEnrollmentModel.findById(enrollment._id);
    expect(updated!.qualificationState.status).toBe('in_progress');
    expect(updated!.status).toBe('interested');
    expect(updated!.hiringFlowState?.status).toBe('completed');
  });

  it('commits ai_voice_minutes on completed call even when retriesLeft was seeded', async () => {
    const auth = await registerAndAuth(agent);
    const candidate = await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'Quota Doe',
      email: 'quota@example.com',
      phone: '+919876543212',
      source: 'manual',
      status: 'saved',
    });

    const campaign = await OutreachCampaignModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'Voice Quota Campaign',
      status: 'running',
      channelConfig: {
        email: { enabled: false, integrationId: null, senderEmail: null },
        whatsapp: { enabled: false, integrationId: null },
        ai_voice: { enabled: true, integrationId: null },
        timezone: 'Asia/Kolkata',
        sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
      },
      sequenceSteps: [{ id: 'v1', order: 0, type: 'ai_voice', body: 'Hello' }],
    });

    const enrollment = await OutreachEnrollmentModel.create({
      organizationId: auth.organizationId,
      campaignId: campaign._id,
      candidateId: candidate._id,
      status: 'active',
      contactAvailability: { email: true, phone: true, optedOut: false },
    });

    const requestId = `${String(campaign._id)}-req-quota`;
    const digits = '919876543212';
    const quotaKey = `voice:${requestId}:${digits}`;

    await quotaService.reserveUsage({
      organizationId: auth.organizationId,
      metric: 'ai_voice_minutes',
      quantity: 1,
      idempotencyKey: quotaKey,
      relatedEntityType: 'campaign',
      relatedEntityId: String(campaign._id),
    });

    await VoiceCallModel.create({
      organizationId: auth.organizationId,
      source: 'outreach',
      campaignId: campaign._id,
      enrollmentId: enrollment._id,
      candidateId: candidate._id,
      callId: pendingVoiceCallId(requestId, digits),
      requestId,
      agentId: 'agent-quota',
      contactName: 'Quota Doe',
      toNumber: digits,
      toNumberDigits: digits,
      status: 'pending',
      maxRetries: 2,
      retriesLeft: 2,
      quotaReservationKey: quotaKey,
    });

    const res = await postSignedHunarWebhook(
      agent,
      `/api/integrations/voice/hunar/call-status?campaignId=${String(campaign._id)}`,
      {
        call_id: 'hunar-call-quota-1',
        request_id: requestId,
        agent_id: 'agent-quota',
        to_number: '+919876543212',
        status: 'COMPLETED',
        duration_seconds: 95,
        retries_left: 2,
      }
    );

    expect(res.status).toBe(200);

    const row = await VoiceCallModel.findOne({
      campaignId: campaign._id,
      callId: 'hunar-call-quota-1',
    });
    expect(row).toBeTruthy();
    expect(row!.status).toBe('completed');
    expect(row!.retriesLeft).toBe(0);
    expect(row!.durationMinutes).toBe(2);

    const counter = await QuotaCounterModel.findOne({
      organizationId: auth.organizationId,
      metric: 'ai_voice_minutes',
    });
    expect(counter).toBeTruthy();
    // 95s → 2 billable minutes (1 reserved + 1 extra)
    expect(counter!.used).toBe(2);
    expect(counter!.reserved).toBe(0);

    const reservation = await UsageReservationModel.findOne({
      organizationId: auth.organizationId,
      idempotencyKey: quotaKey,
    });
    expect(reservation?.status).toBe('committed');
  });
});
