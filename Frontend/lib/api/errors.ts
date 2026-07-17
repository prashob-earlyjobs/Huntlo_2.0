import type { ErrorDetail } from "./contracts/envelopes";

export type ApiErrorCode =
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "ABORTED"
  | "PARSE_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "QUOTA_EXCEEDED"
  | "RATE_LIMITED"
  | "PROVIDER_ERROR"
  | "INTERNAL_ERROR"
  | "NOT_IMPLEMENTED"
  | "UNKNOWN";

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;
  readonly details?: ErrorDetail[];
  readonly requestId?: string;
  readonly retryAfter?: number;

  constructor(options: {
    message: string;
    statusCode: number;
    code: ApiErrorCode;
    details?: ErrorDetail[];
    requestId?: string;
    retryAfter?: number;
    cause?: unknown;
  }) {
    super(options.message, options.cause ? { cause: options.cause } : undefined);
    this.name = "ApiError";
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
    this.requestId = options.requestId;
    this.retryAfter = options.retryAfter;
  }

  static network(message = "Network request failed", cause?: unknown): ApiError {
    return new ApiError({ message, statusCode: 0, code: "NETWORK_ERROR", cause });
  }

  static timeout(message = "Request timed out"): ApiError {
    return new ApiError({ message, statusCode: 408, code: "TIMEOUT" });
  }

  static aborted(message = "Request was aborted"): ApiError {
    return new ApiError({ message, statusCode: 0, code: "ABORTED" });
  }

  static notImplemented(message = "API endpoint not implemented yet"): ApiError {
    return new ApiError({ message, statusCode: 501, code: "NOT_IMPLEMENTED" });
  }
}

export function mapStatusToErrorCode(status: number, serverCode?: string): ApiErrorCode {
  if (
    serverCode === "QUOTA_EXCEEDED" ||
    serverCode === "SEARCH_QUOTA_EXHAUSTED"
  ) {
    return "QUOTA_EXCEEDED";
  }
  if (serverCode === "PROVIDER_ERROR" || serverCode === "FUTURE_JOBS_UNAVAILABLE") {
    return "PROVIDER_ERROR";
  }
  if (serverCode === "VALIDATION_ERROR" || serverCode === "INVALID_SEARCH_PROMPT") {
    return "VALIDATION_ERROR";
  }

  switch (status) {
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 422:
      return "VALIDATION_ERROR";
    case 402:
      return "QUOTA_EXCEEDED";
    case 429:
      return "QUOTA_EXCEEDED";
    case 500:
    case 502:
    case 503:
    case 504:
      return "INTERNAL_ERROR";
    default:
      return "UNKNOWN";
  }
}

/** UI-facing fetch state derived from API outcomes. */
export type ApiUiState =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error"
  | "permission-restricted"
  | "disconnected-provider"
  | "quota-exhausted";

export function mapApiErrorToUiState(error: unknown): ApiUiState {
  if (!(error instanceof ApiError)) return "error";

  switch (error.code) {
    case "FORBIDDEN":
      return "permission-restricted";
    case "QUOTA_EXCEEDED":
    case "RATE_LIMITED":
      return "quota-exhausted";
    case "PROVIDER_ERROR":
      return "disconnected-provider";
    case "UNAUTHORIZED":
      return "permission-restricted";
    default:
      return "error";
  }
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function isQuotaError(error: unknown): boolean {
  return error instanceof ApiError && error.code === "QUOTA_EXCEEDED";
}

export function isProviderError(error: unknown): boolean {
  return error instanceof ApiError && error.code === "PROVIDER_ERROR";
}

export function isPermissionError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.code === "FORBIDDEN" || error.code === "UNAUTHORIZED")
  );
}
