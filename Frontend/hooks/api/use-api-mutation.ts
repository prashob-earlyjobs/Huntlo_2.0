"use client";

import { useCallback, useState } from "react";

import { ApiError } from "@/lib/api/errors";
import { deriveQueryState, type ApiQueryState, createInitialQueryState } from "./use-api-state";

export function useApiMutation<TInput, TOutput>(
  mutationFn: (input: TInput, signal: AbortSignal) => Promise<TOutput>
) {
  const [state, setState] = useState<ApiQueryState<TOutput>>(createInitialQueryState<TOutput>());

  const mutate = useCallback(
    async (input: TInput) => {
      const controller = new AbortController();
      setState(
        deriveQueryState<TOutput>({
          isLoading: true,
        })
      );

      try {
        const data = await mutationFn(input, controller.signal);
        const next = deriveQueryState<TOutput>({
          data,
          isLoading: false,
        });
        setState(next);
        return data;
      } catch (error) {
        const next = deriveQueryState<TOutput>({
          error,
          isLoading: false,
        });
        setState(next);
        if (error instanceof ApiError) throw error;
        throw error;
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setState(createInitialQueryState<TOutput>());
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}
