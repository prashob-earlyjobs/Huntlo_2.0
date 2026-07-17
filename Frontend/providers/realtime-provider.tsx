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

import {
  fetchRealtimeTicket,
  getRealtimeUrl,
  isMockApiEnabled,
} from "@/lib/api";
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

const MAX_BACKOFF_MS = 15_000;
const BASE_BACKOFF_MS = 800;

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<RealtimeConnectionState>(
    isMockApiEnabled() ? "mock" : "idle"
  );
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, Set<(event: RealtimeEvent) => void>>>(new Map());
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const intentionalCloseRef = useRef(false);

  const emit = useCallback((event: RealtimeEvent) => {
    setLastEvent(event);
    const exactHandlers = handlersRef.current.get(event.type);
    exactHandlers?.forEach((handler) => handler(event));
    const wildcardHandlers = handlersRef.current.get("*");
    wildcardHandlers?.forEach((handler) => handler(event));
  }, []);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current != null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;
    clearReconnectTimer();
    socketRef.current?.close();
    socketRef.current = null;
  }, [clearReconnectTimer]);

  const scheduleReconnect = useCallback(() => {
    if (isMockApiEnabled() || !isAuthenticated) return;
    clearReconnectTimer();
    const attempt = reconnectAttemptRef.current;
    const delay = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** attempt);
    reconnectAttemptRef.current = attempt + 1;
    reconnectTimerRef.current = window.setTimeout(() => {
      void connectRef.current();
    }, delay);
  }, [clearReconnectTimer, isAuthenticated]);

  const connectRef = useRef<() => Promise<void>>(async () => undefined);

  const connect = useCallback(async () => {
    if (isMockApiEnabled()) {
      setState("mock");
      return;
    }

    if (!isAuthenticated) {
      setState("idle");
      return;
    }

    intentionalCloseRef.current = false;
    clearReconnectTimer();
    socketRef.current?.close();
    socketRef.current = null;
    setState("connecting");

    try {
      const ticket = await fetchRealtimeTicket();
      if (!ticket.realtimeEnabled) {
        setState("disconnected");
        return;
      }

      const url = new URL(getRealtimeUrl());
      url.searchParams.set(ticket.ticketParam || "ticket", ticket.ticket);

      const socket = new WebSocket(url.toString());
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        reconnectAttemptRef.current = 0;
        setState("connected");
      });

      socket.addEventListener("close", () => {
        setState("disconnected");
        socketRef.current = null;
        if (!intentionalCloseRef.current) {
          scheduleReconnect();
        }
      });

      socket.addEventListener("error", () => {
        setState("disconnected");
      });

      socket.addEventListener("message", (message) => {
        try {
          const event = JSON.parse(String(message.data)) as RealtimeEvent;
          if (event.type === "realtime.ping") {
            socket.send(JSON.stringify({ type: "realtime.pong", data: { ts: Date.now() } }));
          }
          emit(event);
        } catch {
          // ignore malformed events
        }
      });
    } catch {
      setState("disconnected");
      scheduleReconnect();
    }
  }, [clearReconnectTimer, emit, isAuthenticated, scheduleReconnect]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    void connect();
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
      reconnect: () => {
        reconnectAttemptRef.current = 0;
        void connect();
      },
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
