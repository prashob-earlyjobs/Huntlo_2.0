import type { Metadata } from "next";

import { ScreeningResultDetailClient } from "@/components/screening/screening-result-detail-client";

export const metadata: Metadata = { title: "Screening Result" };

export default async function ScreeningResultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ScreeningResultDetailClient id={id} />;
}
