import type { Metadata } from "next";

import { JobForm } from "@/components/jobs/job-form";

export const metadata: Metadata = { title: "Create Job" };

export default function CreateJobPage() {
  return <JobForm />;
}
