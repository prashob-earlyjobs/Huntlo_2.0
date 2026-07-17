"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { JobsMetrics } from "@/components/jobs/jobs-metrics";
import {
  JobsMetricsSkeleton,
  JobsWorkspaceSkeleton,
} from "@/components/jobs/jobs-skeleton";
import { JobsWorkspace } from "@/components/jobs/jobs-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage, jobsApi } from "@/lib/api";
import type { JobListItem, JobMetric } from "@/lib/api/contracts";
import { ROUTES } from "@/lib/routes";

export function JobsPageClient() {
  const [metrics, setMetrics] = useState<JobMetric[]>([]);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const [nextMetrics, nextJobs] = await Promise.all([
          jobsApi.getMetrics(),
          jobsApi.list({ limit: 100 }),
        ]);
        if (cancelled) return;
        setMetrics(nextMetrics);
        setJobs(nextJobs);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "Unable to load jobs."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Hiring requirements shared across sourcing, outreach, and screening."
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

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {loading && metrics.length === 0 ? (
        <JobsMetricsSkeleton />
      ) : metrics.length > 0 ? (
        <JobsMetrics metrics={metrics} />
      ) : null}

      {loading && jobs.length === 0 ? (
        <JobsWorkspaceSkeleton />
      ) : (
        <JobsWorkspace jobs={jobs} />
      )}
    </>
  );
}
