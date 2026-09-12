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
import {
  isHcgStatusOnlyEvent,
  mergeConversationListPreserve,
  patchConversationsFromHcgStatus,
} from "@/lib/conversations-list-merge";
import type { Conversation } from "@/lib/mock-conversations";
import { cn } from "@/lib/utils";
import type { RealtimeEvent } from "@/providers/realtime-provider";

const PAGE_SIZE = 50;

function mergeById(existing: Conversation[], incoming: Conversation[]) {
  if (existing.length === 0) return incoming;
  const seen = new Set(existing.map((row) => row.id));
  const appended = incoming.filter((row) => !seen.has(row.id));
  return appended.length === 0 ? existing : [...existing, ...appended];
}

function hcgPatchFromEvent(event: RealtimeEvent) {
  const data =
    event?.data && typeof event.data === "object"
      ? (event.data as Record<string, unknown>)
      : null;
  if (!data) return null;
  return {
    campaignId: data.campaignId != null ? String(data.campaignId) : null,
    email: data.email != null ? String(data.email) : null,
    phone: data.phone != null ? String(data.phone) : null,
    overallAIStatus:
      data.overallAIStatus != null ? String(data.overallAIStatus) : null,
    reasons: Array.isArray(data.reasons)
      ? data.reasons.map((r) => String(r))
      : null,
  };
}

export function ConversationsPanel({
  campaignId,
  candidateId,
  candidateIds,
  jobId,
  emptyDescription = "Outbound messages (sent or failed) and candidate replies will appear here.",
  className,
  variant = "full",
}: {
  campaignId?: string;
  candidateId?: string;
  candidateIds?: string[];
  jobId?: string;
  emptyDescription?: string;
  className?: string;
  variant?: "full" | "embedded";
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  const candidateIdsKey = (candidateIds ?? []).filter(Boolean).join(",");

  const listParams = useCallback(
    (pageNumber: number) => ({
      campaignId,
      candidateId,
      candidateIds: candidateIdsKey ? candidateIdsKey.split(",") : undefined,
      jobId,
      page: pageNumber,
      limit: PAGE_SIZE,
    }),
    [campaignId, candidateId, candidateIdsKey, jobId]
  );

  const refresh = useCallback(
    async (opts?: { showLoading?: boolean; soft?: boolean }) => {
      const requestId = ++requestIdRef.current;
      if (opts?.showLoading) setLoading(true);
      try {
        const result = await conversationsApi.list(listParams(1));
        if (requestId !== requestIdRef.current) return;
        setConversations((previous) =>
          opts?.soft
            ? mergeConversationListPreserve(previous, result.items)
            : result.items
        );
        setPage(1);
        setTotalPages(result.pagination.totalPages);
        setTotal(result.pagination.total);
        setError(null);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        if (isAbortError(err)) return;
        setError(getApiErrorMessage(err, "Unable to load conversations."));
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [listParams]
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    const requestId = ++requestIdRef.current;
    setLoadingMore(true);
    try {
      const result = await conversationsApi.list(listParams(nextPage));
      if (requestId !== requestIdRef.current) return;
      setConversations((previous) => mergeById(previous, result.items));
      setPage(result.pagination.page);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
      setError(null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      if (isAbortError(err)) return;
      setError(getApiErrorMessage(err, "Unable to load more conversations."));
    } finally {
      if (requestId === requestIdRef.current) setLoadingMore(false);
    }
  }, [listParams, loadingMore, page, totalPages]);

  useEffect(() => {
    void refresh({ showLoading: true });
    return () => {
      requestIdRef.current += 1;
    };
  }, [refresh]);

  useRealtimeRefresh(
    [
      "hcg.gmail.updated",
      "hcg.zoho.updated",
      "hcg.whatsapp.updated",
      "hcg.hunar.updated",
      "hcg.zyvkay.updated",
    ],
    (event) => {
      const data =
        event?.data && typeof event.data === "object"
          ? (event.data as { campaignId?: string | null })
          : null;
      if (
        campaignId &&
        data?.campaignId &&
        String(data.campaignId) !== String(campaignId)
      ) {
        return;
      }
      const patch = hcgPatchFromEvent(event);
      if (patch && isHcgStatusOnlyEvent(patch)) {
        const next = patchConversationsFromHcgStatus(
          conversationsRef.current,
          patch
        );
        if (next && next !== conversationsRef.current) {
          setConversations(next);
          return;
        }
      }
      void refresh({ soft: true });
    },
    { debounceMs: 250 }
  );

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
      void refresh({ soft: true });
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

  if (error && conversations.length === 0) {
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
      hasMore={page < totalPages}
      loadingMore={loadingMore}
      totalCount={total}
      onLoadMore={() => {
        void loadMore();
      }}
    />
  );
}
