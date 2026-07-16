"use client";

import {
  CalendarClock,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { InterviewStatusBadge } from "@/components/schedule/interview-status-badge";
import { ScheduleInterviewFlow } from "@/components/schedule/schedule-interview-flow";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import {
  FilterPopover,
  type FilterOption,
} from "@/components/shared/filter-popover";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DATE_RANGE_OPTIONS } from "@/lib/mock-jobs";
import {
  INTERVIEW_STATUSES,
  INTERVIEW_TYPES,
  INTERVIEWS,
  SCHEDULE_INTERVIEWERS,
  SCHEDULE_RECRUITERS,
  type Interview,
} from "@/lib/mock-schedule";
import {
  candidateDetailPath,
  interviewDetailPath,
  jobDetailPath,
} from "@/lib/routes";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

function toOptions(values: readonly string[]): FilterOption[] {
  return values.map((value) => ({ id: value, label: value }));
}

function RowActions({
  interview,
  onAction,
}: {
  interview: Interview;
  onAction: (message: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Actions for ${interview.candidateName}`}
          />
        }
      >
        <MoreHorizontal aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          render={<Link href={interviewDetailPath(interview.id)} />}
        >
          <Eye aria-hidden />
          View interview
        </DropdownMenuItem>
        {interview.candidateId ? (
          <DropdownMenuItem
            render={
              <Link href={candidateDetailPath(interview.candidateId)} />
            }
          >
            <Eye aria-hidden />
            View candidate
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          onClick={() =>
            onAction(`Opened reschedule for ${interview.candidateName}.`)
          }
        >
          Reschedule
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            onAction(`Reminder sent to ${interview.candidateName}.`)
          }
        >
          <Send aria-hidden />
          Send reminder
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() =>
            onAction(`Cancelled interview with ${interview.candidateName}.`)
          }
        >
          <Trash2 aria-hidden />
          Cancel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ScheduleDashboard() {
  const [query, setQuery] = useState("");
  const [jobFilter, setJobFilter] = useState<string[]>([]);
  const [recruiterFilter, setRecruiterFilter] = useState<string[]>([]);
  const [interviewerFilter, setInterviewerFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState("any");
  const [message, setMessage] = useState<string | null>(null);
  const [flowOpen, setFlowOpen] = useState(false);

  const jobOptions = useMemo(() => {
    const titles = new Map<string, string>();
    INTERVIEWS.forEach((interview) => {
      if (interview.jobId) titles.set(interview.jobId, interview.jobTitle);
    });
    return Array.from(titles, ([id, label]) => ({ id, label }));
  }, []);

  function toggle(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    return (id: string) =>
      setter((previous) =>
        previous.includes(id)
          ? previous.filter((value) => value !== id)
          : [...previous, id]
      );
  }

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return INTERVIEWS.filter((interview) => {
      if (
        normalized &&
        !`${interview.candidateName} ${interview.jobTitle} ${interview.interviewType}`
          .toLowerCase()
          .includes(normalized)
      )
        return false;
      if (jobFilter.length > 0 && !jobFilter.includes(interview.jobId ?? ""))
        return false;
      if (
        recruiterFilter.length > 0 &&
        !recruiterFilter.includes(interview.recruiter)
      )
        return false;
      if (
        interviewerFilter.length > 0 &&
        !interview.interviewers.some((person) =>
          interviewerFilter.includes(person)
        )
      )
        return false;
      if (statusFilter.length > 0 && !statusFilter.includes(interview.status))
        return false;
      if (
        typeFilter.length > 0 &&
        !typeFilter.includes(interview.interviewType)
      )
        return false;
      // Date range is UI-only against mock data; "any" shows all.
      if (dateRange === "7d") {
        const upcoming = [
          "2026-07-16",
          "2026-07-17",
          "2026-07-18",
          "2026-07-19",
          "2026-07-20",
          "2026-07-21",
          "2026-07-22",
        ];
        if (!upcoming.includes(interview.dateKey)) return false;
      }
      return true;
    });
  }, [
    query,
    jobFilter,
    recruiterFilter,
    interviewerFilter,
    statusFilter,
    typeFilter,
    dateRange,
  ]);

  const hasFilters =
    Boolean(query) ||
    jobFilter.length > 0 ||
    recruiterFilter.length > 0 ||
    interviewerFilter.length > 0 ||
    statusFilter.length > 0 ||
    typeFilter.length > 0 ||
    dateRange !== "any";

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  }

  function resetFilters() {
    setQuery("");
    setJobFilter([]);
    setRecruiterFilter([]);
    setInterviewerFilter([]);
    setStatusFilter([]);
    setTypeFilter([]);
    setDateRange("any");
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search candidates, jobs…"
              aria-label="Search interviews"
              className="pl-8"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterPopover
              label="Job"
              options={jobOptions}
              selected={jobFilter}
              onToggle={toggle(setJobFilter)}
            />
            <FilterPopover
              label="Recruiter"
              options={toOptions(SCHEDULE_RECRUITERS)}
              selected={recruiterFilter}
              onToggle={toggle(setRecruiterFilter)}
            />
            <FilterPopover
              label="Interviewer"
              options={toOptions(SCHEDULE_INTERVIEWERS)}
              selected={interviewerFilter}
              onToggle={toggle(setInterviewerFilter)}
            />
            <FilterPopover
              label="Interview status"
              options={toOptions(INTERVIEW_STATUSES)}
              selected={statusFilter}
              onToggle={toggle(setStatusFilter)}
            />
            <FilterPopover
              label="Type"
              options={toOptions(INTERVIEW_TYPES)}
              selected={typeFilter}
              onToggle={toggle(setTypeFilter)}
            />
            <Select
              value={dateRange}
              onValueChange={(value) => value && setDateRange(value)}
            >
              <SelectTrigger size="sm" aria-label="Date range">
                <SelectValue />
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
              <Button size="sm" variant="ghost" onClick={resetFilters}>
                <X aria-hidden />
                Reset
              </Button>
            ) : null}
            <Button size="sm" onClick={() => setFlowOpen(true)}>
              <Plus aria-hidden />
              Schedule Interview
            </Button>
          </div>
        </div>
      </section>

      {message ? (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {message}
        </p>
      ) : null}

      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">
              {filtered.length}
            </span>{" "}
            interviews
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <caption className="sr-only">
                Scheduled interviews with booking and reminder status
              </caption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={HEAD}>Candidate</TableHead>
                  <TableHead className={HEAD}>Job</TableHead>
                  <TableHead className={HEAD}>Interview type</TableHead>
                  <TableHead className={HEAD}>Interviewers</TableHead>
                  <TableHead className={HEAD}>Date and time</TableHead>
                  <TableHead className={HEAD}>Meeting platform</TableHead>
                  <TableHead className={HEAD}>Booking source</TableHead>
                  <TableHead className={HEAD}>Reminder status</TableHead>
                  <TableHead className={HEAD}>Interview status</TableHead>
                  <TableHead className={`${HEAD} w-10 text-right`}>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((interview) => (
                  <TableRow key={interview.id}>
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-2.5">
                        <CandidateAvatar
                          name={interview.candidateName}
                          className="size-7"
                        />
                        <Link
                          href={interviewDetailPath(interview.id)}
                          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          {interview.candidateName}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 whitespace-nowrap">
                      {interview.jobId ? (
                        <Link
                          href={jobDetailPath(interview.jobId)}
                          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                        >
                          {interview.jobTitle}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {interview.jobTitle}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                      {interview.interviewType}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-muted-foreground">
                      <span className="line-clamp-2 max-w-40">
                        {interview.interviewers.join(", ")}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 whitespace-nowrap">
                      <p className="text-sm text-foreground">
                        {interview.dateLabel}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {interview.timeLabel}
                      </p>
                    </TableCell>
                    <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                      {interview.platform}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                      {interview.bookingSource}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                      {interview.reminderStatus}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <InterviewStatusBadge status={interview.status} />
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      <RowActions interview={interview} onAction={flash} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={CalendarClock}
            title="No interviews match these filters"
            description="Adjust your filters, or schedule a new interview."
            actionLabel="Schedule Interview"
            className="m-4 border-0"
            onAction={() => setFlowOpen(true)}
          />
        )}
      </section>

      <ScheduleInterviewFlow
        open={flowOpen}
        onOpenChange={setFlowOpen}
        onComplete={flash}
      />
    </div>
  );
}
