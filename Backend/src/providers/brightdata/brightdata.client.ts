import { randomUUID } from 'node:crypto';

import { getEnv } from '../../config/env.js';
import { createChildLogger } from '../../config/logger.js';
import { AppError } from '../../shared/errors/app-error.js';
import type {
  FilterAutocompleteParams,
  FutureJobsApiResponse,
  FutureJobsCreateSessionData,
  FutureJobsPreviewData,
  FutureJobsProfileDoc,
  FutureJobsProfilesPage,
  FutureJobsProvider,
  FutureJobsRequestOpts,
  GetProfilesOptions,
  ProfilesWhenReadyOptions,
} from '../future-jobs/futureJobs.types.js';
import { BrightDataSearchSessionModel } from './brightdata-session.model.js';
import { BRIGHTDATA_PEOPLE_DATASET_ID } from './brightdata.constants.js';
import { BRIGHTDATA_SECOND_POLL_PROFILES } from './brightdata.poll-fixture.js';
import {
  annotationFromPrompt,
  filterFromFutureJobsPayload,
  mapBrightDataRecordToFjDoc,
} from './brightdata.mapper.js';

const log = () => createChildLogger({ provider: 'brightdata' });

const FILTER_RECORDS_LIMIT = 50;
const SNAPSHOT_POLL_MS = 3000;
const SNAPSHOT_WAIT_MS = 5 * 60 * 1000;
/** Apply should return pending quickly — do not block the HTTP request on a slow filter accept. */
const FILTER_START_TIMEOUT_MS = 12_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requireApiKey(): { apiKey: string; baseUrl: string; timeoutMs: number } {
  const env = getEnv();
  const apiKey = env.BRIGHTDATA_API_KEY.trim();
  if (!apiKey) {
    throw new AppError(503, 'BRIGHTDATA_NOT_CONFIGURED', 'Bright Data API key is not configured.');
  }
  return {
    apiKey,
    baseUrl: env.BRIGHTDATA_API_URL.replace(/\/$/, ''),
    timeoutMs: env.BRIGHTDATA_TIMEOUT_MS,
  };
}

async function parseResponse(response: Response): Promise<unknown> {
  const rawText = await response.text().catch(() => '');
  try {
    return rawText ? (JSON.parse(rawText) as unknown) : null;
  } catch {
    return rawText.slice(0, 800);
  }
}

type SearchResponse = {
  records?: Record<string, unknown>[];
  data?: Record<string, unknown>[];
  hits?: Record<string, unknown>[];
  search_after?: unknown;
  total?: number;
  total_hits?: number;
};

function ok<T>(data: T, message = 'ok'): FutureJobsApiResponse<T> {
  return { status: true, statusCode: 200, message, data };
}

function pending<T>(data: T, message: string): FutureJobsApiResponse<T> {
  return { status: true, statusCode: 207, message, data };
}

const profilePollCountBySession = new Map<string, number>();

function useDevReadyOnSecondPoll(): boolean {
  try {
    return getEnv().APP_ENV !== 'production';
  } catch {
    return false;
  }
}

function isAbortTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === 'TimeoutError' ||
    error.name === 'AbortError' ||
    /timeout|aborted/i.test(error.message)
  );
}

function nextDevProfilePoll(sessionId: string): number {
  const next = (profilePollCountBySession.get(sessionId) ?? 0) + 1;
  profilePollCountBySession.set(sessionId, next);
  return next;
}

async function persistSecondPollFixture(sessionId: string) {
  const stored = await BrightDataSearchSessionModel.findOne({ sessionId });
  const docs = docsFromRecords(sessionId, BRIGHTDATA_SECOND_POLL_PROFILES);
  console.log(
    `[brightdata] second-poll fixture ready records=${docs.length} session=${sessionId}`
  );
  await persistSession(
    sessionId,
    {
      filter: stored?.filter ?? {},
      records: docs,
      snapshotId: stored?.snapshotId ?? 'snap_fixture_second_poll',
      snapshotStatus: 'ready',
      total: docs.length,
    },
    true
  );
}

function isSnapshotPendingStatus(status: string | null | undefined): boolean {
  const value = (status ?? '').trim().toLowerCase();
  // Anything other than a terminal Bright Data status is still in progress.
  if (!value) return true;
  return value !== 'ready' && value !== 'failed' && value !== 'empty';
}

