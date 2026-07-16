import type { Metadata } from "next";

import { ConversationsPageClient } from "@/components/conversations/conversations-page-client";

export const metadata: Metadata = { title: "Conversations" };

export default function ConversationsPage() {
  return <ConversationsPageClient />;
}
