import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

import { CampaignBuilder } from "@/components/outreach/campaign-builder";
import { CampaignDetailSkeleton } from "@/components/outreach/campaign-detail-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Create Campaign" };

export default function NewCampaignPage() {
  return (
    <>
      <PageHeader
        title="Create Campaign"
        description="Six steps: setup, audience, channels, sequence, qualification, and review. No messages are sent from this preview."
        actions={
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={ROUTES.outreach} />}
          >
            <ArrowLeft aria-hidden />
            Back to Outreach
          </Button>
        }
      />
      <Suspense fallback={<CampaignDetailSkeleton />}>
        <CampaignBuilder />
      </Suspense>
    </>
  );
}