function isSnapshotReadyStatus(status: string | null | undefined): boolean {
  return (status ?? '').trim().toLowerCase() === 'ready';
}

function isSnapshotFailedStatus(status: string | null | undefined): boolean {
  return (status ?? '').trim().toLowerCase() === 'failed';
}

function asRecords(payload: unknown): Record<string, unknown>[] {
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (!trimmed) return [];
    try {
      return asRecords(JSON.parse(trimmed));
    } catch {
      return [];
    }
  }
  if (Array.isArray(payload)) {
    return payload.flatMap((item) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        return [item as Record<string, unknown>];
      }
      if (typeof item === 'string') {
        try {
          const parsed = JSON.parse(item) as unknown;
          return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
            ? [parsed as Record<string, unknown>]
            : [];
        } catch {
          return [];
        }
      }
      return [];
    });
  }
  if (!payload || typeof payload !== 'object') return [];
  const record = payload as SearchResponse & {
    result?: unknown;
    results?: unknown;
    items?: unknown;
    profiles?: unknown;
  };
  const nested =
    record.records ?? record.data ?? record.hits ?? record.result ?? record.results ?? record.items ?? record.profiles;
  return Array.isArray(nested) ? asRecords(nested) : [];
}

async function startDatasetFilter(
  filter: unknown,
  opts?: { timeoutMs?: number }
): Promise<{
  snapshotId: string | null;
  empty: boolean;
}> {
  const { apiKey, baseUrl, timeoutMs } = requireApiKey();
  const requestTimeoutMs = opts?.timeoutMs ?? Math.min(timeoutMs, FILTER_START_TIMEOUT_MS);
  const body = {
    dataset_id: BRIGHTDATA_PEOPLE_DATASET_ID,
    records_limit: FILTER_RECORDS_LIMIT,
    filter,
  };
  console.log('[brightdata] POST /datasets/filter\n' + JSON.stringify(body, null, 2));
  const response = await fetch(`${baseUrl}/datasets/filter`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  const json = await parseResponse(response);
  if (response.status === 422) {
    log().info({ body: json }, 'Bright Data filter matched 0 records');
    return { snapshotId: null, empty: true };
  }
  if (!response.ok) {
    log().warn({ status: response.status, body: json }, 'Bright Data filter failed');
    throw new AppError(
      502,
      'BRIGHTDATA_UPSTREAM_ERROR',
      'Bright Data search is temporarily unavailable.'
    );
  }
  const snapshotId =
    json && typeof json === 'object'
      ? String(
          (json as { snapshot_id?: unknown; snapshotId?: unknown }).snapshot_id ??
            (json as { snapshotId?: unknown }).snapshotId ??
            ''
        ).trim() || null
      : null;
  if (!snapshotId) {
    throw new AppError(
      502,
      'BRIGHTDATA_UPSTREAM_ERROR',
      'Bright Data filter did not return a snapshot id.'
    );
  }
  console.log(JSON.stringify({ provider: 'brightdata', snapshotId }));
  log().info({ provider: 'brightdata', snapshotId }, 'Bright Data filter accepted');
  return { snapshotId, empty: false };
}

async function getSnapshotMeta(snapshotId: string): Promise<{
  id: string;
  status: string;
  datasetSize: number;
  error?: string;
  raw: Record<string, unknown>;
}> {
  const { apiKey, baseUrl, timeoutMs } = requireApiKey();
  const url = `${baseUrl}/datasets/snapshots/${snapshotId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(timeoutMs),
  });
  const json = await parseResponse(response);
  if (!response.ok) {
    log().warn({ status: response.status, body: json, snapshotId }, 'Bright Data snapshot meta failed');
    throw new AppError(
      502,
      'BRIGHTDATA_UPSTREAM_ERROR',
      'Bright Data snapshot is temporarily unavailable.'
    );
  }
  const rec = json && typeof json === 'object' ? (json as Record<string, unknown>) : {};
  return {
    id: typeof rec.id === 'string' ? rec.id : snapshotId,
    status: typeof rec.status === 'string' ? rec.status.toLowerCase() : '',
    datasetSize: typeof rec.dataset_size === 'number' ? rec.dataset_size : 0,
    error: typeof rec.error === 'string' ? rec.error : undefined,
    raw: rec,
  };
}

async function waitForSnapshot(snapshotId: string): Promise<{
  status: string;
  datasetSize: number;
  id: string;
  raw: Record<string, unknown>;
}> {
  const deadline = Date.now() + SNAPSHOT_WAIT_MS;
  let meta = await getSnapshotMeta(snapshotId);

  while (meta.status === 'building' && Date.now() < deadline) {
    console.log('[brightdata] snapshot poll\n' + JSON.stringify(meta.raw, null, 2));
    await sleep(SNAPSHOT_POLL_MS);
    meta = await getSnapshotMeta(snapshotId);
  }

  if (meta.status === 'ready') {
    console.log('[brightdata] snapshot ready\n' + JSON.stringify(meta.raw, null, 2));
    return meta;
  }
  if (meta.status === 'failed') {
    throw new AppError(
      502,
      'BRIGHTDATA_UPSTREAM_ERROR',
      meta.error || 'Bright Data filter snapshot failed.'
    );
  }
  if (meta.status === 'scheduled' && Date.now() < deadline) {
    await sleep(SNAPSHOT_POLL_MS);
    return waitForSnapshot(snapshotId);
  }
  throw new AppError(
    502,
    'BRIGHTDATA_UPSTREAM_ERROR',
    meta.status
      ? `Bright Data snapshot ended with status ${meta.status}.`
      : 'Bright Data filter snapshot timed out.'
  );
}

async function downloadSnapshotOnce(snapshotId: string): Promise<Record<string, unknown>[]> {
  const { apiKey, baseUrl, timeoutMs } = requireApiKey();
  const url = `${baseUrl}/datasets/snapshots/${snapshotId}/download?format=json`;
  console.log(`[brightdata] GET ${url}`);
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}` },
    // Large LinkedIn snapshots are ~1MB+; allow well beyond the filter-start timeout.
    signal: AbortSignal.timeout(Math.max(timeoutMs, 120_000)),
  });
  const rawText = await response.text();
  if (!response.ok) {
    log().warn(
      { status: response.status, body: rawText.slice(0, 500), snapshotId },
      'Bright Data snapshot download failed'
    );
    throw new AppError(
      502,
      'BRIGHTDATA_UPSTREAM_ERROR',
      'Bright Data snapshot download failed.'
    );
  }
  let records: Record<string, unknown>[] = [];
  try {
    records = asRecords(rawText ? JSON.parse(rawText) : []);
  } catch {
    records = rawText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as unknown;
        } catch {
          return null;
        }
      })
      .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === 'object'));
  }
  if (records.length === 0) {
    log().warn(
      {
        snapshotId,
        status: response.status,
        contentType: response.headers.get('content-type'),
        bodyLength: rawText.length,
        bodyHead: rawText.slice(0, 240),
      },
      'Bright Data snapshot download returned 0 parseable records'
    );
  }
  return records;
}

