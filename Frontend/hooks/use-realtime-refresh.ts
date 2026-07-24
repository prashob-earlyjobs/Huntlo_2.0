"use client";

import { useEffect, useRef } from "react";

import {
  useRealtime,
  type RealtimeEvent,
} from "@/providers/realtime-provider";

/**
 * Subscribe to one or more realtime event types and invoke `onEvent`.
 * Safe no-op while mock API mode or disconnected.
 *
 * Pass `debounceMs` to coalesce bursts (e.g. campaign workers) so listeners
 * do not open unbounded parallel refetches.
 */
export function useRealtimeRefresh(
  eventTypes: string | string[],
  onEvent: (event: RealtimeEvent) => void,
  options?: { debounceMs?: number }
) {
  const { subscribe } = useRealtime();
  const typesKey = Array.isArray(eventTypes) ? eventTypes.join("|") : eventTypes;
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const debounceMs = options?.debounceMs ?? 0;
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const types = typesKey.split("|").filter(Boolean);
    const unsubscribers = types.map((type) =>
      subscribe(type, (event) => {
        if (debounceMs <= 0) {
          onEventRef.current(event);
          return;
        }
        if (debounceTimerRef.current != null) {
          window.clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = window.setTimeout(() => {
          debounceTimerRef.current = null;
          onEventRef.current(event);
        }, debounceMs);
      })
    );
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      if (debounceTimerRef.current != null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [typesKey, subscribe, debounceMs]);
}
