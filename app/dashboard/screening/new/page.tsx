import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ScreeningBuilder } from "@/components/screening/screening-builder";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Create Screening" };

export default function NewScreeningPage() {
  return (
    <>
      <PageHeader
        title="Create Screening"
        description="Seven steps: details, candidates, agent, questions, evaluation, call settings, and launch. No calls are placed from this preview."
        actions={
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={ROUTES.screening} />}
          >
            <ArrowLeft aria-hidden />
            Back to AI Screening
          </Button>
        }
      />
      <ScreeningBuilder />
    </>
  );
}
