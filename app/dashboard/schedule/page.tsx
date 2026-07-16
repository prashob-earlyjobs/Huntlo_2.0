import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";

import { OverviewMetricCard } from "@/components/dashboard/overview-metric-card";
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
        description="Schedule, track and follow up on interviews — without connecting Calendly or Google Calendar in this preview."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={ROUTES.calendar} />}
            >
              <CalendarDays aria-hidden />
              Calendar
            </Button>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={ROUTES.availability} />}
            >
              <Clock aria-hidden />
              Availability
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {SCHEDULE_METRICS.map((metric) => (
          <OverviewMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <ScheduleDashboard />
    </>
  );
}
