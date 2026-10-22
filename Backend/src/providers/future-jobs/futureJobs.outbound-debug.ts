import mongoose from 'mongoose';

import { isTest } from '../../config/env.js';
import { createChildLogger } from '../../config/logger.js';
import {
  getFutureJobsActor,
  setFutureJobsOutboundDebugId,
} from './futureJobs.actor-context.js';
import { getFutureJobsConfig } from './futureJobs.auth.js';
import {
  FUTURE_JOBS_OUTBOUND_DEBUG_COLLECTION,
  FUTURE_JOBS_OUTBOUND_DEBUG_MAX,
  FutureJobsOutboundDebugModel,
  type FutureJobsOutboundKind,
  type FutureJobsOutboundRevealType,
} from './futureJobs.outbound-debug.model.js';
import {
  linkedinCacheLookupKeys,
  normalizeLinkedinProfileUrl,
  parseFutureJobsPhoneWebhook,
} from './futureJobs.reveal.js';

const log = () =>
  createChildLogger({ provider: 'future-jobs', component: 'outbound-debug' });

const MAX_JSON_CHARS = 24_000;

let ensurePromise: Promise<void> | null = null;

type OutboundCallSnapshot = {
  url: string;
  body: unknown;
  response: unknown;
  ok: boolean;
};

/** Which Future Jobs API this call is. The endpoint decides the kind. */
function classifyOperation(operation: string, url = ''): FutureJobsOutboundKind | null {
  const op = `${operation || ''} ${url || ''}`.toLowerCase();
  if (op.includes('scout-people/lookup') || (op.includes('/lookup') && !op.includes('reveal'))) {
    return 'scout_lookup';
  }
  if (op.includes('reveal-contacts')) return 'email_reveal';
  if (op.includes('contact/reveal')) return 'phone_reveal';
  if (op.includes('fetch-more')) return 'session_fetch_more';
  if (op.includes('update-session')) return 'session_update';
  if (op.includes('filters/autocomplete') || op.includes('autocomplete')) {
    return 'filter_autocomplete';
  }
  if (op.includes('/candidate/') && op.includes('details')) return 'candidate_details';
  if (op.includes('get-annotation') || op.includes('annotation')) return 'session_annotation';
  if (op.includes('sourcing-session/preview') || op.includes('/preview')) return 'session_preview';
  if (op.includes('/profiles') || op.includes('profileswhenready')) return 'session_profiles';
  if (op.includes('/wl/search') || /\bsearch\b/.test(op)) return 'search';
  if (/\/wl\/sourcing-session\/?(\?|$)/.test(op) || op.includes('post /wl/sourcing-session')) {
    return 'session_create';
  }
  return null;
}

function revealKind(type: FutureJobsOutboundRevealType | null | undefined): FutureJobsOutboundKind {
  return type === 'email' ? 'email_reveal' : 'phone_reveal';
}

function truncateJson(value: unknown): unknown {
  if (value == null) return null;
  try {
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    if (text.length <= MAX_JSON_CHARS) {
      return typeof value === 'string' ? value : JSON.parse(text);
    }
    return {
      _truncated: true,
      preview: text.slice(0, MAX_JSON_CHARS),
      originalChars: text.length,
    };
  } catch {
    return { _unserializable: true, preview: String(value).slice(0, 2_000) };
  }
}

function asObjectId(value: unknown): mongoose.Types.ObjectId | null {
  const raw = String(value ?? '').trim();
  if (!raw || !mongoose.Types.ObjectId.isValid(raw)) return null;
  return new mongoose.Types.ObjectId(raw);
}

/** Phone reveal sends its parameters on the URL. Store those as the request body. */
function bodyForLog(url: string, body: unknown): unknown {
  if (body != null) return truncateJson(body);
  try {
    const params = new URL(url).searchParams;
    if ([...params.keys()].length === 0) return null;
    const query: Record<string, string> = {};
    params.forEach((value, key) => {
      query[key] = value;
    });
    return query;
  } catch {
    return null;
  }
}

