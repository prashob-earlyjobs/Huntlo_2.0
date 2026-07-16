import Link from "next/link";
import { CalendarX2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export default function InterviewNotFound() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-20 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-lg border border-border bg-muted">
        <CalendarX2 aria-hidden className="size-5 text-muted-foreground" />
      </div>
      <h1 className="text-base font-semibold text-foreground">
        Interview not found
      </h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        This interview may have been cancelled or deleted, or the link is out of
        date.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href={ROUTES.interviews} />}
        >
          Back to Interviews
        </Button>
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href={ROUTES.calendar} />}
        >
          Open Calendar
        </Button>
      </div>
    </div>
  );
}
