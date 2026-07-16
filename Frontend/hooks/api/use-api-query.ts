"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { deriveQueryState, type ApiQueryState, createInitialQueryState } from "./use-api-state";

export type UseApiQueryOptions<T> = {
  enabled?: boolean;
  initialData?: T | null;
  isEmpty?: (data: T) => boolean;
};

export function useApiQuery<T>(
  key: string,
  fetcher: (signal: AbortSignal) => Promise<T>,
  options: UseApiQueryOptions<T> = {}
) {
  const { enabled = true, initialData = null, isEmpty } = options;
  const [state, setState] = useState<ApiQueryState<T>>(() => ({
    ...createInitialQueryState<T>(),
    data: initialData,
  }));
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refetch = useCallback(async () => {
    const controller = new AbortController();

    setState((current) =>
      deriveQueryState<T>({
        data: current.data,
        isLoading: true,
      })
    );

    try {
      const data = await fetcherRef.current(controller.signal);
      if (controller.signal.aborted) return;
      setState(
        deriveQueryState<T>({
          data,
          isLoading: false,
          isEmpty: isEmpty ? isEmpty(data) : undefined,
        })
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      setState(
        deriveQueryState<T>({
          data: null,
          error,
          isLoading: false,
        })
      );
    }
  }, [isEmpty]);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();

    setState((current) =>
      deriveQueryState<T>({
        data: current.data,
        isLoading: true,
      })
    );

    void (async () => {
      try {
        const data = await fetcherRef.current(controller.signal);
        if (controller.signal.aborted) return;
        setState(
          deriveQueryState<T>({
            data,
            isLoading: false,
            isEmpty: isEmpty ? isEmpty(data) : undefined,
          })
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        setState(
          deriveQueryState<T>({
            data: null,
            error,
            isLoading: false,
          })
        );
      }
    })();

    return () => controller.abort();
  }, [enabled, key, isEmpty]);

  return {
    ...state,
    refetch,
  };
}
