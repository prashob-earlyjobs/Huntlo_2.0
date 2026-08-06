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
import type { Conversation } from "@/lib/mock-conversations";
import { ROUTES } from "@/lib/routes";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

const PAGE_SIZE = 50;

function mergeById(existing: Conversation[], incoming: Conversation[]) {
  if (existing.length === 0) return incoming;
  const seen = new Set(existing.map((row) => row.id));
  const appended = incoming.filter((row) => !seen.has(row.id));
  return appended.length === 0 ? existing : [...existing, ...appended];
}

export function ConversationsPageClient() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const refresh = useCallback(async (opts?: { showLoading?: boolean }) => {
    const requestId = ++requestIdRef.current;
    if (opts?.showLoading) setLoading(true);
    try {
      const result = await conversationsApi.list({ page: 1, limit: PAGE_SIZE });
      if (requestId !== requestIdRef.current) return;
      setConversations(result.items);
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
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    const requestId = ++requestIdRef.current;
    setLoadingMore(true);
    try {
      const result = await conversationsApi.list({
        page: nextPage,
        limit: PAGE_SIZE,
      });
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
  }, [loadingMore, page, totalPages]);

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
    () => {
      void refresh();
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
          onLoadMore={() => {
            void loadMore();
          }}
        />
      )}
    </div>
  );
}