function callSnapshot(input: {
  operation: string;
  method: string;
  url: string;
  body?: unknown;
  response?: unknown;
  status?: number | null;
  statusText?: string | null;
  ok?: boolean;
  elapsedMs?: number | null;
  attempt?: number;
  error?: string | null;
}): OutboundCallSnapshot {
  return {
    url: String(input.url || ''),
    body: bodyForLog(String(input.url || ''), input.body ?? null),
    response: truncateJson(input.response ?? null),
    ok: Boolean(input.ok),
  };
}

async function trimOutboundDebugCollection(): Promise<void> {
  const count = await FutureJobsOutboundDebugModel.countDocuments();
  if (count <= FUTURE_JOBS_OUTBOUND_DEBUG_MAX) return;
  const overflow = count - FUTURE_JOBS_OUTBOUND_DEBUG_MAX;
  const oldest = await FutureJobsOutboundDebugModel.find()
    .sort({ createdAt: 1 })
    .limit(overflow)
    .select('_id')
    .lean();
  if (oldest.length === 0) return;
  await FutureJobsOutboundDebugModel.deleteMany({
    _id: { $in: oldest.map((row) => row._id) },
  });
}

/**
 * Ensure debug collection exists as uncapped (poll arrays need updates).
 * Recreates if a legacy capped collection is present.
 */
export async function ensureFutureJobsOutboundDebugCollection(): Promise<void> {
  if (isTest()) return;
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) return;

  if (!ensurePromise) {
    ensurePromise = (async () => {
      const db = mongoose.connection.db!;
      const name = FUTURE_JOBS_OUTBOUND_DEBUG_COLLECTION;
      const existing = await db.listCollections({ name }).toArray();

      if (existing.length === 0) {
        await db.createCollection(name);
        log().info(
          { collection: name, max: FUTURE_JOBS_OUTBOUND_DEBUG_MAX },
          'created Future Jobs outbound debug collection'
        );
        return;
      }

      const stats = (await db.command({ collStats: name })) as { capped?: boolean };
      if (stats.capped) {
        log().warn(
          { collection: name },
          'outbound debug collection was capped; recreating uncapped'
        );
        await db.dropCollection(name);
        await db.createCollection(name);
        return;
      }

      const col = db.collection(name);
      const remap: Array<[RegExp, FutureJobsOutboundKind]> = [
        [/scout-people\/lookup/i, 'scout_lookup'],
        [/scout-people\/reveal-contacts/i, 'email_reveal'],
        [/contact\/reveal/i, 'phone_reveal'],
        [/fetch-more/i, 'session_fetch_more'],
        [/update-session/i, 'session_update'],
        [/filters\/autocomplete/i, 'filter_autocomplete'],
        [/\/candidate\/[^/]+\/details/i, 'candidate_details'],
        [/get-annotation/i, 'session_annotation'],
        [/sourcing-session\/preview/i, 'session_preview'],
        [/\/profiles/i, 'session_profiles'],
        [/\/wl\/search/i, 'search'],
      ];
      for (const [url, kind] of remap) {
        await col.updateMany({ url }, { $set: { kind } });
      }
      await col.updateMany(
        { url: /\/wl\/sourcing-session\/?(?:\?.*)?$/i },
        { $set: { kind: 'session_create' } }
      );
      await col.updateMany({ kind: 'scout' }, { $set: { kind: 'scout_lookup' } });
      await col.updateMany(
        { kind: 'reveal', type: 'phone' },
        { $set: { kind: 'phone_reveal' } }
      );
      await col.updateMany(
        { kind: 'reveal', type: 'email' },
        { $set: { kind: 'email_reveal' } }
      );
      await col.updateMany(
        { kind: 'reveal', url: /webhooks\/contact-reveal/i },
        { $set: { kind: 'phone_reveal' } }
      );
      await col.updateMany(
        {
          linkedinUrl: { $type: 'string', $ne: '' },
          $or: [{ body: null }, { body: { $exists: false } }],
        },
        [{ $set: { body: { linkedin_profile_url: '$linkedinUrl' } } }]
      );
      await col.updateMany(
        {},
        {
          $unset: {
            mainApi: '',
            calls: '',
            polls: '',
            dataFoundFrom: '',
            resultSummary: '',
            operation: '',
            method: '',
            status: '',
            statusText: '',
            ok: '',
            elapsedMs: '',
            attempt: '',
            error: '',
            organizationId: '',
            lookupId: '',
            profileId: '',
            sessionStatus: '',
            type: '',
            linkedinUrl: '',
          },
        }
      );
      await col.dropIndex('type_1').catch(() => undefined);
    })().catch((err) => {
      ensurePromise = null;
      log().warn(
        { err: err instanceof Error ? err.message : String(err) },
        'failed to ensure Future Jobs outbound debug collection'
      );
    });
  }

  await ensurePromise;
}

