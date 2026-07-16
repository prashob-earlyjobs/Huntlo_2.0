"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { JobDetailView } from "@/components/jobs/job-detail-view";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage, jobsApi } from "@/lib/api";
import type { JobDetail } from "@/lib/api/contracts";
import { ROUTES } from "@/lib/routes";

export function JobDetailPageClient({ id }: { id: string }) {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const detail = await jobsApi.getById(id);
        if (cancelled) return;
        if (!detail) {
          setMissing(true);
          return;
        }
        setJob(detail);
      } catch (err) {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "Unable to load job."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading job…</p>;
  }

  if (missing) {
    return (
      <div className="space-y-3">
        <h1 className="text-lg font-semibold">Job not found</h1>
        <p className="text-sm text-muted-foreground">
          This job may have been deleted or belongs to another workspace.
        </p>
        <Button render={<Link href={ROUTES.jobs} />} variant="outline" size="sm">
          Back to jobs
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (!job) {
    return null;
  }

  return <JobDetailView job={job} />;
}
