"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { InterviewStatusBadge } from "@/components/schedule/interview-status-badge";
import {
  FilterPopover,
  type FilterOption,
} from "@/components/shared/filter-popover";
import { Button } from "@/components/ui/button";
import {
  CALENDAR_TODAY,
  formatDateKey,
  INTERVIEW_STATUSES,
  INTERVIEW_TYPES,
  INTERVIEWS,
  interviewsOnDate,
  monthGrid,
  SCHEDULE_INTERVIEWERS,
  SCHEDULE_RECRUITERS,
  weekDates,
  type Interview,
} from "@/lib/mock-schedule";
import { interviewDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

type CalendarView = "month" | "week" | "day" | "agenda";

const VIEWS: { id: CalendarView; label: string }[] = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "day", label: "Day" },
  { id: "agenda", label: "Agenda" },
];

function toOptions(values: readonly string[]): FilterOption[] {
  return values.map((value) => ({ id: value, label: value }));
}

function shiftDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function EventChip({ interview }: { interview: Interview }) {
  return (
    <Link
      href={interviewDetailPath(interview.id)}
      className={cn(
        "block truncate rounded-md border px-1.5 py-0.5 text-[10px] leading-tight outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
        interview.status === "Scheduled" || interview.status === "Rescheduled"
          ? "border-primary/30 bg-brand-subtle/50 text-primary"
          : interview.status === "Completed"
            ? "border-success/30 bg-success/10 text-success"
            : interview.status === "No Show"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-border bg-muted/60 text-muted-foreground"
      )}
      title={`${interview.candidateName} · ${interview.jobTitle} · ${interview.round}`}
    >
      <span className="font-medium">{interview.candidateName}</span>
      <span className="text-muted-foreground">
        {" "}
        · {interview.interviewType}
      </span>
    </Link>
  );
}

function EventCard({ interview }: { interview: Interview }) {
  return (
    <Link
      href={interviewDetailPath(interview.id)}
      className="block rounded-lg border border-border p-3 outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {interview.candidateName}
          </p>
          <p className="text-xs text-muted-foreground">
            {interview.jobTitle} · {interview.round}
          </p>
        </div>
        <InterviewStatusBadge status={interview.status} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {interview.dateLabel} · {interview.timeLabel}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Interviewer: {interview.interviewers.join(", ")}
      </p>
    </Link>
  );
}

