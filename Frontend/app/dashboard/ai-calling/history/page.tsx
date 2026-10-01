import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Call History" };

export default function AiCallingHistoryPage() {
  return (
    <>
      <PageHeader
        title="Call History"
        description="Browse past AI calling activity across campaigns."
      />
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
        <p className="text-sm font-medium text-foreground">Call history</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Historical dial activity will appear here.
        </p>
      </div>
    </>
  );
}
