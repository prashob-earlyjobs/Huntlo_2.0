"use client";

import Link from "next/link";
import { Bookmark, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { JobsTable } from "@/components/jobs/jobs-table";
import { FilterPopover } from "@/components/shared/filter-popover";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  JOB_DEPARTMENTS,
  JOB_RECRUITERS,
  JOB_STATUSES,
  SAVED_JOB_VIEWS,
  type JobListItem,
} from "@/lib/mock-jobs";
import { ROUTES } from "@/lib/routes";
import type { JobStatus } from "@/lib/types";

function toggleValue(values: string[], id: string) {
  return values.includes(id) ? values.filter((value) => value !== id) : [...values, id];
}

const SAVED_VIEW_ITEMS = Object.fromEntries(
  SAVED_JOB_VIEWS.map((view) => [view.id, view.label])
);

export function JobsWorkspace({ jobs }: { jobs: JobListItem[] }) {
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [recruiters, setRecruiters] = useState<string[]>([]);
  const [savedView, setSavedView] = useState<string>("all");

  const activeView = SAVED_JOB_VIEWS.find((view) => view.id === savedView);

  const filtered = useMemo(() => {
    const viewStatuses = activeView?.status ?? [];
    const viewDepartments = activeView?.department ?? [];

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

      const statusFilter = statuses.length > 0 ? statuses : viewStatuses;
      if (statusFilter.length > 0 && !statusFilter.includes(job.status)) return false;

      const departmentFilter =
        departments.length > 0 ? departments : viewDepartments;
      if (
        departmentFilter.length > 0 &&
        !departmentFilter.includes(job.department)
      ) {
        return false;
      }

      if (recruiters.length > 0 && !recruiters.includes(job.recruiter)) return false;

      // “My active jobs” is keyed to Ananya in demo data.
      if (savedView === "my-active" && job.recruiter !== "Ananya Sharma") {
        return false;
      }

      return true;
    });
  }, [jobs, query, statuses, departments, recruiters, savedView, activeView]);

  const hasFilters =
    query || statuses.length || departments.length || recruiters.length || savedView !== "all";

  function clearFilters() {
    setQuery("");
    setStatuses([]);
    setDepartments([]);
    setRecruiters([]);
    setSavedView("all");
  }

  return (
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

          <Select
            items={SAVED_VIEW_ITEMS}
            value={savedView}
            onValueChange={(value) => value && setSavedView(value)}
          >
            <SelectTrigger size="sm" className="min-w-40" aria-label="Saved views">
              <Bookmark aria-hidden className="size-3.5 text-muted-foreground" />
              <SelectValue placeholder="Saved views" />
            </SelectTrigger>
            <SelectContent>
              {SAVED_JOB_VIEWS.map((view) => (
                <SelectItem key={view.id} value={view.id}>
                  {view.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span aria-hidden className="mx-0.5 h-4 w-px bg-border" />

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

        {activeView && savedView !== "all" ? (
          <p className="text-xs text-muted-foreground">
            Viewing <span className="font-medium text-foreground">{activeView.label}</span>
            {" — "}
            {activeView.description}
            {statuses.length === 0 && activeView.status?.length
              ? ` · Status: ${(activeView.status as JobStatus[]).join(", ")}`
              : null}
          </p>
        ) : null}
      </div>

      <div className="px-2 pb-2">
        <JobsTable jobs={filtered} />
      </div>
    </section>
  );
}
