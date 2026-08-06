/**
 * Zwayam Amplify REST client.
 * Docs: https://developers.zwayam.com/amplify/zwayam-amplify
 * Auth: api_key (query + header). Base: https://api.zwayam.com/amplify/
 */

import { getEnv } from '../../config/env.js';

export type AmplifyJob = {
  id: string;
  title: string;
  status: string | null;
  jobBoard: string | null;
  location: string | null;
  raw: Record<string, unknown>;
};

export type AmplifyApplication = {
  id: string;
  jobId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  headline: string | null;
  currentTitle: string | null;
  currentCompany: string | null;
  location: string | null;
  experienceYears: number | null;
  resumeUrl: string | null;
  stage: string | null;
  raw: Record<string, unknown>;
};

export type AmplifyListJobsResult = {
  jobs: AmplifyJob[];
  page: number;
  pageSize: number;
  total: number | null;
};

export type AmplifyListApplicationsResult = {
  applications: AmplifyApplication[];
  page: number;
  pageSize: number;
  total: number | null;
};

function amplifyBaseUrl(): string {
  const env = getEnv();
  const configured = String(env.ZWAYAM_AMPLIFY_BASE_URL || '').trim();
  if (configured) return configured.replace(/\/$/, '');
  return env.APP_ENV === 'production'
    ? 'https://api.zwayam.com/amplify'
    : 'https://apipreprod1.zwayam.com/amplify';
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(obj: Record<string, unknown> | null, keys: string[]): string | null {
  if (!obj) return null;
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return null;
}

function pickNumber(obj: Record<string, unknown> | null, keys: string[]): number | null {
  if (!obj) return null;
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const n = Number(value);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

function unwrapList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const root = asRecord(payload);
  if (!root) return [];
  for (const key of [
    'data',
    'jobs',
    'jobList',
    'items',
    'results',
    'content',
    'applies',
    'applications',
    'applyList',
  ]) {
    const nested = root[key];
    if (Array.isArray(nested)) return nested;
    const nestedObj = asRecord(nested);
    if (nestedObj) {
      for (const inner of ['data', 'jobs', 'items', 'results', 'content', 'applies', 'applications']) {
        if (Array.isArray(nestedObj[inner])) return nestedObj[inner] as unknown[];
      }
    }
  }
  return [];
}

function unwrapTotal(payload: unknown): number | null {
  const root = asRecord(payload);
  if (!root) return null;
  for (const key of ['total', 'totalCount', 'totalElements', 'count']) {
    const n = pickNumber(root, [key]);
    if (n != null) return n;
  }
  const nested = asRecord(root.data) || asRecord(root.pagination) || asRecord(root.meta);
  if (nested) {
    for (const key of ['total', 'totalCount', 'totalElements', 'count']) {
      const n = pickNumber(nested, [key]);
      if (n != null) return n;
    }
  }
  return null;
}

function mapJob(raw: unknown): AmplifyJob | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = pickString(row, ['jobId', 'id', 'job_id', 'uuid']);
  if (!id) return null;
  const title =
    pickString(row, ['jobTitle', 'title', 'jobName', 'name', 'designation']) || 'Untitled job';
  return {
    id,
    title,
    status: pickString(row, ['status', 'jobStatus', 'state']),
    jobBoard: pickString(row, ['jobBoard', 'job_board', 'board', 'portal']),
    location: pickString(row, ['location', 'jobLocation', 'city']),
    raw: row,
  };
}