/** Download snapshot JSON; retry when meta says records exist but the body is empty. */
async function downloadSnapshot(
  snapshotId: string,
  opts?: { expectedSize?: number }
): Promise<Record<string, unknown>[]> {
  const expected = Math.max(0, opts?.expectedSize ?? 0);
  const attempts = expected > 0 ? 4 : 1;
  let last: Record<string, unknown>[] = [];
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    last = await downloadSnapshotOnce(snapshotId);
    if (last.length > 0 || expected <= 0) return last;
    log().warn(
      { snapshotId, attempt, attempts, expectedSize: expected },
      'Bright Data download empty while dataset_size > 0 — retrying'
    );
    await sleep(1500 * attempt);
  }
  return last;
}

async function brightDataFilter(filter: unknown): Promise<{
  records: Record<string, unknown>[];
  snapshotId: string | null;
  total: number;
}> {
  const started = await startDatasetFilter(filter);
  if (started.empty || !started.snapshotId) {
    return { records: [], snapshotId: null, total: 0 };
  }
  const meta = await waitForSnapshot(started.snapshotId);
  const records = await downloadSnapshot(started.snapshotId, {
    expectedSize: meta.datasetSize,
  });
  return {
    records,
    snapshotId: started.snapshotId,
    total: records.length,
  };
}

