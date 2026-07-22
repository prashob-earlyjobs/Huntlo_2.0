import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

import { CampaignBuilder } from "@/components/outreach/campaign-builder";
import { CampaignDetailSkeleton } from "@/components/outreach/campaign-detail-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { campaignDetailPath, ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Edit Campaign" };

export default async function EditCampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { id } = await params;
  const { step: stepRaw } = await searchParams;
  const parsedStep = Number(stepRaw);
  const initialStep =
    Number.isFinite(parsedStep) && parsedStep >= 0 ? Math.floor(parsedStep) : undefined;

  return (
    <>
      <PageHeader
        title="Edit Campaign"
        description="Update setup, audience, channels, sequence, and qualification — then save or relaunch."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={campaignDetailPath(id)} />}
            >
              <ArrowLeft aria-hidden />
              Back to Campaign
            </Button>
            <Button
              size="sm"
              variant="ghost"
              nativeButton={false}
              render={<Link href={ROUTES.outreach} />}
            >
              Outreach
            </Button>
          </div>
        }
      />
      <Suspense fallback={<CampaignDetailSkeleton />}>
        <CampaignBuilder campaignId={id} initialStep={initialStep} />
      </Suspense>
    </>
  );
}
