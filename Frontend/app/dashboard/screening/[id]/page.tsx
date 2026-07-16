import type { Metadata } from "next";

import { ScreeningDetailPageClient } from "@/components/screening/screening-detail-page-client";

export const metadata: Metadata = { title: "Screening" };

export default async function ScreeningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ScreeningDetailPageClient id={id} />;
}
