import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarClock } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Availability" };

export default function AvailabilityPage() {
  return (
    <>
      <PageHeader
        title="Availability"
        description="Weekly hours, date overrides, buffers and booking limits for scheduling links."
        actions={
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={ROUTES.interviews} />}
          >
            <ArrowLeft aria-hidden />
            Interviews
          </Button>
        }
      />
      <EmptyState
        icon={CalendarClock}
        title="Availability is coming soon"
        description="Set weekly hours, date overrides, and booking limits here once this workspace feature ships."
        actionLabel="Back to interviews"
        actionHref={ROUTES.interviews}
      />
    </>
  );
}
