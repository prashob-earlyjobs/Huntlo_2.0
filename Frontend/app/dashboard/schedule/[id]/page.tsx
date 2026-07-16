import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { InterviewDetail } from "@/components/schedule/interview-detail";
import { Button } from "@/components/ui/button";
import { getInterview, INTERVIEWS } from "@/lib/mock-schedule";
import { ROUTES } from "@/lib/routes";

export function generateStaticParams() {
  return INTERVIEWS.map((interview) => ({ id: interview.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const interview = getInterview(id);
  return {
    title: interview
      ? `${interview.candidateName} · Interview`
      : "Interview",
  };
}

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const interview = getInterview(id);

  if (!interview) {
    notFound();
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="-ml-2 w-fit text-muted-foreground"
        nativeButton={false}
        render={<Link href={ROUTES.interviews} />}
      >
        <ArrowLeft aria-hidden />
        Interviews
      </Button>
      <InterviewDetail interview={interview} />
    </>
  );
}