function mapApplication(raw: unknown, fallbackJobId?: string): AmplifyApplication | null {
  const row = asRecord(raw);
  if (!row) return null;
  const applicant =
    asRecord(row.applicant) ||
    asRecord(row.candidate) ||
    asRecord(row.profile) ||
    asRecord(row.apply) ||
    row;

  const id = pickString(row, ['applyId', 'applicationId', 'id', 'apply_id', 'application_id']);
  if (!id) return null;

  const first = pickString(applicant, ['firstName', 'first_name']);
  const last = pickString(applicant, ['lastName', 'last_name']);
  const combined = [first, last].filter(Boolean).join(' ').trim();
  const name =
    pickString(applicant, ['name', 'fullName', 'applicantName', 'candidateName', 'full_name']) ||
    combined ||
    'Unknown applicant';

  const experience =
    pickNumber(applicant, [
      'experienceYears',
      'experience',
      'totalExperience',
      'totalExp',
      'workExperience',
    ]) ?? pickNumber(row, ['experienceYears', 'experience', 'totalExperience']);

  return {
    id,
    jobId:
      pickString(row, ['jobId', 'job_id']) ||
      pickString(applicant, ['jobId', 'job_id']) ||
      fallbackJobId ||
      null,
    name,
    email: pickString(applicant, ['email', 'emailId', 'emailAddress', 'mailId']),
    phone: pickString(applicant, [
      'phone',
      'mobile',
      'mobileNumber',
      'phoneNumber',
      'contactNumber',
    ]),
    headline: pickString(applicant, ['headline', 'summary', 'profileHeadline']),
    currentTitle: pickString(applicant, [
      'currentTitle',
      'currentDesignation',
      'designation',
      'jobTitle',
      'title',
      'role',
    ]),
    currentCompany: pickString(applicant, [
      'currentCompany',
      'company',
      'companyName',
      'organization',
    ]),
    location: pickString(applicant, ['location', 'city', 'currentLocation']),
    experienceYears: experience,
    resumeUrl: pickString(row, ['resumeUrl', 'resume_url', 'resumeLink']) ||
      pickString(applicant, ['resumeUrl', 'resume_url', 'resumeLink']),
    stage: pickString(row, ['stage', 'status', 'applicantStage', 'applyStatus']),
    raw: row,
  };
}

async function amplifyRequest(
  apiKey: string,
  path: string,
  query: Record<string, string | number | undefined> = {}
): Promise<unknown> {
  const key = String(apiKey || '').trim();
  if (!key) {
    throw Object.assign(new Error('Zwayam Amplify API key is required.'), { statusCode: 400 });
  }

  const url = new URL(`${amplifyBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`);
  url.searchParams.set('api_key', key);
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue;
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      api_key: key,
    },
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      (typeof data.message === 'string' && data.message) ||
      (typeof data.error === 'string' && data.error) ||
      (typeof data.title === 'string' && data.title) ||
      (res.status === 401 || res.status === 403
        ? 'Invalid Zwayam Amplify API key.'
        : 'Zwayam Amplify request failed.');
    throw Object.assign(new Error(msg), {
      statusCode: res.status === 401 || res.status === 403 ? 401 : res.status >= 500 ? 502 : 400,
    });
  }
  return data;
}

export async function verifyAmplifyApiKey(apiKey: string): Promise<{ ok: true; jobCount: number }> {
  const result = await listAmplifyJobs(apiKey, { page: 1, pageSize: 1 });
  return { ok: true, jobCount: result.total ?? result.jobs.length };
}

export async function listAmplifyJobs(
  apiKey: string,
  options: { page?: number; pageSize?: number; search?: string } = {}
): Promise<AmplifyListJobsResult> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 20));
  const data = await amplifyRequest(apiKey, '/v2/jobs', {
    page,
    pageSize,
    ...(options.search ? { search: options.search } : {}),
  });
  const jobs = unwrapList(data)
    .map(mapJob)
    .filter((row): row is AmplifyJob => Boolean(row));
  return {
    jobs,
    page,
    pageSize,
    total: unwrapTotal(data),
  };
}

export async function listAmplifyApplicationsForJob(
  apiKey: string,
  jobId: string,
  options: { page?: number; pageSize?: number } = {}
): Promise<AmplifyListApplicationsResult> {
  const id = String(jobId || '').trim();
  if (!id) {
    throw Object.assign(new Error('Amplify job id is required.'), { statusCode: 400 });
  }
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 50));
  const data = await amplifyRequest(apiKey, `/v2/jobs/${encodeURIComponent(id)}/applies`, {
    page,
    pageSize,
  });
  const applications = unwrapList(data)
    .map((row) => mapApplication(row, id))
    .filter((row): row is AmplifyApplication => Boolean(row));
  return {
    applications,
    page,
    pageSize,
    total: unwrapTotal(data),
  };
}

export async function getAmplifyApplication(
  apiKey: string,
  applyId: string
): Promise<AmplifyApplication | null> {
  const id = String(applyId || '').trim();
  if (!id) return null;
  const data = await amplifyRequest(apiKey, `/v2/applies/${encodeURIComponent(id)}`);
  const root = asRecord(data);
  const nested = root?.data ?? root?.apply ?? root?.application ?? data;
  return mapApplication(nested);
}
