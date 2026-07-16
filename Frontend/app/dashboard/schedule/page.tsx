import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { MetricStrip } from "@/components/shared/metric-strip";
import { ScheduleDashboard } from "@/components/schedule/schedule-dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { SCHEDULE_METRICS } from "@/lib/mock-schedule";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Interviews" };

export default function SchedulePage() {
  return (
    <>
      <PageHeader
        title="Interviews"
        description="Upcoming interviews, confirmations, and follow-ups."
        actions={
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={ROUTES.calendar} />}
          >
            <CalendarDays aria-hidden />
            Calendar
          </Button>
        }
      />

      <MetricStrip metrics={SCHEDULE_METRICS} />

      <ScheduleDashboard />
    </>
  );
}
