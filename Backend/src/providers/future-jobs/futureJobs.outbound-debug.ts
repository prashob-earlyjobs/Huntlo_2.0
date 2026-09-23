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
import { extractRevealValues } from './futureJobs.reveal.js';

const log = () =>
  createChildLogger({ provider: 'future-jobs', component: 'outbound-debug' });

const MAX_JSON_CHARS = 24_000;
const MAX_POLLS = 30;
/** Frontend phone soft-poll window is ~60s / 10s ≈ 6 attempts; close debug session after. */
const PHONE_POLL_COMPLETE_AFTER = 6;

let ensurePromise: Promise<void> | null = null;

type OutboundCallSnapshot = {
  at: Date;
  operation: string;
  method: string;
  url: string;
  body: unknown;
  response: unknown;
  status: number | null;
  statusText: string | null;
  ok: boolean;
  elapsedMs: number | null;
  attempt: number;
  error: string | null;
};

function classifyOperation(operation: string): FutureJobsOutboundKind {
  const op = String(operation || '').toLowerCase();
  if (op.includes('scout-people/lookup') || (op.includes('/lookup') && !op.includes('reveal'))) {
    return 'scout';
  }
  if (
    op.includes('reveal-contacts') ||
    op.includes('contact/reveal') ||
    op.includes('/reveal')
  ) {
    return 'reveal';
  }
  if (op.includes('/wl/search') || op.includes('search')) return 'search';
  return 'other';
}

function normalizeRevealType(raw: unknown): FutureJobsOutboundRevealType | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const s = String(value ?? '')
    .trim()
    .toLowerCase();
  if (s === 'email' || s === 'mail') return 'email';
  if (s === 'phone' || s === 'mobile' || s === 'phonenumber') return 'phone';
  return null;
}

function revealTypeFromRequest(
  body: unknown,
  url: string
): FutureJobsOutboundRevealType | null {
  if (body && typeof body === 'object') {
    const o = body as Record<string, unknown>;
    const fromBody =
      normalizeRevealType(o.revealContactType) ||
      normalizeRevealType(o.revealType) ||
      normalizeRevealType(o.contactType) ||
      normalizeRevealType(o.type);
    if (fromBody) return fromBody;
  }

  try {
    const parsed = new URL(url);
    const fromQuery =
      normalizeRevealType(parsed.searchParams.get('revealType')) ||
      normalizeRevealType(parsed.searchParams.get('revealContactType')) ||
      normalizeRevealType(parsed.searchParams.get('type'));
    if (fromQuery) return fromQuery;
  } catch {
    // ignore
  }

  const lower = url.toLowerCase();
  if (lower.includes('revealtype=email') || lower.includes('revealtype=mail')) {
    return 'email';
  }
  if (lower.includes('revealtype=phone') || lower.includes('revealtype=mobile')) {
    return 'phone';
  }
  return null;
}

