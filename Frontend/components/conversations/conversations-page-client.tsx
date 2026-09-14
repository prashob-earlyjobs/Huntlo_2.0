"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ConversationInbox } from "@/components/conversations/conversation-inbox";
import { ConversationInboxSkeleton } from "@/components/conversations/conversation-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
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
import { ROUTES } from "@/lib/routes";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import type { RealtimeEvent } from "@/providers/realtime-provider";

const PAGE_SIZE = 20;

const CHANNEL_API: Record<string, "email" | "whatsapp" | "ai_voice"> = {
  Email: "email",
  WhatsApp: "whatsapp",
  "AI Voice": "ai_voice",
};

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

export function ConversationsPageClient() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  const requestIdRef = useRef(0);
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const listParams = useCallback(
    (pageNumber: number) => ({
      page: pageNumber,
      limit: PAGE_SIZE,
      q: searchQuery || undefined,
      unreadOnly: unreadOnly || undefined,
      channel:
        channelFilter.length === 1
          ? CHANNEL_API[channelFilter[0] ?? ""]
          : undefined,
    }),
    [searchQuery, unreadOnly, channelFilter]
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
    () => {
      void refresh({ soft: true });
    },
    { debounceMs: 800 }
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <PageHeader
        className="shrink-0"
        title="Conversations"
        description="Every candidate reply across email, WhatsApp and AI voice — in one inbox."
        actions={
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={ROUTES.outreach} />}
          >
            <Send aria-hidden />
            Outreach Campaigns
          </Button>
        }
      />
      {error ? (
        <p role="alert" className="shrink-0 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {loading ? (
        <ConversationInboxSkeleton className="min-h-0 flex-1" />
      ) : (
        <ConversationInbox
          conversations={conversations}
          className="min-h-0 flex-1"
          hasMore={page < totalPages}
          loadingMore={loadingMore}
          totalCount={total}
          serverPaginated
          searchQuery={searchInput}
          onSearchQueryChange={setSearchInput}
          unreadOnly={unreadOnly}
          onUnreadOnlyChange={setUnreadOnly}
          channelFilter={channelFilter}
          onChannelFilterChange={setChannelFilter}
          onLoadMore={loadMore}
        />
      )}
    </div>
  );
}
