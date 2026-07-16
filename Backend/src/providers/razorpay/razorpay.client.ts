/**
 * Razorpay client — ported from EJHunterLanding razorpayService.js.
 * Order create / payment fetch / payment signature only — do not invent payloads.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import Razorpay from 'razorpay';

export type RazorpayConfig = {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  enabled: boolean;
};

export function getRazorpayConfig(): RazorpayConfig {
  const keyId = String(process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = String(process.env.RAZORPAY_KEY_SECRET || '').trim();
  const webhookSecret = String(
    process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || ''
  ).trim();
  return {
    keyId,
    keySecret,
    webhookSecret,
    enabled: Boolean(keyId && keySecret),
  };
}

function getRazorpayClient() {
  const { keyId, keySecret, enabled } = getRazorpayConfig();
  if (!enabled) {
    throw Object.assign(new Error('Razorpay is not configured'), {
      code: 'RAZORPAY_NOT_CONFIGURED',
      statusCode: 503,
    });
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/** Checkout.js payment signature: HMAC-SHA256(`${orderId}|${paymentId}`). */
export function verifyRazorpayPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret, enabled } = getRazorpayConfig();
  if (!enabled) return false;
  const oid = String(input.orderId || '').trim();
  const pid = String(input.paymentId || '').trim();
  const sig = String(input.signature || '').trim();
  if (!oid || !pid || !sig) return false;

  const expected = createHmac('sha256', keySecret)
    .update(`${oid}|${pid}`)
    .digest('hex');

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

/** Webhook signature: HMAC-SHA256(rawBody) with webhook secret (official Razorpay). */
export function verifyRazorpayWebhookSignature(
  rawBody: Buffer | string,
  signatureHeader: string | undefined
): boolean {
  const { webhookSecret } = getRazorpayConfig();
  if (!webhookSecret) return false;
  const sig = String(signatureHeader || '').trim();
  if (!sig) return false;
  const payload = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody || ''), 'utf8');
  const expected = createHmac('sha256', webhookSecret).update(payload).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

export async function createRazorpayOrder(input: {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const client = getRazorpayClient();
  return client.orders.create({
    amount: input.amountPaise,
    currency: input.currency || 'INR',
    receipt: input.receipt.slice(0, 40),
    notes: input.notes || {},
  });
}

export async function fetchRazorpayPayment(paymentId: string) {
  const client = getRazorpayClient();
  return client.payments.fetch(paymentId);
}

export type RazorpayPaymentEntity = {
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  notes?: Record<string, string>;
};
