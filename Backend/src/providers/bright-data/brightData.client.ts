import { createChildLogger } from '../../config/logger.js';
import { getBrightDataConfig } from './brightData.auth.js';
import {
  contactsFromBrightDataProfile,
  profileNeedsBrightDataEnrichment,
} from './brightData.mapper.js';
import type {
  BrightDataContactLookup,
  BrightDataFilter,
  BrightDataLinkedInProfile,
  BrightDataProgressResponse,
  BrightDataProvider,
  BrightDataSearchParams,
  BrightDataSnapshotStatus,
  BrightDataTriggerResponse,
} from './brightData.types.js';

const log = () => createChildLogger({ provider: 'bright-data' });

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function parseSnapshotRecords(data: unknown): BrightDataLinkedInProfile[] {
  if (Array.isArray(data)) return data as BrightDataLinkedInProfile[];
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: BrightDataLinkedInProfile[] }).data;
  }
  if (typeof data === 'string' && data.trim()) {
    const trimmed = data.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (Array.isArray(parsed)) return parsed as BrightDataLinkedInProfile[];
      } catch {
        // fall through to ndjson
      }
    }
    const rows: BrightDataLinkedInProfile[] = [];
    for (const line of trimmed.split('\n')) {
      if (!line.trim()) continue;
      try {
        rows.push(JSON.parse(line) as BrightDataLinkedInProfile);
      } catch {
        // skip malformed lines
      }
    }
    return rows;
  }
  return [];
}

function profileUrlKey(profile: BrightDataLinkedInProfile): string {
  const raw =
    (typeof profile.url === 'string' && profile.url) ||
    (typeof profile.linkedin_url === 'string' && profile.linkedin_url) ||
    (typeof profile.input_url === 'string' && profile.input_url) ||
    '';
  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '')
    .split('?')[0];
  if (normalized) return normalized;
  return String(profile.linkedin_id || profile.id || '')
    .trim()
    .toLowerCase();
}

function richerText(left: unknown, right: unknown): string | undefined {
  const a = typeof left === 'string' ? left.trim() : '';
  const b = typeof right === 'string' ? right.trim() : '';
  if (b.length > a.length) return typeof right === 'string' ? right : undefined;
  if (a.length > 0) return typeof left === 'string' ? left : undefined;
  if (typeof right === 'string') return right;
  if (typeof left === 'string') return left;
  return undefined;
}

function richerArray(left: unknown, right: unknown): unknown {
  const a = Array.isArray(left) ? left.length : 0;
  const b = Array.isArray(right) ? right.length : 0;
  if (b > a) return right;
  if (a > 0) return left;
  return right ?? left;
}

function mergeEnrichedProfiles(
  discovered: BrightDataLinkedInProfile[],
  collected: BrightDataLinkedInProfile[]
): BrightDataLinkedInProfile[] {
  const byKey = new Map<string, BrightDataLinkedInProfile>();
  for (const row of collected) {
    if (row?.error || row?.warning) continue;
    const key = profileUrlKey(row);
    if (key) byKey.set(key, row);
  }
  return discovered.map((row) => {
    const key = profileUrlKey(row);
    const full = key ? byKey.get(key) : undefined;
    if (!full) return row;
    const merged: BrightDataLinkedInProfile = { ...row, ...full };
    merged.about = richerText(row.about, full.about);
    merged.about_html = richerText(row.about_html, full.about_html);
    merged.bio = richerText(row.bio, full.bio);
    merged.summary = richerText(row.summary, full.summary);
    merged.experience = richerArray(row.experience, full.experience) as BrightDataLinkedInProfile['experience'];
    merged.experiences = richerArray(row.experiences, full.experiences) as BrightDataLinkedInProfile['experiences'];
    merged.skills = richerArray(row.skills, full.skills) as BrightDataLinkedInProfile['skills'];
    merged.education = richerArray(row.education, full.education) as BrightDataLinkedInProfile['education'];
    return merged;
  });
}

