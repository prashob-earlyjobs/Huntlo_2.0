/** Future Jobs auth header style. */
export type FutureJobsAuthStyle = 'bearer' | 'x-api-key' | 'x-fj-api-key';

/** Query operator shape used in FJ session.queries. */
export type FutureJobsQueryValue = {
  type: string;
  value: unknown;
};

export type FutureJobsQueries = Record<string, FutureJobsQueryValue>;

export type FutureJobsJdDetail = {
  userText: string;
  sampleProfileURL?: string;
};

export type FutureJobsSession = {
  _id?: string;
  sessionTitle?: string;
  jdDetail?: FutureJobsJdDetail;
  queries?: FutureJobsQueries;
  nuances?: string[];
  profileMatchingStatus?: string;
  expectedProfileCount?: number;
  [key: string]: unknown;
};

export type FutureJobsApiResponse<T = unknown> = {
  status?: string | number | boolean;
  statusCode?: number;
  message?: string;
  data?: T;
  error?: unknown;
  [key: string]: unknown;
};

export type FutureJobsCreateSessionData = {
  session?: FutureJobsSession;
  sourcingError?: string;
  [key: string]: unknown;
};

export type FutureJobsProfileEmployer = {
  job_title?: string;
  name?: string;
  [key: string]: unknown;
};

export type FutureJobsProfile = {
  name?: string;
  current_employers_object?: FutureJobsProfileEmployer[];
  years_of_experience_raw?: number | string;
  skills?: string[];
  region?: string;
  linkedin_profile_url?: string;
  [key: string]: unknown;
};

export type FutureJobsRevealBucket = {
  revealed?: boolean;
  values?: string[];
};

export type FutureJobsProfileDoc = {
  _id?: string;
  sourcingSessionId?: string;
  finalScore?: number;
  profile?: FutureJobsProfile;
  revealStatus?: {
    email?: FutureJobsRevealBucket;
    phone?: FutureJobsRevealBucket;
  };
  [key: string]: unknown;
};

export type FutureJobsProfilesPage = {
  docs?: FutureJobsProfileDoc[];
  totalDocs?: number;
  page?: number;
  limit?: number;
  [key: string]: unknown;
};

export type FutureJobsAnnotationField = {
  presence?: boolean;
  value?: unknown;
  [key: string]: unknown;
};

export type FutureJobsAnnotationData = Record<string, FutureJobsAnnotationField>;

export type FutureJobsFilterForm = {
  searchType: string;
  selectRegion: string[];
  currentTitle: string;
  yearsExpMin: string;
  yearsExpMax: string;
  keywordSkills: string;
  seniorityLevel: string;
  location: string[];
  searchOtherRegions: boolean;
  openToWork: boolean;
  functionCategory: string;
  geoDistance: string;
  industry: string;
  school: string[];
  fieldOfStudy: string[];
  degree: string[];
  certifications: string[];
  honorsAwards: string;
  targetCompanyScope: string;
  currentCompany: string[];
  yearsAtCompany: string[];
  pastCompany: string[];
  pastTitle: string[];
  companyType: string;
  companyHeadquarters: string;
  companyFocus: string[];
  employmentType: string;
  companyHeadcountRange: string;
  fundingStage: string[];
  headcountGrowthMin: string;
  headcountGrowthMax: string;
  companyHeadcountMin: string;
  companyHeadcountMax: string;
  annualRevenue: string;
  totalFundingRaised: string[];
  yearFoundedMin: string;
  yearFoundedMax: string;
  recentlyFunded: string[];
  languages: string[];
  frequentJobSwitch: boolean;
  recentlyChangedJob: boolean;
  largeEmploymentGaps: boolean;
  noCareerProgression: boolean;
  grammarSpellingIssues: boolean;
  overlappingFullTimeJobs: boolean;
  unspecifiedDatesOrLocations: boolean;
};

