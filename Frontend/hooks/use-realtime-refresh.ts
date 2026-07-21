"use client";

import { useEffect, useRef } from "react";

import {
  useRealtime,
  type RealtimeEvent,
} from "@/providers/realtime-provider";

/**
 * Subscribe to one or more realtime event types and invoke `onEvent`.
 * Safe no-op while mock API mode or disconnected.
 */
export function useRealtimeRefresh(
  eventTypes: string | string[],
  onEvent: (event: RealtimeEvent) => void
) {
  const { subscribe } = useRealtime();
  const typesKey = Array.isArray(eventTypes) ? eventTypes.join("|") : eventTypes;
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    const types = typesKey.split("|").filter(Boolean);
    const unsubscribers = types.map((type) =>
      subscribe(type, (event) => {
        onEventRef.current(event);
      })
    );
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [typesKey, subscribe]);
}
