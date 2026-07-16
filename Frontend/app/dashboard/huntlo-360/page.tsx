import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { MetricStrip } from "@/components/shared/metric-strip";
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
        description="End-to-end flows from outreach through screening and scheduling."
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

      <MetricStrip metrics={WORKFLOW_METRICS} />

      <WorkflowsHome />
    </>
  );
}
