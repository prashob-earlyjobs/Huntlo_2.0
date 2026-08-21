"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import {
  clearPendingSearch,
  isSearchWorkspaceActive,
  notifyPendingSearchFinished,
  readPendingSearch,
} from "@/lib/pending-search";
import { sessionDetailPath } from "@/lib/routes";
import { useRealtime } from "@/providers/realtime-provider";

const TERMINAL = new Set(["completed", "partial", "failed", "cancelled"]);

export function PendingSearchNotifier() {
  const pathname = usePathname();
  const { subscribe } = useRealtime();

  useEffect(() => {
    const handle = (event: { type: string; data?: unknown }) => {
      const pending = readPendingSearch();
      if (!pending) return;
      const data = (event.data ?? event) as {
        savedSessionId?: string;
        sessionId?: string;
        status?: string;
        totalDocs?: number;
        polling?: boolean;
        error?: string | null;
      };
      const matches =
        data.savedSessionId === pending.savedSessionId ||
        data.sessionId === pending.sessionId;
      if (!matches) return;

      const status = (data.status ?? "").toLowerCase();
      const terminal = TERMINAL.has(status) || data.polling === false;
      if (!terminal) return;

      const leftSearchPage = !isSearchWorkspaceActive();
      const tabHidden = typeof document !== "undefined" && document.hidden;
      if (leftSearchPage || tabHidden) {
        const failed = status === "failed" || status === "cancelled";
        notifyPendingSearchFinished({
          title: failed ? "Candidate search failed" : "Candidate search finished",
          body: failed
            ? data.error || "We could not finish this search."
            : `Found ${data.totalDocs ?? 0} candidates.`,
          url: sessionDetailPath(pending.savedSessionId),
        });
      }

      if (leftSearchPage) {
        clearPendingSearch();
      }
    };

    const unsubPoll = subscribe("candidates.search.poll", handle);
    const unsubDone = subscribe("candidates.search.completed", handle);
    return () => {
      unsubPoll();
      unsubDone();
    };
  }, [subscribe, pathname]);

  return null;
}
