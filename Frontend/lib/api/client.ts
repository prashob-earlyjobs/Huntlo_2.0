import {
  API_HEADERS,
  API_STORAGE_KEYS,
  getApiV1BaseUrl,
  IDEMPOTENT_METHODS,
  isMockApiEnabled,
  MAX_AUTO_RETRIES,
  RETRYABLE_STATUS_CODES,
  SENSITIVE_OPERATION_PREFIXES,
} from "./config";
import type { ApiEnvelope, ErrorEnvelope } from "./contracts/envelopes";
import { ApiError, mapStatusToErrorCode } from "./errors";
import type { ApiRequestOptions, ApiSuccessResult, HttpMethod } from "./types";

type TokenProvider = {
  getAccessToken: () => string | null;
  getWorkspaceId: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
};

let tokenProvider: TokenProvider | null = null;

export function setTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider;
}

function generateRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `idem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function isSensitivePath(path: string): boolean {
  return SENSITIVE_OPERATION_PREFIXES.some((prefix) => path.includes(prefix));
}

function shouldRetry(
  method: HttpMethod,
  path: string,
  options: ApiRequestOptions,
  status: number,
  attempt: number
): boolean {
  if (options.retry === false) return false;
  if (options.sensitive || isSensitivePath(path)) return false;
  if (!IDEMPOTENT_METHODS.has(method) && options.retry !== true) return false;
  if (attempt >= MAX_AUTO_RETRIES) return false;
  return RETRYABLE_STATUS_CODES.has(status) || status === 0;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  if (!Number.isNaN(seconds)) return seconds;
  const dateMs = Date.parse(header);
  if (!Number.isNaN(dateMs)) {
    return Math.max(0, Math.ceil((dateMs - Date.now()) / 1000));
  }
  return undefined;
}

async function parseErrorEnvelope(response: Response): Promise<ErrorEnvelope | null> {
  try {
    const body = (await response.json()) as ApiEnvelope<unknown>;
    if (body && typeof body === "object" && body.success === false) {
      return body;
    }
  } catch {
    // fall through
  }
  return null;
}

export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl = getApiV1BaseUrl()) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<ApiSuccessResult<T>> {
    if (isMockApiEnabled()) {
      throw ApiError.notImplemented(
        "Direct API client calls are disabled while NEXT_PUBLIC_USE_MOCK_API=true. Use domain services instead."
      );
    }

    const method = options.method ?? "GET";
    let attempt = 0;

    while (true) {
      try {
        return await this.executeRequest<T>(path, { ...options, method }, attempt > 0);
      } catch (error) {
        if (!(error instanceof ApiError)) throw error;

        if (
          shouldRetry(method, path, options, error.statusCode, attempt) &&
          error.code !== "ABORTED"
        ) {
          attempt += 1;
          await sleep(250 * 2 ** (attempt - 1));
          continue;
        }

        throw error;
      }
    }
  }

  private async executeRequest<T>(
    path: string,
    options: ApiRequestOptions,
    isRetry: boolean
  ): Promise<ApiSuccessResult<T>> {
    const method = options.method ?? "GET";
    const requestId = generateRequestId();
    const url = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

    const headers = new Headers(options.headers);
    headers.set(API_HEADERS.requestId, requestId);
    headers.set("Accept", "application/json");

    if (options.body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const useAuth = options.auth !== false;
    if (useAuth && tokenProvider) {
      const accessToken = tokenProvider.getAccessToken();
      if (accessToken) {
        headers.set(API_HEADERS.authorization, `Bearer ${accessToken}`);
      }
    }

    if (options.workspace !== false && tokenProvider) {
      const workspaceId = tokenProvider.getWorkspaceId();
      if (workspaceId) {
        headers.set(API_HEADERS.workspaceId, workspaceId);
      }
    }

    if (options.idempotencyKey) {
      headers.set(API_HEADERS.idempotencyKey, options.idempotencyKey);
    } else if (
      options.sensitive ||
      (method !== "GET" && method !== "HEAD" && isSensitivePath(path))
    ) {
      headers.set(API_HEADERS.idempotencyKey, generateIdempotencyKey());
    }

    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? 30_000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    if (options.signal) {
      if (options.signal.aborted) {
        clearTimeout(timeout);
        throw ApiError.aborted();
      }
      options.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        credentials: options.credentials ?? "include",
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted) {
        throw ApiError.aborted();
      }
      throw ApiError.network(undefined, error);
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 401 && useAuth && tokenProvider && !isRetry) {
      const refreshed = await tokenProvider.refreshAccessToken();
      if (refreshed) {
        return this.executeRequest<T>(path, options, true);
      }
    }

    if (options.raw) {
      const data = (await response.json()) as T;
      if (!response.ok) {
        throw new ApiError({
          message: `Request failed with status ${response.status}`,
          statusCode: response.status,
          code: mapStatusToErrorCode(response.status),
          requestId,
        });
      }
      return { data, status: response.status, requestId };
    }

    let envelope: ApiEnvelope<T>;
    try {
      envelope = (await response.json()) as ApiEnvelope<T>;
    } catch (error) {
      throw new ApiError({
        message: "Failed to parse API response",
        statusCode: response.status,
        code: "PARSE_ERROR",
        requestId,
        cause: error,
      });
    }

    if (!response.ok || envelope.success === false) {
      const errorBody =
        envelope.success === false
          ? envelope
          : await parseErrorEnvelope(response).catch(() => null);

      const code = mapStatusToErrorCode(
        response.status,
        errorBody?.error.code
      );
      throw new ApiError({
        message: errorBody?.error.message ?? `Request failed with status ${response.status}`,
        statusCode: response.status,
        code,
        details: errorBody?.error.details,
        requestId: errorBody?.requestId ?? requestId,
        retryAfter: parseRetryAfter(response.headers.get("Retry-After")),
      });
    }

    return {
      data: envelope.data,
      meta: envelope.meta,
      status: response.status,
      requestId: envelope.meta?.requestId ?? requestId,
    };
  }

  get<T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  put<T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  patch<T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  delete<T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();

/** Read/write token persistence for browser sessions. */
export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(API_STORAGE_KEYS.accessToken);
  },
  setAccessToken(token: string | null): void {
    if (typeof window === "undefined") return;
    if (token) window.localStorage.setItem(API_STORAGE_KEYS.accessToken, token);
    else window.localStorage.removeItem(API_STORAGE_KEYS.accessToken);
  },
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(API_STORAGE_KEYS.refreshToken);
  },
  setRefreshToken(token: string | null): void {
    if (typeof window === "undefined") return;
    if (token) window.localStorage.setItem(API_STORAGE_KEYS.refreshToken, token);
    else window.localStorage.removeItem(API_STORAGE_KEYS.refreshToken);
  },
  getWorkspaceId(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(API_STORAGE_KEYS.workspaceId);
  },
  setWorkspaceId(workspaceId: string | null): void {
    if (typeof window === "undefined") return;
    if (workspaceId) window.localStorage.setItem(API_STORAGE_KEYS.workspaceId, workspaceId);
    else window.localStorage.removeItem(API_STORAGE_KEYS.workspaceId);
  },
  clear(): void {
    this.setAccessToken(null);
    this.setRefreshToken(null);
  },
};
