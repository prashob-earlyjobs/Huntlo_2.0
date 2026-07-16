import type { Metadata } from "next";

import { SessionResultsPageClient } from "@/components/sessions/session-results-page-client";

export const metadata: Metadata = { title: "Search results" };

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SessionResultsPageClient sessionId={id} />;
}
