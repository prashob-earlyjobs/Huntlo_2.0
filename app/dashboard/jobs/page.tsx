import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { JobsMetrics } from "@/components/jobs/jobs-metrics";
import { JobsWorkspace } from "@/components/jobs/jobs-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { JOB_METRICS, JOBS } from "@/lib/mock-jobs";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Jobs" };

export default function JobsPage() {
  return (
    <>
      <PageHeader
        title="Jobs"
        description="Centralise hiring requirements reused across sourcing, outreach, screening and scheduling."
        actions={
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={ROUTES.jobsNew} />}
          >
            <Plus aria-hidden />
            Create Job
          </Button>
        }
      />

      <JobsMetrics metrics={JOB_METRICS} />
      <JobsWorkspace jobs={JOBS} />
    </>
  );
}
