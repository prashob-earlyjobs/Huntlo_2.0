import type { Metadata } from "next";
import { Suspense } from "react";

import { CampaignDetailPageClient } from "@/components/outreach/campaign-detail-page-client";
import { CampaignDetailSkeleton } from "@/components/outreach/campaign-detail-skeleton";

export const metadata: Metadata = { title: "Campaign" };

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<CampaignDetailSkeleton />}>
      <CampaignDetailPageClient id={id} />
    </Suspense>
  );
}
