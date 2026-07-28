"use client";

import { Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ConversationInbox } from "@/components/conversations/conversation-inbox";
import { ConversationInboxSkeleton } from "@/components/conversations/conversation-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import {
  conversationsApi,
  getApiErrorMessage,
  isAbortError,
} from "@/lib/api";
import type { Conversation } from "@/lib/mock-conversations";
import { cn } from "@/lib/utils";

export function ConversationsPanel({
  campaignId,
  candidateId,
  jobId,
  emptyDescription = "Outbound messages (sent or failed) and candidate replies will appear here.",
  className,
  variant = "full",
}: {
  campaignId?: string;
  candidateId?: string;
  jobId?: string;
  emptyDescription?: string;
  className?: string;
  variant?: "full" | "embedded";
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const refresh = useCallback(
    async (opts?: { showLoading?: boolean }) => {
      const requestId = ++requestIdRef.current;
      if (opts?.showLoading) setLoading(true);
      try {
        const rows = await conversationsApi.list({
          campaignId,
          candidateId,
          jobId,
          limit: 100,
        });
        if (requestId !== requestIdRef.current) return;
        setConversations(rows);
        setError(null);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        if (isAbortError(err)) return;
        setError(getApiErrorMessage(err, "Unable to load conversations."));
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [campaignId, candidateId, jobId]
  );

  useEffect(() => {
    void refresh({ showLoading: true });
    return () => {
      requestIdRef.current += 1;
    };
  }, [refresh]);

  useRealtimeRefresh(
    [
      "conversation.message.created",
      "campaign.thread.updated",
      "conversation.qualification.updated",
    ],
    (event) => {
      const data =
        event?.data && typeof event.data === "object"
          ? (event.data as { threadId?: string; campaignId?: string | null })
          : null;
      if (
        campaignId &&
        data?.campaignId &&
        String(data.campaignId) !== String(campaignId)
      ) {
        return;
      }
      void refresh();
    },
    { debounceMs: 800 }
  );

  if (loading) {
    if (variant === "embedded") {
      return (
        <div
          aria-busy
          aria-label="Loading conversations"
          className={cn("space-y-2 p-4", className)}
        >
          <div className="h-10 animate-pulse rounded-md bg-muted" />
          <div className="h-10 animate-pulse rounded-md bg-muted" />
          <div className="h-10 animate-pulse rounded-md bg-muted" />
        </div>
      );
    }
    return <ConversationInboxSkeleton className={className} />;
  }

  if (error) {
    return (
      <p role="alert" className={cn("p-4 text-sm text-destructive", className)}>
        {error}
      </p>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className={cn(variant === "embedded" && "p-4", className)}>
        <EmptyState
          icon={Users}
          title="No conversations yet"
          description={emptyDescription}
        />
      </div>
    );
  }

  return (
    <ConversationInbox
      conversations={conversations}
      className={className}
      variant={variant}
    />
  );
}
