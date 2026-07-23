import { Redis } from 'ioredis';
import mongoose from 'mongoose';

import { getLogger } from '../../config/logger.js';
import { getRedisUrl } from '../../bull-outreach/redis.js';
import {
  getWebhookRouteEnv,
  isWebhookRouteGuardEnabled,
} from './webhook-route-env.js';
import { WhatsAppOutboundRouteModel } from './whatsapp-outbound-route.model.js';

const ROUTE_TTL_SEC = 60 * 60 * 24 * 45;
const WAMID_KEY = (id: string) => `huntlo:wa:out:wamid:${id}`;
const PHONE_KEY = (phone: string) => `huntlo:wa:out:phone:${phone}`;

export type WhatsAppOutboundRouteRecord = {
  providerMessageId: string;
  phoneDigits: string;
  routeEnv: string;
  provider?: string;
  organizationId?: string | null;
  campaignId?: string | null;
  enrollmentId?: string | null;
  at?: string;
};

let redis: Redis | null = null;
let redisFailed = false;

function log() {
  return getLogger().child({ component: 'whatsapp-outbound-route' });
}

function digitsOnly(value: string | null | undefined): string {
  return String(value || '').replace(/\D/g, '');
}

/** Strip provider prefix so Meta context.id / send ids match. */
export function normalizeWhatsAppMessageId(raw: string | null | undefined): string {
  const id = String(raw || '').trim();
  if (!id) return '';
  const stripped = id.replace(/^(meta-whatsapp|gupshup|huntlo-whatsapp):/i, '');
  return stripped || id;
}

async function withRedis<T>(fn: (client: Redis) => Promise<T>): Promise<T | null> {
  const client = getRedis();
  if (!client) return null;
  try {
    return await fn(client);
  } catch (error) {
    log().warn({ err: error }, 'WhatsApp route Redis operation failed');
    return null;
  }
}

