"use client";

import {
  CalendarCheck2,
  ExternalLink,
  Eye,
  Link2,
  MapPin,
  MoreHorizontal,
  RefreshCw,
  Send,
  UserX,
  Video,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { InterviewStatusBadge } from "@/components/schedule/interview-status-badge";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getApiErrorMessage, schedulingApi } from "@/lib/api";
import { type Interview } from "@/lib/mock-schedule";
import { candidateDetailPath, jobDetailPath } from "@/lib/routes";

function detailRows(interview: Interview): Array<[string, string]> {
  const dateTime = [interview.dateLabel, interview.timeLabel]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" · ");
  const meetingFormat =
    interview.platform ||
    (interview.meetingLink ? "Online" : interview.location ? "Offline" : "");
  const reminderHours = (interview.reminderHours || [])
    .slice()
    .sort((a, b) => b - a)
    .map((hours) => `${hours}h before`)
    .join(", ");

  return (
    [
      ["Interview round", interview.round],
      ["Interview type", interview.interviewType],
      ["Date and time", dateTime],
      ["Timezone", interview.timezone],
      ["Meeting format", meetingFormat],
      ["Booking source", interview.bookingSource],
      ["Reminder status", interview.reminderStatus],
      ["Reminders", reminderHours],
    ] as const
  ).filter(([, value]) => Boolean(value)) as Array<[string, string]>;
}

