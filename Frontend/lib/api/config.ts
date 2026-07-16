const TRUE_VALUES = new Set(["true", "1", "yes"]);

export function isMockApiEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_USE_MOCK_API;
  if (flag === undefined || flag === "") return true;
  return TRUE_VALUES.has(flag.trim().toLowerCase());
}

export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return base.replace(/\/+$/, "");
}

export function getApiV1BaseUrl(): string {
  return `${getApiBaseUrl()}/api/v1`;
}

export function getRealtimeUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const apiBase = getApiBaseUrl();
  const wsPath = process.env.NEXT_PUBLIC_WS_PATH ?? "/realtime/v1";
  const normalizedPath = wsPath.startsWith("/") ? wsPath : `/${wsPath}`;

  if (apiBase.startsWith("https://")) {
    return `${apiBase.replace(/^https:/, "wss:")}${normalizedPath}`;
  }
  if (apiBase.startsWith("http://")) {
    return `${apiBase.replace(/^http:/, "ws:")}${normalizedPath}`;
  }
  return `ws://localhost:4000${normalizedPath}`;
}

export const API_STORAGE_KEYS = {
  accessToken: "huntlo.accessToken",
  refreshToken: "huntlo.refreshToken",
  workspaceId: "huntlo.workspaceId",
} as const;

export const AUTH_SESSION_COOKIE = "huntlo_session";

export const API_HEADERS = {
  requestId: "X-Request-Id",
  workspaceId: "X-Workspace-Id",
  idempotencyKey: "Idempotency-Key",
  authorization: "Authorization",
} as const;

/** HTTP methods safe to retry automatically. */
export const IDEMPOTENT_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Operation tags that must never be auto-retried. */
export const SENSITIVE_OPERATION_PREFIXES = [
  "/auth/refresh",
  "/candidates/",
  "/people-scout/",
  "/outreach/",
  "/campaigns/",
  "/billing/",
  "/plans/",
  "/screening/",
  "/huntlo-360/",
] as const;

export const MAX_AUTO_RETRIES = 2;
export const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);