function docsFromRecords(sessionId: string, records: Record<string, unknown>[], offset = 0) {
  return records.map((record, index) =>
    mapBrightDataRecordToFjDoc(record, sessionId, offset + index)
  );
}

async function ensureSnapshotStarted(
  sessionId: string,
  filter: unknown
): Promise<{ snapshotId: string | null; empty: boolean; deferred: boolean }> {
  try {
    const started = await startDatasetFilter(filter);
    return { ...started, deferred: false };
  } catch (error) {
    if (!isAbortTimeoutError(error)) throw error;
    log().warn(
      { err: error, sessionId },
      'Bright Data filter start timed out — deferring snapshot accept to poll'
    );
    return { snapshotId: null, empty: false, deferred: true };
  }
}

async function startSearchIntoSession(
  sessionId: string,
  payload: Record<string, unknown>,
  replace: boolean
): Promise<{ pending: boolean; total: number }> {
  const filter = filterFromFutureJobsPayload(payload);
  if (!filter) {
    throw AppError.badRequest('Add a title, location, company, or prompt before searching.');
  }

  if (useDevReadyOnSecondPoll()) {
    console.log(
      `[brightdata] dev mode — skip live filter API; fixture ready on poll 2 session=${sessionId}`
    );
    await persistSession(
      sessionId,
      {
        filter,
        records: [],
        snapshotId: 'snap_dev_fixture',
        snapshotStatus: 'building',
        total: 0,
      },
      replace
    );
    return { pending: true, total: 0 };
  }

  const started = await ensureSnapshotStarted(sessionId, filter);
  if (started.deferred) {
    await persistSession(
      sessionId,
      {
        filter,
        records: [],
        snapshotId: null,
        snapshotStatus: 'starting',
        total: 0,
      },
      replace
    );
    return { pending: true, total: 0 };
  }
  if (started.empty || !started.snapshotId) {
    await persistSession(
      sessionId,
      {
        filter,
        records: [],
        snapshotId: null,
        snapshotStatus: 'empty',
        total: 0,
      },
      replace
    );
    return { pending: false, total: 0 };
  }

  await persistSession(
    sessionId,
    {
      filter,
      records: [],
      snapshotId: started.snapshotId,
      snapshotStatus: 'building',
      total: 0,
    },
    replace
  );
  return { pending: true, total: 0 };
}

async function hydrateSnapshotRecords(sessionId: string) {
  const stored = await BrightDataSearchSessionModel.findOne({ sessionId });
  if (!stored) {
    throw AppError.notFound('Bright Data search session not found');
  }
  let currentStatus = String(stored.snapshotStatus ?? '').toLowerCase();
  const existingRecords = Array.isArray(stored.records) ? stored.records.length : 0;
  // Ready + zero profiles usually means a prior empty/aborted download — reopen for retry.
  // True empties are stored as snapshotStatus "empty", not "ready".
  if (currentStatus === 'ready' && existingRecords === 0 && stored.snapshotId) {
    stored.snapshotStatus = 'building';
    await stored.save();
    currentStatus = 'building';
  }
  if (currentStatus === 'starting' && !stored.snapshotId && stored.filter) {
    const started = await ensureSnapshotStarted(sessionId, stored.filter);
    if (started.deferred) {
      return stored;
    }
    if (started.empty || !started.snapshotId) {
      stored.snapshotStatus = 'empty';
      stored.snapshotId = null;
      stored.total = 0;
      await stored.save();
      return stored;
    }
    stored.snapshotId = started.snapshotId;
    stored.snapshotStatus = 'building';
    await stored.save();
    currentStatus = 'building';
  }
  if (!isSnapshotPendingStatus(currentStatus) || !stored.snapshotId) {
    return stored;
  }

  const meta = await getSnapshotMeta(stored.snapshotId);
  if (meta.status === 'building') {
    console.log('[brightdata] snapshot poll\n' + JSON.stringify(meta.raw, null, 2));
  }
  if (isSnapshotPendingStatus(meta.status)) {
    stored.snapshotStatus = meta.status;
    await stored.save();
    return stored;
  }
  if (meta.status === 'failed') {
    stored.snapshotStatus = 'failed';
    await stored.save();
    throw new AppError(
      502,
      'BRIGHTDATA_UPSTREAM_ERROR',
      meta.error || 'Bright Data filter snapshot failed.'
    );
  }
  if (meta.status !== 'ready') {
    stored.snapshotStatus = meta.status || 'building';
    await stored.save();
    return stored;
  }

  console.log('[brightdata] snapshot ready\n' + JSON.stringify(meta.raw, null, 2));
  const records = await downloadSnapshot(meta.id || stored.snapshotId, {
    expectedSize: meta.datasetSize,
  });
  console.log(
    `[brightdata] snapshot downloaded records=${records.length} dataset_size=${meta.datasetSize}`
  );
  // Meta can flip to ready before the download body is available. Do not mark the
  // Huntlo session ready with an inflated total and zero profiles.
  if (records.length === 0 && meta.datasetSize > 0) {
    stored.snapshotStatus = 'building';
    await stored.save();
    return stored;
  }
  if (records[0] && typeof records[0] === 'object') {
    console.log(
      '[brightdata] first profile\n' +
        JSON.stringify(
          {
            name: records[0].name,
            position: records[0].position,
            city: records[0].city,
            url: records[0].url,
          },
          null,
          2
        )
    );
  }
  const docs = docsFromRecords(sessionId, records);
  await persistSession(
    sessionId,
    {
      filter: stored.filter,
      records: docs,
      snapshotId: stored.snapshotId,
      snapshotStatus: records.length === 0 ? 'empty' : 'ready',
      // Prefer actual downloaded rows — never advertise dataset_size without profiles.
      total: docs.length,
    },
    true
  );
  return BrightDataSearchSessionModel.findOne({ sessionId });
}

