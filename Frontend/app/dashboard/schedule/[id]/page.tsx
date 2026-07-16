import type { Metadata } from "next";

import { InterviewDetailPageClient } from "@/components/schedule/interview-detail-page-client";

export const metadata: Metadata = { title: "Interview" };

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InterviewDetailPageClient id={id} />;
}