/**
 * Insert scout debug row on lookup click / request start; FJ response updates it.
 */
export async function startScoutOutboundDebugSession(input: {
  body?: unknown;
  userId?: string | null;
  organizationId?: string | null;
  /** Accepted from existing callers. Lookup rows are always kind scout_lookup. */
  type?: FutureJobsOutboundRevealType | null;
  asReveal?: boolean;
}): Promise<string | null> {
  if (isTest()) return null;
  if (mongoose.connection.readyState !== 1) return null;

  try {
    await ensureFutureJobsOutboundDebugCollection();
    const actor = getFutureJobsActor();
    const userId = asObjectId(input.userId ?? actor.userId);
    const baseUrl = getFutureJobsConfig().baseUrl.replace(/\/$/, '');
    const doc = await FutureJobsOutboundDebugModel.create({
      kind: 'scout_lookup',
      ...(userId ? { userId } : {}),
      url: `${baseUrl}/wl/scout-people/lookup`,
      ...(input.body != null ? { body: truncateJson(input.body) } : {}),
    });
    const id = doc._id.toHexString();
    setFutureJobsOutboundDebugId(id);
    void trimOutboundDebugCollection().catch(() => undefined);
    return id;
  } catch (err) {
    log().warn(
      { err: err instanceof Error ? err.message : String(err) },
      'failed to start scout outbound debug session'
    );
    return null;
  }
}

export async function completeScoutOutboundDebugSession(input: {
  debugId?: string | null;
  error?: string | null;
}): Promise<void> {
  if (isTest()) return;
  if (mongoose.connection.readyState !== 1) return;

  const actor = getFutureJobsActor();
  const debugId = asObjectId(input.debugId ?? actor.outboundDebugId);
  if (!debugId) return;

  try {
    await ensureFutureJobsOutboundDebugCollection();
    const existing = await FutureJobsOutboundDebugModel.findById(debugId);
    if (!existing || existing.kind !== 'scout_lookup') return;
    if (existing.response != null || !input.error) return;
    existing.response = { error: input.error };
    await existing.save();
  } catch (err) {
    log().warn(
      { err: err instanceof Error ? err.message : String(err) },
      'failed to complete scout outbound debug session'
    );
  }
}

/**
 * Start a reveal debug session. Returns doc id.
 */
export async function startRevealOutboundDebugSession(input: {
  type: FutureJobsOutboundRevealType;
  lookupId?: string | null;
  linkedinUrl?: string | null;
  userId?: string | null;
  organizationId?: string | null;
}): Promise<string | null> {
  if (isTest()) return null;
  if (mongoose.connection.readyState !== 1) return null;

  try {
    await ensureFutureJobsOutboundDebugCollection();
    const actor = getFutureJobsActor();
    const userId = asObjectId(input.userId ?? actor.userId);
    const baseUrl = getFutureJobsConfig().baseUrl.replace(/\/$/, '');
    const linkedinUrl = String(input.linkedinUrl || '').trim();
    const doc = await FutureJobsOutboundDebugModel.create({
      kind: revealKind(input.type),
      ...(userId ? { userId } : {}),
      url:
        input.type === 'phone'
          ? `${baseUrl}/wl/sourcing-session/contact/reveal`
          : `${baseUrl}/wl/scout-people/reveal-contacts`,
      ...(linkedinUrl ? { body: { linkedin_profile_url: linkedinUrl } } : {}),
    });
    const id = doc._id.toHexString();
    setFutureJobsOutboundDebugId(id);
    void trimOutboundDebugCollection().catch(() => undefined);
    return id;
  } catch (err) {
    log().warn(
      { err: err instanceof Error ? err.message : String(err) },
      'failed to start reveal outbound debug session'
    );
    return null;
  }
}

