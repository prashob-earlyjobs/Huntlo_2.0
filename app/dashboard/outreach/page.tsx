import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { OutreachWorkspace } from "@/components/outreach/outreach-workspace";
import { OverviewMetricCard } from "@/components/dashboard/overview-metric-card";
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
        description="Multi-channel campaigns across email, WhatsApp and AI voice — with automatic reply qualification."
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {OUTREACH_METRICS.map((metric) => (
          <OverviewMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <OutreachWorkspace />
    </>
  );
}
