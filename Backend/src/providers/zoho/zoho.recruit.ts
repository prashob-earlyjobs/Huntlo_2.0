import {
  getZohoDcConfig,
  normalizeZohoDataCenter,
  type ZohoDataCenter,
} from './zoho.oauth.js';

export type ZohoRecruitOrgSummary = {
  companyName: string | null;
  primaryEmail: string | null;
  type: string | null;
  planType: string | null;
};

export type ZohoRecruitJobOpening = {
  id: string;
  title: string;
  status: string | null;
  clientName: string | null;
  location: string | null;
};

export type ZohoRecruitCandidate = {
  id: string;
  jobId: string;
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
};

type RecruitListInfo = {
  per_page?: number;
  count?: number;
  page?: number;
  more_records?: boolean;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function lookupName(value: unknown): string | null {
  const obj = asRecord(value);
  return asString(obj?.name) || asString(value);
}

function joinName(first: string | null, last: string | null): string {
  return [first, last].filter(Boolean).join(' ').trim();
}

function recruitErrorMessage(body: Record<string, unknown>, status: number, fallback: string): string {
  return (
    asString(body.message) ||
    asString(body.code) ||
    asString(asRecord(body.data)?.message) ||
    `${fallback} (${status})`
  );
}

async function recruitGetJson(
  accessToken: string,
  path: string,
  dataCenter?: unknown,
  query?: Record<string, string | number | undefined>
): Promise<Record<string, unknown>> {
  const dc = getZohoDcConfig(dataCenter);
  const url = new URL(`https://${dc.recruitApiHost}/recruit/v2${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === '') continue;
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      Accept: 'application/json',
    },
  });

  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  // Zoho returns NO_CONTENT when a module/page has no rows — treat as empty success.
  if (
    res.status === 204 ||
    asString(body.code) === 'NO_CONTENT' ||
    (asString(body.status) === 'error' && /no content/i.test(asString(body.message) || ''))
  ) {
    return { data: [], info: { page: 1, per_page: 200, count: 0, more_records: false } };
  }
  if (!res.ok) {
    throw Object.assign(new Error(recruitErrorMessage(body, res.status, 'Zoho Recruit request failed')), {
      statusCode: res.status >= 500 ? 502 : 400,
    });
  }
  return body;
}

/**
 * GET /recruit/v2/org — validates Recruit OAuth token for connect/test.
 * Auth header uses Zoho-oauthtoken (Recruit API convention).
 */
export async function fetchZohoRecruitOrg(
  accessToken: string,
  dataCenter?: unknown
): Promise<ZohoRecruitOrgSummary> {
  const body = await recruitGetJson(accessToken, '/org', dataCenter);
  const orgList = Array.isArray(body.org) ? body.org : [];
  const org = asRecord(orgList[0]);
  const license = asRecord(org?.license_details);

  return {
    companyName: asString(org?.company_name),
    primaryEmail: asString(org?.primary_email)?.toLowerCase() ?? null,
    type: asString(org?.type),
    planType: asString(license?.plan_type),
  };
}

function mapJobOpening(raw: Record<string, unknown>): ZohoRecruitJobOpening | null {
  const id = asString(raw.id);
  if (!id) return null;
  const title =
    asString(raw.Job_Opening_Name) ||
    asString(raw.Posting_Title) ||
    asString(raw.Name) ||
    `Job ${id}`;
  const city = asString(raw.City);
  const state = asString(raw.State);
  const country = asString(raw.Country);
  const location =
    asString(raw.Location) ||
    [city, state, country].filter(Boolean).join(', ') ||
    null;

  return {
    id,
    title,
    status: asString(raw.Job_Opening_Status) || asString(raw.Status),
    clientName: lookupName(raw.Client_Name) || asString(raw.Account_Name),
    location,
  };
}

function mapCandidate(
  raw: Record<string, unknown>,
  jobId: string
): ZohoRecruitCandidate | null {
  const id = asString(raw.id);
  if (!id) return null;

  const first = asString(raw.First_Name);
  const last = asString(raw.Last_Name);
  const full =
    asString(raw.Full_Name) ||
    asString(raw.Candidate_Name) ||
    joinName(first, last) ||
    asString(raw.Email) ||
    `Candidate ${id}`;

  const currentTitle =
    asString(raw.Current_Job_Title) ||
    asString(raw.Title) ||
    asString(raw.Designation);
  const currentCompany =
    asString(raw.Current_Employer) ||
    asString(raw.Current_Company) ||
    lookupName(raw.Account_Name);
  const city = asString(raw.City);
  const state = asString(raw.State);
  const country = asString(raw.Country);
  const location =
    asString(raw.Location) ||
    [city, state, country].filter(Boolean).join(', ') ||
    null;

  const phone =
    asString(raw.Mobile) ||
    asString(raw.Phone) ||
    asString(raw.Secondary_Email) ||
    null;

  const experienceYears =
    asNumber(raw.Experience_in_Years) ??
    asNumber(raw.Experience_Years) ??
    asNumber(raw.Work_Experience);

  const resumeObj = asRecord(raw.$attachments) || asRecord(raw.Resume);
  const resumeUrl =
    asString(raw.Resume_Link) ||
    asString(raw.Resume_URL) ||
    asString(resumeObj?.download_Url) ||
    asString(resumeObj?.file_Url) ||
    null;

  return {
    id,
    jobId,
    name: full,
    email: asString(raw.Email)?.toLowerCase() ?? null,
    phone,
    headline: currentTitle || currentCompany,
    currentTitle,
    currentCompany,
    location,
    experienceYears,
    resumeUrl,
    // Job-associated lists expose Application_Status (pipeline). Candidate_Status
    // is the profile field and is often absent on /associate rows.
    stage:
      asString(raw.Application_Status) ||
      asString(raw.Candidate_Status) ||
      asString(raw.Status),
  };
}

/**
 * GET /recruit/v2/Job_Openings
 */
export async function listZohoRecruitJobOpenings(
  accessToken: string,
  dataCenter: unknown,
  query: { page?: number; pageSize?: number; search?: string } = {}
): Promise<{
  jobs: ZohoRecruitJobOpening[];
  page: number;
  pageSize: number;
  total: number | null;
}> {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(query.pageSize) || 50));
  const search = String(query.search || '').trim();

  const fields = [
    'id',
    'Job_Opening_Name',
    'Posting_Title',
    'Job_Opening_Status',
    'Client_Name',
    'City',
    'State',
    'Country',
    'Location',
  ].join(',');

  let body: Record<string, unknown>;
  if (search) {
    body = await recruitGetJson(accessToken, '/Job_Openings/search', dataCenter, {
      word: search,
      page,
      per_page: pageSize,
      fields,
    });
  } else {
    body = await recruitGetJson(accessToken, '/Job_Openings', dataCenter, {
      page,
      per_page: pageSize,
      fields,
      sort_by: 'Modified_Time',
      sort_order: 'desc',
    });
  }

  const rows = Array.isArray(body.data) ? body.data : [];
  const jobs = rows
    .map((row) => mapJobOpening(asRecord(row) || {}))
    .filter((job): job is ZohoRecruitJobOpening => Boolean(job));

  const info = asRecord(body.info) as RecruitListInfo | null;
  const count = asNumber(info?.count);
  const more = Boolean(info?.more_records);
  const total =
    count != null && !more
      ? (page - 1) * pageSize + count
      : count != null && more
        ? null
        : jobs.length;

  return { jobs, page, pageSize, total };
}

/**
 * GET /recruit/v2/Job_Openings/{jobId}/associate — candidates linked to a job opening.
 */
export async function listZohoRecruitCandidatesForJob(
  accessToken: string,
  dataCenter: unknown,
  jobId: string,
  query: { page?: number; pageSize?: number } = {}
): Promise<{
  candidates: ZohoRecruitCandidate[];
  page: number;
  pageSize: number;
  total: number | null;
}> {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(query.pageSize) || 50));
  const safeJobId = encodeURIComponent(String(jobId).trim());

  const body = await recruitGetJson(
    accessToken,
    `/Job_Openings/${safeJobId}/associate`,
    dataCenter,
    {
      page,
      per_page: pageSize,
    }
  );

  const rows = Array.isArray(body.data) ? body.data : [];
  const candidates = rows
    .map((row) => mapCandidate(asRecord(row) || {}, String(jobId)))
    .filter((c): c is ZohoRecruitCandidate => Boolean(c));

  const info = asRecord(body.info) as RecruitListInfo | null;
  const count = asNumber(info?.count);
  const more = Boolean(info?.more_records);
  const total =
    count != null && !more
      ? (page - 1) * pageSize + count
      : count != null && more
        ? null
        : candidates.length;

  return { candidates, page, pageSize, total };
}

export function recruitDataCenterLabel(dataCenter: ZohoDataCenter): string {
  return normalizeZohoDataCenter(dataCenter);
}

async function recruitWriteJson(
  accessToken: string,
  method: 'POST' | 'PUT',
  path: string,
  dataCenter: unknown,
  payload: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const dc = getZohoDcConfig(dataCenter);
  const url = `https://${dc.recruitApiHost}/recruit/v2${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw Object.assign(new Error(recruitErrorMessage(body, res.status, 'Zoho Recruit write failed')), {
      statusCode: res.status >= 500 ? 502 : 400,
    });
  }
  const rows = Array.isArray(body.data) ? body.data : [];
  const first = asRecord(Array.isArray(rows[0]) ? rows[0][0] : rows[0]);
  if (first && asString(first.status) === 'error') {
    throw Object.assign(
      new Error(asString(first.message) || asString(first.code) || 'Zoho Recruit write failed'),
      { statusCode: 400 }
    );
  }
  return body;
}

