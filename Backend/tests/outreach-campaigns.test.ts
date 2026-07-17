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
import { JobModel } from '../src/modules/jobs/job.model.js';
import { UserIntegrationModel } from '../src/modules/integrations/user-integration.model.js';
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import { OutreachCampaignModel } from '../src/modules/outreach/campaign.model.js';
import { OutreachEnrollmentModel } from '../src/modules/outreach/enrollment.model.js';
import { CampaignJobModel } from '../src/modules/outreach/campaign-job.model.js';
import { campaignsService } from '../src/modules/outreach/campaigns.service.js';
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
    email: `camp-${Date.now()}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Camp',
    lastName: 'Tester',
    organizationName: `Camp Org ${Date.now()}`,
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
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
  return connect.body.data.integration.id as string;
}

describe('Outreach campaigns', () => {
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
      CampaignJobModel.deleteMany({}),
      OutreachEnrollmentModel.deleteMany({}),
      OutreachCampaignModel.deleteMany({}),
      SavedCandidateModel.deleteMany({}),
      JobModel.deleteMany({}),
      UserIntegrationModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);
  });

  it('creates, lists, updates, and soft-deletes campaigns', async () => {
    const auth = await registerAndAuth(agent);

    const created = await agent
      .post('/api/v1/outreach/campaigns')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Backend Sequence',
        description: 'Intro + follow-up',
        campaignType: 'multi_channel',
        sequenceSteps: [
          {
            type: 'email',
            order: 0,
            delayDays: 0,
            subject: 'Hi {{first_name}}',
            body: 'Role {{job_title}} at {{company_name}}',
            stopOnReply: true,
          },
          { type: 'wait', order: 1, delayDays: 2, note: 'Wait for reply' },
          {
            type: 'whatsapp',
            order: 2,
            delayDays: 0,
            body: 'Quick nudge {{first_name}}',
          },
        ],
        channelConfig: {
          email: { enabled: true },
          whatsapp: { enabled: true },
          timezone: 'Asia/Kolkata',
        },
      });
    expect(created.status).toBe(201);
    expect(created.body.data.status).toBe('draft');
    expect(created.body.data.sequenceSteps).toHaveLength(3);
    expect(created.body.data.channels).toEqual(
      expect.arrayContaining(['email', 'whatsapp'])
    );

    const list = await agent
      .get('/api/v1/outreach/campaigns')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);

    const patched = await agent
      .patch(`/api/v1/outreach/campaigns/${created.body.data.id}`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ name: 'Backend Sequence v2' });
    expect(patched.status).toBe(200);
    expect(patched.body.data.name).toBe('Backend Sequence v2');
    expect(patched.body.data.version).toBe(2);

    const removed = await agent
      .delete(`/api/v1/outreach/campaigns/${created.body.data.id}`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(removed.status).toBe(200);

    const after = await agent
      .get('/api/v1/outreach/campaigns')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(after.body.data).toHaveLength(0);
  });

  it('enforces single-channel vs multi-channel consistency', async () => {
    const auth = await registerAndAuth(agent);

    const rejected = await agent
      .post('/api/v1/outreach/campaigns')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Broken Single',
        campaignType: 'single_channel',
        sequenceSteps: [
          {
            type: 'email',
            order: 0,
            subject: 'Hi',
            body: 'Hello',
          },
          {
            type: 'whatsapp',
            order: 1,
            body: 'Nudge',
          },
        ],
        channelConfig: {
          email: { enabled: true },
          whatsapp: { enabled: true },
          timezone: 'Asia/Kolkata',
        },
      });
    expect(rejected.status).toBe(400);
    expect(rejected.body.error?.code).toBe('VALIDATION_ERROR');

    const ok = await agent
      .post('/api/v1/outreach/campaigns')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Email Only',
        campaignType: 'single_channel',
        sequenceSteps: [
          {
            type: 'email',
            order: 0,
            subject: 'Hi',
            body: 'Hello',
          },
          { type: 'wait', order: 1, delayDays: 2 },
          {
            type: 'email',
            order: 2,
            subject: 'Follow up',
            body: 'Still interested?',
          },
        ],
        channelConfig: {
          email: { enabled: true },
          whatsapp: { enabled: false },
          ai_voice: { enabled: false },
          timezone: 'Asia/Kolkata',
        },
      });
    expect(ok.status).toBe(201);
    expect(ok.body.data.campaignType).toBe('single_channel');
    expect(ok.body.data.channels).toEqual(['email']);
  });

  it('returns org-wide outreach overview metrics', async () => {
    const auth = await registerAndAuth(agent);

    const created = await agent
      .post('/api/v1/outreach/campaigns')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Metrics Campaign',
        sequenceSteps: [
          {
            type: 'email',
            order: 0,
            subject: 'Hi',
            body: 'Hello',
          },
        ],
        channelConfig: { email: { enabled: true } },
      });
    expect(created.status).toBe(201);
    const campaignId = created.body.data.id as string;

    await OutreachCampaignModel.findByIdAndUpdate(campaignId, {
      status: 'running',
    });

    const candidate = await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'Metrics Cand',
      email: 'metrics@example.com',
      source: 'manual',
      status: 'saved',
    });

    await OutreachEnrollmentModel.create({
      organizationId: auth.organizationId,
      campaignId,
      candidateId: candidate._id,
      status: 'stopped',
      replyState: {
        hasReply: true,
        disposition: 'interested',
        repliedAt: new Date(),
      },
      qualificationState: { status: 'qualified', answers: {} },
      contactAvailability: { email: true, phone: false, optedOut: false },
    });

    // 40 succeeded sends → messagesSent / replyRate denominator
    await CampaignJobModel.insertMany(
      Array.from({ length: 40 }, (_, i) => ({
        organizationId: auth.organizationId,
        campaignId,
        enrollmentId: candidate._id,
        stepId: 'step-0',
        jobType: 'send_email',
        scheduledAt: new Date(),
        status: 'succeeded',
        attempts: 1,
        result: { delivery: 'sent', stepId: `s-${i}` },
      }))
    );

    // Second enrollment: replied but not interested
    const candidate2 = await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'Metrics Cand 2',
      email: 'metrics2@example.com',
      source: 'manual',
      status: 'saved',
    });
    await OutreachEnrollmentModel.create({
      organizationId: auth.organizationId,
      campaignId,
      candidateId: candidate2._id,
      status: 'stopped',
      replyState: {
        hasReply: true,
        disposition: 'maybe',
        repliedAt: new Date(),
      },
      qualificationState: { status: 'pending', answers: {} },
      contactAvailability: { email: true, phone: false, optedOut: false },
    });

    // Pad to 12 replies / 4 interested / 2 qualified for rate checks
    for (let i = 0; i < 10; i += 1) {
      const c = await SavedCandidateModel.create({
        organizationId: auth.organizationId,
        ownerUserId: auth.userId,
        name: `Pad ${i}`,
        email: `pad${i}@example.com`,
        source: 'manual',
        status: 'saved',
      });
      await OutreachEnrollmentModel.create({
        organizationId: auth.organizationId,
        campaignId,
        candidateId: c._id,
        status: 'stopped',
        replyState: {
          hasReply: true,
          disposition: i < 3 ? 'interested' : 'not_interested',
          repliedAt: new Date(),
        },
        qualificationState: {
          status: i === 0 ? 'qualified' : 'pending',
          answers: {},
        },
        contactAvailability: { email: true, phone: false, optedOut: false },
      });
    }

    const overview = await agent
      .get('/api/v1/outreach/campaigns/overview')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(overview.status).toBe(200);
    expect(overview.body.data.activeCampaigns).toBe(1);
    expect(overview.body.data.messagesSent).toBe(40);
    expect(overview.body.data.replies).toBe(12);
    expect(overview.body.data.interested).toBe(4);
    expect(overview.body.data.qualified).toBe(2);
    expect(overview.body.data.replyRate).toBe(30);
    expect(overview.body.data.positiveReplyRate).toBe(33.3);
  });

  it('validates launch blockers and launches after audience + provider are ready', async () => {
    const auth = await registerAndAuth(agent);
    await connectSmtp(agent, auth.token);

    const job = await agent
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ title: 'Senior Backend Engineer', department: 'Engineering' });
    expect(job.status).toBe(201);

    const candidate = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '9876543210',
        status: 'saved',
      });
    expect(candidate.status).toBe(201);

    const optedOut = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Opt Out Candidate',
        email: 'opt@example.com',
        tags: ['opted_out'],
        status: 'saved',
      });
    expect(optedOut.status).toBe(201);

    const created = await agent
      .post('/api/v1/outreach/campaigns')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Launch me',
        jobId: job.body.data.id,
        sequenceSteps: [
          {
            type: 'email',
            order: 0,
            subject: 'Hello {{first_name}}',
            body: 'Join us for {{job_title}}',
          },
        ],
        channelConfig: {
          email: { enabled: true, senderEmail: 'recruiter@example.com' },
          timezone: 'Asia/Kolkata',
          sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
        },
      });
    expect(created.status).toBe(201);
    const id = created.body.data.id as string;

    const emptyValidate = await agent
      .post(`/api/v1/outreach/campaigns/${id}/validate`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(emptyValidate.status).toBe(200);
    expect(emptyValidate.body.data.ok).toBe(false);
    expect(emptyValidate.body.data.issues.some((i: { code: string }) => i.code === 'AUDIENCE_EMPTY')).toBe(
      true
    );

    const audience = await agent
      .post(`/api/v1/outreach/campaigns/${id}/audience`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        candidateIds: [candidate.body.data.id, optedOut.body.data.id],
      });
    expect(audience.status).toBe(200);
    expect(audience.body.data.added).toBe(2);

    const preview = await agent
      .get(`/api/v1/outreach/campaigns/${id}/audience-preview`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(preview.status).toBe(200);
    expect(preview.body.data.optedOut).toBe(1);

    const validate = await agent
      .post(`/api/v1/outreach/campaigns/${id}/validate`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(validate.status).toBe(200);
    expect(validate.body.data.ok).toBe(true);

    const launch = await agent
      .post(`/api/v1/outreach/campaigns/${id}/launch`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(launch.status).toBe(200);
    expect(launch.body.data.status).toBe('running');

    const jobs = await CampaignJobModel.countDocuments({
      campaignId: id,
      status: { $in: ['queued', 'queued_v2'] },
    });
    expect(jobs).toBeGreaterThan(0);

    const enrollments = await agent
      .get(`/api/v1/outreach/campaigns/${id}/enrollments`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(enrollments.status).toBe(200);
    expect(enrollments.body.data.length).toBe(2);

    const pause = await agent
      .post(`/api/v1/outreach/campaigns/${id}/pause`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(pause.status).toBe(200);
    expect(pause.body.data.status).toBe('paused');

    const resume = await agent
      .post(`/api/v1/outreach/campaigns/${id}/resume`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(resume.status).toBe(200);
    expect(resume.body.data.status).toBe('running');
  });

  it('rejects invalid variables and stops enrollment messaging', async () => {
    const auth = await registerAndAuth(agent);

    const bad = await agent
      .post('/api/v1/outreach/campaigns')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Bad vars',
        sequenceSteps: [
          {
            type: 'email',
            order: 0,
            body: 'See {{calendly_link}}',
          },
        ],
      });
    // Create succeeds — validation catches variables at launch time
    expect(bad.status).toBe(201);

    const candidate = await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      name: 'Test User',
      email: 'test@example.com',
      sourceType: 'manual',
      status: 'saved',
    });

    await agent
      .post(`/api/v1/outreach/campaigns/${bad.body.data.id}/audience`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ candidateIds: [String(candidate._id)] });

    const validate = await agent
      .post(`/api/v1/outreach/campaigns/${bad.body.data.id}/validate`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(validate.body.data.ok).toBe(false);
    expect(
      validate.body.data.issues.some((i: { code: string }) => i.code === 'INVALID_VARIABLES')
    ).toBe(true);

    // Direct stopEnrollment rule
    const campaign = await OutreachCampaignModel.findById(bad.body.data.id);
    const enrollment = await OutreachEnrollmentModel.findOne({ campaignId: campaign!._id });
    expect(enrollment).toBeTruthy();
    enrollment!.status = 'active';
    await enrollment!.save();

    await CampaignJobModel.create({
      organizationId: auth.organizationId,
      campaignId: campaign!._id,
      enrollmentId: enrollment!._id,
      stepId: 'step-1',
      jobType: 'send_email',
      scheduledAt: new Date(),
      status: 'queued',
      attempts: 0,
    });

    await campaignsService.stopEnrollment(String(enrollment!._id), 'candidate_replied');
    const stopped = await OutreachEnrollmentModel.findById(enrollment!._id);
    expect(stopped!.status).toBe('stopped');
    expect(stopped!.stopReason).toBe('candidate_replied');

    const cancelledJobs = await CampaignJobModel.countDocuments({
      enrollmentId: enrollment!._id,
      status: 'cancelled',
    });
    expect(cancelledJobs).toBe(1);
  });

  it('duplicates a campaign as draft and schedules launch', async () => {
    const auth = await registerAndAuth(agent);
    await connectSmtp(agent, auth.token);

    const candidate = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Grace Hopper',
        email: 'grace@example.com',
        status: 'saved',
      });

    const created = await agent
      .post('/api/v1/outreach/campaigns')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Original',
        sequenceSteps: [
          {
            type: 'email',
            order: 0,
            subject: 'Hi {{first_name}}',
            body: 'Hello from {{recruiter_name}}',
          },
        ],
        channelConfig: {
          email: { enabled: true, senderEmail: 'recruiter@example.com' },
          timezone: 'Asia/Kolkata',
        },
      });

    await agent
      .post(`/api/v1/outreach/campaigns/${created.body.data.id}/audience`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ candidateIds: [candidate.body.data.id] });

    const dup = await agent
      .post(`/api/v1/outreach/campaigns/${created.body.data.id}/duplicate`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(dup.status).toBe(201);
    expect(dup.body.data.status).toBe('draft');
    expect(dup.body.data.name.toLowerCase()).toContain('copy');

    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const scheduled = await agent
      .post(`/api/v1/outreach/campaigns/${created.body.data.id}/schedule`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ scheduledAt });
    expect(scheduled.status).toBe(200);
    expect(scheduled.body.data.status).toBe('scheduled');

    const cancel = await agent
      .post(`/api/v1/outreach/campaigns/${created.body.data.id}/cancel`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(cancel.status).toBe(200);
    expect(cancel.body.data.status).toBe('cancelled');
  });
});
