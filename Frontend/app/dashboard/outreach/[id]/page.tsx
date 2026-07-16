import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CampaignDetail } from "@/components/outreach/campaign-detail";
import { Button } from "@/components/ui/button";
import { getCampaign } from "@/lib/mock-campaign-detail";
import { OUTREACH_CAMPAIGNS } from "@/lib/mock-outreach";
import { ROUTES } from "@/lib/routes";

export function generateStaticParams() {
  return OUTREACH_CAMPAIGNS.map((campaign) => ({ id: campaign.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const campaign = getCampaign(id);
  return { title: campaign ? campaign.name : "Campaign" };
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = getCampaign(id);

  if (!campaign) {
    notFound();
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="-ml-2 w-fit text-muted-foreground"
        nativeButton={false}
        render={<Link href={ROUTES.outreach} />}
      >
        <ArrowLeft aria-hidden />
        Outreach
      </Button>
      <CampaignDetail campaign={campaign} />
    </>
  );
}
