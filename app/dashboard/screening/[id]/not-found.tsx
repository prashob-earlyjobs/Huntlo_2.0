import Link from "next/link";
import { AudioLines } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export default function ScreeningNotFound() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-20 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-lg border border-border bg-muted">
        <AudioLines aria-hidden className="size-5 text-muted-foreground" />
      </div>
      <h1 className="text-base font-semibold text-foreground">
        Screening not found
      </h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        This screening batch may have been deleted, or the link is out of date.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href={ROUTES.screening} />}
        >
          Back to AI Screening
        </Button>
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href={ROUTES.screeningNew} />}
        >
          Create Screening
        </Button>
      </div>
    </div>
  );
}
