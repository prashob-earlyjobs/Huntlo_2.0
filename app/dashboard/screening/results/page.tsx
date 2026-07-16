import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

import { ResultsWorkspace } from "@/components/screening/results-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Screening Results" };

export default function ScreeningResultsPage() {
  return (
    <>
      <PageHeader
        title="Screening Results"
        description="Completed voice screenings with AI scores, recommendations and recruiter decisions."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={ROUTES.screening} />}
            >
              <ArrowLeft aria-hidden />
              AI Screening
            </Button>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href={ROUTES.screeningNew} />}
            >
              <Plus aria-hidden />
              Create Screening
            </Button>
          </div>
        }
      />
      <ResultsWorkspace />
    </>
  );
}
