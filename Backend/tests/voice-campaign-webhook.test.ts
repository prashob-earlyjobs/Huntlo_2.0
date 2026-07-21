import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../src/app.js';
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
  pendingVoiceCallId,
  VoiceCallModel,
} from '../src/modules/voice/voice-call.model.js';
import { AuditLogModel } from '../src/shared/audit/audit.service.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

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
    resetEnvCache();
    process.env.HUNAR_WEBHOOK_SECRET = 'whsec_test_secret';
    process.env.PUBLIC_API_BASE_URL = 'http://localhost:4000';
    await connectDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
    await stopMemoryMongo();
  });

  beforeEach(async () => {
    clearRateLimits();
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
    ]);
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

    const res = await agent
      .post(
        `/api/integrations/voice/hunar/call-status?campaignId=${String(campaign._id)}`
      )
      .set('x-webhook-secret', 'whsec_test_secret')
      .send({
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
      });

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
});
