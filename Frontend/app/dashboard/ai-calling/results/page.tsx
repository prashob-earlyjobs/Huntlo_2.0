import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Call Results" };

export default function AiCallingResultsPage() {
  return (
    <>
      <PageHeader
        title="Call Results"
        description="Review completed AI call outcomes and scores."
      />
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
        <p className="text-sm font-medium text-foreground">Call results</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Outcome tables and transcripts will appear here.
        </p>
      </div>
    </>
  );
}
