import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { ScheduleDashboard } from "@/components/schedule/schedule-dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
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

      <ScheduleDashboard />
    </>
  );
}