export type FutureJobsMappedCandidate = {
  id?: string;
  sourcingSessionId?: string;
  linkedin_profile_url: string;
  name: string;
  role: string;
  experience: string;
  location: string;
  skills: string;
  status: string;
  email: string;
  phone: string;
};

export type GetProfilesOptions = {
  page?: number;
  limit?: number;
  pollAttempt?: number;
};

export type ProfilesWhenReadyOptions = GetProfilesOptions & {
  maxWaitMs?: number;
  intervalMs?: number;
  expectedProfileCount?: number | null;
  profileMatchingStatus?: string | null;
  onPoll?: ((payload: ProfilesPollPayload) => void) | null;
};

export type ProfilesPollPayload = {
  sessionId: string;
  attempt: number;
  docs: FutureJobsProfileDoc[];
  totalDocs: number;
  done: boolean;
  polling: boolean;
};

export type FilterAutocompleteParams = {
  filterType?: string;
  query: string;
  limit?: number;
};

export type FutureJobsRequestOpts = {
  traceId?: string;
};

export type FutureJobsConfig = {
  baseUrl: string;
  apiKey: string;
  authStyle: FutureJobsAuthStyle;
  useMock: boolean;
  timeoutMs: number;
  maxRetries: number;
  circuitFailureThreshold: number;
  circuitResetMs: number;
};

/** Public provider surface used by sourcing / people-scout modules. */
export interface FutureJobsProvider {
  createSourcingSession(
    body: Record<string, unknown>,
    opts?: FutureJobsRequestOpts
  ): Promise<FutureJobsApiResponse<FutureJobsCreateSessionData>>;

  updateSourcingSession(
    sessionId: string,
    body: Record<string, unknown>,
    opts?: FutureJobsRequestOpts
  ): Promise<FutureJobsApiResponse>;

  getSourcingSessionProfiles(
    sessionId: string,
    opts?: GetProfilesOptions
  ): Promise<FutureJobsApiResponse<FutureJobsProfilesPage>>;

  getSourcingSessionProfilesWhenReady(
    sessionId: string,
    opts?: ProfilesWhenReadyOptions
  ): Promise<FutureJobsApiResponse<FutureJobsProfilesPage>>;

  fetchMoreSourcingSession(
    sessionId: string,
    body?: Record<string, unknown>
  ): Promise<FutureJobsApiResponse>;

  getSourcingSessionCandidateDetails(
    candidateId: string
  ): Promise<FutureJobsApiResponse>;

  /**
   * POST /wl/sourcing-session/contact/reveal
   * Query: sourcingSessionId, linkedin_profile_url, revealType (EMAIL|PHONE)
   */
  revealSourcingSessionContact(
    sourcingSessionId: string,
    linkedinProfileUrl: string,
    revealType: 'EMAIL' | 'PHONE'
  ): Promise<FutureJobsApiResponse>;

  /**
   * POST /wl/scout-people/reveal-contacts
   * Body: { linkedin_profile_url, revealContactType: ["email"] | ["phone"] }
   */
  scoutPeopleRevealContact(
    linkedinProfileUrl: string,
    revealType: 'EMAIL' | 'PHONE'
  ): Promise<FutureJobsApiResponse>;

  getSourcingSessionAnnotation(body: {
    userText: string;
    linkedin_profile_url?: string;
  }): Promise<FutureJobsApiResponse<FutureJobsAnnotationData>>;

  getFilterAutocomplete(
    params: FilterAutocompleteParams,
    opts?: FutureJobsRequestOpts
  ): Promise<FutureJobsApiResponse>;

  isFjSessionPending(data: unknown): boolean;
  fjSessionPendingMessage(data: unknown): string;
}

export type MockFutureJobsMode = {
  /** Fail the next N requests with an upstream error. */
  failNext?: number;
  /** Always fail every request. */
  alwaysFail?: boolean;
  /** Simulate request timeout / AbortError. */
  timeout?: boolean;
};
