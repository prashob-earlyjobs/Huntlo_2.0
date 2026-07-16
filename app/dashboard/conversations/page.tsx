import type { Metadata } from "next";
import Link from "next/link";
import { Send } from "lucide-react";

import { ConversationInbox } from "@/components/conversations/conversation-inbox";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CONVERSATIONS } from "@/lib/mock-conversations";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Conversations" };

export default function ConversationsPage() {
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
      <ConversationInbox
        conversations={CONVERSATIONS}
        className="lg:h-[calc(100vh-14rem)]"
      />
    </>
  );
}
