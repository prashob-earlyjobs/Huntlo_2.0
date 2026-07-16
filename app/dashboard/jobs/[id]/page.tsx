import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JobDetailView } from "@/components/jobs/job-detail-view";
import { getJobDetail, JOBS } from "@/lib/mock-jobs";

export function generateStaticParams() {
  return JOBS.map((job) => ({ id: job.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = getJobDetail(id);
  return { title: job ? job.title : "Job not found" };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = getJobDetail(id);

  if (!job) {
    notFound();
  }

  return <JobDetailView job={job} />;
}
