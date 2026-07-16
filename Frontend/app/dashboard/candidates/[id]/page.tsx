import type { Metadata } from "next";

import { CandidateDetailPageClient } from "@/components/candidates/candidate-detail-page-client";

export const metadata: Metadata = { title: "Candidate" };

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CandidateDetailPageClient candidateId={id} />;
}
