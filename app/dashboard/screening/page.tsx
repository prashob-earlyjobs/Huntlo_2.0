import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { OverviewMetricCard } from "@/components/dashboard/overview-metric-card";
import { ScreeningHome } from "@/components/screening/screening-home";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { SCREENING_METRICS } from "@/lib/mock-screening";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "AI Screening" };

export default function ScreeningPage() {
  return (
    <>
      <PageHeader
        title="AI Screening"
        description="Voice screening is the primary workflow — conversational AI agents call candidates, score answers and recommend shortlists."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={ROUTES.screeningResults} />}
            >
              View Results
            </Button>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href={ROUTES.screeningNew} />}
            >
              <Plus aria-hidden />
              Create Screening
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {SCREENING_METRICS.map((metric) => (
          <OverviewMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <ScreeningHome />
    </>
  );
}