function linkedinSearchNeedle(linkedinUrl: string): string {
  const trimmed = linkedinUrl.trim();
  const match = trimmed.match(/linkedin\.com\/in\/([^/?#]+)/i);
  if (match?.[1]) {
    try {
      return `/in/${decodeURIComponent(match[1]).replace(/\/+$/, '')}`;
    } catch {
      return `/in/${match[1].replace(/\/+$/, '')}`;
    }
  }
  return trimmed;
}

function hitsFromSearchResponse(data: unknown): BrightDataLinkedInProfile[] {
  if (!data || typeof data !== 'object') return [];
  const hits = (data as { hits?: unknown }).hits;
  if (Array.isArray(hits)) return hits as BrightDataLinkedInProfile[];
  if (Array.isArray(data)) return data as BrightDataLinkedInProfile[];
  return [];
}

class BrightDataUpstreamError extends Error {
  code = 'BRIGHTDATA_UPSTREAM_ERROR';
  constructor(message: string) {
    super(message);
    this.name = 'BrightDataUpstreamError';
  }
}

/**
 * Bright Data's `/datasets/filter` rejects any logical group with more than
 * 4 rules ("Filter logical groups can have a maximum of 4 rules"). Future
 * Jobs regularly expands a title into 5-8 variants, so the OR group built
 * below must be capped here — independent of whatever the caller passes in.
 */
const MAX_OR_FILTER_RULES = 4;

/**
 * Build the `filter` body for `POST /datasets/filter` from our search params.
 * Combines a title/keyword `includes` match on `position` with an optional
 * `includes` match on `city`, ANDed together when both are present.
 *
 * When multiple title variants are supplied (e.g. Future Jobs' expanded
 * title list), they're OR'd together — concatenating them into one comma
 * joined string and running a single `includes` match would require that
 * exact literal string to appear in someone's LinkedIn `position` field,
 * which never happens and silently zeroes out every fallback search.
 */
function buildFilter(params: BrightDataSearchParams): BrightDataFilter {
  const conditions: BrightDataFilter[] = [];
  const titleVariants = (params.titles ?? [])
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, MAX_OR_FILTER_RULES);

  if (titleVariants.length > 1) {
    conditions.push({
      operator: 'or',
      filters: titleVariants.map((value) => ({
        name: 'position',
        operator: 'includes' as const,
        value,
      })),
    });
  } else {
    const titleOrKeyword = (titleVariants[0] || params.title || params.keyword || '').trim();
    if (titleOrKeyword) {
      conditions.push({ name: 'position', operator: 'includes', value: titleOrKeyword });
    }
  }

  if (params.location) {
    conditions.push({ name: 'city', operator: 'includes', value: params.location });
  }

  const [first, ...rest] = conditions;
  if (!first) {
    // Filter is required — fall back to a near-universal match on `name`.
    return { name: 'name', operator: 'includes', value: '' };
  }
  if (rest.length === 0) return first;
  return { operator: 'and', filters: conditions };
}

/** Map the Marketplace Dataset API's real snapshot status to ours. */
function normalizeSnapshotStatus(status: string | undefined): BrightDataSnapshotStatus {
  switch (status) {
    case 'scheduled':
    case 'building':
    case 'ready':
    case 'failed':
      return status;
    default:
      return 'running';
  }
}

/**
 * Live Bright Data Marketplace Dataset API client — filters the "LinkedIn
 * people profiles" dataset (or whichever dataset id is configured) by
 * title/location and downloads the resulting snapshot.
 * See: https://docs.brightdata.com/api-reference/marketplace-dataset-api
 */
export function createLiveBrightDataProvider(): BrightDataProvider {
  const request = async <T>(
    path: string,
    init: RequestInit & { query?: Record<string, string | undefined> } = {}
  ): Promise<T> => {
    const { apiKey, baseUrl, timeoutMs } = getBrightDataConfig();
    if (!apiKey) {
      throw new BrightDataUpstreamError('Bright Data API key is not configured');
    }

    const url = new URL(`${baseUrl}${path}`);
    for (const [key, value] of Object.entries(init.query ?? {})) {
      if (value !== undefined && value !== '') url.searchParams.set(key, value);
    }

    const res = await fetchWithTimeout(
      url.toString(),
      {
        method: init.method ?? 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...(init.headers as Record<string, string> | undefined),
        },
        body: init.body,
      },
      timeoutMs
    ).catch((err) => {
      throw new BrightDataUpstreamError(
        `Bright Data request failed: ${err instanceof Error ? err.message : String(err)}`
      );
    });

    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    if (!res.ok) {
      log().warn(
        { status: res.status, path, body: typeof parsed === 'string' ? parsed.slice(0, 300) : parsed },
        'bright data upstream error'
      );
      throw new BrightDataUpstreamError(
        `Bright Data ${path} responded ${res.status}`
      );
    }

    return parsed as T;
  };

  const triggerPeopleSearch = async (params: BrightDataSearchParams): Promise<string> => {
    const { linkedinDatasetId, maxResults } = getBrightDataConfig();
    if (!linkedinDatasetId) {
      throw new BrightDataUpstreamError('BRIGHTDATA_LINKEDIN_DATASET_ID is not configured');
    }

    const data = await request<BrightDataTriggerResponse>('/datasets/filter', {
      method: 'POST',
      body: JSON.stringify({
        dataset_id: linkedinDatasetId,
        records_limit: maxResults,
        filter: buildFilter(params),
      }),
    });

    if (!data?.snapshot_id) {
      throw new BrightDataUpstreamError('Bright Data filter did not return a snapshot_id');
    }
    return data.snapshot_id;
  };

  const getSnapshotStatus = async (snapshotId: string): Promise<BrightDataSnapshotStatus> => {
    const data = await request<BrightDataProgressResponse>(
      `/datasets/snapshots/${encodeURIComponent(snapshotId)}`
    );
    if (data?.error) {
      throw new BrightDataUpstreamError(`Bright Data snapshot error: ${data.error}`);
    }
    const status = normalizeSnapshotStatus(data?.status);
    if (status === 'failed' || status === 'canceled') {
      // The `failed`/`canceled` branch below only logs the bare status — dump
      // the full raw response here so a real cause (quota, dataset access,
      // rejected filter, etc.) isn't indistinguishable from "no matches".
      log().warn(
        { snapshotId, rawStatus: data?.status, raw: data },
        'bright data snapshot status response (non-ready)'
      );
    }
    return status;
  };

  const getSnapshotResults = async (
    snapshotId: string
  ): Promise<BrightDataLinkedInProfile[]> => {
    const data = await request<unknown>(
      `/datasets/snapshots/${encodeURIComponent(snapshotId)}/download`,
      { query: { format: 'json' } }
    );
    return parseSnapshotRecords(data);
  };

  const waitForSnapshot = async (
    snapshotId: string,
    deadline: number,
    intervalMs: number
  ): Promise<BrightDataLinkedInProfile[] | null> => {
    while (Date.now() < deadline) {
      let status: BrightDataSnapshotStatus;
      try {
        status = await getSnapshotStatus(snapshotId);
      } catch (err) {
        log().warn({ err, snapshotId }, 'bright data progress poll failed');
        return null;
      }

      if (status === 'ready') {
        try {
          return await getSnapshotResults(snapshotId);
        } catch (err) {
          log().warn({ err, snapshotId }, 'bright data snapshot download failed');
          return null;
        }
      }
      if (status === 'failed' || status === 'canceled') {
        log().warn({ snapshotId, status }, 'bright data snapshot did not complete');
        return null;
      }
      await sleep(intervalMs);
    }
    log().warn({ snapshotId }, 'bright data snapshot timed out');
    return null;
  };

  const collectProfilesByUrl = async (
    urls: string[],
    opts: { maxWaitMs: number; intervalMs: number }
  ): Promise<BrightDataLinkedInProfile[]> => {
    const { linkedinDatasetId, maxResults } = getBrightDataConfig();
    const unique = [...new Set(urls.map((url) => url.trim()).filter(Boolean))].slice(
      0,
      maxResults
    );
    if (!unique.length) return [];

    let data: BrightDataTriggerResponse;
    try {
      data = await request<BrightDataTriggerResponse>('/datasets/v3/trigger', {
        method: 'POST',
        query: {
          dataset_id: linkedinDatasetId,
          include_errors: 'true',
        },
        body: JSON.stringify(unique.map((url) => ({ url }))),
      });
    } catch (err) {
      log().warn(
        { err, urlCount: unique.length },
        'bright data collect-by-url trigger failed'
      );
      return [];
    }

    const snapshotId = data?.snapshot_id;
    if (!snapshotId) {
      log().warn(
        { raw: data, urlCount: unique.length },
        'bright data collect-by-url did not return a snapshot_id'
      );
      return [];
    }

    log().info(
      { snapshotId, urlCount: unique.length },
      'bright data collect-by-url snapshot started'
    );
    const collected = await waitForSnapshot(
      snapshotId,
      Date.now() + opts.maxWaitMs,
      opts.intervalMs
    );
    return collected ?? [];
  };

  const enrichThinProfiles = async (
    discovered: BrightDataLinkedInProfile[],
    opts: { maxWaitMs: number; intervalMs: number }
  ): Promise<BrightDataLinkedInProfile[]> => {
    const thin = discovered.filter((row) => profileNeedsBrightDataEnrichment(row));
    if (thin.length === 0) return discovered;

    const urls = thin
      .map((row) => {
        const url =
          (typeof row.url === 'string' && row.url.trim()) ||
          (typeof row.linkedin_url === 'string' && row.linkedin_url.trim()) ||
          (typeof row.input_url === 'string' && row.input_url.trim()) ||
          '';
        return url;
      })
      .filter(Boolean);

    if (urls.length === 0) return discovered;

    log().info(
      { thinCount: thin.length, urlCount: urls.length },
      'bright data enriching discovery rows via collect-by-url'
    );
    const collected = await collectProfilesByUrl(urls, opts);
    if (collected.length === 0) return discovered;
    const merged = mergeEnrichedProfiles(discovered, collected);
    log().info(
      {
        discoveredCount: discovered.length,
        collectedCount: collected.length,
        stillThin: merged.filter((row) => profileNeedsBrightDataEnrichment(row)).length,
      },
      'bright data collect-by-url merge complete'
    );
    return merged;
  };

  const searchAndWait: BrightDataProvider['searchAndWait'] = async (params, opts) => {
    const maxWaitMs = opts?.maxWaitMs ?? 120_000;
    const enrichMaxWaitMs = opts?.enrichMaxWaitMs ?? maxWaitMs;
    const intervalMs = opts?.intervalMs ?? 5_000;
    const deadline = Date.now() + maxWaitMs;

    let snapshotId: string;
    try {
      snapshotId = await triggerPeopleSearch(params);
    } catch (err) {
      log().warn({ err }, 'bright data trigger failed');
      return [];
    }

    const discovered = await waitForSnapshot(snapshotId, deadline, intervalMs);
    if (!discovered || discovered.length === 0) return [];

    try {
      return await enrichThinProfiles(discovered, {
        maxWaitMs: enrichMaxWaitMs,
        intervalMs,
      });
    } catch (err) {
      log().warn({ err }, 'bright data collect-by-url enrichment failed');
      return discovered;
    }
  };

  const lookupContactsByLinkedinUrl = async (
    linkedinUrl: string
  ): Promise<BrightDataContactLookup> => {
    const empty: BrightDataContactLookup = { emails: [], phones: [] };
    const raw = String(linkedinUrl || '').trim();
    if (!raw) return empty;

    const { apiKey, baseUrl, timeoutMs, contactDatasetId } = getBrightDataConfig();
    if (!apiKey || !contactDatasetId) {
      log().warn('bright data contact lookup skipped — missing api key or dataset id');
      return empty;
    }

    const needle = linkedinSearchNeedle(raw);
    const url = `${baseUrl}/datasets/search/${encodeURIComponent(contactDatasetId)}`;

    try {
      const res = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            size: 1,
            filter: {
              name: 'url',
              operator: 'includes',
              value: needle,
            },
          }),
        },
        timeoutMs
      );

      // 422 = filter matched 0 records (not billed). Treat as a miss.
      if (res.status === 422) return empty;

      const text = await res.text();
      let parsed: unknown = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = text;
      }

      if (!res.ok) {
        log().warn(
          {
            status: res.status,
            body: typeof parsed === 'string' ? parsed.slice(0, 300) : parsed,
          },
          'bright data contact search error'
        );
        return empty;
      }

      const hits = hitsFromSearchResponse(parsed);
      for (const hit of hits) {
        const contacts = contactsFromBrightDataProfile(hit);
        if (contacts.emails.length > 0 || contacts.phones.length > 0) {
          log().info(
            {
              emailCount: contacts.emails.length,
              phoneCount: contacts.phones.length,
              needle,
            },
            'bright data contact lookup hit'
          );
          return contacts;
        }
      }
      return empty;
    } catch (err) {
      log().warn({ err, needle }, 'bright data contact lookup failed');
      return empty;
    }
  };

  return {
    triggerPeopleSearch,
    getSnapshotStatus,
    getSnapshotResults,
    searchAndWait,
    lookupContactsByLinkedinUrl,
  };
}
