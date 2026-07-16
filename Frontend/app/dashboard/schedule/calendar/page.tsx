import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CalendarWorkspace } from "@/components/schedule/calendar-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <>
      <PageHeader
        title="Calendar"
        description="Month, week, day and agenda views of interviews across your hiring team."
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
      <CalendarWorkspace />
    </>
  );
}
