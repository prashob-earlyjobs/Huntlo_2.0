import { createChildLogger } from '../../config/logger.js';
import {
  buildFjAuthHeaders,
  getFutureJobsConfig,
  shouldUseFutureJobsMock,
} from './futureJobs.auth.js';
import { appendFutureJobsCurl, logFutureJobsCurlResponse } from './futureJobs.curl-log.js';
import {
  createFutureJobsCircuitOpenError,
  createFutureJobsUpstreamError,
  isFjInvalidLinkedinUrlError,
  isFjInvalidLinkedinUrlResponse,
  isFjNoMoreProfilesError,
  isFjProfileNotFoundError,
  throwIfFjHttpNotOk,
} from './futureJobs.errors.js';
import { createMockFutureJobsProvider } from './futureJobs.mock.js';
import type {
  FilterAutocompleteParams,
  FutureJobsAnnotationData,
  FutureJobsApiResponse,
  FutureJobsCreateSessionData,
  FutureJobsProfilesPage,
  FutureJobsProvider,
  FutureJobsRequestOpts,
  GetProfilesOptions,
  ProfilesWhenReadyOptions,
} from './futureJobs.types.js';

const log = () => createChildLogger({ provider: 'future-jobs' });

/** Truncate long strings for log payloads (avoid dumping full prompts/JD). */
function truncateForLog(value: unknown, max = 120): string | undefined {
  if (value == null) return undefined;
  const s = String(value);
  if (!s) return undefined;
  return s.length <= max ? s : `${s.slice(0, max)}…`;
}

function pathFromFjUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.pathname}${u.search}`;
  } catch {
    return url;
  }
}

function sessionIdFromFjUrl(url: string): string | undefined {
  const update = url.match(/\/wl\/sourcing-session\/update-session\/([^/?#]+)/i);
  if (update?.[1]) return decodeURIComponent(update[1]);

  const sessionOp = url.match(
    /\/wl\/sourcing-session\/([^/?#]+)\/(?:profiles|fetch-more)(?:\?|$)/i
  );
  if (sessionOp?.[1]) return decodeURIComponent(sessionOp[1]);

  return undefined;
}

/** Safe request summary — keys + sizes, not full PII bodies. */
function summarizeFjRequest(body: unknown): Record<string, unknown> | undefined {
  if (body == null) return undefined;
  if (typeof body !== 'object' || Array.isArray(body)) {
    return { bodyType: Array.isArray(body) ? 'array' : typeof body };
  }
  const o = body as Record<string, unknown>;
  const keys = Object.keys(o);
  const out: Record<string, unknown> = { bodyKeys: keys };
  if (typeof o.jd === 'string') out.jdChars = o.jd.length;
  if (typeof o.jdText === 'string') out.jdTextChars = o.jdText.length;
  if (typeof o.prompt === 'string') out.promptChars = o.prompt.length;
  if (typeof o.query === 'string') out.query = truncateForLog(o.query, 80);
  if (typeof o.filter_type === 'string') out.filterType = o.filter_type;
  if (typeof o.type === 'string') out.type = o.type;
  if (typeof o.revealType === 'string') out.revealType = o.revealType;
  if (typeof o.linkedin_profile_url === 'string') {
    out.linkedin_profile_url = o.linkedin_profile_url;
  }
  if (Array.isArray(o.revealContactType)) out.revealContactType = o.revealContactType;
  if (typeof o.sessionId === 'string') out.sessionId = o.sessionId;
  if (typeof o.candidateId === 'string') out.candidateId = truncateForLog(o.candidateId, 40);
  if (o.queries && typeof o.queries === 'object' && !Array.isArray(o.queries)) {
    out.queryKeys = Object.keys(o.queries as Record<string, unknown>);
  }
  return out;
}

/** Safe response summary for tracking session/profile outcomes. */
function summarizeFjResponse(data: unknown): Record<string, unknown> {
  if (data == null || typeof data !== 'object') {
    return { responseType: data == null ? 'null' : typeof data };
  }
  const root = data as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  if (typeof root.success === 'boolean') out.success = root.success;
  if (typeof root.message === 'string') out.message = truncateForLog(root.message, 160);
  if (typeof root.status === 'string' || typeof root.status === 'number') {
    out.status = root.status;
  }

  const bucket =
    root.data && typeof root.data === 'object' && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;

  const sessionId =
    (typeof bucket.sessionId === 'string' && bucket.sessionId) ||
    (typeof bucket._id === 'string' && bucket._id) ||
    (typeof bucket.id === 'string' && bucket.id) ||
    undefined;
  if (sessionId) out.sessionId = sessionId;

  const docs = bucket.docs;
  if (Array.isArray(docs)) out.docCount = docs.length;
  else if (Array.isArray(root.data)) out.docCount = root.data.length;
  if (typeof bucket.totalDocs === 'number') out.totalDocs = bucket.totalDocs;
  if (typeof bucket.hasNextPage === 'boolean') out.hasNextPage = bucket.hasNextPage;

  const matching =
    bucket.profileMatchingStatus ??
    (bucket.sourcing &&
    typeof bucket.sourcing === 'object' &&
    !Array.isArray(bucket.sourcing)
      ? (bucket.sourcing as Record<string, unknown>).profileMatchingStatus
      : undefined);
  if (typeof matching === 'string') out.profileMatchingStatus = matching;

  for (const key of [
    'expectedProfileCount',
    'profileCount',
    'estimatedResults',
    'totalResults',
    'count',
    'previewCount',
  ] as const) {
    const v = bucket[key];
    if (typeof v === 'number' && Number.isFinite(v)) out[key] = v;
  }

  // Preview APIs often nest counts under data
  if (typeof root.count === 'number') out.count = root.count;

  return out;
}

type CircuitState = {
  failures: number;
  openUntil: number;
};

const circuit: CircuitState = {
  failures: 0,
  openUntil: 0,
};

const inFlightRequests = new Map<string, Promise<DedupedResponse>>();

type DedupedResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  text: () => Promise<string>;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function dedupeKey(method: string, url: string, body = ''): string {
  return `${method.toUpperCase()} ${url} ${typeof body === 'string' ? body : JSON.stringify(body || '')}`;
}

function assertCircuitAllows(fjOperation: string): void {
  if (Date.now() < circuit.openUntil) {
    throw createFutureJobsCircuitOpenError(fjOperation);
  }
}

function recordCircuitSuccess(): void {
  circuit.failures = 0;
}

function recordCircuitFailure(): void {
  const { circuitFailureThreshold, circuitResetMs } = getFutureJobsConfig();
  circuit.failures += 1;
  if (circuit.failures >= circuitFailureThreshold) {
    circuit.openUntil = Date.now() + circuitResetMs;
    circuit.failures = 0;
    log().warn({ openUntil: circuit.openUntil }, 'future-jobs circuit opened');
  }
}

/** Reset circuit breaker — for tests only. */
export function resetFutureJobsCircuit(): void {
  circuit.failures = 0;
  circuit.openUntil = 0;
}

function assertFutureJobsApiKey(apiKey: string): void {
  if (!apiKey) {
    throw createFutureJobsUpstreamError({
      details: { reason: 'FUTURE_JOBS_API_KEY is not configured in environment' },
      fjHttpStatus: 503,
      statusCode: 503,
    });
  }
}

function isRetryableStatus(status: number): boolean {
  return status >= 500 && status <= 599;
}

function isAbortError(err: unknown): boolean {
  return (
    err instanceof Error &&
    (err.name === 'AbortError' || /aborted|timeout/i.test(err.message))
  );
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function futureJobsFetch(
  url: string,
  options: RequestInit = {},
  dedupe = false,
  fjOperation?: string,
  timeoutMsOverride?: number
): Promise<DedupedResponse> {
  const method = options.method || 'GET';
  const key = dedupe ? dedupeKey(method, url, typeof options.body === 'string' ? options.body : '') : '';
  if (key && inFlightRequests.has(key)) {
    log().debug({ method, url }, 'deduped in-flight request');
    return inFlightRequests.get(key)!;
  }

  const timeoutMs = timeoutMsOverride ?? getFutureJobsConfig().timeoutMs;

  appendFutureJobsCurl({
    method,
    url,
    headers: options.headers,
    body: options.body,
    fjOperation,
  });

  const run = async (): Promise<DedupedResponse> => {
    const res = await fetchWithTimeout(url, options, timeoutMs);
    const text = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      text: async () => text,
    };
  };

  if (!key) return run();

  const promise = run();
  inFlightRequests.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlightRequests.delete(key);
  }
}

async function parseJsonSafe(text: string): Promise<unknown> {
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text, parseError: true };
  }
}

async function futureJobsHttpRequest(options: {
  method: string;
  url: string;
  body?: unknown;
  apiKey: string;
  fjOperation: string;
  traceId?: string;
  defaultErrorPrefix?: string;
  dedupe?: boolean;
  logContext?: Record<string, unknown>;
  timeoutMs?: number;
  maxRetries?: number;
}): Promise<unknown> {
  const {
    method,
    url,
    body,
    apiKey,
    fjOperation,
    defaultErrorPrefix = 'Future Jobs API',
    dedupe = false,
    logContext,
  } = options;

  assertCircuitAllows(fjOperation);

  const config = getFutureJobsConfig();
  const maxRetries = options.maxRetries ?? config.maxRetries;
  const timeoutMs = options.timeoutMs ?? config.timeoutMs;
  const authStyle = config.authStyle;
  const authHeaders = buildFjAuthHeaders(apiKey, authStyle);
  const hasBody = body !== undefined && body !== null;
  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    ...(hasBody ? { body: JSON.stringify(body) } : {}),
  };

  const path = pathFromFjUrl(url);
  const urlSessionId = sessionIdFromFjUrl(url);
  const requestSummary = summarizeFjRequest(body);

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const started = Date.now();
    log().info(
      {
        fjOperation,
        method: method.toUpperCase(),
        path,
        sessionId: urlSessionId,
        attempt: attempt + 1,
        maxAttempts: maxRetries + 1,
        timeoutMs,
        traceId: options.traceId,
        ...requestSummary,
        ...logContext,
      },
      `FJ → ${fjOperation}`
    );

    try {
      const res = await futureJobsFetch(
        url,
        init,
        dedupe && method.toUpperCase() === 'GET',
        fjOperation,
        timeoutMs
      );
      const text = await res.text();
      const data = await parseJsonSafe(text);
      const elapsedMs = Date.now() - started;
      const responseSummary = summarizeFjResponse(data);

      logFutureJobsCurlResponse({
        fjOperation,
        method,
        url,
        status: res.status,
        statusText: res.statusText,
        elapsedMs,
        response: data,
      });

      if (!res.ok) {
        const noMoreProfiles =
          res.status === 400 &&
          typeof responseSummary.message === 'string' &&
          /no profiles match/i.test(String(responseSummary.message));
        const revealProfileNotFound =
          res.status === 404 &&
          typeof responseSummary.message === 'string' &&
          /no profile found/i.test(String(responseSummary.message));
        const invalidLinkedinUrl = isFjInvalidLinkedinUrlResponse(res.status, data);

        if (noMoreProfiles || revealProfileNotFound || invalidLinkedinUrl) {
          log().info(
            {
              fjOperation,
              method: method.toUpperCase(),
              path,
              sessionId: urlSessionId ?? responseSummary.sessionId,
              status: res.status,
              elapsedMs,
              attempt: attempt + 1,
              ...responseSummary,
              ...logContext,
            },
            noMoreProfiles
              ? `FJ ← ${fjOperation} no more profiles`
              : invalidLinkedinUrl
                ? `FJ ← ${fjOperation} invalid linkedin url`
                : `FJ ← ${fjOperation} profile not found`
          );
          throwIfFjHttpNotOk(res, data, {
            label: `${fjOperation || defaultErrorPrefix} HTTP ${res.status}`,
            fjOperation,
            extra: { elapsedMs },
          });
        }

        log().warn(
          {
            fjOperation,
            method: method.toUpperCase(),
            path,
            sessionId: urlSessionId ?? responseSummary.sessionId,
            status: res.status,
            statusText: res.statusText,
            elapsedMs,
            attempt: attempt + 1,
            ...responseSummary,
            ...logContext,
          },
          `FJ ← ${fjOperation} failed`
        );

        if (isRetryableStatus(res.status) && attempt < maxRetries) {
          const backoff = Math.min(1000 * 2 ** attempt, 8000);
          log().warn(
            { fjOperation, status: res.status, attempt, backoff, elapsedMs },
            'retrying Future Jobs request after 5xx'
          );
          await sleep(backoff);
          continue;
        }

        recordCircuitFailure();
        throwIfFjHttpNotOk(res, data, {
          label: `${fjOperation || defaultErrorPrefix} HTTP ${res.status}`,
          fjOperation,
          extra: { elapsedMs },
        });
      }

      recordCircuitSuccess();
      log().info(
        {
          fjOperation,
          method: method.toUpperCase(),
          path,
          sessionId: urlSessionId ?? responseSummary.sessionId,
          status: res.status,
          elapsedMs,
          attempt: attempt + 1,
          ...responseSummary,
          ...logContext,
        },
        `FJ ← ${fjOperation} ok`
      );
      return data;
    } catch (err) {
      lastError = err;

      if (err instanceof Error && 'code' in err) {
        const code = (err as { code?: string }).code;
        if (code === 'FUTURE_JOBS_UPSTREAM_ERROR' || code === 'FUTURE_JOBS_CIRCUIT_OPEN') {
          log().error(
            {
              fjOperation,
              method: method.toUpperCase(),
              path,
              sessionId: urlSessionId,
              elapsedMs: Date.now() - started,
              code,
              error: err.message,
              ...logContext,
            },
            `FJ ← ${fjOperation} error`
          );
          throw err;
        }
        if (
          code === 'FUTURE_JOBS_NO_MORE_PROFILES' ||
          isFjNoMoreProfilesError(err) ||
          isFjProfileNotFoundError(err) ||
          isFjInvalidLinkedinUrlError(err)
        ) {
          throw err;
        }
      }

      const networkLike = isAbortError(err) || err instanceof TypeError;
      if (networkLike && attempt < maxRetries) {
        const backoff = Math.min(1000 * 2 ** attempt, 8000);
        log().warn(
          {
            fjOperation,
            attempt,
            backoff,
            timeoutMs,
            error: err instanceof Error ? err.message : String(err),
          },
          'retrying Future Jobs request after network error'
        );
        await sleep(backoff);
        continue;
      }

      recordCircuitFailure();
      log().error(
        {
          fjOperation,
          method: method.toUpperCase(),
          path,
          sessionId: urlSessionId,
          elapsedMs: Date.now() - started,
          error: err instanceof Error ? err.message : String(err),
          ...logContext,
        },
        `FJ ← ${fjOperation} network error`
      );
      throw createFutureJobsUpstreamError({
        details: {
          networkError: err instanceof Error ? err.message : String(err),
        },
        fjHttpStatus: 0,
        fjOperation,
        statusCode: 503,
      });
    }
  }

  recordCircuitFailure();
  throw createFutureJobsUpstreamError({
    details: {
      networkError:
        lastError instanceof Error ? lastError.message : String(lastError ?? 'unknown'),
    },
    fjHttpStatus: 0,
    fjOperation,
    statusCode: 503,
  });
}

function isFjSessionPending(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  return Number((data as { statusCode?: unknown }).statusCode) === 207;
}

function fjSessionPendingMessage(data: unknown): string {
  const obj = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const nested =
    obj.data && typeof obj.data === 'object'
      ? (obj.data as Record<string, unknown>)
      : {};
  const sourcingError =
    typeof nested.sourcingError === 'string' ? nested.sourcingError.trim() : '';
  if (sourcingError) return sourcingError;

  if (typeof obj.message === 'string' && obj.message.trim()) {
    return obj.message.trim();
  }
  return 'Sourcing session is still being prepared. Please try again in a moment.';
}

function profilesResponseDocCount(
  profilesRes: FutureJobsApiResponse<FutureJobsProfilesPage>
): number {
  const docs = profilesRes?.data?.docs;
  return Array.isArray(docs) ? docs.length : 0;
}

function profilesResponseTotalDocs(
  profilesRes: FutureJobsApiResponse<FutureJobsProfilesPage>
): number {
  const n = profilesRes?.data?.totalDocs;
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

function resolveDelegate(): FutureJobsProvider | null {
  if (shouldUseFutureJobsMock()) {
    return createMockFutureJobsProvider();
  }
  return null;
}

export function createLiveFutureJobsProvider(): FutureJobsProvider {
  async function createSourcingSession(
    body: Record<string, unknown>,
    opts: FutureJobsRequestOpts = {}
  ): Promise<FutureJobsApiResponse<FutureJobsCreateSessionData>> {
    const delegate = resolveDelegate();
    if (delegate) return delegate.createSourcingSession(body, opts);

    const { baseUrl, apiKey } = getFutureJobsConfig();
    assertFutureJobsApiKey(apiKey);

    const url = `${baseUrl}/wl/sourcing-session`;
    return (await futureJobsHttpRequest({
      method: 'POST',
      url,
      body,
      apiKey,
      traceId: opts.traceId,
      fjOperation: 'POST /wl/sourcing-session',
      defaultErrorPrefix: 'Future Jobs API',
    })) as FutureJobsApiResponse<FutureJobsCreateSessionData>;
  }

  async function updateSourcingSession(
    sessionId: string,
    body: Record<string, unknown>,
    opts: FutureJobsRequestOpts = {}
  ): Promise<FutureJobsApiResponse> {
    const delegate = resolveDelegate();
    if (delegate) return delegate.updateSourcingSession(sessionId, body, opts);

    const { baseUrl, apiKey } = getFutureJobsConfig();
    assertFutureJobsApiKey(apiKey);

    const sid = String(sessionId || '').trim();
    if (!sid) {
      const err = new Error('sessionId is required');
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }

    const url = `${baseUrl}/wl/sourcing-session/update-session/${encodeURIComponent(sid)}`;
    return (await futureJobsHttpRequest({
      method: 'PATCH',
      url,
      body,
      apiKey,
      traceId: opts.traceId,
      fjOperation: 'PATCH /wl/sourcing-session/update-session/:id',
      defaultErrorPrefix: 'Future Jobs update session',
      logContext: { sessionId: sid },
    })) as FutureJobsApiResponse;
  }

  async function getSourcingSessionProfiles(
    sessionId: string,
    { page = 1, limit = 20, pollAttempt }: GetProfilesOptions = {}
  ): Promise<FutureJobsApiResponse<FutureJobsProfilesPage>> {
    const delegate = resolveDelegate();
    if (delegate) {
      return delegate.getSourcingSessionProfiles(sessionId, {
        page,
        limit,
        pollAttempt,
      });
    }

    const { baseUrl, apiKey } = getFutureJobsConfig();
    assertFutureJobsApiKey(apiKey);

    if (!sessionId || typeof sessionId !== 'string') {
      const err = new Error('sessionId is required to fetch profiles');
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }

    const pageNum = Math.max(1, Math.floor(Number(page)) || 1);
    const limitNum = Math.min(300, Math.max(1, Math.floor(Number(limit)) || 20));
    const params = new URLSearchParams({
      page: String(pageNum),
      limit: String(limitNum),
    });

    const url = `${baseUrl}/wl/sourcing-session/${encodeURIComponent(sessionId)}/profiles?${params}`;
    return (await futureJobsHttpRequest({
      method: 'GET',
      url,
      apiKey,
      fjOperation: 'GET /wl/sourcing-session/:id/profiles',
      defaultErrorPrefix: 'Future Jobs profiles',
      dedupe: true,
      logContext: {
        sessionId,
        page: pageNum,
        limit: limitNum,
        ...(pollAttempt != null ? { pollAttempt } : {}),
      },
    })) as FutureJobsApiResponse<FutureJobsProfilesPage>;
  }

  async function getSourcingSessionProfilesWhenReady(
    sessionId: string,
    {
      page = 1,
      limit = 20,
      maxWaitMs = 90000,
      intervalMs = 3000,
      expectedProfileCount = null,
      profileMatchingStatus = null,
      onPoll = null,
    }: ProfilesWhenReadyOptions = {}
  ): Promise<FutureJobsApiResponse<FutureJobsProfilesPage>> {
    const delegate = resolveDelegate();
    if (delegate) {
      return delegate.getSourcingSessionProfilesWhenReady(sessionId, {
        page,
        limit,
        maxWaitMs,
        intervalMs,
        expectedProfileCount,
        profileMatchingStatus,
        onPoll,
      });
    }

    const expected =
      typeof expectedProfileCount === 'number' && Number.isFinite(expectedProfileCount)
        ? Math.max(0, Math.floor(expectedProfileCount))
        : null;
    const status =
      typeof profileMatchingStatus === 'string'
        ? profileMatchingStatus.trim().toLowerCase()
        : '';
    const shouldPoll =
      (expected !== null && expected > 0) ||
      status === 'processing' ||
      status === 'pending' ||
      status === 'in_progress';

    const notifyPoll = (payload: {
      sessionId: string;
      attempt: number;
      docs: NonNullable<FutureJobsProfilesPage['docs']>;
      totalDocs: number;
      done: boolean;
      polling: boolean;
    }) => {
      if (typeof onPoll !== 'function') return;
      try {
        onPoll(payload);
      } catch {
        /* ignore listener errors */
      }
    };

    if (!shouldPoll) {
      log().info(
        {
          fjOperation: 'profilesWhenReady',
          sessionId,
          maxWaitMs,
          expectedProfileCount: expected,
          profileMatchingStatus: status || undefined,
          shouldPoll: false,
        },
        'FJ profilesWhenReady — single fetch (not waiting)'
      );
      const res = await getSourcingSessionProfiles(sessionId, {
        page,
        limit,
        pollAttempt: 1,
      });
      notifyPoll({
        sessionId,
        attempt: 1,
        docs: Array.isArray(res?.data?.docs) ? res.data.docs : [],
        totalDocs: profilesResponseTotalDocs(res),
        done: false,
        polling: true,
      });
      return res;
    }

    log().info(
      {
        fjOperation: 'profilesWhenReady',
        sessionId,
        maxWaitMs,
        intervalMs,
        expectedProfileCount: expected,
        profileMatchingStatus: status || undefined,
      },
      'FJ profilesWhenReady — start polling'
    );

    const started = Date.now();
    let attempt = 0;
    let lastRes: FutureJobsApiResponse<FutureJobsProfilesPage> | null = null;

    while (Date.now() - started <= maxWaitMs) {
      attempt += 1;
      lastRes = await getSourcingSessionProfiles(sessionId, {
        page,
        limit,
        pollAttempt: attempt,
      });
      const docCount = profilesResponseDocCount(lastRes);
      const totalDocs = profilesResponseTotalDocs(lastRes);
      const docs = Array.isArray(lastRes?.data?.docs) ? lastRes.data.docs : [];

      notifyPoll({
        sessionId,
        attempt,
        docs,
        totalDocs: totalDocs || docCount,
        done: false,
        polling: true,
      });

      if (docCount > 0 || totalDocs > 0) {
        log().info(
          { sessionId, attempt, waitedMs: Date.now() - started, docCount, totalDocs },
          'FJ profilesWhenReady — ready'
        );
        return lastRes;
      }

      if (Date.now() - started + intervalMs > maxWaitMs) {
        break;
      }

      log().info(
        {
          sessionId,
          attempt,
          waitedMs: Date.now() - started,
          expectedProfileCount: expected,
          profileMatchingStatus: status || undefined,
          nextPollInMs: intervalMs,
        },
        'FJ profilesWhenReady — empty, waiting'
      );
      await sleep(intervalMs);
    }

    log().warn(
      { sessionId, attempt, waitedMs: Date.now() - started, expectedProfileCount: expected },
      'FJ profilesWhenReady — timeout'
    );
    return (
      lastRes ||
      (await getSourcingSessionProfiles(sessionId, {
        page,
        limit,
        pollAttempt: attempt + 1,
      }))
    );
  }

  async function fetchMoreSourcingSession(
    sessionId: string,
    body: Record<string, unknown> = {}
  ): Promise<FutureJobsApiResponse> {
    const delegate = resolveDelegate();
    if (delegate) return delegate.fetchMoreSourcingSession(sessionId, body);

    const { baseUrl, apiKey } = getFutureJobsConfig();
    assertFutureJobsApiKey(apiKey);

    if (!sessionId || typeof sessionId !== 'string') {
      const err = new Error('sessionId is required for fetch-more');
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }

    const url = `${baseUrl}/wl/sourcing-session/${encodeURIComponent(sessionId)}/fetch-more`;
    const payload = body && typeof body === 'object' ? body : {};

    return (await futureJobsHttpRequest({
      method: 'POST',
      url,
      body: payload,
      apiKey,
      fjOperation: 'POST /wl/sourcing-session/:id/fetch-more',
      defaultErrorPrefix: 'Future Jobs fetch-more',
      dedupe: false,
      logContext: { sessionId },
    })) as FutureJobsApiResponse;
  }

  async function getSourcingSessionCandidateDetails(
    candidateId: string,
    opts: { sessionId?: string | null } = {}
  ): Promise<FutureJobsApiResponse> {
    const delegate = resolveDelegate();
    if (delegate) return delegate.getSourcingSessionCandidateDetails(candidateId, opts);

    const { baseUrl, apiKey } = getFutureJobsConfig();
    assertFutureJobsApiKey(apiKey);

    const cid = String(candidateId || '').trim();
    if (!cid) {
      const err = new Error('candidateId is required');
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }

    const params = new URLSearchParams();
    const sid = String(opts.sessionId || '').trim();
    if (sid) params.set('sessionId', sid);
    const qs = params.toString();
    const url = `${baseUrl}/wl/sourcing-session/candidate/${encodeURIComponent(cid)}/details${
      qs ? `?${qs}` : ''
    }`;
    return (await futureJobsHttpRequest({
      method: 'GET',
      url,
      apiKey,
      fjOperation: 'GET /wl/sourcing-session/candidate/:id/details',
      defaultErrorPrefix: 'Future Jobs candidate details',
      dedupe: true,
      logContext: {
        candidateId: cid,
        ...(sid ? { sessionId: sid } : {}),
      },
    })) as FutureJobsApiResponse;
  }

  async function revealSourcingSessionContact(
    sourcingSessionId: string,
    linkedinProfileUrl: string,
    revealType: 'EMAIL' | 'PHONE'
  ): Promise<FutureJobsApiResponse> {
    const delegate = resolveDelegate();
    if (delegate) {
      return delegate.revealSourcingSessionContact(
        sourcingSessionId,
        linkedinProfileUrl,
        revealType
      );
    }

    const { baseUrl, apiKey } = getFutureJobsConfig();
    assertFutureJobsApiKey(apiKey);

    const sessionId = String(sourcingSessionId || '').trim();
    const profileUrl = String(linkedinProfileUrl || '').trim();
    const type = String(revealType || '').toUpperCase();
    if (!sessionId || !profileUrl || (type !== 'PHONE' && type !== 'EMAIL')) {
      const err = new Error(
        'sourcingSessionId, linkedin_profile_url and revealType (PHONE|EMAIL) are required'
      );
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }

    const params = new URLSearchParams({
      sourcingSessionId: sessionId,
      linkedin_profile_url: profileUrl,
      revealType: type,
    });
    const url = `${baseUrl}/wl/sourcing-session/contact/reveal?${params.toString()}`;

    return (await futureJobsHttpRequest({
      method: 'POST',
      url,
      apiKey,
      fjOperation: 'POST /wl/sourcing-session/contact/reveal',
      defaultErrorPrefix: 'Future Jobs contact reveal',
      logContext: {
        sessionId,
        revealType: type,
        linkedin_profile_url: profileUrl,
        query: {
          sourcingSessionId: sessionId,
          linkedin_profile_url: profileUrl,
          revealType: type,
        },
      },
    })) as FutureJobsApiResponse;
  }

  async function scoutPeopleRevealContact(
    linkedinProfileUrl: string,
    revealType: 'EMAIL' | 'PHONE'
  ): Promise<FutureJobsApiResponse> {
    const delegate = resolveDelegate();
    if (delegate) return delegate.scoutPeopleRevealContact(linkedinProfileUrl, revealType);

    const { baseUrl, apiKey } = getFutureJobsConfig();
    assertFutureJobsApiKey(apiKey);

    const profileUrl = String(linkedinProfileUrl || '').trim();
    const type = String(revealType || '').toUpperCase();
    if (!profileUrl || (type !== 'PHONE' && type !== 'EMAIL')) {
      const err = new Error('linkedin_profile_url and revealType (PHONE|EMAIL) are required');
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }

    const revealBody = {
      linkedin_profile_url: profileUrl,
      revealContactType: type === 'EMAIL' ? ['email'] : ['phone'],
    };
    const url = `${baseUrl}/wl/scout-people/reveal-contacts`;

    log().info(
      { fjOperation: 'POST /wl/scout-people/reveal-contacts', body: revealBody },
      'FJ reveal-contacts request body'
    );

    return (await futureJobsHttpRequest({
      method: 'POST',
      url,
      body: revealBody,
      apiKey,
      fjOperation: 'POST /wl/scout-people/reveal-contacts',
      defaultErrorPrefix: 'Future Jobs scout reveal-contacts',
      logContext: {
        revealType: type,
        body: revealBody,
      },
    })) as FutureJobsApiResponse;
  }

  /**
   * POST /wl/scout-people/lookup
   * Body: { email } OR { linkedin_url } — exact EJHunterLanding contract.
   */
  async function scoutPeopleLookup(body: {
    email?: string;
    linkedin_url?: string;
  }): Promise<FutureJobsApiResponse> {
    const delegate = resolveDelegate();
    if (delegate) return delegate.scoutPeopleLookup(body);

    const { baseUrl, apiKey } = getFutureJobsConfig();
    assertFutureJobsApiKey(apiKey);

    const payload =
      body && typeof body.email === 'string' && body.email.trim()
        ? { email: body.email.trim() }
        : body && typeof body.linkedin_url === 'string' && body.linkedin_url.trim()
          ? { linkedin_url: body.linkedin_url.trim() }
          : null;

    if (!payload) {
      const err = new Error('Provide email or linkedin_url');
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }

    const url = `${baseUrl}/wl/scout-people/lookup`;

    return (await futureJobsHttpRequest({
      method: 'POST',
      url,
      body: payload,
      apiKey,
      fjOperation: 'POST /wl/scout-people/lookup',
      defaultErrorPrefix: 'Future Jobs scout-people lookup',
      logContext: {
        lookupBy: 'email' in payload ? 'email' : 'linkedin_url',
      },
    })) as FutureJobsApiResponse;
  }

  async function getSourcingSessionAnnotation(body: {
    userText: string;
    linkedin_profile_url?: string;
  }): Promise<FutureJobsApiResponse<FutureJobsAnnotationData>> {
    const delegate = resolveDelegate();
    if (delegate) return delegate.getSourcingSessionAnnotation(body);

    const { baseUrl, apiKey } = getFutureJobsConfig();
    assertFutureJobsApiKey(apiKey);

    const userText = typeof body?.userText === 'string' ? body.userText : '';
    if (!userText || !String(userText).trim()) {
      const err = new Error('userText is required for get-annotation');
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }

    const payload = {
      userText,
      linkedin_profile_url:
        typeof body?.linkedin_profile_url === 'string' ? body.linkedin_profile_url : '',
    };

    const url = `${baseUrl}/wl/sourcing-session/get-annotation`;
    return (await futureJobsHttpRequest({
      method: 'POST',
      url,
      body: payload,
      apiKey,
      fjOperation: 'POST /wl/sourcing-session/get-annotation',
      defaultErrorPrefix: 'Future Jobs get-annotation',
      logContext: {
        userTextChars: userText.length,
        hasLinkedinUrl: Boolean(payload.linkedin_profile_url),
      },
    })) as FutureJobsApiResponse<FutureJobsAnnotationData>;
  }

  async function getFilterAutocomplete(
    { filterType = 'region', query, limit = 10 }: FilterAutocompleteParams = {
      query: '',
    },
    opts: FutureJobsRequestOpts = {}
  ): Promise<FutureJobsApiResponse> {
    const delegate = resolveDelegate();
    if (delegate) return delegate.getFilterAutocomplete({ filterType, query, limit }, opts);

    const { baseUrl, apiKey } = getFutureJobsConfig();
    assertFutureJobsApiKey(apiKey);

    const q = String(query || '').trim();
    if (!q) {
      const err = new Error('query is required');
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }

    const cappedLimit = Math.min(Math.max(Number(limit) || 10, 1), 25);
    const params = new URLSearchParams({
      filter_type: String(filterType || 'region').trim() || 'region',
      query: q,
      limit: String(cappedLimit),
    });
    const url = `${baseUrl}/wl/sourcing-session/filters/autocomplete?${params}`;

    return (await futureJobsHttpRequest({
      method: 'GET',
      url,
      apiKey,
      traceId: opts.traceId,
      fjOperation: 'GET /wl/sourcing-session/filters/autocomplete',
      defaultErrorPrefix: 'Future Jobs autocomplete',
      dedupe: true,
      logContext: {
        filterType: String(filterType || 'region').trim() || 'region',
        query: truncateForLog(q, 80),
        limit: cappedLimit,
      },
    })) as FutureJobsApiResponse;
  }

  async function previewSourcingSession(
    body: { jd: string; queries: Record<string, unknown> },
    opts: FutureJobsRequestOpts = {}
  ): Promise<FutureJobsApiResponse<import('./futureJobs.types.js').FutureJobsPreviewData>> {
    const delegate = resolveDelegate();
    if (delegate) return delegate.previewSourcingSession(body, opts);

    const { baseUrl, apiKey } = getFutureJobsConfig();
    assertFutureJobsApiKey(apiKey);

    const url = `${baseUrl}/wl/sourcing-session/preview`;
    const jd = String(body?.jd ?? '');
    const queries =
      body?.queries && typeof body.queries === 'object' && !Array.isArray(body.queries)
        ? body.queries
        : {};
    return (await futureJobsHttpRequest({
      method: 'POST',
      url,
      body: { jd, queries },
      apiKey,
      traceId: opts.traceId,
      fjOperation: 'POST /wl/sourcing-session/preview',
      defaultErrorPrefix: 'Future Jobs preview',
      dedupe: true,
      logContext: {
        jdChars: jd.length,
        queryKeys: Object.keys(queries),
      },
    })) as FutureJobsApiResponse<import('./futureJobs.types.js').FutureJobsPreviewData>;
  }

  /** Wait up to 2 minutes — /wl/search returns profiles in the same response. */
  const JD_SEARCH_TIMEOUT_MS = 120_000;

  async function searchByJdText(
    body: {
      jdText: string;
      filters?: {
        years_of_experience_raw?: { type: 'RANGE'; value: [number, number] };
        country_region?: { type: '='; value: string[] };
      };
    },
    opts: FutureJobsRequestOpts = {}
  ): Promise<FutureJobsApiResponse<import('./futureJobs.types.js').FutureJobsSearchData>> {
    const delegate = resolveDelegate();
    if (delegate) return delegate.searchByJdText(body, opts);

    const { baseUrl, apiKey } = getFutureJobsConfig();
    assertFutureJobsApiKey(apiKey);

    const jdText = String(body?.jdText ?? '').trim();
    const filters =
      body?.filters && typeof body.filters === 'object' && Object.keys(body.filters).length > 0
        ? body.filters
        : undefined;
    const url = `${baseUrl}/wl/search`;
    return (await futureJobsHttpRequest({
      method: 'POST',
      url,
      body: filters ? { jdText, filters } : { jdText },
      apiKey,
      traceId: opts.traceId,
      fjOperation: 'POST /wl/search',
      defaultErrorPrefix: 'Future Jobs search',
      timeoutMs: opts.timeoutMs ?? JD_SEARCH_TIMEOUT_MS,
      maxRetries: opts.maxRetries ?? 0,
      logContext: {
        jdTextChars: jdText.length,
        hasYearsFilter: Boolean(filters?.years_of_experience_raw),
        hasCountryFilter: Boolean(filters?.country_region),
      },
    })) as FutureJobsApiResponse<import('./futureJobs.types.js').FutureJobsSearchData>;
  }

  return {
    createSourcingSession,
    updateSourcingSession,
    getSourcingSessionProfiles,
    getSourcingSessionProfilesWhenReady,
    fetchMoreSourcingSession,
    getSourcingSessionCandidateDetails,
    revealSourcingSessionContact,
    scoutPeopleRevealContact,
    scoutPeopleLookup,
    getSourcingSessionAnnotation,
    getFilterAutocomplete,
    previewSourcingSession,
    searchByJdText,
    isFjSessionPending,
    fjSessionPendingMessage,
  };
}
