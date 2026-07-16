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
import { OutreachCampaignModel } from '../src/modules/outreach/campaign.model.js';
import { OutreachEnrollmentModel } from '../src/modules/outreach/enrollment.model.js';
import { CampaignJobModel } from '../src/modules/outreach/campaign-job.model.js';
import {
  Huntlo360WorkflowModel,
  Huntlo360CandidateStateModel,
  Huntlo360TransitionModel,
} from '../src/modules/huntlo-360/index.js';
import { ScreeningSessionModel } from '../src/modules/screening/index.js';
import { ScheduleCandidateModel } from '../src/modules/scheduling/index.js';
import { AuditLogModel } from '../src/shared/audit/audit.service.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({
      verify: async () => true,
      close: () => undefined,
    }),
  },
}));

async function registerAndAuth(agent: ReturnType<typeof request.agent>) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `h360-${Date.now()}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'H360',
    lastName: 'Tester',
    organizationName: `H360 Org ${Date.now()}`,
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

async function connectSmtp(agent: ReturnType<typeof request.agent>, token: string) {
  const connect = await agent
    .post('/api/v1/integrations/smtp/connect')
    .set('Authorization', `Bearer ${token}`)
    .send({
      fromEmail: 'recruiter@example.com',
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      security: 'tls',
      username: 'recruiter@example.com',
      password: 'smtp-secret',
      displayName: 'Recruiter',
    });
  expect(connect.status).toBe(200);
}

describe('Huntlo 360 orchestration', () => {
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
      Huntlo360TransitionModel.deleteMany({}),
      Huntlo360CandidateStateModel.deleteMany({}),
      Huntlo360WorkflowModel.deleteMany({}),
      ScreeningSessionModel.deleteMany({}),
      ScheduleCandidateModel.deleteMany({}),
      CampaignJobModel.deleteMany({}),
      OutreachEnrollmentModel.deleteMany({}),
      OutreachCampaignModel.deleteMany({}),
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

  it('creates a workflow that compiles into an outreach campaign', async () => {
    const auth = await registerAndAuth(agent);

    const created = await agent
      .post('/api/v1/huntlo-360/workflows')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Backend full pipeline',
        outreachConfig: {
          emailEnabled: true,
          whatsappEnabled: true,
          openingMessage: 'Hi {{first_name}}, role {{job_title}}',
          followUps: ['Following up {{first_name}}'],
        },
        qualificationConfig: {
          enabled: true,
          questions: [
            { id: 'q1', prompt: 'Notice period?', answerType: 'Number' },
          ],
        },
        screeningConfig: {
          enabled: true,
          questions: ['Tell me about your backend experience'],
          minScore: 70,
          onPass: 'recruiter_review',
        },
        schedulingConfig: {
          enabled: true,
          eventTypeUri: 'https://calendly.com/huntlo/intro',
          autoSendAfterScreening: true,
        },
      });

    expect(created.status).toBe(201);
    expect(created.body.data.status).toBe('Draft');
    expect(created.body.data.campaignId).toBeTruthy();

    const campaign = await OutreachCampaignModel.findById(created.body.data.campaignId);
    expect(campaign!.sourceModule).toBe('huntlo360');
    expect(campaign!.sequenceSteps.some((s) => s.type === 'email')).toBe(true);
    expect(campaign!.sequenceSteps.some((s) => s.type === 'whatsapp')).toBe(true);
    // Screening/scheduling are orchestrated outside the campaign sequence
    expect(campaign!.sequenceSteps.some((s) => s.type === 'ai_voice')).toBe(false);
  });

  it('transitions positive reply → qualification → screening → review → scheduling → completed with idempotency', async () => {
    const auth = await registerAndAuth(agent);
    await connectSmtp(agent, auth.token);

    const candidate = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Priya Nair',
        email: 'priya@example.com',
        phone: '9845012345',
        status: 'saved',
      });
    expect(candidate.status).toBe(201);
    const candidateId = candidate.body.data.id as string;

    const created = await agent
      .post('/api/v1/huntlo-360/workflows')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Pipeline A',
        candidateSource: {
          type: 'manual',
          candidateIds: [candidateId],
        },
        outreachConfig: {
          emailEnabled: true,
          openingMessage: 'Hi {{first_name}} about {{job_title}}',
        },
        qualificationConfig: { enabled: true, questions: [] },
        screeningConfig: {
          enabled: true,
          questions: ['Experience?'],
          minScore: 70,
          onPass: 'recruiter_review',
          onFail: 'recruiter_review',
        },
        schedulingConfig: {
          enabled: true,
          eventTypeUri: 'https://calendly.com/huntlo/intro',
          autoSendAfterQualification: false,
          autoSendAfterScreening: false,
        },
      });
    expect(created.status).toBe(201);
    const workflowId = created.body.data.id as string;

    // Attach sender for launch validation
    await agent
      .patch(`/api/v1/huntlo-360/workflows/${workflowId}`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        outreachConfig: {
          emailEnabled: true,
          openingMessage: 'Hi {{first_name}} about {{job_title}}',
        },
      });

    // Patch campaign channel sender after compile
    const wf = await Huntlo360WorkflowModel.findById(workflowId);
    await OutreachCampaignModel.findByIdAndUpdate(wf!.campaignId, {
      $set: {
        'channelConfig.email.senderEmail': 'recruiter@example.com',
        'channelConfig.email.enabled': true,
      },
    });

    const launched = await agent
      .post(`/api/v1/huntlo-360/workflows/${workflowId}/launch`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(launched.status).toBe(200);
    expect(launched.body.data.status).toBe('Running');

    const states = await Huntlo360CandidateStateModel.find({ workflowId });
    expect(states).toHaveLength(1);
    expect(states[0]!.currentStage).toBe('outreach');

    const key1 = 'idem-positive-1';
    const t1 = await agent
      .post(`/api/v1/huntlo-360/workflows/${workflowId}/transitions`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        candidateId,
        event: 'positive_reply',
        idempotencyKey: key1,
        interestStatus: 'interested',
      });
    expect(t1.status).toBe(200);
    expect(t1.body.data.duplicate).toBe(false);
    expect(t1.body.data.toStage).toBe('qualification');

    const t1Dup = await agent
      .post(`/api/v1/huntlo-360/workflows/${workflowId}/transitions`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        candidateId,
        event: 'positive_reply',
        idempotencyKey: key1,
        interestStatus: 'interested',
      });
    expect(t1Dup.status).toBe(200);
    expect(t1Dup.body.data.duplicate).toBe(true);
    expect(t1Dup.body.data.toStage).toBe('qualification');

    const transitionCount = await Huntlo360TransitionModel.countDocuments({
      workflowId,
      idempotencyKey: key1,
    });
    expect(transitionCount).toBe(1);

    const t2 = await agent
      .post(`/api/v1/huntlo-360/workflows/${workflowId}/transitions`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        candidateId,
        event: 'qualification_pass',
        idempotencyKey: 'idem-qual-pass',
      });
    expect(t2.body.data.toStage).toBe('screening');

    const screening = await ScreeningSessionModel.findOne({ workflowId });
    expect(screening).toBeTruthy();

    const t3 = await agent
      .post(`/api/v1/huntlo-360/workflows/${workflowId}/transitions`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        candidateId,
        event: 'screening_pass',
        idempotencyKey: 'idem-screen-pass',
        screeningScore: 88,
      });
    expect(t3.body.data.toStage).toBe('recruiter_review');

    const t4 = await agent
      .post(`/api/v1/huntlo-360/workflows/${workflowId}/transitions`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        candidateId,
        event: 'recruiter_approve',
        idempotencyKey: 'idem-approve',
        recruiterDecision: 'shortlist',
      });
    expect(t4.body.data.toStage).toBe('scheduling');

    const schedule = await ScheduleCandidateModel.findOne({ workflowId });
    expect(schedule!.status).toBe('link_sent');

    const t5 = await agent
      .post(`/api/v1/huntlo-360/workflows/${workflowId}/transitions`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        candidateId,
        event: 'scheduling_booked',
        idempotencyKey: 'idem-booked',
      });
    expect(t5.body.data.toStage).toBe('completed');

    const finalState = await Huntlo360CandidateStateModel.findOne({
      workflowId,
      candidateId,
    });
    expect(finalState!.currentStage).toBe('completed');
    expect(finalState!.recruiterDecision).toBe('shortlist');

    const stats = await agent
      .get(`/api/v1/huntlo-360/workflows/${workflowId}/stats`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(stats.status).toBe(200);
    expect(stats.body.data.stageStats.completed).toBe(1);
  });

  it('stops on opt-out and supports recruiter stage override', async () => {
    const auth = await registerAndAuth(agent);
    await connectSmtp(agent, auth.token);

    const candidate = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Opt Out',
        email: 'opt@example.com',
        status: 'saved',
      });

    const created = await agent
      .post('/api/v1/huntlo-360/workflows')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Opt out flow',
        candidateSource: { type: 'manual', candidateIds: [candidate.body.data.id] },
        outreachConfig: {
          emailEnabled: true,
          openingMessage: 'Hi {{first_name}}',
        },
        screeningConfig: { enabled: false },
        schedulingConfig: { enabled: false },
      });

    const workflowId = created.body.data.id as string;
    const wf = await Huntlo360WorkflowModel.findById(workflowId);
    await OutreachCampaignModel.findByIdAndUpdate(wf!.campaignId, {
      $set: { 'channelConfig.email.senderEmail': 'recruiter@example.com' },
    });

    await agent
      .post(`/api/v1/huntlo-360/workflows/${workflowId}/launch`)
      .set('Authorization', `Bearer ${auth.token}`);

    const opt = await agent
      .post(`/api/v1/huntlo-360/workflows/${workflowId}/transitions`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        candidateId: candidate.body.data.id,
        event: 'opt_out',
        idempotencyKey: 'idem-opt-out',
      });
    expect(opt.body.data.toStage).toBe('stopped');

    const state = await Huntlo360CandidateStateModel.findOne({ workflowId });
    expect(state!.exceptionCode).toBe('opted_out');
    expect(state!.currentStage).toBe('stopped');

    const enrollment = await OutreachEnrollmentModel.findById(state!.enrollmentId);
    expect(enrollment!.stopReason).toBe('candidate_opted_out');

    // Recruiter override can reopen to review even from stopped
    const override = await agent
      .post(`/api/v1/huntlo-360/workflows/${workflowId}/transitions`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        candidateId: candidate.body.data.id,
        event: 'recruiter_override_stage',
        toStage: 'recruiter_review',
        idempotencyKey: 'idem-override',
        recruiterDecision: 'manual_review',
      });
    expect(override.body.data.toStage).toBe('recruiter_review');

    const exceptions = await agent
      .get(`/api/v1/huntlo-360/workflows/${workflowId}/exceptions`)
      .set('Authorization', `Bearer ${auth.token}`);
    // exception may clear or remain — opted_out still on state until cleared
    expect(exceptions.status).toBe(200);
  });

  it('follows screening failure rules into stop when autoReject is on', async () => {
    const auth = await registerAndAuth(agent);

    const candidate = await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      name: 'Fail Screen',
      email: 'fail@example.com',
      sourceType: 'manual',
      status: 'saved',
    });

    const workflow = await Huntlo360WorkflowModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'Strict screen',
      status: 'running',
      screeningConfig: {
        enabled: true,
        language: 'en',
        voiceTone: null,
        questions: ['Q'],
        evaluationFields: [],
        attempts: 1,
        attemptIntervalHours: 24,
        minScore: 80,
        autoReject: true,
        onPass: 'recruiter_review',
        onFail: 'stop',
      },
      stageStats: {
        enrolled: 1,
        outreach: 0,
        qualification: 0,
        screening: 1,
        recruiter_review: 0,
        scheduling: 0,
        completed: 0,
        stopped: 0,
        exceptions: 0,
      },
    });

    await Huntlo360CandidateStateModel.create({
      organizationId: auth.organizationId,
      workflowId: workflow._id,
      candidateId: candidate._id,
      currentStage: 'screening',
      outreachStatus: 'replied',
      interestStatus: 'interested',
      qualificationStatus: 'qualified',
      screeningStatus: 'scheduled',
    });

    const fail = await agent
      .post(`/api/v1/huntlo-360/workflows/${workflow._id}/transitions`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        candidateId: String(candidate._id),
        event: 'screening_fail',
        idempotencyKey: 'idem-screen-fail',
        screeningScore: 40,
      });
    expect(fail.body.data.toStage).toBe('stopped');
    expect(fail.body.data.candidateState.exceptionCode).toBe('screening_failed');
  });
});