function getRedis(): Redis | null {
  if (redisFailed) return null;
  if (redis) return redis;
  try {
    const url = getRedisUrl();
    redis = new Redis(url, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    redis.on('error', (err) => {
      log().warn({ err }, 'WhatsApp route Redis error');
    });
    return redis;
  } catch {
    redisFailed = true;
    return null;
  }
}

/**
 * Call after a successful WhatsApp send so fan-out webhooks can route replies.
 */
export async function stampWhatsAppOutboundRoute(input: {
  providerMessageId?: string | null;
  toPhone: string;
  provider?: string;
  organizationId?: string | null;
  campaignId?: string | null;
  enrollmentId?: string | null;
  routeEnv?: string;
}): Promise<void> {
  const providerMessageId = normalizeWhatsAppMessageId(input.providerMessageId);
  const phoneDigits = digitsOnly(input.toPhone);
  if (!providerMessageId || phoneDigits.length < 8) return;

  const routeEnv = String(input.routeEnv || getWebhookRouteEnv())
    .trim()
    .toLowerCase();
  const record: WhatsAppOutboundRouteRecord = {
    providerMessageId,
    phoneDigits,
    routeEnv,
    provider: input.provider || 'meta-whatsapp',
    organizationId: input.organizationId || null,
    campaignId: input.campaignId || null,
    enrollmentId: input.enrollmentId || null,
    at: new Date().toISOString(),
  };

  await withRedis(async (client) => {
    const payload = JSON.stringify(record);
    const pipe = client.pipeline();
    pipe.set(WAMID_KEY(providerMessageId), payload, 'EX', ROUTE_TTL_SEC);
    pipe.set(PHONE_KEY(phoneDigits), payload, 'EX', ROUTE_TTL_SEC);
    await pipe.exec();
  });

  try {
    await WhatsAppOutboundRouteModel.findOneAndUpdate(
      { providerMessageId },
      {
        $set: {
          phoneDigits,
          routeEnv,
          provider: record.provider,
          organizationId: input.organizationId
            ? new mongoose.Types.ObjectId(String(input.organizationId))
            : null,
          campaignId: input.campaignId
            ? new mongoose.Types.ObjectId(String(input.campaignId))
            : null,
          enrollmentId: input.enrollmentId
            ? new mongoose.Types.ObjectId(String(input.enrollmentId))
            : null,
        },
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    log().warn(
      { err: error, providerMessageId, routeEnv },
      'Failed to persist WhatsApp outbound route in Mongo'
    );
  }

  log().info(
    { providerMessageId, phoneDigits, routeEnv, provider: record.provider },
    'Stamped WhatsApp outbound route env'
  );
}

async function loadByWamid(
  providerMessageId: string
): Promise<WhatsAppOutboundRouteRecord | null> {
  const id = normalizeWhatsAppMessageId(providerMessageId);
  if (!id) return null;

  const fromRedis = await withRedis(async (client) => {
    const raw = await client.get(WAMID_KEY(id));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as WhatsAppOutboundRouteRecord;
    } catch {
      return null;
    }
  });
  if (fromRedis?.routeEnv) return fromRedis;

  const doc = await WhatsAppOutboundRouteModel.findOne({ providerMessageId: id })
    .sort({ createdAt: -1 })
    .lean();
  if (!doc) return null;
  return {
    providerMessageId: String(doc.providerMessageId),
    phoneDigits: String(doc.phoneDigits),
    routeEnv: String(doc.routeEnv),
    provider: String(doc.provider || 'meta-whatsapp'),
    organizationId: doc.organizationId ? String(doc.organizationId) : null,
    campaignId: doc.campaignId ? String(doc.campaignId) : null,
    enrollmentId: doc.enrollmentId ? String(doc.enrollmentId) : null,
  };
}

async function loadLatestByPhone(
  phone: string
): Promise<WhatsAppOutboundRouteRecord | null> {
  const phoneDigits = digitsOnly(phone);
  if (phoneDigits.length < 8) return null;

  const fromRedis = await withRedis(async (client) => {
    const raw = await client.get(PHONE_KEY(phoneDigits));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as WhatsAppOutboundRouteRecord;
    } catch {
      return null;
    }
  });
  if (fromRedis?.routeEnv) return fromRedis;

  // Suffix match: stored 91XXXXXXXXXX vs inbound XXXXXXXXXX
  const doc = await WhatsAppOutboundRouteModel.findOne({
    $or: [
      { phoneDigits },
      { phoneDigits: { $regex: `${phoneDigits}$` } },
      ...(phoneDigits.length >= 10
        ? [{ phoneDigits: { $regex: `${phoneDigits.slice(-10)}$` } }]
        : []),
    ],
  })
    .sort({ createdAt: -1 })
    .lean();
  if (!doc) return null;
  return {
    providerMessageId: String(doc.providerMessageId),
    phoneDigits: String(doc.phoneDigits),
    routeEnv: String(doc.routeEnv),
    provider: String(doc.provider || 'meta-whatsapp'),
    organizationId: doc.organizationId ? String(doc.organizationId) : null,
    campaignId: doc.campaignId ? String(doc.campaignId) : null,
    enrollmentId: doc.enrollmentId ? String(doc.enrollmentId) : null,
  };
}

export async function resolveWhatsAppInboundRoute(input: {
  fromPhone: string;
  contextProviderMessageId?: string | null;
  headerRouteEnv?: string | null;
}): Promise<{
  routeEnv: string | null;
  source: 'header' | 'context' | 'latest_outbound' | 'none';
  record: WhatsAppOutboundRouteRecord | null;
}> {
  const header = String(input.headerRouteEnv || '')
    .trim()
    .toLowerCase();
  if (header) {
    return { routeEnv: header, source: 'header', record: null };
  }

  if (input.contextProviderMessageId) {
    const byContext = await loadByWamid(input.contextProviderMessageId);
    if (byContext?.routeEnv) {
      return { routeEnv: byContext.routeEnv, source: 'context', record: byContext };
    }
  }

  const latest = await loadLatestByPhone(input.fromPhone);
  if (latest?.routeEnv) {
    return { routeEnv: latest.routeEnv, source: 'latest_outbound', record: latest };
  }

  return { routeEnv: null, source: 'none', record: null };
}

/**
 * Returns false when this deploy must ignore the inbound (owned by another env).
 * Missing stamp → allow (legacy / first send before stamp), unless REQUIRE is on.
 */
export async function shouldProcessWhatsAppInboundForThisEnv(input: {
  fromPhone: string;
  contextProviderMessageId?: string | null;
  headerRouteEnv?: string | null;
}): Promise<{ process: boolean; reason: string; routeEnv: string | null; myEnv: string }> {
  const myEnv = getWebhookRouteEnv();
  if (!isWebhookRouteGuardEnabled()) {
    return { process: true, reason: 'guard_disabled', routeEnv: null, myEnv };
  }

  const resolved = await resolveWhatsAppInboundRoute(input);
  if (!resolved.routeEnv) {
    const requireStamp = ['1', 'true', 'yes', 'on'].includes(
      String(process.env.WEBHOOK_ROUTE_REQUIRE_STAMP || '')
        .trim()
        .toLowerCase()
    );
    if (requireStamp) {
      return {
        process: false,
        reason: 'no_stamp_required',
        routeEnv: null,
        myEnv,
      };
    }
    return { process: true, reason: 'no_stamp_allow', routeEnv: null, myEnv };
  }

  if (resolved.routeEnv === myEnv) {
    return {
      process: true,
      reason: `matched_${resolved.source}`,
      routeEnv: resolved.routeEnv,
      myEnv,
    };
  }

  return {
    process: false,
    reason: `owned_by_${resolved.routeEnv}_via_${resolved.source}`,
    routeEnv: resolved.routeEnv,
    myEnv,
  };
}
