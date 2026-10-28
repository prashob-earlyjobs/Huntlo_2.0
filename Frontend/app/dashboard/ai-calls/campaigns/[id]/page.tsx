import type { Metadata } from "next";

import { CampaignDetailPageClient } from "@/components/ai-calls/campaign-detail-page-client";

export const metadata: Metadata = { title: "Campaign" };

export default async function AiCallCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CampaignDetailPageClient id={id} />;
}
