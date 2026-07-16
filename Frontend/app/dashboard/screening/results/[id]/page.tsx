import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ResultDetail } from "@/components/screening/result-detail";
import { Button } from "@/components/ui/button";
import {
  getScreeningResult,
  SCREENING_RESULTS,
} from "@/lib/mock-screening";
import { ROUTES } from "@/lib/routes";

export function generateStaticParams() {
  return SCREENING_RESULTS.map((result) => ({ id: result.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = getScreeningResult(id);
  return {
    title: result ? `${result.candidateName} · Screening` : "Screening Result",
  };
}

export default async function ScreeningResultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = getScreeningResult(id);

  if (!result) {
    notFound();
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="-ml-2 w-fit text-muted-foreground"
        nativeButton={false}
        render={<Link href={ROUTES.screeningResults} />}
      >
        <ArrowLeft aria-hidden />
        Screening Results
      </Button>
      <ResultDetail result={result} />
    </>
  );
}
