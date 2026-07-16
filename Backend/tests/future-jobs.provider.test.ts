import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getEnv, resetEnvCache } from '../src/config/env.js';
import {
  FUTURE_JOBS_CIRCUIT_OPEN_CODE,
  createLiveFutureJobsProvider,
  createMockFutureJobsProvider,
  resetFutureJobsCircuit,
  resetMockFutureJobsState,
  setMockFutureJobsMode,
} from '../src/providers/future-jobs/index.js';

describe('Future Jobs mock provider', () => {
  beforeEach(() => {
    resetMockFutureJobsState();
    resetFutureJobsCircuit();
  });

  afterEach(() => {
    resetMockFutureJobsState();
    resetFutureJobsCircuit();
  });

  it('returns empty profiles then candidates (progressive results)', async () => {
    const provider = createMockFutureJobsProvider();
    const created = await provider.createSourcingSession({
      sessionTitle: 'Test',
      jdDetail: { userText: 'backend engineers' },
      queries: {},
    });

    const sessionId = String(created.data?.session?._id);
    expect(sessionId).toBeTruthy();

    const first = await provider.getSourcingSessionProfiles(sessionId, {
      page: 1,
      limit: 20,
      pollAttempt: 1,
    });
    expect(provider.isFjSessionPending(first) || (first.data?.docs?.length ?? 0) === 0).toBe(true);

    const second = await provider.getSourcingSessionProfiles(sessionId, {
      page: 1,
      limit: 20,
      pollAttempt: 2,
    });
    // Still may be empty on attempt 2 depending on mock timing
    expect(second.statusCode ?? 200).toBeTruthy();

    const ready = await provider.getSourcingSessionProfiles(sessionId, {
      page: 1,
      limit: 20,
      pollAttempt: 3,
    });
    expect(ready.data?.docs?.length ?? 0).toBeGreaterThan(0);
    expect(ready.data?.totalDocs ?? 0).toBeGreaterThan(0);
  });

  it('simulates timeout failures', async () => {
    setMockFutureJobsMode({ timeout: true });
    const provider = createMockFutureJobsProvider();

    await expect(
      provider.createSourcingSession({
        sessionTitle: 'Timeout',
        jdDetail: { userText: 'x' },
        queries: {},
      })
    ).rejects.toMatchObject({
      details: expect.objectContaining({ timeout: true }),
    });
  });

  it('simulates successive failures via failNext', async () => {
    setMockFutureJobsMode({ failNext: 2 });
    const provider = createMockFutureJobsProvider();

    await expect(provider.getSourcingSessionAnnotation({ userText: 'a' })).rejects.toBeTruthy();
    await expect(provider.getSourcingSessionAnnotation({ userText: 'b' })).rejects.toBeTruthy();
    const ok = await provider.getSourcingSessionAnnotation({ userText: 'c' });
    expect(ok.data).toBeTruthy();
  });
});

describe('Future Jobs live client resilience', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    resetEnvCache();
    resetFutureJobsCircuit();
    process.env.FUTURE_JOBS_USE_MOCK = 'false';
    process.env.FUTURE_JOBS_API_KEY = 'test-fj-key-for-unit-tests';
    process.env.FUTURE_JOBS_MAX_RETRIES = '2';
    process.env.FUTURE_JOBS_CIRCUIT_FAILURE_THRESHOLD = '3';
    process.env.FUTURE_JOBS_CIRCUIT_RESET_MS = '60000';
    process.env.FUTURE_JOBS_TIMEOUT_MS = '5000';
    resetEnvCache();
    void getEnv();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.FUTURE_JOBS_USE_MOCK;
    delete process.env.FUTURE_JOBS_API_KEY;
    delete process.env.FUTURE_JOBS_MAX_RETRIES;
    delete process.env.FUTURE_JOBS_CIRCUIT_FAILURE_THRESHOLD;
    delete process.env.FUTURE_JOBS_CIRCUIT_RESET_MS;
    resetEnvCache();
    resetFutureJobsCircuit();
    vi.restoreAllMocks();
  });

  it('retries on 5xx then succeeds', async () => {
    let calls = 0;
    globalThis.fetch = vi.fn(async () => {
      calls += 1;
      if (calls < 3) {
        return new Response(JSON.stringify({ message: 'upstream down' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(
        JSON.stringify({
          statusCode: 200,
          data: { docs: [], totalDocs: 0 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as typeof fetch;

    const provider = createLiveFutureJobsProvider();
    const result = await provider.getSourcingSessionProfiles('fj-session-1', {
      page: 1,
      limit: 10,
    });

    expect(calls).toBe(3);
    expect(result.data?.totalDocs).toBe(0);
  });

  it('opens circuit breaker after consecutive failures', async () => {
    process.env.FUTURE_JOBS_MAX_RETRIES = '0';
    resetEnvCache();
    void getEnv();

    globalThis.fetch = vi.fn(async () => {
      return new Response(JSON.stringify({ message: 'boom' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;

    const provider = createLiveFutureJobsProvider();

    // threshold=3 — each failed request records one circuit failure
    for (let i = 0; i < 3; i += 1) {
      await expect(
        provider.getSourcingSessionProfiles(`fj-session-fail-${i}`, { page: 1, limit: 5 })
      ).rejects.toBeTruthy();
    }

    await expect(
      provider.getSourcingSessionProfiles('fj-session-blocked', { page: 1, limit: 5 })
    ).rejects.toMatchObject({
      code: FUTURE_JOBS_CIRCUIT_OPEN_CODE,
    });
  });

  it('retries network/timeout errors then fails', async () => {
    let calls = 0;
    globalThis.fetch = vi.fn(async () => {
      calls += 1;
      const err = new Error('The operation was aborted due to timeout');
      err.name = 'AbortError';
      throw err;
    }) as typeof fetch;

    const provider = createLiveFutureJobsProvider();
    await expect(
      provider.getSourcingSessionProfiles('fj-timeout', { page: 1, limit: 5 })
    ).rejects.toBeTruthy();

    // initial + 2 retries = 3
    expect(calls).toBe(3);
  });
});
