import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { OverviewMetricCard } from "@/components/dashboard/overview-metric-card";
import { WorkflowsHome } from "@/components/huntlo-360/workflows-home";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { WORKFLOW_METRICS } from "@/lib/mock-360";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Huntlo 360" };

export default function Huntlo360Page() {
  return (
    <>
      <PageHeader
        title="Huntlo 360"
        description="End-to-end workflows: outreach, AI reply qualification, voice screening, shortlisting and interview scheduling — in one flow."
        actions={
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={ROUTES.huntlo360New} />}
          >
            <Plus aria-hidden />
            Create Workflow
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {WORKFLOW_METRICS.map((metric) => (
          <OverviewMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <WorkflowsHome />
    </>
  );
}
