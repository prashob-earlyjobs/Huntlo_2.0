import { createHmac } from 'node:crypto';
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
  InterviewModel,
  AvailabilityRuleModel,
  ReminderLogModel,
  CalendlyWebhookEventModel,
  getTimezoneOffsetMinutes,
  zonedLocalToUtc,
  dateKeyInTimezone,
  normalizeTimezone,
} from '../src/modules/scheduling/index.js';
import { AuditLogModel } from '../src/shared/audit/audit.service.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerAndAuth(agent: ReturnType<typeof request.agent>) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `sched-${Date.now()}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Sched',
    lastName: 'Tester',
    organizationName: `Sched Org ${Date.now()}`,
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

describe('timezone helpers (DST)', () => {
  it('normalizes FE timezone labels to IANA', () => {
    expect(normalizeTimezone('Asia/Kolkata (IST)')).toBe('Asia/Kolkata');
    expect(normalizeTimezone("Candidate's local timezone")).toBe('Asia/Kolkata');
  });

  it('converts America/New_York winter (EST) wall time to UTC', () => {
    // 2024-01-15 10:00 EST = 15:00 UTC (UTC-5)
    const utc = zonedLocalToUtc(2024, 1, 15, 10, 0, 'America/New_York');
    expect(utc.toISOString()).toBe('2024-01-15T15:00:00.000Z');
    expect(getTimezoneOffsetMinutes(utc, 'America/New_York')).toBe(-300);
  });

  it('converts America/New_York summer (EDT) wall time to UTC', () => {
    // 2024-07-15 10:00 EDT = 14:00 UTC (UTC-4)
    const utc = zonedLocalToUtc(2024, 7, 15, 10, 0, 'America/New_York');
    expect(utc.toISOString()).toBe('2024-07-15T14:00:00.000Z');
    expect(getTimezoneOffsetMinutes(utc, 'America/New_York')).toBe(-240);
  });

  it('keeps Asia/Kolkata date keys stable across UTC day boundaries', () => {
    // 2024-06-15 20:30 UTC = 2024-06-16 02:00 IST
    const date = new Date('2024-06-15T20:30:00.000Z');
    expect(dateKeyInTimezone(date, 'Asia/Kolkata')).toBe('2024-06-16');
  });
});

describe('Interview scheduling', () => {
  const app = createApp();
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    process.env.CALENDLY_WEBHOOK_SIGNING_KEY = 'whsec_calendly_test';
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
      ReminderLogModel.deleteMany({}),
      CalendlyWebhookEventModel.deleteMany({}),
      InterviewModel.deleteMany({}),
      AvailabilityRuleModel.deleteMany({}),
      SavedCandidateModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);
  });

  it(
    'creates a manual interview, reschedules, reminds, and completes',
    async () => {
    const auth = await registerAndAuth(agent);
    const candidate = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Priya Nair',
        email: 'priya@example.com',
        phone: '9876512345',
        status: 'saved',
      });
    const candidateId = candidate.body.data.id as string;

    const startAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const created = await agent
      .post('/api/v1/interviews')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        candidateId,
        interviewType: 'Technical screen',
        schedulingMethod: 'manual',
        startAt,
        timezone: 'Asia/Kolkata',
        location: 'Zoom',
        meetingUrl: 'https://zoom.us/j/123',
      });
    expect(created.status).toBe(201);
    expect(created.body.data.status).toBe('Scheduled');
    const interviewId = created.body.data.id as string;

    const newStart = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    const rescheduled = await agent
      .post(`/api/v1/interviews/${interviewId}/reschedule`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ startAt: newStart, timezone: 'Asia/Kolkata' });
    expect(rescheduled.status).toBe(200);
    expect(rescheduled.body.data.status).toBe('Rescheduled');

    const reminded = await agent
      .post(`/api/v1/interviews/${interviewId}/remind`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({});
    expect(reminded.status).toBe(200);

    const completed = await agent
      .post(`/api/v1/interviews/${interviewId}/complete`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({});
    expect(completed.status).toBe(200);
    expect(completed.body.data.status).toBe('Completed');
  },
  20_000
  );

  it('saves availability and returns calendar window', async () => {
    const auth = await registerAndAuth(agent);
    const put = await agent
      .put('/api/v1/availability')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        timezone: 'America/New_York',
        bufferBefore: 10,
        dailyLimit: 4,
      });
    expect(put.status).toBe(200);
    expect(put.body.data.timezone).toBe('America/New_York');
    expect(put.body.data.dailyLimit).toBe(4);

    const get = await agent
      .get('/api/v1/availability')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(get.status).toBe(200);
    expect(get.body.data.bufferBefore).toBe(10);

    const calendar = await agent
      .get('/api/v1/interviews/calendar')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(calendar.status).toBe(200);
    expect(Array.isArray(calendar.body.data.items)).toBe(true);
  });

  it('verifies Calendly webhook signature and books from invitee payload fields', async () => {
    const auth = await registerAndAuth(agent);
    const candidate = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Kabir Malhotra',
        email: 'kabir@example.com',
        status: 'saved',
      });
    const candidateId = candidate.body.data.id as string;

    const interview = await agent
      .post('/api/v1/interviews')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        candidateId,
        schedulingMethod: 'calendly_link',
        providerEventTypeId: 'https://api.calendly.com/event_types/ET123',
        schedulingUrl: 'https://calendly.com/huntlo/intro',
        inviteeEmail: 'kabir@example.com',
        inviteChannel: 'email',
        sendLink: true,
      });
    expect(interview.status).toBe(201);
    expect(interview.body.data.status).toMatch(/Link Sent|Awaiting Booking/);

    const body = {
      payload: {
        scheduled_event: {
          uri: 'https://api.calendly.com/scheduled_events/SE1',
          status: 'active',
          event_type: 'https://api.calendly.com/event_types/ET123',
          name: 'Intro call',
          start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 24.5 * 60 * 60 * 1000).toISOString(),
          location: { join_url: 'https://meet.google.com/abc-defg-hij' },
        },
        invitee: {
          uri: 'https://api.calendly.com/scheduled_events/SE1/invitees/INV1',
          email: 'kabir@example.com',
          name: 'Kabir Malhotra',
          status: 'active',
          timezone: 'Asia/Kolkata',
          reschedule_url: 'https://calendly.com/reschedules/x',
          cancel_url: 'https://calendly.com/cancellations/x',
        },
      },
    };
    const raw = JSON.stringify(body);
    const timestamp = String(Math.floor(Date.now() / 1000));
    const digest = createHmac('sha256', 'whsec_calendly_test')
      .update(`${timestamp}.${raw}`)
      .digest('hex');

    const webhook = await agent
      .post('/api/v1/webhooks/calendly')
      .set('Content-Type', 'application/json')
      .set('calendly-webhook-signature', `t=${timestamp},v1=${digest}`)
      .send(body);
    expect(webhook.status).toBe(200);
    expect(webhook.body.received).toBe(true);

    const list = await agent
      .get('/api/v1/interviews')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(list.status).toBe(200);
    const booked = list.body.data.find(
      (row: { candidateId: string }) => row.candidateId === candidateId
    );
    expect(booked?.status).toBe('Scheduled');
    expect(booked?.meetingUrl).toContain('meet.google.com');

    // Bad signature rejected when key is set
    const bad = await agent
      .post('/api/v1/webhooks/calendly')
      .set('Content-Type', 'application/json')
      .set('calendly-webhook-signature', `t=${timestamp},v1=deadbeef`)
      .send(body);
    expect(bad.status).toBe(401);
  });
});
