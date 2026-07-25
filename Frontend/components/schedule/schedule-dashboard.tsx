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
import { useCallback, useEffect, useMemo, useState } from "react";

import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

import { InterviewStatusBadge } from "@/components/schedule/interview-status-badge";
import { ScheduleInterviewFlow } from "@/components/schedule/schedule-interview-flow";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import {
  FilterPopover,
  type FilterOption,
} from "@/components/shared/filter-popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  type Interview,
} from "@/lib/mock-schedule";
import { getApiErrorMessage, schedulingApi } from "@/lib/api";
import {
  candidateDetailPath,
  interviewDetailPath,
  jobDetailPath,
} from "@/lib/routes";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

function toOptions(values: readonly string[]): FilterOption[] {
  return values.map((value) => ({ id: value, label: value }));
}

function InterviewsTableSkeleton() {
  return (
    <section
      aria-busy
      aria-label="Loading interviews"
      className="rounded-xl border border-border bg-card"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[960px]">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_0.9fr_0.9fr_0.9fr_0.9fr_40px] gap-3 border-b border-border px-4 py-2.5">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} className="h-3 w-full max-w-20" />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, row) => (
            <div
              key={row}
              className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_0.9fr_0.9fr_0.9fr_0.9fr_40px] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
            >
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-7 shrink-0 rounded-full" />
                <Skeleton className="h-3.5 w-28" />
              </div>
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3.5 w-28" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3.5 w-14" />
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="ml-auto size-7 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RowActions({
  interview,
  busy,
  onReschedule,
  onRemind,
  onCancel,
}: {
  interview: Interview;
  busy: boolean;
  onReschedule: () => void;
  onRemind: () => void;
  onCancel: () => void;
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
          disabled={busy}
          onClick={onReschedule}
        >
          Reschedule
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={busy || !interview.dateKey}
          onClick={onRemind}
        >
          <Send aria-hidden />
          Send reminder
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={
            busy ||
            interview.status === "Cancelled" ||
            interview.status === "Completed"
          }
          onClick={onCancel}
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
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Interview | null>(
    null
  );
  const [rescheduleAt, setRescheduleAt] = useState("");

  const refresh = useCallback(async () => {
    const rows = await schedulingApi.listInterviews();
    setInterviews(rows);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        await refresh();
      } catch (err) {
        if (!cancelled) setMessage(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useRealtimeRefresh("interview.updated", () => {
    void refresh().catch(() => undefined);
  });

  const jobOptions = useMemo(() => {
    const titles = new Map<string, string>();
    interviews.forEach((interview) => {
      if (interview.jobId) titles.set(interview.jobId, interview.jobTitle);
    });
    return Array.from(titles, ([id, label]) => ({ id, label }));
  }, [interviews]);

  const recruiterOptions = useMemo(() => {
    const names = new Set<string>();
    interviews.forEach((interview) => {
      if (interview.recruiter) names.add(interview.recruiter);
    });
    return toOptions(Array.from(names).sort());
  }, [interviews]);

  const interviewerOptions = useMemo(() => {
    const names = new Set<string>();
    interviews.forEach((interview) => {
      interview.interviewers.forEach((person) => names.add(person));
    });
    return toOptions(Array.from(names).sort());
  }, [interviews]);

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
    return interviews.filter((interview) => {
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
      if (dateRange === "7d") {
        if (!interview.dateKey) return false;
        const interviewDate = new Date(`${interview.dateKey}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(today);
        end.setDate(end.getDate() + 7);
        if (interviewDate < today || interviewDate >= end) return false;
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
    interviews,
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

  async function runInterviewAction(
    interview: Interview,
    action: () => Promise<Interview>,
    successMessage: string
  ) {
    setBusyId(interview.id);
    setActionError(null);
    try {
      const updated = await action();
      setInterviews((previous) =>
        previous.map((row) => (row.id === updated.id ? updated : row))
      );
      flash(successMessage);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Unable to update interview."));
    } finally {
      setBusyId(null);
    }
  }

  function openReschedule(interview: Interview) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const local = new Date(
      tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60_000
    )
      .toISOString()
      .slice(0, 16);
    setRescheduleAt(local);
    setRescheduleTarget(interview);
  }

  async function confirmReschedule() {
    if (!rescheduleTarget || !rescheduleAt) return;
    if (new Date(rescheduleAt).getTime() <= Date.now()) {
      setActionError("Choose a future date and time.");
      return;
    }
    const target = rescheduleTarget;
    await runInterviewAction(
      target,
      () =>
        schedulingApi.reschedule(target.id, {
          startAt: new Date(rescheduleAt).toISOString(),
          timezone: target.timezone,
        }),
      `Rescheduled interview with ${target.candidateName}.`
    );
    setRescheduleTarget(null);
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
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                disabled={loading}
              />
            </div>
            <Button
              size="sm"
              className="w-full shrink-0 sm:w-auto"
              onClick={() => setFlowOpen(true)}
            >
              <Plus aria-hidden />
              Schedule Interview
            </Button>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <FilterPopover
              label="Job"
              options={jobOptions}
              selected={jobFilter}
              onToggle={toggle(setJobFilter)}
            />
            <FilterPopover
              label="Recruiter"
              options={recruiterOptions}
              selected={recruiterFilter}
              onToggle={toggle(setRecruiterFilter)}
            />
            <FilterPopover
              label="Interviewer"
              options={interviewerOptions}
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
              <SelectTrigger
                size="sm"
                aria-label="Date range"
                className="w-auto min-w-[7.5rem] shrink-0"
              >
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
      {actionError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {actionError}
        </p>
      ) : null}

      {loading ? (
        <InterviewsTableSkeleton />
      ) : (
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
                      <RowActions
                        interview={interview}
                        busy={busyId === interview.id}
                        onReschedule={() => openReschedule(interview)}
                        onRemind={() =>
                          void runInterviewAction(
                            interview,
                            () => schedulingApi.remind(interview.id),
                            `Reminder sent to ${interview.candidateName}.`
                          )
                        }
                        onCancel={() => {
                          if (
                            !window.confirm(
                              `Cancel the interview with ${interview.candidateName}?`
                            )
                          ) {
                            return;
                          }
                          void runInterviewAction(
                            interview,
                            () => schedulingApi.cancel(interview.id),
                            `Cancelled interview with ${interview.candidateName}.`
                          );
                        }}
                      />
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
      )}

      <ScheduleInterviewFlow
        open={flowOpen}
        onOpenChange={setFlowOpen}
        onComplete={(message) => {
          flash(message);
          void schedulingApi.listInterviews().then(setInterviews).catch(() => undefined);
        }}
      />

      <Dialog
        open={Boolean(rescheduleTarget)}
        onOpenChange={(open) => {
          if (!open && !busyId) setRescheduleTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule interview</DialogTitle>
            <DialogDescription>
              Choose a new date and time for{" "}
              {rescheduleTarget?.candidateName ?? "the candidate"}.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="datetime-local"
            value={rescheduleAt}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(event) => setRescheduleAt(event.target.value)}
            aria-label="New interview date and time"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={Boolean(busyId)}
              onClick={() => setRescheduleTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!rescheduleAt || Boolean(busyId)}
              onClick={() => void confirmReschedule()}
            >
              {busyId ? "Rescheduling…" : "Reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
