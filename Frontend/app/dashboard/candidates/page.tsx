import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark } from "lucide-react";

import { PoolWorkspace } from "@/components/candidates/pool-workspace";
import { MetricStrip } from "@/components/shared/metric-strip";
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
        description="Sourced, imported, and saved candidates in one list."
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

      <MetricStrip metrics={POOL_METRICS} columns="5" />

      <PoolWorkspace />
    </>
  );
}
