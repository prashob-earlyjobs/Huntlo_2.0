import type { Metadata } from "next";

import { WorkflowDetailPageClient } from "@/components/huntlo-360/workflow-detail-page-client";

export const metadata: Metadata = { title: "Workflow" };

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkflowDetailPageClient id={id} />;
}
