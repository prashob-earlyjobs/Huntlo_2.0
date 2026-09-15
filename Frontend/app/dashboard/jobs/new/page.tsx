import type { Metadata } from "next";
import { Suspense } from "react";

import { JobForm } from "@/components/jobs/job-form";
import { JobFormSkeleton } from "@/components/jobs/jobs-skeleton";

export const metadata: Metadata = { title: "Create Job" };

export default function CreateJobPage() {
  return (
    <Suspense fallback={<JobFormSkeleton />}>
      <JobForm />
    </Suspense>
  );
}
