import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SessionResults } from "@/components/sessions/session-results";
import {
  SOURCING_SESSIONS,
  getSession,
  getSessionCandidates,
} from "@/lib/mock-sessions";

export function generateStaticParams() {
  return SOURCING_SESSIONS.map((session) => ({ id: session.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = getSession(id);
  return { title: session ? session.name : "Search results" };
}

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = getSession(id);

  if (!session) {
    notFound();
  }

  const candidates = getSessionCandidates(session);

  return <SessionResults session={session} candidates={candidates} />;
}
