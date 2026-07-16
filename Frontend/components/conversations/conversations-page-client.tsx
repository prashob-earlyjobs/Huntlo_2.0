"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";

import { ConversationInbox } from "@/components/conversations/conversation-inbox";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { conversationsApi, getApiErrorMessage } from "@/lib/api";
import type { Conversation } from "@/lib/mock-conversations";
import { ROUTES } from "@/lib/routes";

export function ConversationsPageClient() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const rows = await conversationsApi.list({ limit: 100 });
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
  }, []);

  return (
    <>
      <PageHeader
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
        <p role="alert" className="mb-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading conversations…</p>
      ) : (
        <ConversationInbox
          conversations={conversations}
          className="lg:h-[calc(100vh-14rem)]"
        />
      )}
    </>
  );
}
