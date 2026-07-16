import { createChildLogger } from '../../config/logger.js';
import {
  buildFjAuthHeaders,
  getFutureJobsConfig,
  shouldUseFutureJobsMock,
} from './futureJobs.auth.js';
import {
  createFutureJobsCircuitOpenError,
  createFutureJobsUpstreamError,
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
  dedupe = false
): Promise<DedupedResponse> {
  const method = options.method || 'GET';
  const key = dedupe ? dedupeKey(method, url, typeof options.body === 'string' ? options.body : '') : '';
  if (key && inFlightRequests.has(key)) {
    log().debug({ method, url }, 'deduped in-flight request');
    return inFlightRequests.get(key)!;
  }

  const { timeoutMs } = getFutureJobsConfig();

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
}): Promise<unknown> {
  const {
    method,
    url,
    body,
    apiKey,
    fjOperation,
    defaultErrorPrefix = 'Future Jobs API',
    dedupe = false,
  } = options;

  assertCircuitAllows(fjOperation);

  const { maxRetries, timeoutMs, authStyle } = getFutureJobsConfig();
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

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const started = Date.now();
    try {
      const res = await futureJobsFetch(url, init, dedupe && method.toUpperCase() === 'GET');
      const text = await res.text();
      const data = await parseJsonSafe(text);
      const elapsedMs = Date.now() - started;

      if (!res.ok) {
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
      return data;
    } catch (err) {
      lastError = err;

      if (err instanceof Error && 'code' in err) {
        const code = (err as { code?: string }).code;
        if (code === 'FUTURE_JOBS_UPSTREAM_ERROR' || code === 'FUTURE_JOBS_CIRCUIT_OPEN') {
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
    })) as FutureJobsApiResponse;
  }

  async function getSourcingSessionProfiles(
    sessionId: string,
    { page = 1, limit = 20 }: GetProfilesOptions = {}
  ): Promise<FutureJobsApiResponse<FutureJobsProfilesPage>> {
    const delegate = resolveDelegate();
    if (delegate) return delegate.getSourcingSessionProfiles(sessionId, { page, limit });

    const { baseUrl, apiKey, authStyle } = getFutureJobsConfig();
    assertFutureJobsApiKey(apiKey);

    if (!sessionId || typeof sessionId !== 'string') {
      const err = new Error('sessionId is required to fetch profiles');
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }

    const params = new URLSearchParams({
      page: String(Math.max(1, Math.floor(Number(page)) || 1)),
      limit: String(Math.min(200, Math.max(1, Math.floor(Number(limit)) || 20))),
    });

    const url = `${baseUrl}/wl/sourcing-session/${encodeURIComponent(sessionId)}/profiles?${params}`;
    const fjOperation = 'GET /wl/sourcing-session/:id/profiles';
    assertCircuitAllows(fjOperation);

    const authHeaders = buildFjAuthHeaders(apiKey, authStyle);
    const { maxRetries } = getFutureJobsConfig();
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await futureJobsFetch(
          url,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...authHeaders,
            },
          },
          true
        );
        const text = await res.text();
        const data = await parseJsonSafe(text);

        if (!res.ok) {
          if (isRetryableStatus(res.status) && attempt < maxRetries) {
            await sleep(Math.min(1000 * 2 ** attempt, 8000));
            continue;
          }
          recordCircuitFailure();
          throwIfFjHttpNotOk(res, data, {
            label: 'profiles response error',
            fjOperation,
          });
        }

        recordCircuitSuccess();
        return data as FutureJobsApiResponse<FutureJobsProfilesPage>;
      } catch (err) {
        lastError = err;
        if (err instanceof Error && 'code' in err) {
          const code = (err as { code?: string }).code;
          if (code === 'FUTURE_JOBS_UPSTREAM_ERROR' || code === 'FUTURE_JOBS_CIRCUIT_OPEN') {
            throw err;
          }
        }
        if ((isAbortError(err) || err instanceof TypeError) && attempt < maxRetries) {
          await sleep(Math.min(1000 * 2 ** attempt, 8000));
          continue;
        }
        recordCircuitFailure();
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
      fjOperation: 'GET /wl/sourcing-session/:id/profiles',
      statusCode: 503,
    });
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
        log().debug(
          { sessionId, attempt, waitedMs: Date.now() - started, docCount, totalDocs },
          'profiles ready after poll'
        );
        return lastRes;
      }

      if (Date.now() - started + intervalMs > maxWaitMs) {
        break;
      }

      log().debug(
        {
          sessionId,
          attempt,
          waitedMs: Date.now() - started,
          expectedProfileCount: expected,
          profileMatchingStatus: status || undefined,
          nextPollInMs: intervalMs,
        },
        'profiles empty — waiting for matching'
      );
      await sleep(intervalMs);
    }

    log().warn(
      { sessionId, attempt, waitedMs: Date.now() - started, expectedProfileCount: expected },
      'profiles poll timeout — returning last response'
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
    })) as FutureJobsApiResponse;
  }

  async function getSourcingSessionCandidateDetails(
    candidateId: string
  ): Promise<FutureJobsApiResponse> {
    const delegate = resolveDelegate();
    if (delegate) return delegate.getSourcingSessionCandidateDetails(candidateId);

    const { baseUrl, apiKey } = getFutureJobsConfig();
    assertFutureJobsApiKey(apiKey);

    const cid = String(candidateId || '').trim();
    if (!cid) {
      const err = new Error('candidateId is required');
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }

    const url = `${baseUrl}/wl/sourcing-session/candidate/${encodeURIComponent(cid)}/details`;
    return (await futureJobsHttpRequest({
      method: 'GET',
      url,
      apiKey,
      fjOperation: 'GET /wl/sourcing-session/candidate/:id/details',
      defaultErrorPrefix: 'Future Jobs candidate details',
      dedupe: true,
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

    log().info(
      { fjOperation: 'POST /wl/sourcing-session/contact/reveal', revealType: type },
      'future-jobs contact reveal request'
    );

    return (await futureJobsHttpRequest({
      method: 'POST',
      url,
      apiKey,
      fjOperation: 'POST /wl/sourcing-session/contact/reveal',
      defaultErrorPrefix: 'Future Jobs contact reveal',
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

    const revealContactType = type === 'EMAIL' ? ['email'] : ['phone'];
    const url = `${baseUrl}/wl/scout-people/reveal-contacts`;

    log().info(
      {
        fjOperation: 'POST /wl/scout-people/reveal-contacts',
        revealType: type,
        linkedinProfileUrlLen: profileUrl.length,
      },
      'future-jobs scout reveal request'
    );

    return (await futureJobsHttpRequest({
      method: 'POST',
      url,
      body: {
        linkedin_profile_url: profileUrl,
        revealContactType,
      },
      apiKey,
      fjOperation: 'POST /wl/scout-people/reveal-contacts',
      defaultErrorPrefix: 'Future Jobs scout reveal-contacts',
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

    log().info(
      {
        fjOperation: 'POST /wl/scout-people/lookup',
        keys: Object.keys(payload),
      },
      'future-jobs scout lookup request'
    );

    return (await futureJobsHttpRequest({
      method: 'POST',
      url,
      body: payload,
      apiKey,
      fjOperation: 'POST /wl/scout-people/lookup',
      defaultErrorPrefix: 'Future Jobs scout-people lookup',
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
    })) as FutureJobsApiResponse;
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
    isFjSessionPending,
    fjSessionPendingMessage,
  };
}
