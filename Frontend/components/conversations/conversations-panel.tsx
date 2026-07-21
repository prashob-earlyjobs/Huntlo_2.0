"use client";

import { Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ConversationInbox } from "@/components/conversations/conversation-inbox";
import { ConversationInboxSkeleton } from "@/components/conversations/conversation-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import { conversationsApi, getApiErrorMessage } from "@/lib/api";
import type { Conversation } from "@/lib/mock-conversations";

export function ConversationsPanel({
  campaignId,
  candidateId,
  jobId,
  emptyDescription = "Outbound messages (sent or failed) and candidate replies will appear here.",
  className,
}: {
  campaignId?: string;
  candidateId?: string;
  jobId?: string;
  emptyDescription?: string;
  className?: string;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusThreadId, setFocusThreadId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const rows = await conversationsApi.list({
        campaignId,
        candidateId,
        jobId,
        limit: 100,
      });
      setConversations(rows);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load conversations."));
    }
  }, [campaignId, candidateId, jobId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        await refresh();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
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
      // Campaign-scoped panel: ignore events for other campaigns.
      if (
        campaignId &&
        data?.campaignId &&
        String(data.campaignId) !== String(campaignId)
      ) {
        return;
      }
      if (data?.threadId) {
        setFocusThreadId(String(data.threadId));
      }
      void refresh();
    }
  );

  if (loading) {
    return <ConversationInboxSkeleton className={className} />;
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No conversations yet"
        description={emptyDescription}
      />
    );
  }

  return (
    <ConversationInbox
      conversations={conversations}
      focusThreadId={focusThreadId}
      className={className}
    />
  );
}
