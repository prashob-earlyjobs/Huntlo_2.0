import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ScreeningDetail } from "@/components/screening/screening-detail";
import { Button } from "@/components/ui/button";
import { getScreeningBatch, SCREENING_BATCHES } from "@/lib/mock-screening";
import { ROUTES } from "@/lib/routes";

export function generateStaticParams() {
  return SCREENING_BATCHES.map((batch) => ({ id: batch.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const batch = getScreeningBatch(id);
  return { title: batch ? batch.name : "Screening" };
}

export default async function ScreeningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const batch = getScreeningBatch(id);

  if (!batch) {
    notFound();
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="-ml-2 w-fit text-muted-foreground"
        nativeButton={false}
        render={<Link href={ROUTES.screening} />}
      >
        <ArrowLeft aria-hidden />
        AI Screening
      </Button>
      <ScreeningDetail batch={batch} />
    </>
  );
}