export function completeRevealOutboundDebugSession(input: {
  debugId?: string | null;
  lookupId?: string | null;
  type?: FutureJobsOutboundRevealType | null;
  found: boolean;
  charged?: boolean;
  source?: string | null;
  values?: string[];
  error?: string | null;
}): void {
  if (isTest()) return;
  if (mongoose.connection.readyState !== 1) return;

  const actor = getFutureJobsActor();
  const debugId = asObjectId(input.debugId ?? actor.outboundDebugId);

  void (async () => {
    await ensureFutureJobsOutboundDebugCollection();
    const filter = debugId
      ? { _id: debugId }
      : {
          kind: input.type ? revealKind(input.type) : { $in: ['email_reveal', 'phone_reveal'] },
          response: null,
          ...(asObjectId(actor.userId) ? { userId: asObjectId(actor.userId) } : {}),
        };

    const existing = await FutureJobsOutboundDebugModel.findOne(filter).sort({
      createdAt: -1,
    });
    if (!existing || existing.response != null || !input.error) return;

    existing.response = { error: input.error };
    await existing.save();
  })().catch((err) => {
    log().warn(
      { err: err instanceof Error ? err.message : String(err) },
      'failed to complete reveal outbound debug session'
    );
  });
}

/** Stale in-progress phone reveals auto-clear so the next unlock can start. */
export const PHONE_REVEAL_LOCK_MAX_AGE_MS = 4 * 60 * 1000;

/**
 * Any in-progress phone reveal for this user (any candidate), used to serialize
 * lookup + reveal-contacts and avoid FJ rate limits.
 */
export async function findAnyInProgressPhoneRevealForUser(
  userId?: string | null
): Promise<{ id: string; createdAt: Date } | null> {
  if (isTest()) return null;
  if (mongoose.connection.readyState !== 1) return null;
  const uid = asObjectId(userId ?? getFutureJobsActor().userId);
  if (!uid) return null;

  await ensureFutureJobsOutboundDebugCollection();
  const session = await FutureJobsOutboundDebugModel.findOne({
    kind: 'phone_reveal',
    userId: uid,
    response: null,
  })
    .sort({ createdAt: -1 })
    .select({ _id: 1, createdAt: 1 })
    .lean()
    .exec();

  if (!session?._id) return null;
  return {
    id: String(session._id),
    createdAt: session.createdAt instanceof Date ? session.createdAt : new Date(session.createdAt),
  };
}

/**
 * Fire-and-forget insert / session attach for an outbound FJ HTTP call.
 */
