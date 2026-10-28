import type { Metadata } from "next";

import { AssignedAgentsWorkspace } from "@/components/ai-calls/assigned-agents-workspace";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "AI Agents" };

export default function AiCallsPage() {
  return (
    <>
      <PageHeader
        title="AI Agents"
        description="Voice agents assigned to you. Use these for outbound AI calls."
      />
      <AssignedAgentsWorkspace />
    </>
  );
}
