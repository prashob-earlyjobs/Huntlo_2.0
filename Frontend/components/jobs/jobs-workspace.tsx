"use client";

import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { JobsTable } from "@/components/jobs/jobs-table";
import { FilterPopover } from "@/components/shared/filter-popover";
import { SectionHeader } from "@/components/shared/section-header";
import { Snackbar } from "@/components/shared/snackbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  JOB_DEPARTMENTS,
  JOB_RECRUITERS,
  JOB_STATUSES,
  type JobListItem,
} from "@/lib/mock-jobs";
import { ROUTES } from "@/lib/routes";

function toggleValue(values: string[], id: string) {
  return values.includes(id) ? values.filter((value) => value !== id) : [...values, id];
}

export function JobsWorkspace({
  jobs,
  onJobUpdated,
  onJobRemoved,
}: {
  jobs: JobListItem[];
  onJobUpdated?: (job: JobListItem) => void;
  onJobRemoved?: (jobId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [recruiters, setRecruiters] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const haystack = [
        job.title,
        job.department,
        job.location,
        job.recruiter,
        job.hiringManager,
      ]
        .join(" ")
        .toLowerCase();
      if (query && !haystack.includes(query.toLowerCase())) return false;
      if (statuses.length > 0 && !statuses.includes(job.status)) return false;
      if (
        departments.length > 0 &&
        !departments.includes(job.department)
      ) {
        return false;
      }
      if (recruiters.length > 0 && !recruiters.includes(job.recruiter)) return false;
      return true;
    });
  }, [jobs, query, statuses, departments, recruiters]);

  const hasFilters =
    query || statuses.length || departments.length || recruiters.length;

  function clearFilters() {
    setQuery("");
    setStatuses([]);
    setDepartments([]);
    setRecruiters([]);
  }

  return (
    <>
      <section className="rounded-lg border border-border bg-card">
      <div className="space-y-3 border-b border-border p-4">
        <SectionHeader
          title="All jobs"
          description={`${filtered.length} of ${jobs.length} open`}
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

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search jobs..."
              aria-label="Search jobs"
              className="h-8 pl-8"
            />
          </div>

          <FilterPopover
            label="Status"
            variant="ghost"
            options={JOB_STATUSES.map((status) => ({ id: status, label: status }))}
            selected={statuses}
            onToggle={(id) => setStatuses((prev) => toggleValue(prev, id))}
          />
          <FilterPopover
            label="Department"
            variant="ghost"
            options={JOB_DEPARTMENTS.map((department) => ({
              id: department,
              label: department,
            }))}
            selected={departments}
            onToggle={(id) => setDepartments((prev) => toggleValue(prev, id))}
          />
          <FilterPopover
            label="Recruiter"
            variant="ghost"
            options={JOB_RECRUITERS.map((recruiter) => ({
              id: recruiter,
              label: recruiter,
            }))}
            selected={recruiters}
            onToggle={(id) => setRecruiters((prev) => toggleValue(prev, id))}
          />

          {hasFilters ? (
            <Button size="sm" variant="ghost" onClick={clearFilters}>
              <X aria-hidden />
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      <div className="px-2 pb-2">
        <JobsTable
          jobs={filtered}
          onJobUpdated={onJobUpdated}
          onJobRemoved={onJobRemoved}
          onActionMessage={(message, variant = "success") => {
            setFeedback({ message, variant });
          }}
        />
      </div>
    </section>
    <Snackbar
      message={feedback?.message ?? null}
      variant={feedback?.variant === "error" ? "error" : "default"}
      onDismiss={() => setFeedback(null)}
    />
    </>
  );
}
