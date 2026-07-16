/**
 * Dodo Payments client — ported from EJHunterLanding dodoPaymentsService.js.
 * Checkout session + payment fetch + product id mapping only — do not invent payloads.
 */

export type DodoConfig = {
  apiKey: string;
  webhookSecret: string;
  environment: 'test' | 'live';
  baseUrl: string;
  enabled: boolean;
};

const DEFAULT_FRONTEND = 'http://localhost:3000';

export function getDodoConfig(): DodoConfig {
  const apiKey = String(process.env.DODO_PAYMENTS_API_KEY || '').trim();
  const webhookSecret = String(
    process.env.DODO_PAYMENTS_WEBHOOK_KEY || process.env.DODO_WEBHOOK_SECRET || ''
  ).trim();
  const envRaw = String(
    process.env.DODO_PAYMENTS_ENVIRONMENT || process.env.DODO_PAYMENTS_MODE || ''
  )
    .trim()
    .toLowerCase();
  const testMode =
    envRaw === 'test_mode' ||
    envRaw === 'test' ||
    envRaw === 'sandbox' ||
    process.env.DODO_PAYMENTS_TEST === 'true';
  const liveMode = envRaw === 'live_mode' || envRaw === 'live' || envRaw === 'production';
  const environment: 'test' | 'live' = liveMode && !testMode ? 'live' : 'test';
  const baseUrl =
    environment === 'live' ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com';

  return {
    apiKey,
    webhookSecret,
    environment,
    baseUrl,
    enabled: Boolean(apiKey),
  };
}

export function getFrontendBaseUrl(): string {
  const explicit =
    process.env.FRONTEND_URL?.trim() || process.env.PUBLIC_FRONTEND_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  const cors = process.env.CORS_ORIGINS;
  if (cors && String(cors).trim()) {
    const first = String(cors).split(',')[0]?.trim();
    if (first) return first.replace(/\/$/, '');
  }
  return DEFAULT_FRONTEND;
}

/** Map Huntlo plan codes to Dodo product IDs via env (EJHunter pattern). */
export function getDodoProductId(planCode: string): string {
  const id = String(planCode || '').trim().toLowerCase();
  if (id === 'starter') {
    return String(process.env.DODO_PRODUCT_ID_STARTER || '').trim();
  }
  if (id === 'growth') {
    return String(process.env.DODO_PRODUCT_ID_GROWTH || '').trim();
  }
  if (id === 'scale') {
    return String(process.env.DODO_PRODUCT_ID_SCALE || '').trim();
  }
  return '';
}

export function buildDodoCheckoutCustomer(user: {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}): { email?: string; name?: string; phone_number?: string } {
  const customer: { email?: string; name?: string; phone_number?: string } = {};
  const email = String(user?.email || '').trim();
  if (email.includes('@')) customer.email = email;
  const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  if (name) customer.name = name;
  const phone = String(user?.phone || '').trim();
  if (phone.startsWith('+')) customer.phone_number = phone;
  return customer;
}

async function dodoApiRequest(path: string, options?: { method?: string; body?: unknown }) {
  const { apiKey, baseUrl, enabled } = getDodoConfig();
  if (!enabled) {
    throw Object.assign(new Error('Dodo Payments is not configured'), {
      code: 'DODO_NOT_CONFIGURED',
      statusCode: 503,
    });
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method: options?.method || 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const message =
      (data && (String(data.message || data.error || '') || null)) ||
      `Dodo API error (${res.status})`;
    throw Object.assign(new Error(message), {
      code: 'DODO_API_ERROR',
      statusCode: res.status >= 400 && res.status < 600 ? res.status : 502,
      dodoResponse: data,
    });
  }

  return data;
}

/**
 * POST /checkouts — body shape from EJHunter createCheckoutSession usage:
 * product_cart, customer, billing_currency, return_url, cancel_url, metadata, feature_flags
 */
export async function createDodoCheckoutSession(payload: {
  product_cart: Array<{ product_id: string; quantity: number }>;
  customer: { email?: string; name?: string; phone_number?: string };
  billing_currency: string;
  return_url: string;
  cancel_url: string;
  metadata: Record<string, string>;
  feature_flags: { redirect_immediately: boolean };
}) {
  return dodoApiRequest('/checkouts', { method: 'POST', body: payload });
}

export async function fetchDodoPayment(paymentId: string) {
  const id = String(paymentId || '').trim();
  if (!id) return null;
  try {
    return await dodoApiRequest(`/payments/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}
