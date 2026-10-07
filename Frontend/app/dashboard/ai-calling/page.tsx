import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "AI Calling" };

export default function AiCallingPage() {
  return (
    <>
      <PageHeader
        title="AI Calling"
        description="Launch and manage AI voice call campaigns."
      />
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
        <p className="text-sm font-medium text-foreground">AI Calling workspace</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Campaign list and dial controls will appear here.
        </p>
      </div>
    </>
  );
}
