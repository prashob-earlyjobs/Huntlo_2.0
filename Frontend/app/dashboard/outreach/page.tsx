import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { MetricStrip } from "@/components/shared/metric-strip";
import { OutreachWorkspace } from "@/components/outreach/outreach-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { OUTREACH_METRICS } from "@/lib/mock-outreach";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Outreach" };

export default function OutreachPage() {
  return (
    <>
      <PageHeader
        title="Outreach"
        description="Campaigns across email, WhatsApp, and voice with reply tracking."
        actions={
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={ROUTES.outreachNew} />}
          >
            <Plus aria-hidden />
            Create Campaign
          </Button>
        }
      />

      <MetricStrip metrics={OUTREACH_METRICS} />

      <OutreachWorkspace />
    </>
  );
}
