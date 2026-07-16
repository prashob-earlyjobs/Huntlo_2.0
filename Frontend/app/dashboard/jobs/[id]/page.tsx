import type { Metadata } from "next";

import { JobDetailPageClient } from "@/components/jobs/job-detail-page-client";

export const metadata: Metadata = { title: "Job" };

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobDetailPageClient id={id} />;
}
