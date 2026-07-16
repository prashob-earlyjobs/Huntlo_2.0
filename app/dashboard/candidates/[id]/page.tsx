import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CandidateProfile } from "@/components/candidates/candidate-profile";
import { Button } from "@/components/ui/button";
import { getPoolCandidate, POOL_CANDIDATES } from "@/lib/mock-candidates";
import { ROUTES } from "@/lib/routes";

export function generateStaticParams() {
  return POOL_CANDIDATES.map((candidate) => ({ id: candidate.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const candidate = getPoolCandidate(id);
  return { title: candidate ? candidate.name : "Candidate" };
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = getPoolCandidate(id);

  if (!candidate) {
    notFound();
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="-ml-2 w-fit text-muted-foreground"
        nativeButton={false}
        render={<Link href={ROUTES.candidates} />}
      >
        <ArrowLeft aria-hidden />
        Candidate Pool
      </Button>
      <CandidateProfile candidate={candidate} />
    </>
  );
}
