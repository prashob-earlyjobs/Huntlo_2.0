import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark } from "lucide-react";

import { PoolWorkspace } from "@/components/candidates/pool-workspace";
import { OverviewMetricCard } from "@/components/dashboard/overview-metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { POOL_METRICS } from "@/lib/mock-candidates";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Candidate Pool" };

export default function CandidatesPage() {
  return (
    <>
      <PageHeader
        title="Candidate Pool"
        description="Every candidate you've sourced, imported or saved — organised in one place."
        actions={
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={ROUTES.saved} />}
          >
            <Bookmark aria-hidden />
            Saved Lists
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {POOL_METRICS.map((metric) => (
          <OverviewMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <PoolWorkspace />
    </>
  );
}