export function InterviewDetail({
  interview: initial,
  onInterviewChange,
}: {
  interview: Interview;
  onInterviewChange?: (next: Interview) => void;
}) {
  const [interview, setInterview] = useState(initial);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleAt, setRescheduleAt] = useState<Date | null>(null);

  useEffect(() => {
    setInterview(initial);
  }, [initial]);

  const rows = useMemo(() => detailRows(interview), [interview]);
  const profileRows = useMemo(
    () =>
      (
        [
          ["Name", interview.candidateName],
          ["Current role", interview.candidateTitle],
          ["Company", interview.candidateCompany],
          ["Email", interview.candidateEmail || ""],
          ["Phone", interview.candidatePhone || ""],
        ] as const
      ).filter(([, value]) => Boolean(value)),
    [interview]
  );

  function flash(text: string) {
    setFeedback(text);
    setError(null);
    window.setTimeout(() => setFeedback(null), 2400);
  }

  function apply(next: Interview, message: string) {
    setInterview(next);
    onInterviewChange?.(next);
    flash(message);
  }

  async function runAction(
    action: () => Promise<Interview>,
    successMessage: string
  ) {
    setBusy(true);
    setError(null);
    try {
      const next = await action();
      apply(next, successMessage);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <CandidateAvatar
              name={interview.candidateName}
              className="size-12"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {interview.candidateId ? (
                  <Link
                    href={candidateDetailPath(interview.candidateId)}
                    className="text-xl font-semibold tracking-tight text-foreground underline-offset-4 hover:underline"
                  >
                    {interview.candidateName}
                  </Link>
                ) : (
                  <h1 className="text-xl font-semibold tracking-tight text-foreground">
                    {interview.candidateName}
                  </h1>
                )}
                {interview.status ? (
                  <InterviewStatusBadge status={interview.status} />
                ) : null}
              </div>
              {interview.candidateTitle || interview.candidateCompany ? (
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {[interview.candidateTitle, interview.candidateCompany]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
              {interview.candidateEmail || interview.candidatePhone ? (
                <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
                  {interview.candidateEmail ? (
                    <a
                      href={`mailto:${interview.candidateEmail}`}
                      className="truncate underline-offset-4 hover:text-foreground hover:underline"
                    >
                      {interview.candidateEmail}
                    </a>
                  ) : null}
                  {interview.candidateEmail && interview.candidatePhone ? (
                    <span aria-hidden className="text-border">
                      ·
                    </span>
                  ) : null}
                  {interview.candidatePhone ? (
                    <a
                      href={`tel:${interview.candidatePhone}`}
                      className="truncate underline-offset-4 hover:text-foreground hover:underline"
                    >
                      {interview.candidatePhone}
                    </a>
                  ) : null}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
                {[
                  interview.jobId && interview.jobTitle ? (
                    <Link
                      key="job"
                      href={jobDetailPath(interview.jobId)}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {interview.jobTitle}
                    </Link>
                  ) : interview.jobTitle ? (
                    <span key="job">{interview.jobTitle}</span>
                  ) : null,
                  interview.round ? (
                    <span key="round">{interview.round}</span>
                  ) : null,
                  interview.interviewType ? (
                    <span key="type">{interview.interviewType}</span>
                  ) : null,
                  interview.recruiter ? (
                    <span key="recruiter">Recruiter: {interview.recruiter}</span>
                  ) : null,
                ]
                  .filter(Boolean)
                  .map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-x-1.5"
                    >
                      {index > 0 ? (
                        <span aria-hidden className="text-border">
                          ·
                        </span>
                      ) : null}
                      {item}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => setRescheduleOpen((previous) => !previous)}
            >
              <RefreshCw aria-hidden />
              Reschedule
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() =>
                void runAction(
                  () => schedulingApi.remind(interview.id),
                  `Reminder sent to ${interview.candidateName}.`
                )
              }
            >
              <Send aria-hidden />
              Send Reminder
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    size="icon-sm"
                    variant="outline"
                    disabled={busy}
                    aria-label="More actions"
                  />
                }
              >
                <MoreHorizontal aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  onClick={() =>
                    void runAction(
                      () => schedulingApi.complete(interview.id),
                      "Marked completed."
                    )
                  }
                >
                  <CalendarCheck2 aria-hidden />
                  Mark Completed
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    void runAction(
                      () => schedulingApi.noShow(interview.id),
                      "Marked as no show."
                    )
                  }
                >
                  <UserX aria-hidden />
                  Mark No Show
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    void runAction(
                      () =>
                        schedulingApi.sendLink(interview.id, {
                          channel: "email",
                        }),
                      `Scheduling link sent to ${interview.candidateName}.`
                    )
                  }
                >
                  <Link2 aria-hidden />
                  Send Link
                </DropdownMenuItem>
                {interview.candidateId ? (
                  <DropdownMenuItem
                    render={
                      <Link href={candidateDetailPath(interview.candidateId)} />
                    }
                  >
                    <Eye aria-hidden />
                    View Candidate
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() =>
                    void runAction(
                      () => schedulingApi.cancel(interview.id),
                      `Cancelled interview with ${interview.candidateName}.`
                    )
                  }
                >
                  <XCircle aria-hidden />
                  Cancel Interview
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {rescheduleOpen ? (
          <div className="mt-3 space-y-2 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              New date and time
            </p>
            <DateTimePicker
              id="reschedule-at"
              value={rescheduleAt}
              minDate={new Date()}
              onChange={setRescheduleAt}
              placeholder="Select date"
            />
            <div className="flex justify-end gap-2">
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  setRescheduleOpen(false);
                  setRescheduleAt(null);
                }}
              >
                Cancel
              </Button>
              <Button
                size="xs"
                disabled={busy || !rescheduleAt}
                onClick={() => {
                  if (!rescheduleAt) return;
                  const startAt = rescheduleAt.toISOString();
                  void runAction(
                    () =>
                      schedulingApi.reschedule(interview.id, {
                        startAt,
                        timezone:
                          interview.timezone.split(" ")[0] ||
                          interview.timezone ||
                          undefined,
                      }),
                    `Rescheduled interview with ${interview.candidateName}.`
                  ).then(() => {
                    setRescheduleOpen(false);
                    setRescheduleAt(null);
                  });
                }}
              >
                Confirm reschedule
              </Button>
            </div>
          </div>
        ) : null}

        {feedback ? (
          <p
            role="status"
            className="mt-3 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
          >
            {feedback}
          </p>
        ) : null}
        {error ? (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">
              Interview details
            </h2>
            {rows.length > 0 ? (
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                {rows.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-foreground">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No interview details available.
              </p>
            )}

            {interview.meetingLink ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                <Video aria-hidden className="size-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Meeting link</p>
                  <p className="truncate text-sm font-medium text-foreground">
                    {interview.meetingLink}
                  </p>
                </div>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard?.writeText(interview.meetingLink!);
                    flash("Meeting link copied.");
                  }}
                >
                  <ExternalLink aria-hidden />
                  Copy link
                </Button>
              </div>
            ) : null}

            {interview.location &&
            interview.location !== "Online" &&
            interview.location !== interview.platform ? (
              <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                {interview.location}
              </div>
            ) : null}

            {interview.instructions ? (
              <div className="mt-4 border-t border-border pt-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Interview instructions
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {interview.instructions}
                </p>
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">
              Interview panel
            </h2>
            <ul className="mt-3 space-y-2">
              {interview.interviewers.map((person) => (
                <li
                  key={person}
                  className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2"
                >
                  <CandidateAvatar name={person} className="size-7" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {person}
                    </p>
                    <p className="text-xs text-muted-foreground">Interviewer</p>
                  </div>
                </li>
              ))}
              {interview.interviewers.length === 0 ? (
                <li className="text-sm text-muted-foreground">
                  No interviewers assigned.
                </li>
              ) : null}
            </ul>
          </section>
        </div>

        <div className="space-y-4">
          {profileRows.length > 0 ? (
            <section className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground">
                Candidate profile
              </h2>
              <dl className="mt-3 space-y-2">
                {profileRows.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-sm font-medium text-foreground">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              {interview.candidateId ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 w-full"
                  nativeButton={false}
                  render={
                    <Link href={candidateDetailPath(interview.candidateId)} />
                  }
                >
                  Open full profile
                </Button>
              ) : null}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