export function recordFutureJobsOutboundDebug(input: {
  operation: string;
  method: string;
  url: string;
  body?: unknown;
  response?: unknown;
  status?: number | null;
  statusText?: string | null;
  ok?: boolean;
  elapsedMs?: number | null;
  attempt?: number;
  error?: string | null;
  userId?: string | null;
  organizationId?: string | null;
}): void {
  if (isTest()) return;
  if (mongoose.connection.readyState !== 1) return;

  const actor = getFutureJobsActor();
  const snapshot = callSnapshot(input);
  const kind = classifyOperation(input.operation, input.url);
  if (!kind) return;
  const debugId = asObjectId(actor.outboundDebugId);

  void (async () => {
    await ensureFutureJobsOutboundDebugCollection();

    if (debugId) {
      const session = await FutureJobsOutboundDebugModel.findById(debugId);
      // Same API as the open row: fill url, body, and response on it.
      if (session && session.kind === kind) {
        session.url = snapshot.url;
        if (snapshot.body != null) session.body = snapshot.body;
        if (snapshot.response != null) session.response = snapshot.response;
        await session.save();
        return;
      }
    }

    // A different API (lookup, then reveal-contacts) is its own row.
    const userId = asObjectId(input.userId ?? actor.userId);
    await FutureJobsOutboundDebugModel.create({
      kind,
      ...(userId ? { userId } : {}),
      url: snapshot.url,
      ...(snapshot.body != null ? { body: snapshot.body } : {}),
      ...(snapshot.response != null ? { response: snapshot.response } : {}),
    });
    await trimOutboundDebugCollection();
  })().catch((err) => {
    log().warn(
      {
        err: err instanceof Error ? err.message : String(err),
        operation: input.operation,
      },
      'failed to record Future Jobs outbound debug row'
    );
  });
}

/** Remember which profile this reveal log belongs to, so the webhook can be attached. */
export function noteRevealDebugTarget(input: {
  profileId?: string | null;
  linkedinUrl?: string | null;
}): void {
  if (isTest()) return;
  if (mongoose.connection.readyState !== 1) return;
  const debugId = asObjectId(getFutureJobsActor().outboundDebugId);
  if (!debugId) return;
  const linkedinUrl = String(input.linkedinUrl || '').trim();
  if (!linkedinUrl) return;
  void (async () => {
    const existing = await FutureJobsOutboundDebugModel.findById(debugId);
    if (!existing) return;
    const current =
      existing.body && typeof existing.body === 'object' && !Array.isArray(existing.body)
        ? (existing.body as Record<string, unknown>)
        : null;
    if (current?.linkedin_profile_url || current?.linkedin_url) return;
    existing.body = { ...(current ?? {}), linkedin_profile_url: linkedinUrl };
    await existing.save();
  })().catch((err) => {
    log().warn(
      { err: err instanceof Error ? err.message : String(err) },
      'failed to note reveal debug target'
    );
  });
}

/**
 * Store the incoming contact.reveal webhook on the reveal log it finishes.
 * The row then has the called URL, request body, response, and this webhook.
 */
export function recordFutureJobsRevealWebhook(event: unknown): void {
  if (isTest()) return;
  if (mongoose.connection.readyState !== 1) return;
  const parsed = parseFutureJobsPhoneWebhook(event);
  if (!parsed) return;
  const webhook = truncateJson(event);

  void (async () => {
    await ensureFutureJobsOutboundDebugCollection();
    const linkedinUrl = normalizeLinkedinProfileUrl(parsed?.linkedinUrl);
    const keys = linkedinUrl ? linkedinCacheLookupKeys(linkedinUrl) : [];
    const linkedinKeys = keys.length > 0 ? keys : linkedinUrl ? [linkedinUrl] : [];

    const existing = linkedinKeys.length
      ? await FutureJobsOutboundDebugModel.findOne({
          kind: 'phone_reveal',
          $or: [
            { 'body.linkedin_profile_url': { $in: linkedinKeys } },
            { 'body.linkedin_url': { $in: linkedinKeys } },
          ],
        }).sort({ createdAt: -1 })
      : null;

    if (existing) {
      existing.webhook = webhook;
      await existing.save();
      return;
    }

    await FutureJobsOutboundDebugModel.create({
      kind: 'phone_reveal',
      url: '/api/v1/webhooks/contact-reveal',
      webhook,
      ...(linkedinUrl ? { body: { linkedin_profile_url: linkedinUrl } } : {}),
    });
    await trimOutboundDebugCollection();
  })().catch((err) => {
    log().warn(
      { err: err instanceof Error ? err.message : String(err) },
      'failed to record Future Jobs reveal webhook'
    );
  });
}
