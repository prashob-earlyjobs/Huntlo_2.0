import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CampaignBuilder } from "@/components/outreach/campaign-builder";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { campaignDetailPath, ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Edit Campaign" };

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
      <CampaignBuilder campaignId={id} />
    </>
  );
}
