import { createFutureJobsUpstreamError } from './futureJobs.errors.js';
import type {
  FilterAutocompleteParams,
  FutureJobsAnnotationData,
  FutureJobsApiResponse,
  FutureJobsCreateSessionData,
  FutureJobsProfileDoc,
  FutureJobsProfilesPage,
  FutureJobsProvider,
  FutureJobsRequestOpts,
  GetProfilesOptions,
  MockFutureJobsMode,
  ProfilesWhenReadyOptions,
} from './futureJobs.types.js';

type MockModeState = {
  failNext: number;
  alwaysFail: boolean;
  timeout: boolean;
};

const mockMode: MockModeState = {
  failNext: 0,
  alwaysFail: false,
  timeout: false,
};

/** Per-session poll counters for deterministic empty → ready behavior. */
const sessionPollCounts = new Map<string, number>();

let sessionSeq = 0;
let candidateSeq = 0;

function nextSessionId(): string {
  sessionSeq += 1;
  return `mock-fj-session-${sessionSeq}`;
}

function nextCandidateId(sessionId: string, index: number): string {
  candidateSeq += 1;
  return `mock-fj-cand-${sessionId}-${index}-${candidateSeq}`;
}

/**
 * Configure mock failure modes for circuit-breaker / timeout tests.
 */
export function setMockFutureJobsMode(mode: MockFutureJobsMode): void {
  if (typeof mode.failNext === 'number') {
    mockMode.failNext = Math.max(0, Math.floor(mode.failNext));
  }
  if (typeof mode.alwaysFail === 'boolean') {
    mockMode.alwaysFail = mode.alwaysFail;
  }
  if (typeof mode.timeout === 'boolean') {
    mockMode.timeout = mode.timeout;
  }
}

export function resetMockFutureJobsState(): void {
  mockMode.failNext = 0;
  mockMode.alwaysFail = false;
  mockMode.timeout = false;
  sessionPollCounts.clear();
  sessionSeq = 0;
  candidateSeq = 0;
}

