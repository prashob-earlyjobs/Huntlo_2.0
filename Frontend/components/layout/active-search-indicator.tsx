"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { candidateSearchApi } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

const ACTIVE_STATUSES = new Set([
  "creating",
  "pending",
  "queued",
  "running",
  "polling",
]);

/** Fallback poll while disconnected/mock, since sessions can finish server-side unnoticed. */
const FALLBACK_POLL_MS = 20_000;

/**
 * Small pill in the top header showing how many candidate searches are
 * currently running in the background (Future Jobs + Bright Data fallback).
 * Visible on every dashboard page, including home.
 */
export function ActiveSearchIndicator() {
  const [activeCount, setActiveCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const result = await candidateSearchApi.getSourcingSessions({ limit: 20 });
      const count = result.sessions.filter((session) =>
        ACTIVE_STATUSES.has(session.status)
      ).length;
      setActiveCount(count);
    } catch {
      // Silent — this is a best-effort ambient indicator, not critical UI.
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), FALLBACK_POLL_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  useRealtimeRefresh(
    ["candidates.search.poll", "notification.created"],
    () => {
      void refresh();
    },
    { debounceMs: 1500 }
  );

  if (activeCount === 0) return null;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={ROUTES.searchHistory}
            aria-label={`${activeCount} candidate search${activeCount === 1 ? "" : "es"} in progress`}
            className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          />
        }
      >
        <Loader2 aria-hidden className="size-3.5 animate-spin" />
        <span className="text-xs">Searching… ({activeCount})</span>
      </TooltipTrigger>
      <TooltipContent>
        {activeCount === 1
          ? "1 candidate search running in the background"
          : `${activeCount} candidate searches running in the background`}
      </TooltipContent>
    </Tooltip>
  );
}
