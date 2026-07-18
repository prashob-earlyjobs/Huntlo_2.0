import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { clearAnalyticsCache } from '../src/modules/analytics/index.js';
import { OnboardingModel } from '../src/modules/auth/onboarding.model.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { SavedCandidateModel } from '../src/modules/candidates/saved-candidate.model.js';
import { RevealedContactModel } from '../src/modules/candidates/revealed-contact.model.js';
import { JobModel } from '../src/modules/jobs/job.model.js';
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import { OutreachCampaignModel } from '../src/modules/outreach/campaign.model.js';
import { CampaignJobModel } from '../src/modules/outreach/campaign-job.model.js';
import { OutreachEnrollmentModel } from '../src/modules/outreach/enrollment.model.js';
import { InterviewModel } from '../src/modules/scheduling/interview.model.js';
import { AnalyticsReportModel } from '../src/modules/analytics/report.model.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerAndAuth(agent: ReturnType<typeof request.agent>) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `analytics-${Date.now()}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Analytics',
    lastName: 'Tester',
    organizationName: `Analytics Org ${Date.now()}`,
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
    userId: response.body.data.user.id as string,
  };
}

describe('Dashboard + analytics aggregations', () => {
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
    clearAnalyticsCache();
    await Promise.all([
      AnalyticsReportModel.deleteMany({}),
      InterviewModel.deleteMany({}),
      CampaignJobModel.deleteMany({}),
      OutreachEnrollmentModel.deleteMany({}),
      OutreachCampaignModel.deleteMany({}),
      RevealedContactModel.deleteMany({}),
      SavedCandidateModel.deleteMany({}),
      JobModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);
  });

  it('aggregates known fixtures into dashboard summary and pipeline', async () => {
    const auth = await registerAndAuth(agent);
    const orgOid = auth.organizationId;
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const job = await JobModel.create({
      organizationId: orgOid,
      title: 'Backend Engineer',
      status: 'active',
      locations: ['Bengaluru'],
      recruiterIds: [auth.userId],
      createdBy: auth.userId,
      stats: {
        candidatesSourced: 5,
        contacted: 3,
        positiveReplies: 2,
        qualified: 1,
        screened: 1,
        interviews: 1,
        hired: 0,
      },
    });

    const candidates = await SavedCandidateModel.insertMany([
      {
        organizationId: orgOid,
        name: 'A',
        status: 'contacted',
        sourceType: 'sourcing',
        jobIds: [job._id],
        createdAt: hourAgo,
      },
      {
        organizationId: orgOid,
        name: 'B',
        status: 'interested',
        sourceType: 'sourcing',
        jobIds: [job._id],
        createdAt: hourAgo,
      },
      {
        organizationId: orgOid,
        name: 'C',
        status: 'qualified',
        sourceType: 'import',
        jobIds: [job._id],
        createdAt: hourAgo,
      },
      {
        organizationId: orgOid,
        name: 'D',
        status: 'interview_scheduled',
        sourceType: 'manual',
        jobIds: [job._id],
        createdAt: hourAgo,
      },
      {
        organizationId: orgOid,
        name: 'E',
        status: 'hired',
        sourceType: 'referral',
        jobIds: [job._id],
        createdAt: hourAgo,
      },
    ]);

    const campaign = await OutreachCampaignModel.create({
      organizationId: orgOid,
      ownerUserId: auth.userId,
      name: 'Fixture campaign',
      status: 'running',
      sourceModule: 'outreach',
      jobId: job._id,
      channelConfig: {
        email: { enabled: true },
        whatsapp: { enabled: false },
        ai_voice: { enabled: false },
      },
      sequenceSteps: [
        {
          id: 'step-1',
          order: 0,
          type: 'email',
          subject: 'Hello',
          body: 'Hi {{first_name}}',
        },
      ],
      stats: {
        sent: 0,
        delivered: 0,
        replies: 0,
        interested: 0,
        qualified: 0,
        enrolled: 0,
      },
    });

    const enrollmentA = await OutreachEnrollmentModel.create({
      organizationId: orgOid,
      campaignId: campaign._id,
      candidateId: candidates[0]!._id,
      status: 'stopped',
      replyState: {
        hasReply: true,
        disposition: 'interested',
        repliedAt: hourAgo,
      },
      contactAvailability: { email: true, phone: false, optedOut: false },
    });
    const enrollmentB = await OutreachEnrollmentModel.create({
      organizationId: orgOid,
      campaignId: campaign._id,
      candidateId: candidates[1]!._id,
      status: 'replied',
      replyState: {
        hasReply: true,
        disposition: 'neutral',
        repliedAt: hourAgo,
      },
      contactAvailability: { email: true, phone: false, optedOut: false },
    });
    await OutreachEnrollmentModel.create({
      organizationId: orgOid,
      campaignId: campaign._id,
      candidateId: candidates[2]!._id,
      status: 'qualified',
      replyState: {
        hasReply: true,
        disposition: 'interested',
        repliedAt: hourAgo,
      },
      qualificationState: { status: 'qualified', answers: {} },
      contactAvailability: { email: true, phone: false, optedOut: false },
    });

    // 3 succeeded email sends + 1 failed → delivery 75%, reply 3/3 = 100%
    await CampaignJobModel.insertMany([
      {
        organizationId: orgOid,
        campaignId: campaign._id,
        enrollmentId: enrollmentA._id,
        stepId: 'step-1',
        jobType: 'send_email',
        scheduledAt: hourAgo,
        status: 'succeeded',
        result: { delivery: 'sent', type: 'email', channel: 'email' },
        updatedAt: hourAgo,
        createdAt: hourAgo,
      },
      {
        organizationId: orgOid,
        campaignId: campaign._id,
        enrollmentId: enrollmentB._id,
        stepId: 'step-1',
        jobType: 'send_email',
        scheduledAt: hourAgo,
        status: 'succeeded',
        result: { delivery: 'sent', type: 'email', channel: 'email' },
        updatedAt: hourAgo,
        createdAt: hourAgo,
      },
      {
        organizationId: orgOid,
        campaignId: campaign._id,
        enrollmentId: candidates[2]!._id,
        stepId: 'step-1',
        jobType: 'send_email',
        scheduledAt: hourAgo,
        status: 'succeeded',
        result: { delivery: 'sent', type: 'email', channel: 'email' },
        updatedAt: hourAgo,
        createdAt: hourAgo,
      },
      {
        organizationId: orgOid,
        campaignId: campaign._id,
        enrollmentId: candidates[3]!._id,
        stepId: 'step-1',
        jobType: 'send_email',
        scheduledAt: hourAgo,
        status: 'failed',
        error: 'bounce',
        updatedAt: hourAgo,
        createdAt: hourAgo,
      },
    ]);

    // Fix third job to use a real enrollment id (CampaignJob requires enrollmentId ObjectId)
    await CampaignJobModel.deleteMany({
      campaignId: campaign._id,
      enrollmentId: { $in: [candidates[2]!._id, candidates[3]!._id] },
    });
    const enrollmentC = await OutreachEnrollmentModel.findOne({
      campaignId: campaign._id,
      candidateId: candidates[2]!._id,
    });
    const enrollmentD = await OutreachEnrollmentModel.create({
      organizationId: orgOid,
      campaignId: campaign._id,
      candidateId: candidates[3]!._id,
      status: 'failed',
      contactAvailability: { email: true, phone: false, optedOut: false },
    });
    await CampaignJobModel.insertMany([
      {
        organizationId: orgOid,
        campaignId: campaign._id,
        enrollmentId: enrollmentC!._id,
        stepId: 'step-1b',
        jobType: 'send_email',
        scheduledAt: hourAgo,
        status: 'succeeded',
        result: { delivery: 'sent', type: 'email', channel: 'email' },
        updatedAt: hourAgo,
        createdAt: hourAgo,
      },
      {
        organizationId: orgOid,
        campaignId: campaign._id,
        enrollmentId: enrollmentD._id,
        stepId: 'step-1',
        jobType: 'send_email',
        scheduledAt: hourAgo,
        status: 'failed',
        error: 'bounce',
        updatedAt: hourAgo,
        createdAt: hourAgo,
      },
    ]);

    await InterviewModel.create({
      organizationId: orgOid,
      createdBy: auth.userId,
      jobId: job._id,
      interviewType: 'Intro call',
      schedulingMethod: 'manual',
      status: 'scheduled',
      bookingStatus: 'booked',
      startAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 2.5 * 60 * 60 * 1000),
      timezone: 'Asia/Kolkata',
      inviteeName: 'Priya Nair',
    });

    const summary = await agent
      .get('/api/v1/dashboard/summary?preset=30d&timezone=Asia/Kolkata')
      .set('Authorization', `Bearer ${auth.token}`)
      .expect(200);

    expect(summary.body.data.totals.candidatesSourced).toBe(5);
    expect(summary.body.data.totals.activeJobs).toBe(1);
    expect(summary.body.data.totals.positiveReplies).toBe(2);
    expect(summary.body.data.totals.hired).toBe(1);
    expect(summary.body.data.metrics).toHaveLength(4);

    const pipeline = await agent
      .get('/api/v1/dashboard/pipeline')
      .set('Authorization', `Bearer ${auth.token}`)
      .expect(200);
    const stages = pipeline.body.data.stages as Array<{ id: string; count: number }>;
    const byId = Object.fromEntries(stages.map((s) => [s.id, s.count]));
    expect(byId.sourced).toBe(5);
    expect(byId.scheduled).toBeGreaterThanOrEqual(2); // interview_scheduled + hired

    const campaignPerf = await agent
      .get('/api/v1/dashboard/campaign-performance?preset=30d')
      .set('Authorization', `Bearer ${auth.token}`)
      .expect(200);
    const summaryStats = campaignPerf.body.data.summary as Array<{
      id: string;
      value: string;
    }>;
    const byStat = Object.fromEntries(summaryStats.map((s) => [s.id, s.value]));
    expect(byStat.sent).toBe('3');
    expect(byStat.delivery).toBe('75.0%');
    expect(byStat.reply).toBe('100.0%');
    expect(byStat.positive).toBe('66.7%');
    expect(byStat.qualified).toBe('1');
    expect(byStat.active).toBe('1');

    const deliveryRow = (
      campaignPerf.body.data.comparison as Array<{
        metric: string;
        email: number;
      }>
    ).find((r) => r.metric === 'Delivery rate');
    expect(deliveryRow?.email).toBe(75);
    const replyRow = (
      campaignPerf.body.data.comparison as Array<{
        metric: string;
        email: number;
      }>
    ).find((r) => r.metric === 'Reply rate');
    expect(replyRow?.email).toBe(100);

    const overview = await agent
      .get('/api/v1/analytics/overview?preset=30d')
      .set('Authorization', `Bearer ${auth.token}`)
      .expect(200);
    expect(overview.body.data.metrics.candidatesSourced).toBe(5);
    expect(overview.body.data.conversions.length).toBe(3);

    // Org scoping: second org sees zeros
    const other = await registerAndAuth(agent);
    const otherSummary = await agent
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${other.token}`)
      .expect(200);
    expect(otherSummary.body.data.totals.candidatesSourced).toBe(0);
  }, 40_000);

  it('generates a report and streams CSV export with export permission', async () => {
    const auth = await registerAndAuth(agent);

    await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      name: 'Report Candidate',
      status: 'qualified',
      sourceType: 'manual',
    });

    const generated = await agent
      .post('/api/v1/reports/generate')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ type: 'pipeline', name: 'Fixture pipeline report' })
      .expect(201);

    expect(generated.body.data.status).toBe('ready');
    expect(generated.body.data.id).toBeTruthy();

    const listed = await agent
      .get('/api/v1/reports')
      .set('Authorization', `Bearer ${auth.token}`)
      .expect(200);
    expect(listed.body.data.length).toBe(1);

    const exported = await agent
      .get(`/api/v1/reports/${generated.body.data.id}/export`)
      .set('Authorization', `Bearer ${auth.token}`)
      .expect(200);

    expect(String(exported.headers['content-type'])).toContain('text/csv');
    expect(String(exported.text)).toContain('id');
    expect(String(exported.text)).toContain('sourced');
  }, 30_000);
});
