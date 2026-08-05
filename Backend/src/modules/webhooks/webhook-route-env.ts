import { getEnv } from '../../config/env.js';

/**
 * Stable label used to stamp outbound WhatsApp sends and gate fan-out webhooks.
 * Prefer WEBHOOK_ROUTE_ENV when set (e.g. local | qa | production).
 * Falls back to APP_ENV (development | staging | production | test).
 */
export function getWebhookRouteEnv(): string {
  const explicit = String(process.env.WEBHOOK_ROUTE_ENV || '')
    .trim()
    .toLowerCase();
  if (explicit) return explicit;
  try {
    return String(getEnv().APP_ENV || 'development').trim().toLowerCase();
  } catch {
    return String(process.env.APP_ENV || 'development').trim().toLowerCase();
  }
}

/** When false/off/0, inbound WhatsApp is not gated by outbound env stamps. */
export function isWebhookRouteGuardEnabled(): boolean {
  const raw = String(process.env.WEBHOOK_ROUTE_GUARD || 'on')
    .trim()
    .toLowerCase();
  return !(raw === 'off' || raw === 'false' || raw === '0' || raw === 'no');
}

/**
 * Fan-out proxies may inject this header after resolving ownership.
 * Header wins over Redis/Mongo lookup when present.
 */
export const WEBHOOK_ROUTE_ENV_HEADER = 'x-huntlo-webhook-route-env';
