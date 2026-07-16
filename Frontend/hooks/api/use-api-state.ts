"use client";

import type { ApiUiState } from "@/lib/api/errors";
import { ApiError, getApiErrorMessage, mapApiErrorToUiState } from "@/lib/api/errors";

export type ApiQueryState<T> = {
  data: T | null;
  error: ApiError | null;
  uiState: ApiUiState;
  message: string | null;
  isLoading: boolean;
  isEmpty: boolean;
  isSuccess: boolean;
  isError: boolean;
  requestId?: string;
};

export function createInitialQueryState<T>(): ApiQueryState<T> {
  return {
    data: null,
    error: null,
    uiState: "idle",
    message: null,
    isLoading: false,
    isEmpty: false,
    isSuccess: false,
    isError: false,
  };
}

export function deriveQueryState<T>(
  input: {
    data?: T | null;
    error?: unknown;
    isLoading: boolean;
    isEmpty?: boolean;
  }
): ApiQueryState<T> {
  if (input.isLoading) {
    return {
      ...createInitialQueryState<T>(),
      uiState: "loading",
      isLoading: true,
    };
  }

  if (input.error) {
    const apiError = input.error instanceof ApiError ? input.error : ApiError.network(getApiErrorMessage(input.error));
    return {
      data: input.data ?? null,
      error: apiError,
      uiState: mapApiErrorToUiState(apiError),
      message: apiError.message,
      isLoading: false,
      isEmpty: false,
      isSuccess: false,
      isError: true,
      requestId: apiError.requestId,
    };
  }

  const isEmpty = input.isEmpty ?? (Array.isArray(input.data) ? input.data.length === 0 : !input.data);

  return {
    data: input.data ?? null,
    error: null,
    uiState: isEmpty ? "empty" : "success",
    message: null,
    isLoading: false,
    isEmpty,
    isSuccess: !isEmpty,
    isError: false,
  };
}

export const UI_STATE_LABELS: Record<ApiUiState, string> = {
  idle: "Ready",
  loading: "Loading",
  success: "Loaded",
  empty: "No results",
  error: "Something went wrong",
  "permission-restricted": "You do not have access",
  "disconnected-provider": "Provider disconnected",
  "quota-exhausted": "Quota exhausted",
};

export function getUiStateLabel(state: ApiUiState): string {
  return UI_STATE_LABELS[state];
}
