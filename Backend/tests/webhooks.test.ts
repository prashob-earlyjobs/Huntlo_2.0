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
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import {
  processWebhookEvent,
  WebhookEventModel,
} from '../src/modules/webhooks/index.js';
import { BackgroundJobModel } from '../src/workers/job.model.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerAndAuth(
  agent: ReturnType<typeof request.agent>,
  opts?: { platformAdmin?: boolean }
) {
  const email = `wh-${Date.now()}@huntlo.ai`;
  const response = await agent.post('/api/v1/auth/register').send({
    email,
    password: 'Password123!',
    firstName: 'Webhook',
    lastName: 'Admin',
    organizationName: `Webhook Org ${Date.now()}`,
  });
  expect(response.status).toBe(201);
  const userId = response.body.data.user.id as string;
  if (opts?.platformAdmin) {
    await UserModel.updateOne({ _id: userId }, { $set: { platformAdmin: true } });
    const login = await agent.post('/api/v1/auth/login').send({
      email,
      password: 'Password123!',
    });
    expect(login.status).toBe(200);
    return {
      token: login.body.data.accessToken as string,
      organizationId: login.body.data.organization.id as string,
    };
  }
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
  };
}

describe('Centralized webhook layer', () => {
  const app = createApp();
  let agent: ReturnType<typeof request.agent>;
  const razorpaySecret = 'test_razorpay_webhook_secret_32c!!';

  beforeAll(async () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
    process.env.RAZORPAY_KEY_SECRET = razorpaySecret;
    process.env.RAZORPAY_WEBHOOK_SECRET = razorpaySecret;
    process.env.META_APP_SECRET = 'meta_app_secret_for_tests_32chars!';
    process.env.GUPSHUP_WEBHOOK_SECRET = 'gupshup_webhook_secret_32chars!!';
    process.env.CALENDLY_WEBHOOK_SIGNING_KEY = 'whsec_calendly_central';
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
      WebhookEventModel.deleteMany({}),
      BackgroundJobModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);
  });

  function signRazorpay(raw: string) {
    return createHmac('sha256', razorpaySecret).update(raw).digest('hex');
  }

  function signMeta(raw: string) {
    return (
      'sha256=' +
      createHmac('sha256', process.env.META_APP_SECRET!).update(raw).digest('hex')
    );
  }

  it(
    'accepts a valid Razorpay signature and stores the event',
    async () => {
    const fixture = {
      id: 'evt_valid_1',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_x',
            order_id: 'order_missing',
            amount: 100,
            currency: 'INR',
          },
        },
      },
    };
    const raw = JSON.stringify(fixture);
    const res = await agent
      .post('/api/v1/webhooks/razorpay')
      .set('Content-Type', 'application/json')
      .set('X-Razorpay-Signature', signRazorpay(raw))
      .send(raw);

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);

    const stored = await WebhookEventModel.findOne({ providerEventId: 'evt_valid_1' });
    expect(stored).toBeTruthy();
    expect(stored!.signatureValid).toBe(true);
    expect(['processed', 'ignored', 'queued', 'failed']).toContain(
      stored!.processingStatus
    );
    },
    20_000
  );

  it('rejects an invalid signature', async () => {
    const raw = JSON.stringify({ id: 'evt_bad', event: 'payment.captured', payload: {} });
    const res = await agent
      .post('/api/v1/webhooks/razorpay')
      .set('Content-Type', 'application/json')
      .set('X-Razorpay-Signature', 'not-a-valid-signature')
      .send(raw);
    expect(res.status).toBe(401);
    expect(await WebhookEventModel.countDocuments({})).toBe(0);
  });

  it('deduplicates by provider event id (provider retry)', async () => {
    const fixture = {
      id: 'evt_dup_1',
      event: 'refund.created',
      payload: { refund: { entity: { id: 'rfnd_1', payment_id: 'pay_missing' } } },
    };
    const raw = JSON.stringify(fixture);
    const sig = signRazorpay(raw);

    const first = await agent
      .post('/api/v1/webhooks/razorpay')
      .set('Content-Type', 'application/json')
      .set('X-Razorpay-Signature', sig)
      .send(raw);
    expect(first.status).toBe(200);
    expect(first.body.duplicate).toBeFalsy();

    const second = await agent
      .post('/api/v1/webhooks/razorpay')
      .set('Content-Type', 'application/json')
      .set('X-Razorpay-Signature', sig)
      .send(raw);
    expect(second.status).toBe(200);
    expect(second.body.duplicate).toBe(true);
    expect(await WebhookEventModel.countDocuments({ provider: 'razorpay' })).toBe(1);
  });

  it('handles out-of-order webhooks by distinct event ids safely', async () => {
    const older = {
      id: 'evt_order_old',
      event: 'payment.authorized',
      payload: {
        payment: { entity: { id: 'pay_1', order_id: 'missing_a', amount: 1, currency: 'INR' } },
      },
      created_at: 1,
    };
    const newer = {
      id: 'evt_order_new',
      event: 'payment.captured',
      payload: {
        payment: { entity: { id: 'pay_1', order_id: 'missing_a', amount: 1, currency: 'INR' } },
      },
      created_at: 2,
    };

    // Deliver newer first, then older
    for (const fixture of [newer, older]) {
      const raw = JSON.stringify(fixture);
      const res = await agent
        .post('/api/v1/webhooks/razorpay')
        .set('Content-Type', 'application/json')
        .set('X-Razorpay-Signature', signRazorpay(raw))
        .send(raw);
      expect(res.status).toBe(200);
    }

    expect(await WebhookEventModel.countDocuments({})).toBe(2);
    const ids = await WebhookEventModel.find({}).distinct('providerEventId');
    expect(ids.sort()).toEqual(['evt_order_new', 'evt_order_old']);
  });

  it('marks unknown entities without throwing (ignored/failed visibility)', async () => {
    const fixture = {
      id: 'evt_unknown_order',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_orphan',
            order_id: 'order_does_not_exist',
            amount: 999,
            currency: 'INR',
          },
        },
      },
    };
    const raw = JSON.stringify(fixture);
    const res = await agent
      .post('/api/v1/webhooks/razorpay')
      .set('Content-Type', 'application/json')
      .set('X-Razorpay-Signature', signRazorpay(raw))
      .send(raw);
    expect(res.status).toBe(200);

    const stored = await WebhookEventModel.findOne({
      providerEventId: 'evt_unknown_order',
    });
    expect(stored).toBeTruthy();
    // Unknown order is treated as processed with no-op / ignored path
    expect(['processed', 'ignored']).toContain(stored!.processingStatus);
  });

  it('supports admin visibility and safe retry after temporary failure', async () => {
    const auth = await registerAndAuth(agent, { platformAdmin: true });

    const event = await WebhookEventModel.create({
      provider: 'razorpay',
      providerEventId: 'evt_fail_retry',
      eventType: 'payment.captured',
      payloadHash: 'abc',
      signatureValid: true,
      processingStatus: 'failed',
      attempts: 1,
      error: 'temporary failure',
      payload: {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_retry',
              order_id: 'missing',
              amount: 1,
              currency: 'INR',
            },
          },
        },
      },
      headers: {},
    });

    const listed = await agent
      .get('/api/v1/admin/webhooks?status=failed')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(listed.status).toBe(200);
    expect(listed.body.data.items.length).toBeGreaterThanOrEqual(1);

    const retried = await agent
      .post(`/api/v1/admin/webhooks/${event._id.toHexString()}/retry`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(retried.status).toBe(200);

    const after = await WebhookEventModel.findById(event._id);
    expect(['processed', 'ignored']).toContain(after!.processingStatus);
    expect(after!.error).toBeNull();
  });

  it('rejects oversized payloads', async () => {
    const huge = JSON.stringify({ id: 'big', event: 'x', blob: 'a'.repeat(1_100_000) });
    const res = await agent
      .post('/api/v1/webhooks/razorpay')
      .set('Content-Type', 'application/json')
      .set('X-Razorpay-Signature', signRazorpay(huge))
      .send(huge);
    expect([413, 400]).toContain(res.status);
  });

  it('verifies Meta signature when META_APP_SECRET is configured', async () => {
    const fixture = {
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              field: 'messages',
              value: { messages: [{ id: 'wamid.TEST1', from: '911', type: 'text', text: { body: 'hi' } }] },
            },
          ],
        },
      ],
    };
    const raw = JSON.stringify(fixture);

    const bad = await agent
      .post('/api/v1/webhooks/meta')
      .set('Content-Type', 'application/json')
      .set('X-Hub-Signature-256', 'sha256=deadbeef')
      .send(raw);
    expect(bad.status).toBe(401);

    const good = await agent
      .post('/api/v1/webhooks/meta')
      .set('Content-Type', 'application/json')
      .set('X-Hub-Signature-256', signMeta(raw))
      .send(raw);
    expect(good.status).toBe(200);
    expect(good.body.received).toBe(true);
  });

  it('does not expose webhook internals to normal recruiter users', async () => {
    // Register creates an owner — demote member role for this check
    const auth = await registerAndAuth(agent);
    await OrganizationMemberModel.updateOne(
      { organizationId: auth.organizationId },
      { $set: { role: 'recruiter' } }
    );

    const res = await agent
      .get('/api/v1/admin/webhooks')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(res.status).toBe(403);
  });

  it('reprocesses failed events without double-applying when already processed', async () => {
    const event = await WebhookEventModel.create({
      provider: 'razorpay',
      providerEventId: 'evt_once',
      eventType: 'payment.failed',
      payloadHash: 'hash-once',
      signatureValid: true,
      processingStatus: 'queued',
      payload: {
        event: 'payment.failed',
        payload: { payment: { entity: { order_id: 'missing' } } },
      },
      headers: {},
    });

    const first = await processWebhookEvent(event._id.toHexString());
    const second = await processWebhookEvent(event._id.toHexString());
    expect(first.status).toMatch(/processed|ignored/);
    expect(second.result).toMatchObject({ skipped: true });
  });
});
