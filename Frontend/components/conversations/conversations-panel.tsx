"use client";

import { Users } from "lucide-react";
import { useEffect, useState } from "react";

import { ConversationInbox } from "@/components/conversations/conversation-inbox";
import { EmptyState } from "@/components/shared/empty-state";
import { conversationsApi, getApiErrorMessage } from "@/lib/api";
import type { Conversation } from "@/lib/mock-conversations";

export function ConversationsPanel({
  campaignId,
  candidateId,
  jobId,
  emptyDescription = "Replies from candidates will appear here.",
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

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const rows = await conversationsApi.list({
          campaignId,
          candidateId,
          jobId,
          limit: 100,
        });
        if (cancelled) return;
        setConversations(rows);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "Unable to load conversations."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [campaignId, candidateId, jobId]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading conversations…</p>;
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

  return <ConversationInbox conversations={conversations} className={className} />;
}
