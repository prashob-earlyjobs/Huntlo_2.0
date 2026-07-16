"use client";

import Link from "next/link";
import { Bookmark, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { JobsTable } from "@/components/jobs/jobs-table";
import { FilterBar } from "@/components/shared/filter-bar";
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
  DATE_RANGE_OPTIONS,
  JOB_DEPARTMENTS,
  JOB_HIRING_MANAGERS,
  JOB_LOCATIONS,
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

function parseJobDate(createdAt: string) {
  const parsed = Date.parse(createdAt);
  if (!Number.isNaN(parsed)) return parsed;
  // Fallback for "12 Jun 2026" style demo labels.
  const match = createdAt.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (!match) return NaN;
  return Date.parse(`${match[2]} ${match[1]}, ${match[3]}`);
}

function matchesDateRange(createdAt: string, range: string) {
  if (range === "any") return true;
  const created = parseJobDate(createdAt);
  if (Number.isNaN(created)) return true;
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const windows: Record<string, number> = {
    "7d": 7 * day,
    "30d": 30 * day,
    "90d": 90 * day,
    ytd: now - Date.parse("2026-01-01"),
  };
  return now - created <= (windows[range] ?? Infinity);
}

export function JobsWorkspace({ jobs }: { jobs: JobListItem[] }) {
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [recruiters, setRecruiters] = useState<string[]>([]);
  const [managers, setManagers] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<string>("any");
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

      if (locations.length > 0 && !locations.includes(job.location)) return false;
      if (recruiters.length > 0 && !recruiters.includes(job.recruiter)) return false;
      if (managers.length > 0 && !managers.includes(job.hiringManager)) {
        return false;
      }
      if (!matchesDateRange(job.createdAt, dateRange)) return false;

      // “My active jobs” is keyed to Ananya in demo data.
      if (savedView === "my-active" && job.recruiter !== "Ananya Sharma") {
        return false;
      }

      return true;
    });
  }, [
    jobs,
    query,
    statuses,
    departments,
    locations,
    recruiters,
    managers,
    dateRange,
    savedView,
    activeView,
  ]);

  const hasFilters =
    query ||
    statuses.length ||
    departments.length ||
    locations.length ||
    recruiters.length ||
    managers.length ||
    dateRange !== "any" ||
    savedView !== "all";

  function clearFilters() {
    setQuery("");
    setStatuses([]);
    setDepartments([]);
    setLocations([]);
    setRecruiters([]);
    setManagers([]);
    setDateRange("any");
    setSavedView("all");
  }

  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="space-y-3 p-4">
        <SectionHeader
          title="All jobs"
          description={`${filtered.length} of ${jobs.length} requirements`}
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

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
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

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={savedView}
              onValueChange={(value) => value && setSavedView(value)}
            >
              <SelectTrigger size="sm" className="min-w-44" aria-label="Saved views">
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

            <Select
              value={dateRange}
              onValueChange={(value) => value && setDateRange(value)}
            >
              <SelectTrigger size="sm" className="min-w-36" aria-label="Date range">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters ? (
              <Button size="sm" variant="ghost" onClick={clearFilters}>
                <X aria-hidden />
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        <FilterBar>
          <FilterPopover
            label="Status"
            options={JOB_STATUSES.map((status) => ({
              id: status,
              label: status,
            }))}
            selected={statuses}
            onToggle={(id) => setStatuses((prev) => toggleValue(prev, id))}
          />
          <FilterPopover
            label="Department"
            options={JOB_DEPARTMENTS.map((department) => ({
              id: department,
              label: department,
            }))}
            selected={departments}
            onToggle={(id) => setDepartments((prev) => toggleValue(prev, id))}
          />
          <FilterPopover
            label="Location"
            options={JOB_LOCATIONS.map((location) => ({
              id: location,
              label: location,
            }))}
            selected={locations}
            onToggle={(id) => setLocations((prev) => toggleValue(prev, id))}
          />
          <FilterPopover
            label="Recruiter"
            options={JOB_RECRUITERS.map((recruiter) => ({
              id: recruiter,
              label: recruiter,
            }))}
            selected={recruiters}
            onToggle={(id) => setRecruiters((prev) => toggleValue(prev, id))}
          />
          <FilterPopover
            label="Hiring manager"
            options={JOB_HIRING_MANAGERS.map((manager) => ({
              id: manager,
              label: manager,
            }))}
            selected={managers}
            onToggle={(id) => setManagers((prev) => toggleValue(prev, id))}
          />
        </FilterBar>

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
