"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import type { RealtimeEvent } from "@/providers/realtime-provider";

const AUTO_DISMISS_MS = 6_000;
const MAX_VISIBLE_TOASTS = 4;

type ToastSeverity = "success" | "info" | "error";

type SearchToast = {
  id: string;
  title: string;
  message: string;
  actionUrl: string | null;
  severity: ToastSeverity;
};

type RealtimeNotificationPayload = {
  organizationId?: string;
  userId?: string;
  notification?: {
    id?: string;
    type?: string;
    severity?: string;
    title?: string;
    message?: string;
    description?: string;
    actionUrl?: string | null;
  };
};

const SEVERITY_ICON: Record<ToastSeverity, typeof CheckCircle2> = {
  success: CheckCircle2,
  info: Info,
  error: AlertCircle,
};

const SEVERITY_ICON_CLASS: Record<ToastSeverity, string> = {
  success: "text-emerald-600 dark:text-emerald-400",
  info: "text-primary",
  error: "text-destructive",
};

function toSeverity(value: string | undefined): ToastSeverity {
  if (value === "error") return "error";
  if (value === "success") return "success";
  return "info";
}

/**
 * Global, auto-dismissing toast for candidate search completion/failure.
 * Listens for `notification.created` realtime events app-wide so a search
 * kicked off from any page surfaces here regardless of current route.
 * Mounted once in the dashboard layout.
 */
export function SearchCompletionToast() {
  const [toasts, setToasts] = useState<SearchToast[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer != null) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const handleEvent = useCallback(
    (event: RealtimeEvent) => {
      const data = event.data as RealtimeNotificationPayload | undefined;
      const notification = data?.notification;
      if (!notification || notification.type !== "candidate_search_progress") return;

      const id = notification.id ?? `search-toast-${Date.now()}-${Math.random()}`;
      const toast: SearchToast = {
        id,
        title: notification.title || "Candidate search update",
        message: notification.description || notification.message || "",
        actionUrl: notification.actionUrl ?? null,
        severity: toSeverity(notification.severity),
      };

      setToasts((previous) => {
        if (previous.some((existing) => existing.id === id)) return previous;
        return [toast, ...previous].slice(0, MAX_VISIBLE_TOASTS);
      });

      const timer = window.setTimeout(() => {
        dismiss(id);
      }, AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  useRealtimeRefresh("notification.created", handleEvent);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
    >
      {toasts.map((toast) => {
        const Icon = SEVERITY_ICON[toast.severity];
        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-2.5 rounded-lg border border-border bg-card p-3 shadow-lg"
          >
            <Icon
              aria-hidden
              className={cn("mt-0.5 size-4.5 shrink-0", SEVERITY_ICON_CLASS[toast.severity])}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{toast.title}</p>
              {toast.message ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{toast.message}</p>
              ) : null}
              {toast.actionUrl ? (
                <Link
                  href={toast.actionUrl}
                  className="mt-1.5 inline-block text-xs font-medium text-primary hover:underline"
                  onClick={() => dismiss(toast.id)}
                >
                  View results
                </Link>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismiss(toast.id)}
              className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            >
              <X aria-hidden className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
