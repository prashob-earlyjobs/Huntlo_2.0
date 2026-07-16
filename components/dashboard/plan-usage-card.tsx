import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { SectionHeader } from "@/components/shared/section-header";
import { UsageProgress } from "@/components/shared/usage-progress";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { CreditMetric } from "@/lib/types";

export function PlanUsageCard({
  metrics,
  planName,
  className,
}: {
  metrics: CreditMetric[];
  planName: string;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <SectionHeader
        title="Plan usage"
        description={`Remaining balances on your ${planName}`}
        actions={
          <Button size="sm" variant="ghost" render={<Link href={ROUTES.plans} />}>
            Manage plan
            <ExternalLink aria-hidden />
          </Button>
        }
      />
      <div className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <UsageProgress key={metric.id} metric={metric} />
        ))}
      </div>
    </section>
  );
}
