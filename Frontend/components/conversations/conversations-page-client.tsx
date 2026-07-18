"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ConversationInbox } from "@/components/conversations/conversation-inbox";
import { ConversationInboxSkeleton } from "@/components/conversations/conversation-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { conversationsApi, getApiErrorMessage } from "@/lib/api";
import type { Conversation } from "@/lib/mock-conversations";
import { ROUTES } from "@/lib/routes";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

export function ConversationsPageClient() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const rows = await conversationsApi.list({ limit: 100 });
      setConversations(rows);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load conversations."));
    }
  }, []);

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
    () => {
      void refresh();
    }
  );

  return (
    <>
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
        <ConversationInboxSkeleton className="min-h-112 flex-1 xl:h-[calc(100svh-9.25rem)] xl:flex-none" />
      ) : (
        <ConversationInbox
          conversations={conversations}
          className="min-h-112 flex-1 xl:h-[calc(100svh-9.25rem)] xl:flex-none"
        />
      )}
    </>
  );
}