export function CalendarWorkspace() {
  const [view, setView] = useState<CalendarView>("week");
  const [anchor, setAnchor] = useState(CALENDAR_TODAY);
  const [recruiterFilter, setRecruiterFilter] = useState<string[]>([]);
  const [interviewerFilter, setInterviewerFilter] = useState<string[]>([]);
  const [jobFilter, setJobFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const jobOptions = useMemo(() => {
    const titles = new Map<string, string>();
    INTERVIEWS.forEach((interview) => {
      if (interview.jobId) titles.set(interview.jobId, interview.jobTitle);
    });
    return Array.from(titles, ([id, label]) => ({ id, label }));
  }, []);

  function matches(interview: Interview): boolean {
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
    if (jobFilter.length > 0 && !jobFilter.includes(interview.jobId ?? ""))
      return false;
    if (typeFilter.length > 0 && !typeFilter.includes(interview.interviewType))
      return false;
    if (statusFilter.length > 0 && !statusFilter.includes(interview.status))
      return false;
    return true;
  }

  function forDate(dateKey: string): Interview[] {
    return interviewsOnDate(dateKey).filter(matches);
  }

  function toggle(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    return (id: string) =>
      setter((previous) =>
        previous.includes(id)
          ? previous.filter((value) => value !== id)
          : [...previous, id]
      );
  }

  const hasFilters =
    recruiterFilter.length > 0 ||
    interviewerFilter.length > 0 ||
    jobFilter.length > 0 ||
    typeFilter.length > 0 ||
    statusFilter.length > 0;

  const [year, month] = useMemo(() => {
    const [y, m] = anchor.split("-").map(Number);
    return [y, m - 1] as const;
  }, [anchor]);

  const monthLabel = useMemo(() => {
    const date = new Date(year, month, 1);
    return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  }, [year, month]);

  const week = weekDates(anchor);
  const cells = monthGrid(year, month);

  const agenda = useMemo(() => {
    return INTERVIEWS.filter((interview) => {
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
      if (jobFilter.length > 0 && !jobFilter.includes(interview.jobId ?? ""))
        return false;
      if (
        typeFilter.length > 0 &&
        !typeFilter.includes(interview.interviewType)
      )
        return false;
      if (statusFilter.length > 0 && !statusFilter.includes(interview.status))
        return false;
      if (
        interview.status === "Cancelled" ||
        interview.status === "Link Sent"
      )
        return false;
      return true;
    }).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [
    recruiterFilter,
    interviewerFilter,
    jobFilter,
    typeFilter,
    statusFilter,
  ]);

  function navigate(direction: -1 | 1) {
    if (view === "month") {
      const next = new Date(year, month + direction, 1);
      setAnchor(
        `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`
      );
    } else if (view === "week") {
      setAnchor(shiftDateKey(anchor, direction * 7));
    } else {
      setAnchor(shiftDateKey(anchor, direction));
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="icon-sm"
              variant="outline"
              aria-label="Previous"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft aria-hidden />
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              aria-label="Next"
              onClick={() => navigate(1)}
            >
              <ChevronRight aria-hidden />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAnchor(CALENDAR_TODAY)}
            >
              Today
            </Button>
            <h2 className="text-sm font-semibold text-foreground">
              {view === "month"
                ? monthLabel
                : view === "week"
                  ? `Week of ${formatDateKey(week[0]!)}`
                  : view === "day"
                    ? formatDateKey(anchor)
                    : "Agenda"}
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Calendar view"
            className="flex rounded-lg border border-border p-0.5"
          >
            {VIEWS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={view === item.id}
                onClick={() => setView(item.id)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                  view === item.id
                    ? "bg-brand-subtle font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
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
            label="Job"
            options={jobOptions}
            selected={jobFilter}
            onToggle={toggle(setJobFilter)}
          />
          <FilterPopover
            label="Interview type"
            options={toOptions(INTERVIEW_TYPES)}
            selected={typeFilter}
            onToggle={toggle(setTypeFilter)}
          />
          <FilterPopover
            label="Status"
            options={toOptions(INTERVIEW_STATUSES)}
            selected={statusFilter}
            onToggle={toggle(setStatusFilter)}
          />
          {hasFilters ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setRecruiterFilter([]);
                setInterviewerFilter([]);
                setJobFilter([]);
                setTypeFilter([]);
                setStatusFilter([]);
              }}
            >
              <X aria-hidden />
              Reset
            </Button>
          ) : null}
        </div>
      </section>

      {view === "month" ? (
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-7 border-b border-border bg-muted/40">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((dateKey, index) => {
              const events = dateKey ? forDate(dateKey) : [];
              const isToday = dateKey === CALENDAR_TODAY;
              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-24 border-b border-r border-border p-1.5",
                    !dateKey && "bg-muted/20"
                  )}
                >
                  {dateKey ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setAnchor(dateKey);
                          setView("day");
                        }}
                        className={cn(
                          "mb-1 flex size-6 items-center justify-center rounded-full text-xs tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                          isToday
                            ? "bg-primary font-semibold text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {Number(dateKey.slice(-2))}
                      </button>
                      <div className="space-y-0.5">
                        {events.slice(0, 3).map((interview) => (
                          <EventChip key={interview.id} interview={interview} />
                        ))}
                        {events.length > 3 ? (
                          <p className="px-1 text-[10px] text-muted-foreground">
                            +{events.length - 3} more
                          </p>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {view === "week" ? (
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-7 md:divide-x md:divide-y-0">
            {week.map((dateKey) => {
              const events = forDate(dateKey);
              const isToday = dateKey === CALENDAR_TODAY;
              return (
                <div key={dateKey} className="min-h-40 p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAnchor(dateKey);
                      setView("day");
                    }}
                    className={cn(
                      "mb-2 w-full rounded-md px-1.5 py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      isToday ? "bg-brand-subtle" : "hover:bg-muted/40"
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs font-medium",
                        isToday ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {formatDateKey(dateKey)}
                    </p>
                  </button>
                  <div className="space-y-1">
                    {events.length > 0 ? (
                      events.map((interview) => (
                        <EventChip key={interview.id} interview={interview} />
                      ))
                    ) : (
                      <p className="px-1 text-[11px] text-muted-foreground">
                        Clear
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {view === "day" ? (
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground">
            {formatDateKey(anchor)}
          </h3>
          <div className="mt-3 space-y-2">
            {forDate(anchor).length > 0 ? (
              forDate(anchor).map((interview) => (
                <EventCard key={interview.id} interview={interview} />
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                No interviews on this day.
              </p>
            )}
          </div>
        </section>
      ) : null}

      {view === "agenda" ? (
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="space-y-2">
            {agenda.length > 0 ? (
              agenda.map((interview) => (
                <EventCard key={interview.id} interview={interview} />
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                No interviews match these filters.
              </p>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
