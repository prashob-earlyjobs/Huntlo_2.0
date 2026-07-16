import type { Metadata } from "next";

import { CampaignDetailPageClient } from "@/components/outreach/campaign-detail-page-client";

export const metadata: Metadata = { title: "Campaign" };

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CampaignDetailPageClient id={id} />;
}