function isMainRevealOperation(operation: string): boolean {
  const op = String(operation || '').toLowerCase();
  return op.includes('reveal-contacts') || op.includes('contact/reveal');
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
    at: new Date(),
    operation: String(input.operation || '').trim() || 'unknown',
    method: String(input.method || 'GET').toUpperCase(),
    url: String(input.url || ''),
    body: truncateJson(input.body ?? null),
    response: truncateJson(input.response ?? null),
    status: input.status ?? null,
    statusText: input.statusText ?? null,
    ok: Boolean(input.ok),
    elapsedMs: input.elapsedMs ?? null,
    attempt: input.attempt ?? 1,
    error: input.error ?? null,
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
      if (!stats.capped) return;

      log().warn(
        { collection: name },
        'outbound debug collection was capped; recreating uncapped for poll arrays'
      );
      await db.dropCollection(name);
      await db.createCollection(name);
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
}): Promise<string | null> {
  if (isTest()) return null;
  if (mongoose.connection.readyState !== 1) return null;

  try {
    await ensureFutureJobsOutboundDebugCollection();
    const actor = getFutureJobsActor();
    const userId = asObjectId(input.userId ?? actor.userId);
    const organizationId = asObjectId(input.organizationId ?? actor.organizationId);
    const baseUrl = getFutureJobsConfig().baseUrl.replace(/\/$/, '');
    const doc = await FutureJobsOutboundDebugModel.create({
      kind: 'scout',
      ...(userId ? { userId } : {}),
      ...(organizationId ? { organizationId } : {}),
      sessionStatus: 'in_progress',
      operation: 'POST /wl/scout-people/lookup',
      method: 'POST',
      url: `${baseUrl}/wl/scout-people/lookup`,
      ...(input.body != null ? { body: truncateJson(input.body) } : {}),
      ok: false,
      attempt: 1,
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
    if (!existing || existing.kind !== 'scout') return;
    if (existing.sessionStatus !== 'in_progress') return;
    existing.sessionStatus = input.error ? 'failed' : 'completed';
    if (input.error) existing.error = input.error;
    await existing.save();
  } catch (err) {
    log().warn(
      { err: err instanceof Error ? err.message : String(err) },
      'failed to complete scout outbound debug session'
    );
  }
}

/**
 * Start a reveal debug session (phone soft-poll UX). Returns doc id.
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
    const organizationId = asObjectId(input.organizationId ?? actor.organizationId);
    const lookupId = asObjectId(input.lookupId);
    const baseUrl = getFutureJobsConfig().baseUrl.replace(/\/$/, '');
    const doc = await FutureJobsOutboundDebugModel.create({
      kind: 'reveal',
      type: input.type,
      ...(userId ? { userId } : {}),
      ...(organizationId ? { organizationId } : {}),
      ...(lookupId ? { lookupId } : {}),
      ...(input.linkedinUrl?.trim()
        ? { linkedinUrl: input.linkedinUrl.trim() }
        : {}),
      sessionStatus: 'in_progress',
      calls: [],
      polls: [],
      operation: `reveal-session:${input.type}`,
      method: 'POST',
      // Mongoose rejects empty string for required String fields.
      url: `${baseUrl}/wl/scout-people/reveal-contacts`,
      ok: false,
      attempt: 1,
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
  const lookupId = asObjectId(input.lookupId);

  void (async () => {
    await ensureFutureJobsOutboundDebugCollection();
    const filter = debugId
      ? { _id: debugId }
      : {
          kind: 'reveal' as const,
          sessionStatus: 'in_progress',
          ...(input.type ? { type: input.type } : {}),
          ...(lookupId ? { lookupId } : {}),
          ...(asObjectId(actor.userId) ? { userId: asObjectId(actor.userId) } : {}),
        };

    const existing = await FutureJobsOutboundDebugModel.findOne(filter).sort({
      createdAt: -1,
    });
    if (!existing) return;

    const dataFoundFrom =
      input.found && !existing.dataFoundFrom
        ? existing.polls?.some((p) => phoneFoundInPollResponse(p.response))
          ? 'poll'
          : 'main_api'
        : existing.dataFoundFrom;

    // Phone UX polls getLookup after empty/error main reveal — keep session open
    // so soft-poll observations can still append. Email closes immediately.
    const keepOpenForPhonePoll =
      (input.type === 'phone' || existing.type === 'phone') && !input.found;

    existing.sessionStatus = keepOpenForPhonePoll
      ? 'in_progress'
      : input.error
        ? 'failed'
        : 'completed';
    existing.dataFoundFrom = dataFoundFrom ?? existing.dataFoundFrom;
    existing.resultSummary = truncateJson({
      found: input.found,
      charged: input.charged ?? false,
      source: input.source ?? null,
      values: input.values ?? [],
      error: input.error ?? null,
    });
    if (input.error) existing.error = input.error;
    await existing.save();
  })().catch((err) => {
    log().warn(
      { err: err instanceof Error ? err.message : String(err) },
      'failed to complete reveal outbound debug session'
    );
  });
}

function phoneFoundInPollResponse(response: unknown): boolean {
  if (!response || typeof response !== 'object') return false;
  const root = response as Record<string, unknown>;
  const data =
    root.data && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : root;
  const rs =
    data.revealStatus && typeof data.revealStatus === 'object'
      ? (data.revealStatus as Record<string, unknown>)
      : root.revealStatus && typeof root.revealStatus === 'object'
        ? (root.revealStatus as Record<string, unknown>)
        : null;
  if (!rs) return false;
  const phone =
    rs.phone && typeof rs.phone === 'object'
      ? (rs.phone as { values?: unknown })
      : null;
  return Array.isArray(phone?.values) && phone.values.length > 0;
}

/**
 * Append a soft-poll (GET lookup) observation onto the in-progress phone reveal session.
 * Stores only url + response + createdAt per poll.
 */
export function appendRevealOutboundDebugPoll(input: {
  lookupId: string;
  url: string;
  response: unknown;
  type?: FutureJobsOutboundRevealType;
  userId?: string | null;
}): void {
  if (isTest()) return;
  if (mongoose.connection.readyState !== 1) return;

  const lookupId = asObjectId(input.lookupId);
  if (!lookupId) return;
  const userId = asObjectId(input.userId ?? getFutureJobsActor().userId);
  const url = String(input.url || '').trim();
  if (!url) return;
  const found = phoneFoundInPollResponse(input.response);

  void (async () => {
    await ensureFutureJobsOutboundDebugCollection();
    const session = await FutureJobsOutboundDebugModel.findOne({
      kind: 'reveal',
      sessionStatus: 'in_progress',
      lookupId,
      ...(input.type ? { type: input.type } : { type: 'phone' }),
      ...(userId ? { userId } : {}),
    })
      .sort({ createdAt: -1 })
      .exec();

    if (!session) return;
    if ((session.polls?.length ?? 0) >= MAX_POLLS) return;

    const phoneValues = (() => {
      if (!input.response || typeof input.response !== 'object') return [] as string[];
      const root = input.response as Record<string, unknown>;
      const data =
        root.data && typeof root.data === 'object'
          ? (root.data as Record<string, unknown>)
          : root;
      const rs =
        data.revealStatus && typeof data.revealStatus === 'object'
          ? (data.revealStatus as Record<string, unknown>)
          : root.revealStatus && typeof root.revealStatus === 'object'
            ? (root.revealStatus as Record<string, unknown>)
            : null;
      const phone =
        rs && rs.phone && typeof rs.phone === 'object'
          ? (rs.phone as { values?: unknown })
          : null;
      return Array.isArray(phone?.values)
        ? phone.values.map((v) => String(v)).filter(Boolean)
        : [];
    })();

    session.set('polls', [
      ...(session.polls ?? []),
      {
        url,
        response: truncateJson(input.response),
        createdAt: new Date(),
      },
    ]);

    if (found && phoneValues.length > 0) {
      if (!session.dataFoundFrom) session.dataFoundFrom = 'poll';
      session.sessionStatus = 'completed';
      session.resultSummary = truncateJson({
        found: true,
        charged: false,
        source: 'poll',
        values: phoneValues,
        error: null,
      });
    } else if ((session.polls?.length ?? 0) >= PHONE_POLL_COMPLETE_AFTER) {
      session.sessionStatus = 'completed';
      session.resultSummary = truncateJson({
        found: false,
        charged: false,
        source: 'poll_exhausted',
        values: [],
        error: null,
        pollCount: session.polls?.length ?? 0,
      });
    }

    await session.save();
  })().catch((err) => {
    log().warn(
      { err: err instanceof Error ? err.message : String(err) },
      'failed to append reveal outbound debug poll'
    );
  });
}

/** Latest in-progress phone reveal debug session for soft-poll FJ lookup. */
export async function findInProgressRevealOutboundDebugSession(input: {
  lookupId: string;
  userId?: string | null;
  type?: FutureJobsOutboundRevealType;
}): Promise<{ id: string; pollCount: number } | null> {
  if (isTest()) return null;
  if (mongoose.connection.readyState !== 1) return null;
  const lookupId = asObjectId(input.lookupId);
  if (!lookupId) return null;
  const userId = asObjectId(input.userId ?? getFutureJobsActor().userId);

  await ensureFutureJobsOutboundDebugCollection();
  const session = await FutureJobsOutboundDebugModel.findOne({
    kind: 'reveal',
    sessionStatus: 'in_progress',
    lookupId,
    type: input.type ?? 'phone',
    ...(userId ? { userId } : {}),
  })
    .sort({ createdAt: -1 })
    .select({ _id: 1, polls: 1 })
    .lean()
    .exec();

  if (!session?._id) return null;
  return {
    id: String(session._id),
    pollCount: Array.isArray(session.polls) ? session.polls.length : 0,
  };
}

/** Reveal + soft-poll window (~130s HTTP + 60s poll). Stale locks auto-clear. */
export const PHONE_REVEAL_LOCK_MAX_AGE_MS = 4 * 60 * 1000;

/**
 * Any in-progress phone reveal for this user (any candidate), used to serialize
 * lookup + reveal-contacts + soft-poll and avoid FJ rate limits.
 */
export async function findAnyInProgressPhoneRevealForUser(
  userId?: string | null
): Promise<{ id: string; createdAt: Date; lookupId?: string } | null> {
  if (isTest()) return null;
  if (mongoose.connection.readyState !== 1) return null;
  const uid = asObjectId(userId ?? getFutureJobsActor().userId);
  if (!uid) return null;

  await ensureFutureJobsOutboundDebugCollection();
  const session = await FutureJobsOutboundDebugModel.findOne({
    kind: 'reveal',
    type: 'phone',
    sessionStatus: 'in_progress',
    userId: uid,
  })
    .sort({ createdAt: -1 })
    .select({ _id: 1, createdAt: 1, lookupId: 1 })
    .lean()
    .exec();

  if (!session?._id) return null;
  return {
    id: String(session._id),
    createdAt: session.createdAt instanceof Date ? session.createdAt : new Date(session.createdAt),
    ...(session.lookupId ? { lookupId: String(session.lookupId) } : {}),
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
  const kind = classifyOperation(input.operation);
  const revealType =
    kind === 'reveal' ? revealTypeFromRequest(input.body, input.url) : null;
  const debugId = asObjectId(actor.outboundDebugId);

  void (async () => {
    await ensureFutureJobsOutboundDebugCollection();

    if (debugId) {
      const session = await FutureJobsOutboundDebugModel.findById(debugId);
      if (session) {
        // Scout: insert-on-click row → update with response (lean, no calls/polls).
        if (
          session.kind === 'scout' &&
          session.sessionStatus === 'in_progress'
        ) {
          session.operation = snapshot.operation;
          session.method = snapshot.method;
          session.url = snapshot.url;
          if (snapshot.body != null) session.body = snapshot.body;
          if (snapshot.response != null) session.response = snapshot.response;
          if (snapshot.status != null) session.status = snapshot.status;
          if (snapshot.statusText) session.statusText = snapshot.statusText;
          session.ok = snapshot.ok;
          if (snapshot.elapsedMs != null) session.elapsedMs = snapshot.elapsedMs;
          session.attempt = snapshot.attempt;
          if (snapshot.error) session.error = snapshot.error;
          session.sessionStatus = snapshot.ok ? 'completed' : 'failed';
          await session.save();
          return;
        }

        // Reveal: append main reveal HTTP to `calls` / `mainApi` even if
        // complete() already ran (phone soft-poll keeps session in_progress).
        // Soft-poll scout-people/lookup must NOT land in `calls` — only in
        // `polls` via appendRevealOutboundDebugPoll.
        if (session.kind === 'reveal') {
          if (!isMainRevealOperation(snapshot.operation)) {
            return;
          }
          session.set('calls', [...(session.calls ?? []), snapshot]);
          session.mainApi = snapshot;
          session.operation = snapshot.operation;
          session.method = snapshot.method;
          session.url = snapshot.url;
          session.body = snapshot.body;
          session.response = snapshot.response;
          session.status = snapshot.status;
          session.statusText = snapshot.statusText;
          session.ok = snapshot.ok;
          session.elapsedMs = snapshot.elapsedMs;
          session.attempt = snapshot.attempt;
          if (snapshot.error) session.error = snapshot.error;
          // Only mark main_api when the channel actually returned values.
          const fjType = session.type === 'email' ? 'EMAIL' : 'PHONE';
          const values = extractRevealValues(snapshot.response, fjType);
          if (snapshot.ok && values.length > 0 && !session.dataFoundFrom) {
            session.dataFoundFrom = 'main_api';
          }
          if (revealType && !session.type) session.type = revealType;
          await session.save();
          return;
        }
      }
    }

    // Lean one-shot row (search / other, or scout without a pre-started session).
    const userId = asObjectId(input.userId ?? actor.userId);
    const organizationId = asObjectId(input.organizationId ?? actor.organizationId);
    await FutureJobsOutboundDebugModel.create({
      kind,
      ...(kind === 'reveal' && revealType ? { type: revealType } : {}),
      ...(userId ? { userId } : {}),
      ...(organizationId ? { organizationId } : {}),
      operation: snapshot.operation,
      method: snapshot.method,
      url: snapshot.url,
      ...(snapshot.body != null ? { body: snapshot.body } : {}),
      ...(snapshot.response != null ? { response: snapshot.response } : {}),
      ...(snapshot.status != null ? { status: snapshot.status } : {}),
      ...(snapshot.statusText ? { statusText: snapshot.statusText } : {}),
      ok: snapshot.ok,
      ...(snapshot.elapsedMs != null ? { elapsedMs: snapshot.elapsedMs } : {}),
      attempt: snapshot.attempt,
      ...(snapshot.error ? { error: snapshot.error } : {}),
    });
    await trimOutboundDebugCollection();
  })().catch((err) => {
    log().warn(
      {
        err: err instanceof Error ? err.message : String(err),
        operation: snapshot.operation,
      },
      'failed to record Future Jobs outbound debug row'
    );
  });
}