function maybeFail(operation: string): void {
  if (mockMode.timeout) {
    const err = new Error('The operation was aborted due to timeout');
    err.name = 'AbortError';
    throw createFutureJobsUpstreamError({
      details: { networkError: err.message, timeout: true },
      fjHttpStatus: 0,
      fjOperation: operation,
      statusCode: 503,
    });
  }

  if (mockMode.alwaysFail || mockMode.failNext > 0) {
    if (mockMode.failNext > 0) mockMode.failNext -= 1;
    throw createFutureJobsUpstreamError({
      details: { reason: 'mock_forced_failure' },
      fjHttpStatus: 503,
      fjOperation: operation,
      statusCode: 503,
    });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildFakeProfiles(sessionId: string, count: number): FutureJobsProfileDoc[] {
  const profiles: Array<{
    name: string;
    title: string;
    company: string;
    years: number;
    skills: string[];
    region: string;
    score: number;
  }> = [
    {
      name: 'Aisha Rahman',
      title: 'Senior Software Engineer',
      company: 'Nimbus Labs',
      years: 7,
      skills: ['TypeScript', 'Node.js', 'React', 'AWS'],
      region: 'Bangalore, Karnataka, India',
      score: 4.6,
    },
    {
      name: 'Marcus Chen',
      title: 'Staff Backend Engineer',
      company: 'Orbit Systems',
      years: 10,
      skills: ['Go', 'Kubernetes', 'PostgreSQL', 'gRPC'],
      region: 'Singapore',
      score: 4.2,
    },
    {
      name: 'Priya Nair',
      title: 'Full Stack Developer',
      company: 'BrightPath',
      years: 5,
      skills: ['JavaScript', 'Python', 'Django', 'Vue'],
      region: 'Hyderabad, Telangana, India',
      score: 3.9,
    },
    {
      name: 'Elena Volkov',
      title: 'Platform Engineer',
      company: 'CloudHarbor',
      years: 8,
      skills: ['Rust', 'Terraform', 'GCP', 'CI/CD'],
      region: 'Berlin, Germany',
      score: 4.4,
    },
    {
      name: 'Jordan Blake',
      title: 'Engineering Manager',
      company: 'Northstar AI',
      years: 12,
      skills: ['Leadership', 'Hiring', 'System Design', 'Java'],
      region: 'Austin, Texas, United States',
      score: 4.1,
    },
  ];

  const n = Math.min(Math.max(count, 3), 5);
  return profiles.slice(0, n).map((p, index) => ({
    _id: nextCandidateId(sessionId, index),
    sourcingSessionId: sessionId,
    finalScore: p.score,
    profile: {
      name: p.name,
      current_employers_object: [
        {
          job_title: p.title,
          name: p.company,
        },
      ],
      years_of_experience_raw: p.years,
      skills: p.skills,
      region: p.region,
      linkedin_profile_url: `https://www.linkedin.com/in/mock-${index + 1}-${sessionId.slice(-6)}`,
    },
  }));
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

export function createMockFutureJobsProvider(): FutureJobsProvider {
  async function createSourcingSession(
    body: Record<string, unknown>,
    _opts?: FutureJobsRequestOpts
  ): Promise<FutureJobsApiResponse<FutureJobsCreateSessionData>> {
    maybeFail('POST /wl/sourcing-session');
    const sessionId = nextSessionId();
    sessionPollCounts.set(sessionId, 0);

    const sessionTitle =
      typeof body.sessionTitle === 'string' && body.sessionTitle.trim()
        ? body.sessionTitle.trim()
        : 'Mock sourcing session';

    const expectedProfileCount = 4;

    return {
      status: true,
      statusCode: 200,
      message: 'Sourcing session created',
      data: {
        session: {
          _id: sessionId,
          sessionTitle,
          jdDetail:
            body.jdDetail && typeof body.jdDetail === 'object'
              ? {
                  userText:
                    typeof (body.jdDetail as { userText?: unknown }).userText === 'string'
                      ? (body.jdDetail as { userText: string }).userText
                      : '',
                  ...((body.jdDetail as { sampleProfileURL?: string }).sampleProfileURL
                    ? {
                        sampleProfileURL: (body.jdDetail as { sampleProfileURL: string })
                          .sampleProfileURL,
                      }
                    : {}),
                }
              : { userText: '' },
          queries:
            body.queries && typeof body.queries === 'object'
              ? (body.queries as import('./futureJobs.types.js').FutureJobsQueries)
              : {},
          nuances: Array.isArray(body.nuances) ? (body.nuances as string[]) : [],
          profileMatchingStatus: 'processing',
          expectedProfileCount,
        },
      },
    };
  }

  async function updateSourcingSession(
    sessionId: string,
    body: Record<string, unknown>,
    _opts?: FutureJobsRequestOpts
  ): Promise<FutureJobsApiResponse> {
    maybeFail('PATCH /wl/sourcing-session/update-session/:id');
    const sid = String(sessionId || '').trim();
    if (!sid) {
      const err = new Error('sessionId is required');
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }
    sessionPollCounts.set(sid, 0);
    return {
      status: true,
      statusCode: 200,
      message: 'Sourcing session updated',
      data: {
        session: {
          _id: sid,
          ...body,
          profileMatchingStatus: 'processing',
        },
      },
    };
  }

  async function getSourcingSessionProfiles(
    sessionId: string,
    { page = 1, limit = 20 }: GetProfilesOptions = {}
  ): Promise<FutureJobsApiResponse<FutureJobsProfilesPage>> {
    maybeFail('GET /wl/sourcing-session/:id/profiles');
    if (!sessionId || typeof sessionId !== 'string') {
      const err = new Error('sessionId is required to fetch profiles');
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }

    const attempt = (sessionPollCounts.get(sessionId) ?? 0) + 1;
    sessionPollCounts.set(sessionId, attempt);

    const safePage = Math.max(1, Math.floor(Number(page)) || 1);
    const safeLimit = Math.min(200, Math.max(1, Math.floor(Number(limit)) || 20));

    // First 1–2 polls return empty docs while matching is "processing".
    if (attempt <= 2) {
      return {
        status: true,
        statusCode: 200,
        data: {
          docs: [],
          totalDocs: 0,
          page: safePage,
          limit: safeLimit,
        },
      };
    }

    const docs = buildFakeProfiles(sessionId, 4);
    return {
      status: true,
      statusCode: 200,
      data: {
        docs,
        totalDocs: docs.length,
        page: safePage,
        limit: safeLimit,
      },
    };
  }

  async function getSourcingSessionProfilesWhenReady(
    sessionId: string,
    {
      page = 1,
      limit = 20,
      maxWaitMs = 90000,
      intervalMs = 50,
      expectedProfileCount = null,
      profileMatchingStatus = null,
      onPoll = null,
    }: ProfilesWhenReadyOptions = {}
  ): Promise<FutureJobsApiResponse<FutureJobsProfilesPage>> {
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
      docs: FutureJobsProfileDoc[];
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
    // Mock uses a short interval so tests don't wait on the live 3s default.
    const pollInterval = Math.min(intervalMs, 50);

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
        return lastRes;
      }

      if (Date.now() - started + pollInterval > maxWaitMs) {
        break;
      }
      await sleep(pollInterval);
    }

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
    _body: Record<string, unknown> = {}
  ): Promise<FutureJobsApiResponse> {
    maybeFail('POST /wl/sourcing-session/:id/fetch-more');
    if (!sessionId || typeof sessionId !== 'string') {
      const err = new Error('sessionId is required for fetch-more');
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }
    // Reset poll so next profiles fetch can refill.
    sessionPollCounts.set(sessionId, 2);
    return {
      status: true,
      statusCode: 200,
      message: 'Fetching more profiles',
      data: { sessionId },
    };
  }

  async function getSourcingSessionCandidateDetails(
    candidateId: string
  ): Promise<FutureJobsApiResponse> {
    maybeFail('GET /wl/sourcing-session/candidate/:id/details');
    const cid = String(candidateId || '').trim();
    if (!cid) {
      const err = new Error('candidateId is required');
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }
    return {
      status: true,
      statusCode: 200,
      data: {
        _id: cid,
        profile: {
          name: 'Mock Candidate',
          current_employers_object: [{ job_title: 'Software Engineer', name: 'Mock Co' }],
          years_of_experience_raw: 5,
          skills: ['TypeScript', 'Node.js'],
          region: 'India',
          linkedin_profile_url: 'https://www.linkedin.com/in/mock-candidate',
          summary: 'Experienced engineer focused on backend systems.',
          education: [{ school: 'Mock University', degree: 'B.Tech' }],
        },
        finalScore: 4,
      },
    };
  }

  function buildRevealResponse(
    revealType: 'EMAIL' | 'PHONE',
    linkedinProfileUrl: string
  ): FutureJobsApiResponse {
    const slug = linkedinProfileUrl
      .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '')
      .replace(/\/+$/, '')
      .slice(0, 24) || 'mock';
    const emailValues = [`${slug.replace(/[^a-z0-9]/gi, '.').toLowerCase() || 'mock'}@example.com`];
    const phoneValues = ['+919876543210'];

    return {
      status: true,
      statusCode: 200,
      message: 'Contact revealed',
      data: {
        revealStatus: {
          email: {
            revealed: revealType === 'EMAIL',
            values: revealType === 'EMAIL' ? emailValues : [],
          },
          phone: {
            revealed: revealType === 'PHONE',
            values: revealType === 'PHONE' ? phoneValues : [],
          },
        },
      },
    };
  }

  async function revealSourcingSessionContact(
    sourcingSessionId: string,
    linkedinProfileUrl: string,
    revealType: 'EMAIL' | 'PHONE'
  ): Promise<FutureJobsApiResponse> {
    maybeFail('POST /wl/sourcing-session/contact/reveal');
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
    return buildRevealResponse(type as 'EMAIL' | 'PHONE', profileUrl);
  }

  async function scoutPeopleRevealContact(
    linkedinProfileUrl: string,
    revealType: 'EMAIL' | 'PHONE'
  ): Promise<FutureJobsApiResponse> {
    maybeFail('POST /wl/scout-people/reveal-contacts');
    const profileUrl = String(linkedinProfileUrl || '').trim();
    const type = String(revealType || '').toUpperCase();
    if (!profileUrl || (type !== 'PHONE' && type !== 'EMAIL')) {
      const err = new Error('linkedin_profile_url and revealType (PHONE|EMAIL) are required');
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }
    return buildRevealResponse(type as 'EMAIL' | 'PHONE', profileUrl);
  }

  async function getSourcingSessionAnnotation(body: {
    userText: string;
    linkedin_profile_url?: string;
  }): Promise<FutureJobsApiResponse<FutureJobsAnnotationData>> {
    maybeFail('POST /wl/sourcing-session/get-annotation');
    const userText = typeof body?.userText === 'string' ? body.userText : '';
    if (!userText || !String(userText).trim()) {
      const err = new Error('userText is required for get-annotation');
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }

    const annotation: FutureJobsAnnotationData = {
      'current_employers.title': {
        presence: true,
        value: ['Software Engineer', 'Backend Engineer'],
      },
      skills: {
        presence: true,
        value: {
          mandatory: [],
          core: ['TypeScript', 'Node.js', 'React'],
          secondary: ['AWS'],
        },
      },
      region: {
        presence: true,
        value: ['Bangalore, Karnataka, India'],
      },
      country_region: {
        presence: true,
        value: ['India'],
      },
      years_of_experience_raw: {
        presence: true,
        value: [3, 8],
      },
      'current_employers.company_industries': {
        presence: true,
        value: ['Software', 'Internet'],
      },
    };

    return {
      status: true,
      statusCode: 200,
      message: 'Annotation ready',
      data: annotation,
    };
  }

  async function getFilterAutocomplete(
    { filterType = 'region', query, limit = 10 }: FilterAutocompleteParams,
    _opts?: FutureJobsRequestOpts
  ): Promise<FutureJobsApiResponse> {
    maybeFail('GET /wl/sourcing-session/filters/autocomplete');
    const q = String(query || '').trim();
    if (!q) {
      const err = new Error('query is required');
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }

    const cappedLimit = Math.min(Math.max(Number(limit) || 10, 1), 25);
    const samples =
      String(filterType || 'region').toLowerCase() === 'region'
        ? [
            'Bangalore, Karnataka, India',
            'Mumbai, Maharashtra, India',
            'Hyderabad, Telangana, India',
            'Singapore',
            'Berlin, Germany',
          ]
        : [`${q} Option 1`, `${q} Option 2`, `${q} Option 3`];

    const suggestions = samples
      .filter((s) => s.toLowerCase().includes(q.toLowerCase()) || q.length < 2)
      .slice(0, cappedLimit);

    return {
      status: true,
      statusCode: 200,
      data: { suggestions },
    };
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
    getSourcingSessionAnnotation,
    getFilterAutocomplete,
    isFjSessionPending,
    fjSessionPendingMessage,
  };
}
