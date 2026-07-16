"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { getRealtimeUrl, isMockApiEnabled } from "@/lib/api";
import { tokenStorage } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";

export type RealtimeConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "mock";

export type RealtimeEvent = {
  type: string;
  data: unknown;
  meta?: Record<string, unknown>;
};

type RealtimeContextValue = {
  state: RealtimeConnectionState;
  lastEvent: RealtimeEvent | null;
  subscribe: (eventType: string, handler: (event: RealtimeEvent) => void) => () => void;
  reconnect: () => void;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<RealtimeConnectionState>(
    isMockApiEnabled() ? "mock" : "idle"
  );
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, Set<(event: RealtimeEvent) => void>>>(new Map());

  const emit = useCallback((event: RealtimeEvent) => {
    setLastEvent(event);
    const exactHandlers = handlersRef.current.get(event.type);
    exactHandlers?.forEach((handler) => handler(event));
    const wildcardHandlers = handlersRef.current.get("*");
    wildcardHandlers?.forEach((handler) => handler(event));
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.close();
    socketRef.current = null;
  }, []);

  const connect = useCallback(() => {
    if (isMockApiEnabled()) {
      setState("mock");
      return;
    }

    if (!isAuthenticated) {
      setState("idle");
      return;
    }

    disconnect();
    setState("connecting");

    const accessToken = tokenStorage.getAccessToken();
    const url = new URL(getRealtimeUrl());
    if (accessToken) {
      url.searchParams.set("token", accessToken);
    }

    const socket = new WebSocket(url.toString());
    socketRef.current = socket;

    socket.addEventListener("open", () => setState("connected"));
    socket.addEventListener("close", () => setState("disconnected"));
    socket.addEventListener("error", () => setState("disconnected"));
    socket.addEventListener("message", (message) => {
      try {
        const event = JSON.parse(String(message.data)) as RealtimeEvent;
        emit(event);
      } catch {
        // ignore malformed events
      }
    });
  }, [disconnect, emit, isAuthenticated]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const subscribe = useCallback(
    (eventType: string, handler: (event: RealtimeEvent) => void) => {
      const current = handlersRef.current.get(eventType) ?? new Set();
      current.add(handler);
      handlersRef.current.set(eventType, current);

      return () => {
        current.delete(handler);
        if (current.size === 0) handlersRef.current.delete(eventType);
      };
    },
    []
  );

  const value = useMemo<RealtimeContextValue>(
    () => ({
      state,
      lastEvent,
      subscribe,
      reconnect: connect,
    }),
    [state, lastEvent, subscribe, connect]
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within RealtimeProvider");
  }
  return context;
}
