import type { PaginationMeta, SuccessMeta } from "./contracts/envelopes";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Include cookies on cross-origin requests (refresh token flow). */
  credentials?: RequestCredentials;
  /** Attach Bearer access token (default true for authenticated routes). */
  auth?: boolean;
  /** Attach X-Workspace-Id header when a workspace is selected. */
  workspace?: boolean;
  /** Explicit idempotency key for sensitive mutations. */
  idempotencyKey?: string;
  /**
   * Sensitive mutations (reveals, sends, billing, launches) must set this true
   * to disable automatic retries even when method is POST.
   */
  sensitive?: boolean;
  /** Override automatic retry behaviour. */
  retry?: boolean;
  /** Request timeout in milliseconds. */
  timeoutMs?: number;
  /** Raw JSON response without envelope parsing (health probes, openapi). */
  raw?: boolean;
  /** Return response body as a Blob (CSV/file downloads). */
  blob?: boolean;
};

export type ApiBlobResult = {
  blob: Blob;
  filename: string | null;
  contentType: string | null;
  status: number;
  requestId?: string;
};

export type ApiSuccessResult<T> = {
  data: T;
  meta?: SuccessMeta;
  status: number;
  requestId?: string;
};

export type ApiQueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export function buildQueryString(params?: ApiQueryParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export type PaginatedResponse<T> = {
  items: T[];
  pagination: PaginationMeta;
};

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  workspaceId?: string;
};

export type MemberStatus = "active" | "invited" | "suspended" | "blocked";
export type OnboardingStatus = "not_started" | "in_progress" | "completed";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  jobTitle?: string | null;
  profileImage?: string | null;
  timezone?: string;
  locale?: string;
  role: string;
  initials: string;
  plan: string;
  memberStatus?: MemberStatus;
  onboardingStatus?: OnboardingStatus;
  emailVerified?: boolean;
  organizationId?: string;
};

export type AuthOrganization = {
  id: string;
  name: string;
  plan: string;
  initials: string;
};

export type AuthMeResponse = {
  user: AuthUser;
  organization: AuthOrganization;
  permissions: string[];
};

export type AuthSessionState =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "blocked"
  | "expired";

export type { ApiEnvelope, ErrorEnvelope, SuccessEnvelope } from "./contracts/envelopes";
