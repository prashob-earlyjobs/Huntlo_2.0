import { createHmac } from 'node:crypto';

import request from 'supertest';
import { Webhook } from 'standardwebhooks';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { OnboardingModel } from '../src/modules/auth/onboarding.model.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import {
  BillingInvoiceModel,
  BillingWebhookEventModel,
  PaymentOrderModel,
  PlanHistoryModel,
} from '../src/modules/billing/index.js';
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import { PricingPlanModel } from '../src/modules/plans/pricing-plan.model.js';
import { WorkspaceSubscriptionModel } from '../src/modules/plans/subscription.model.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerAndAuth(
  agent: ReturnType<typeof request.agent>,
  suffix = ''
) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `billing-${Date.now()}${suffix}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Billing',
    lastName: 'Tester',
    organizationName: `Billing Org ${Date.now()}${suffix}`,
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
    userId: response.body.data.user.id as string,
  };
}

describe('Billing checkout + webhooks', () => {
  const app = createApp();
  let agent: ReturnType<typeof request.agent>;

  const razorpaySecret = 'test_razorpay_secret_key_32chars!!';
  const dodoWebhookSecret =
    'whsec_' + Buffer.from('dodo_test_secret_key_32bytes_xx').toString('base64');

  beforeAll(async () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
    process.env.RAZORPAY_KEY_SECRET = razorpaySecret;
    process.env.RAZORPAY_WEBHOOK_SECRET = razorpaySecret;
    process.env.DODO_PAYMENTS_WEBHOOK_KEY = dodoWebhookSecret;
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
      BillingWebhookEventModel.deleteMany({}),
      BillingInvoiceModel.deleteMany({}),
      PlanHistoryModel.deleteMany({}),
      PaymentOrderModel.deleteMany({}),
      WorkspaceSubscriptionModel.deleteMany({}),
      PricingPlanModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);
  });

  it('activates subscription from signed Razorpay payment.captured webhook fixture', async () => {
    const auth = await registerAndAuth(agent, '-rz');
    await agent
      .get('/api/v1/plans')
      .set('Authorization', `Bearer ${auth.token}`)
      .expect(200);
    const plan = await PricingPlanModel.findOne({ code: 'growth' });
    expect(plan).toBeTruthy();

    const order = await PaymentOrderModel.create({
      organizationId: auth.organizationId,
      userId: auth.userId,
      planId: plan!._id,
      billingCycle: 'monthly',
      provider: 'razorpay',
      providerOrderId: 'order_test_webhook_1',
      currency: 'INR',
      amount: 2_499_900,
      status: 'created',
      idempotencyKey: 'idem_rz_webhook_1',
      metadata: { planCode: 'growth', planName: 'Growth' },
    });

    const fixture = {
      event: 'payment.captured',
      id: 'evt_razorpay_fixture_1',
      payload: {
        payment: {
          entity: {
            id: 'pay_test_webhook_1',
            order_id: 'order_test_webhook_1',
            amount: 2_499_900,
            currency: 'INR',
            status: 'captured',
          },
        },
      },
    };
    const raw = JSON.stringify(fixture);
    const signature = createHmac('sha256', razorpaySecret).update(raw).digest('hex');

    const res = await agent
      .post('/api/v1/webhooks/razorpay')
      .set('Content-Type', 'application/json')
      .set('X-Razorpay-Signature', signature)
      .send(raw);

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);

    const updated = await PaymentOrderModel.findById(order._id);
    expect(updated?.status).toBe('paid');
    expect(updated?.providerPaymentId).toBe('pay_test_webhook_1');

    const sub = await WorkspaceSubscriptionModel.findOne({
      organizationId: auth.organizationId,
      status: 'active',
    });
    expect(sub?.planId.toHexString()).toBe(plan!._id.toHexString());
    expect(sub?.billingProvider).toBe('razorpay');

    const history = await PlanHistoryModel.findOne({
      organizationId: auth.organizationId,
      paymentOrderId: order._id,
    });
    expect(history?.planCodeAfter).toBe('growth');

    const invoice = await BillingInvoiceModel.findOne({ paymentOrderId: order._id });
    expect(invoice?.status).toBe('paid');
    expect(invoice?.amount).toBe(2_499_900);

    // Duplicate event is idempotent
    const replay = await agent
      .post('/api/v1/webhooks/razorpay')
      .set('Content-Type', 'application/json')
      .set('X-Razorpay-Signature', signature)
      .send(raw);
    expect(replay.status).toBe(200);
    expect(replay.body.duplicate).toBe(true);
  }, 30_000);
  it('rejects Razorpay webhook with invalid signature', async () => {
    const fixture = { event: 'payment.captured', payload: {} };
    const raw = JSON.stringify(fixture);
    const res = await agent
      .post('/api/v1/webhooks/razorpay')
      .set('Content-Type', 'application/json')
      .set('X-Razorpay-Signature', 'deadbeef')
      .send(raw);
    expect(res.status).toBe(401);
  });

  it('activates subscription from signed Dodo payment.succeeded webhook fixture', async () => {
    const auth = await registerAndAuth(agent, '-dodo');
    await agent
      .get('/api/v1/plans')
      .set('Authorization', `Bearer ${auth.token}`)
      .expect(200);
    const plan = await PricingPlanModel.findOne({ code: 'growth' });
    expect(plan).toBeTruthy();

    const order = await PaymentOrderModel.create({
      organizationId: auth.organizationId,
      userId: auth.userId,
      planId: plan!._id,
      billingCycle: 'monthly',
      provider: 'dodo',
      providerOrderId: 'cks_test_session_1',
      currency: 'USD',
      amount: 24_900,
      status: 'pending',
      checkoutUrl: 'https://test.dodopayments.com/checkout/demo',
      idempotencyKey: 'idem_dodo_webhook_1',
      metadata: { planCode: 'growth', planName: 'Growth' },
    });

    // EJHunter / Dodo: type payment.succeeded with data.metadata.huntlo_order_id
    const fixture = {
      type: 'payment.succeeded',
      webhook_id: 'whmsg_dodo_fixture_1',
      data: {
        payment_id: 'pay_dodo_fixture_1',
        status: 'succeeded',
        checkout_session_id: 'cks_test_session_1',
        metadata: {
          huntlo_order_id: order._id.toHexString(),
          plan_id: plan!._id.toHexString(),
        },
      },
    };
    const payload = JSON.stringify(fixture);
    const msgId = 'msg_dodo_fixture_1';
    const timestamp = new Date();
    const wh = new Webhook(dodoWebhookSecret);
    const signature = wh.sign(msgId, timestamp, payload);

    const res = await agent
      .post('/api/v1/webhooks/dodo')
      .set('Content-Type', 'application/json')
      .set('webhook-id', msgId)
      .set('webhook-timestamp', String(Math.floor(timestamp.getTime() / 1000)))
      .set('webhook-signature', signature)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);

    const updated = await PaymentOrderModel.findById(order._id);
    expect(updated?.status).toBe('paid');
    expect(updated?.providerPaymentId).toBe('pay_dodo_fixture_1');

    const org = await OrganizationModel.findById(auth.organizationId);
    expect(org?.plan).toBe('Growth');

    const invoices = await agent
      .get('/api/v1/billing/invoices')
      .set('Authorization', `Bearer ${auth.token}`)
      .expect(200);
    expect(invoices.body.data.length).toBeGreaterThanOrEqual(1);
    expect(invoices.body.data[0].status).toBe('paid');
  });

  it('marks order refunded from Razorpay refund.processed fixture', async () => {
    const auth = await registerAndAuth(agent, '-ref');
    await agent.get('/api/v1/plans').set('Authorization', `Bearer ${auth.token}`);
    const plan = await PricingPlanModel.findOne({ code: 'starter' });

    const order = await PaymentOrderModel.create({
      organizationId: auth.organizationId,
      userId: auth.userId,
      planId: plan!._id,
      billingCycle: 'monthly',
      provider: 'razorpay',
      providerOrderId: 'order_refund_1',
      providerPaymentId: 'pay_refund_1',
      currency: 'INR',
      amount: 999_900,
      status: 'paid',
      paidAt: new Date(),
      idempotencyKey: 'idem_refund_1',
    });
    await BillingInvoiceModel.create({
      organizationId: auth.organizationId,
      paymentOrderId: order._id,
      invoiceNumber: 'INV-TEST-REF-1',
      amount: 999_900,
      currency: 'INR',
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 30 * 86400_000),
      status: 'paid',
      planName: 'Starter',
      provider: 'razorpay',
    });

    const fixture = {
      event: 'refund.processed',
      id: 'evt_refund_fixture_1',
      payload: {
        refund: {
          entity: {
            id: 'rfnd_1',
            payment_id: 'pay_refund_1',
            amount: 999_900,
            status: 'processed',
          },
        },
      },
    };
    const raw = JSON.stringify(fixture);
    const signature = createHmac('sha256', razorpaySecret).update(raw).digest('hex');

    const res = await agent
      .post('/api/v1/webhooks/razorpay')
      .set('Content-Type', 'application/json')
      .set('X-Razorpay-Signature', signature)
      .send(raw);

    expect(res.status).toBe(200);
    const updated = await PaymentOrderModel.findById(order._id);
    expect(updated?.status).toBe('refunded');
    const invoice = await BillingInvoiceModel.findOne({ paymentOrderId: order._id });
    expect(invoice?.status).toBe('refunded');
  });

  it('lists billing history for the organization', async () => {
    const auth = await registerAndAuth(agent, '-hist');
    await agent.get('/api/v1/plans').set('Authorization', `Bearer ${auth.token}`);
    const plan = await PricingPlanModel.findOne({ code: 'starter' });

    await PaymentOrderModel.create({
      organizationId: auth.organizationId,
      userId: auth.userId,
      planId: plan!._id,
      billingCycle: 'monthly',
      provider: 'razorpay',
      providerOrderId: 'order_hist_1',
      currency: 'INR',
      amount: 999_900,
      status: 'failed',
      failedAt: new Date(),
      idempotencyKey: 'idem_hist_1',
    });

    const res = await agent
      .get('/api/v1/billing/history')
      .set('Authorization', `Bearer ${auth.token}`)
      .expect(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].status).toBe('failed');
  });
});