/**
 * PUT /recruit/v2/Candidates/status — change job-pipeline Application_Status
 * (and Candidate_Status when jobids are omitted). Zoho rejects POST on this path.
 * Then PUT /Candidates so the profile Candidate_Status stays in sync.
 */
export async function changeZohoRecruitCandidateStatus(
  accessToken: string,
  dataCenter: unknown,
  input: {
    candidateId: string;
    status: string;
    comments?: string;
    jobId?: string | null;
  }
): Promise<void> {
  const candidateId = String(input.candidateId || '').trim();
  const status = String(input.status || '').trim();
  if (!candidateId || !status) {
    throw Object.assign(new Error('candidateId and status are required'), { statusCode: 400 });
  }
  const row: Record<string, unknown> = {
    ids: [candidateId],
    Candidate_Status: status,
  };
  if (input.comments?.trim()) row.comments = input.comments.trim();
  const jobId = String(input.jobId || '').trim();
  if (jobId) row.jobids = [jobId];

  let statusError: unknown;
  try {
    await recruitWriteJson(accessToken, 'PUT', '/Candidates/status', dataCenter, {
      data: [row],
    });
  } catch (error) {
    statusError = error;
  }

  try {
    await recruitWriteJson(accessToken, 'PUT', '/Candidates', dataCenter, {
      data: [{ id: candidateId, Candidate_Status: status }],
    });
  } catch (error) {
    if (statusError) throw statusError;
    throw error;
  }
}

/**
 * POST /recruit/v2/Notes — attach a note to a candidate.
 */
export async function createZohoRecruitCandidateNote(
  accessToken: string,
  dataCenter: unknown,
  input: { candidateId: string; title: string; content: string }
): Promise<void> {
  const candidateId = String(input.candidateId || '').trim();
  const title = String(input.title || '').trim() || 'Huntlo';
  const content = String(input.content || '').trim();
  if (!candidateId || !content) {
    throw Object.assign(new Error('candidateId and note content are required'), { statusCode: 400 });
  }
  await recruitWriteJson(accessToken, 'POST', '/Notes', dataCenter, {
    data: [
      {
        Note_Title: title.slice(0, 120),
        Note_Content: content.slice(0, 30000),
        Parent_Id: candidateId,
        se_module: 'Candidates',
      },
    ],
  });
}
