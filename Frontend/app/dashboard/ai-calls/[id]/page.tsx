import type { Metadata } from "next";

import { AgentDetailPageClient } from "@/components/ai-calls/agent-detail-page-client";

export const metadata: Metadata = { title: "Voice agent" };

export default async function AiCallAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AgentDetailPageClient id={id} />;
}