async function persistSession(
  sessionId: string,
  fields: {
    filter: unknown;
    records: unknown[];
    snapshotId: string | null;
    snapshotStatus: string;
    total: number;
  },
  replace: boolean
) {
  const update = {
    sessionId,
    filter: fields.filter,
    records: fields.records,
    snapshotId: fields.snapshotId,
    snapshotStatus: fields.snapshotStatus,
    searchAfter: null,
    total: fields.total,
    hasMore: false,
    pageSize: FILTER_RECORDS_LIMIT,
  };
  if (replace) {
    await BrightDataSearchSessionModel.findOneAndUpdate({ sessionId }, { $set: update }, {
      upsert: true,
    });
    return;
  }
  await BrightDataSearchSessionModel.create(update);
}

export function createLiveBrightDataSearchProvider(): FutureJobsProvider {
  return {
    async createSourcingSession(body) {
      const sessionId = `bd_${randomUUID().replace(/-/g, '').slice(0, 24)}`;
      const started = await startSearchIntoSession(sessionId, body, false);
      if (started.pending) {
        return pending<FutureJobsCreateSessionData>(
          {
            session: {
              _id: sessionId,
              expectedProfileCount: 0,
              profileMatchingStatus: 'building',
            },
          },
          'Finding candidates — matching profiles in progress.'
        );
      }
      return ok<FutureJobsCreateSessionData>({
        session: {
          _id: sessionId,
          expectedProfileCount: started.total,
          profileMatchingStatus: 'completed',
        },
      });
    },

    async updateSourcingSession(sessionId, body) {
      const started = await startSearchIntoSession(sessionId, body, true);
      if (started.pending) {
        return pending(
          {
            session: {
              _id: sessionId,
              expectedProfileCount: 0,
              profileMatchingStatus: 'building',
            },
          },
          'Finding candidates — matching profiles in progress.'
        );
      }
      return ok({ session: { _id: sessionId, expectedProfileCount: started.total } });
    },

    async getSourcingSessionProfiles(sessionId, opts?: GetProfilesOptions) {
      const page = opts?.page ?? 1;
      const limit = opts?.limit ?? 20;

      if (useDevReadyOnSecondPoll()) {
        const poll = nextDevProfilePoll(sessionId);
        console.log(
          `[brightdata] profiles poll=${poll} session=${sessionId} (ready on poll 2 in non-production)`
        );
        if (poll < 2) {
          return pending<FutureJobsProfilesPage>(
            {
              docs: [],
              totalDocs: 0,
              page,
              limit,
              hasNextPage: false,
            },
            'Finding candidates — matching profiles in progress.'
          );
        }
        await persistSecondPollFixture(sessionId);
        const fixture = await BrightDataSearchSessionModel.findOne({ sessionId });
        const docs = (fixture?.records ?? []) as FutureJobsProfileDoc[];
        return ok<FutureJobsProfilesPage>({
          docs: docs.slice(0, limit),
          totalDocs: docs.length,
          page,
          limit,
          hasNextPage: docs.length > limit,
        });
      }

      const stored = await hydrateSnapshotRecords(sessionId);
      if (!stored) {
        throw AppError.notFound('Bright Data search session not found');
      }
      // Snapshot id present but not ready yet — never return an empty "success"
      // page or the poller will finalize completed with 0 candidates.
      if (
        stored.snapshotId &&
        !isSnapshotReadyStatus(stored.snapshotStatus) &&
        !isSnapshotFailedStatus(stored.snapshotStatus) &&
        String(stored.snapshotStatus ?? '').toLowerCase() !== 'empty'
      ) {
        return pending<FutureJobsProfilesPage>(
          {
            docs: [],
            totalDocs: 0,
            page,
            limit,
            hasNextPage: false,
          },
          'Finding candidates — matching profiles in progress.'
        );
      }
      if (isSnapshotPendingStatus(stored.snapshotStatus)) {
        return pending<FutureJobsProfilesPage>(
          {
            docs: [],
            totalDocs: 0,
            page,
            limit,
            hasNextPage: false,
          },
          'Finding candidates — matching profiles in progress.'
        );
      }
      if (isSnapshotFailedStatus(stored.snapshotStatus)) {
        throw new AppError(
          502,
          'BRIGHTDATA_UPSTREAM_ERROR',
          'Bright Data filter snapshot failed.'
        );
      }
      const docs = (stored.records ?? []) as FutureJobsProfileDoc[];
      const start = (page - 1) * limit;
      return ok<FutureJobsProfilesPage>({
        docs: docs.slice(start, start + limit),
        totalDocs: stored.total || docs.length,
        page,
        limit,
        hasNextPage: Boolean(stored.hasMore) || start + limit < docs.length,
      });
    },

    async getSourcingSessionProfilesWhenReady(
      sessionId: string,
      opts?: ProfilesWhenReadyOptions
    ) {
      return this.getSourcingSessionProfiles(sessionId, opts);
    },

    async fetchMoreSourcingSession() {
      return ok({ fetched: false, message: 'Bright Data Filter snapshots are downloaded in one pass.' });
    },

    async getSourcingSessionCandidateDetails() {
      throw AppError.notFound('Bright Data candidate details are not used for search');
    },
    async revealSourcingSessionContact() {
      throw AppError.forbidden('Contact reveal stays on Future Jobs');
    },
    async scoutPeopleRevealContact() {
      throw AppError.forbidden('People Scout stays on Future Jobs');
    },
    async scoutPeopleLookup() {
      throw AppError.forbidden('People Scout stays on Future Jobs');
    },
    async getSourcingSessionAnnotation(body) {
      return ok(annotationFromPrompt(body.userText));
    },
    async getFilterAutocomplete(_params: FilterAutocompleteParams, _opts?: FutureJobsRequestOpts) {
      return ok({ suggestions: [] });
    },
    async previewSourcingSession() {
      return ok<FutureJobsPreviewData>({
        status: 'pending',
        count: 0,
        exactCount: 0,
      });
    },
    isFjSessionPending(data) {
      if (!data || typeof data !== 'object') return false;
      return Number((data as { statusCode?: unknown }).statusCode) === 207;
    },
    fjSessionPendingMessage(data) {
      const obj = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
      return typeof obj.message === 'string' && obj.message.trim()
        ? obj.message.trim()
        : 'Finding candidates — matching profiles in progress.';
    },
  };
}

export async function fetchBrightDataDatasetMetadata(): Promise<unknown> {
  const { apiKey, baseUrl, timeoutMs } = requireApiKey();
  const url = `${baseUrl}/datasets/${BRIGHTDATA_PEOPLE_DATASET_ID}/metadata`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(timeoutMs),
  });
  const json = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    log().warn({ status: response.status, body: json }, 'Bright Data metadata failed');
    throw new AppError(
      502,
      'BRIGHTDATA_UPSTREAM_ERROR',
      'Bright Data dataset metadata is temporarily unavailable.'
    );
  }
  return json;
}
