"use client";

import { useEffect } from "react";

import { useRealtime } from "@/providers/realtime-provider";

/**
 * Subscribe to one or more realtime event types and invoke `onEvent`.
 * Safe no-op while mock API mode or disconnected.
 */
export function useRealtimeRefresh(
  eventTypes: string | string[],
  onEvent: () => void
) {
  const { subscribe } = useRealtime();
  const typesKey = Array.isArray(eventTypes) ? eventTypes.join("|") : eventTypes;

  useEffect(() => {
    const types = typesKey.split("|").filter(Boolean);
    const unsubscribers = types.map((type) => subscribe(type, () => onEvent()));
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [typesKey, onEvent, subscribe]);
}
