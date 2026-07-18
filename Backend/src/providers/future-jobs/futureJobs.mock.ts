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
  pending207: boolean;
  emptyProfiles: boolean;
};

const mockMode: MockModeState = {
  failNext: 0,
  alwaysFail: false,
  timeout: false,
  pending207: false,
  emptyProfiles: false,
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
  if (typeof mode.pending207 === 'boolean') {
    mockMode.pending207 = mode.pending207;
  }
  if (typeof mode.emptyProfiles === 'boolean') {
    mockMode.emptyProfiles = mode.emptyProfiles;
  }
}

export function resetMockFutureJobsState(): void {
  mockMode.failNext = 0;
  mockMode.alwaysFail = false;
  mockMode.timeout = false;
  mockMode.pending207 = false;
  mockMode.emptyProfiles = false;
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
              company_name: p.company,
              name: p.company,
            },
          ],
      years_of_experience_raw: p.years,
      skills: p.skills,
      region: p.region,
      linkedin_profile_url: `https://www.linkedin.com/in/mock-${index + 1}-${sessionId.slice(-6)}`,
      profile_picture_permalink: `https://i.pravatar.cc/150?u=${sessionId}-${index}`,
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

    if (mockMode.pending207) {
      return {
        status: false,
        statusCode: 207,
        message: 'Candidate matching is still being prepared.',
        data: {
          session: {
            _id: sessionId,
            sessionTitle,
            jdDetail: { userText: '' },
            queries: {},
            nuances: [],
            profileMatchingStatus: 'pending',
            expectedProfileCount: 0,
          },
        },
      };
    }

    return {
      status: true,
      statusCode: 201,
      message: 'Session created successfully',
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
          // Production often leaves session matching idle at create time.
          profileMatchingStatus: 'idle',
          expectedProfileCount: 0,
          totalAvailableProfiles: 0,
        },
        sourcing: {
          total_display_count: expectedProfileCount,
          next_cursor: 'mock-cursor',
          filterChangesCounter: 0,
          searchMoreCounter: 0,
          profileMatchingStatus: 'processing',
          newProfilesCount: expectedProfileCount,
          creditInfo: {
            charged: true,
            amount: 5,
            reason: 'Sourcing Session Created',
            remainingCredits: 999,
          },
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
    if (mockMode.pending207) {
      return {
        status: false,
        statusCode: 207,
        message: 'Candidate matching is still being prepared.',
        data: {
          session: {
            _id: sid,
            ...body,
            profileMatchingStatus: 'pending',
          },
        },
      };
    }
    return {
      status: true,
      statusCode: 200,
      message: 'Sourcing session updated',
      data: {
        session: {
          _id: sid,
          ...body,
          profileMatchingStatus: 'idle',
        },
        sourcing: {
          total_display_count: 4,
          profileMatchingStatus: 'processing',
          newProfilesCount: 4,
        },
      },
    };
  }

  async function getSourcingSessionProfiles(
    sessionId: string,
    { page = 1, limit = 20, pollAttempt }: GetProfilesOptions = {}
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
    const safeLimit = Math.min(300, Math.max(1, Math.floor(Number(limit)) || 20));

    let response: FutureJobsApiResponse<FutureJobsProfilesPage>;

    // First 1–2 polls return empty docs while matching is "processing".
    if (attempt <= 2 || mockMode.emptyProfiles) {
      response = {
        status: true,
        statusCode: 200,
        data: {
          docs: [],
          totalDocs: 0,
          page: safePage,
          limit: safeLimit,
        },
      };
    } else {
      const docs = buildFakeProfiles(sessionId, 4);
      response = {
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

    return response;
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
    candidateId: string,
    opts: { sessionId?: string | null } = {}
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
      message: 'Candidate details fetched successfully',
      data: {
        candidate: {
          _id: cid,
          name: 'Mock Candidate',
          first_name: 'Mock',
          last_name: 'Candidate',
          headline: 'Software Engineer',
          summary:
            'Experienced engineer focused on backend systems and reliable delivery.',
          region: 'Pune, Maharashtra, India',
          years_of_experience_raw: 5,
          linkedin_profile_url: 'https://www.linkedin.com/in/mock-candidate',
          profile_picture_permalink: `https://i.pravatar.cc/150?u=${cid}`,
          skills: ['TypeScript', 'Node.js', 'React'],
          current_employers: [
            {
              name: 'Mock Co',
              title: 'Software Engineer',
              description: 'Built APIs and services.',
              start_date: '2023-01-01T00:00:00',
              employment_type: 'Full-time',
            },
          ],
          past_employers: [
            {
              name: 'Earlier Labs',
              title: 'Junior Developer',
              description: 'Supported product features.',
              start_date: '2021-01-01T00:00:00',
              end_date: '2022-12-01T00:00:00',
              employment_type: 'Full-time',
            },
          ],
          all_employers: [
            {
              name: 'Mock Co',
              title: 'Software Engineer',
              description: 'Built APIs and services.',
              start_date: '2023-01-01T00:00:00',
              employment_type: 'Full-time',
            },
            {
              name: 'Earlier Labs',
              title: 'Junior Developer',
              description: 'Supported product features.',
              start_date: '2021-01-01T00:00:00',
              end_date: '2022-12-01T00:00:00',
              employment_type: 'Full-time',
            },
          ],
          education_background: [
            {
              degree_name: 'B.Tech',
              institute_name: 'Mock University',
              field_of_study: 'Computer Science',
              start_date: '2017-01-01T00:00:00',
              end_date: '2021-01-01T00:00:00',
            },
          ],
        },
        profileAnalysis: {
          analysis: {
            finalScore: 90,
            starRating: 5,
            scoreBreakdown: [
              { code: 'JT', label: 'Job Title Match', weight: 20, awarded: 18 },
              { code: 'MAND', label: 'Mandatory Skills', weight: 30, awarded: 28 },
              { code: 'Experience (Years)', label: 'Experience', weight: 15, awarded: 14 },
              { code: 'Region Match', label: 'Region', weight: 10, awarded: 10 },
              { code: 'IND', label: 'Industry', weight: 10, awarded: 8 },
              { code: 'EDU', label: 'Education', weight: 10, awarded: 9 },
            ],
            keyStrengths: [
              {
                observation: 'Strong backend experience',
                evidence: 'Worked across Mock Co and Earlier Labs.',
              },
            ],
            keyWeaknesses: [],
          },
          highlights: [
            {
              Category: 'SKILLS',
              Highlight: 'TypeScript',
              ReasonForHighlight: 'Listed among core skills.',
              Icon: 'BULB',
            },
          ],
          recommendation: 'Strong fit for the role. 5/5',
        },
        finalScore: 4.5,
        sessionId: opts.sessionId ?? null,
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

  async function scoutPeopleLookup(body: {
    email?: string;
    linkedin_url?: string;
  }): Promise<FutureJobsApiResponse> {
    maybeFail('POST /wl/scout-people/lookup');

    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const linkedinUrl =
      typeof body?.linkedin_url === 'string' ? body.linkedin_url.trim() : '';

    if (!email && !linkedinUrl) {
      const err = new Error('Provide email or linkedin_url');
      (err as Error & { statusCode: number }).statusCode = 400;
      throw err;
    }

    const needle = (email || linkedinUrl).toLowerCase();
    if (needle.includes('notfound') || needle.includes('not-found')) {
      return {
        status: 'SUCCESS',
        statusCode: 200,
        message: 'Candidate not found',
        data: { scoutId: '', profile: null },
      };
    }

    if (needle.includes('multi')) {
      return {
        status: 'SUCCESS',
        statusCode: 200,
        message: 'Multiple matches',
        data: {
          scoutId: 'mock-scout-multi',
          profiles: [
            {
              name: 'Arjun Malhotra',
              headline: 'Engineering Manager, Platform at Cloudmesh',
              location: 'Bengaluru, India',
              linkedin_profile_url: 'https://www.linkedin.com/in/arjun-malhotra-platform',
              current_employers: [
                { employer_name: 'Cloudmesh', employee_title: 'Engineering Manager' },
              ],
            },
            {
              name: 'Arjun Malhotra',
              headline: 'Product Manager — Payments at Razorpay',
              location: 'Bengaluru, India',
              linkedin_profile_url: 'https://www.linkedin.com/in/arjunmalhotra-pm',
              current_employers: [
                { employer_name: 'Razorpay', employee_title: 'Product Manager' },
              ],
            },
            {
              name: 'Arjun S. Malhotra',
              headline: 'Data Scientist at Fractal Analytics',
              location: 'Mumbai, India',
              linkedin_profile_url: 'https://www.linkedin.com/in/arjun-s-malhotra',
              current_employers: [
                { employer_name: 'Fractal Analytics', employee_title: 'Data Scientist' },
              ],
            },
          ],
        },
      };
    }

    const slug =
      linkedinUrl.match(/\/in\/([^/?#]+)/i)?.[1] ||
      (email ? email.split('@')[0] : 'mock-candidate');
    const profileUrl =
      linkedinUrl || `https://www.linkedin.com/in/${encodeURIComponent(slug!)}`;

    return {
      status: 'SUCCESS',
      statusCode: 200,
      message: 'Profile found',
      data: {
        scoutId: `mock-scout-${slug}`,
        profile: {
          _id: `mock-fj-profile-${slug}`,
          name: 'Aisha Rahman',
          title: 'Senior Software Engineer',
          headline: 'Senior Software Engineer · Platform · TypeScript',
          location: 'Bengaluru, India',
          summary: 'Builds reliable APIs and hiring systems.',
          linkedin_flagship_url: profileUrl,
          linkedin_profile_url: profileUrl,
          profile_picture_url: '',
          num_of_connections: 500,
          skills: ['TypeScript', 'Node.js', 'React'],
          languages: ['English (Native or bilingual proficiency)'],
          all_titles: ['Senior Software Engineer', 'Software Engineer'],
          all_employers: ['Nimbus Labs', 'Orbit Soft'],
          all_schools: ['IISc Bangalore'],
          all_degrees: ['B.Tech'],
          query_linkedin_profile_urn_or_slug: [slug],
          current_employers: [
            {
              employer_name: 'Nimbus Labs',
              employee_title: 'Senior Software Engineer',
              employee_description: 'Owns platform APIs and hiring tooling.',
              employee_location: 'Bengaluru, India',
              start_date: '2022-01-01T00:00:00+00:00',
              end_date: null,
            },
          ],
          past_employers: [
            {
              employer_name: 'Orbit Soft',
              employee_title: 'Software Engineer',
              employee_description: 'Built billing and metering services.',
              employee_location: 'Bengaluru, India',
              start_date: '2019-06-01T00:00:00+00:00',
              end_date: '2021-12-01T00:00:00+00:00',
            },
          ],
          education_background: [
            {
              degree_name: 'B.Tech',
              institute_name: 'IISc Bangalore',
              field_of_study: 'Computer Science',
              start_date: '2015-01-01T00:00:00+00:00',
              end_date: '2019-01-01T00:00:00+00:00',
            },
          ],
        },
        revealStatus: {
          email: { revealed: false, values: [] },
          phone: { revealed: false, values: [] },
        },
      },
    };
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

    const list = samples
      .filter((s) => s.toLowerCase().includes(q.toLowerCase()) || q.length < 2)
      .slice(0, cappedLimit)
      .map((s) => ({ label: s, value: s }));

    return {
      status: 'SUCCESS',
      statusCode: 200,
      message: 'Successfully Accessed!',
      data: { list },
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
    scoutPeopleLookup,
    getSourcingSessionAnnotation,
    getFilterAutocomplete,
    isFjSessionPending,
    fjSessionPendingMessage,
  };
}
