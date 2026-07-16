"use client";

import {
  CalendarCheck2,
  CalendarClock,
  ExternalLink,
  MapPin,
  RefreshCw,
  Send,
  StickyNote,
  UserX,
  Video,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { InterviewStatusBadge } from "@/components/schedule/interview-status-badge";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getActivity,
  getNotes,
  getReminders,
  type Interview,
  type InterviewStatus,
} from "@/lib/mock-schedule";
import { candidateDetailPath, jobDetailPath } from "@/lib/routes";

export function InterviewDetail({ interview }: { interview: Interview }) {
  const [status, setStatus] = useState<InterviewStatus>(interview.status);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [notes, setNotes] = useState(getNotes(interview.id));
  const [noteDraft, setNoteDraft] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);

  const reminders = getReminders(interview.id);
  const activity = getActivity(interview.id);

  function flash(text: string) {
    setFeedback(text);
    window.setTimeout(() => setFeedback(null), 2400);
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
                <InterviewStatusBadge status={status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {interview.candidateTitle} · {interview.candidateCompany}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {interview.jobId ? (
                  <Link
                    href={jobDetailPath(interview.jobId)}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {interview.jobTitle}
                  </Link>
                ) : (
                  <span>{interview.jobTitle}</span>
                )}
                <span>{interview.round}</span>
                <span>{interview.interviewType}</span>
                <span>Recruiter: {interview.recruiter}</span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                flash(`Opened reschedule for ${interview.candidateName}.`)
              }
            >
              <RefreshCw aria-hidden />
              Reschedule
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setStatus("Cancelled");
                flash(`Cancelled interview with ${interview.candidateName}.`);
              }}
            >
              <XCircle aria-hidden />
              Cancel
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setStatus("Completed");
                flash(`Marked completed.`);
              }}
            >
              <CalendarCheck2 aria-hidden />
              Mark Completed
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setStatus("No Show");
                flash(`Marked as no show.`);
              }}
            >
              <UserX aria-hidden />
              Mark No Show
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => flash(`Reminder sent to ${interview.candidateName}.`)}
            >
              <Send aria-hidden />
              Send Reminder
            </Button>
            {interview.candidateId ? (
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={
                  <Link href={candidateDetailPath(interview.candidateId)} />
                }
              >
                View Candidate
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setNoteOpen((previous) => !previous)}
            >
              <StickyNote aria-hidden />
              Add Note
            </Button>
          </div>
        </div>

        {noteOpen ? (
          <div className="mt-3 space-y-2 rounded-lg border border-border bg-muted/30 p-3">
            <Textarea
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              placeholder="Interview note…"
              className="min-h-20 bg-card"
              aria-label="Interview note"
            />
            <div className="flex justify-end gap-2">
              <Button size="xs" variant="ghost" onClick={() => setNoteOpen(false)}>
                Cancel
              </Button>
              <Button
                size="xs"
                disabled={!noteDraft.trim()}
                onClick={() => {
                  setNotes((previous) => [
                    {
                      id: `n-${Date.now()}`,
                      author: "You",
                      text: noteDraft.trim(),
                      time: "Just now",
                    },
                    ...previous,
                  ]);
                  setNoteDraft("");
                  setNoteOpen(false);
                  flash("Note added.");
                }}
              >
                Save note
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
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">
              Interview details
            </h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["Interview round", interview.round],
                  ["Date and time", `${interview.dateLabel} · ${interview.timeLabel}`],
                  ["Duration", interview.duration],
                  ["Candidate timezone", interview.timezone],
                  ["Meeting platform", interview.platform],
                  ["Booking source", interview.bookingSource],
                  ["Reminder status", interview.reminderStatus],
                ] as const
              ).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-foreground">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

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
                  onClick={() =>
                    flash("Meeting link copied. (UI preview — not opened)")
                  }
                >
                  <ExternalLink aria-hidden />
                  Copy link
                </Button>
              </div>
            ) : null}

            {interview.location ? (
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
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">
              Scheduling activity
            </h2>
            <ol className="mt-3 space-y-0">
              {activity.map((entry, index) => (
                <li
                  key={entry.id}
                  className="relative flex gap-3 pb-5 last:pb-0"
                >
                  {index < activity.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute top-6 left-[11px] h-full w-px bg-border"
                    />
                  ) : null}
                  <span className="relative mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                    <entry.icon
                      aria-hidden
                      className="size-3 text-muted-foreground"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {entry.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.detail}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {entry.time}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Side column */}
        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <CalendarClock aria-hidden className="size-3.5 text-muted-foreground" />
              Candidate profile
            </h2>
            <dl className="mt-3 space-y-2">
              <div>
                <dt className="text-xs text-muted-foreground">Name</dt>
                <dd className="text-sm font-medium text-foreground">
                  {interview.candidateName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Current role</dt>
                <dd className="text-sm text-foreground">
                  {interview.candidateTitle}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Company</dt>
                <dd className="text-sm text-foreground">
                  {interview.candidateCompany}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Timezone</dt>
                <dd className="text-sm text-foreground">{interview.timezone}</dd>
              </div>
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

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">
              Reminder history
            </h2>
            <ul className="mt-3 divide-y divide-border">
              {reminders.map((reminder) => (
                <li key={reminder.id} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {reminder.label}
                    </p>
                    <span
                      className={
                        reminder.status === "Sent"
                          ? "text-xs font-medium text-success"
                          : reminder.status === "Failed"
                            ? "text-xs font-medium text-destructive"
                            : "text-xs text-muted-foreground"
                      }
                    >
                      {reminder.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {reminder.channel} · {reminder.time}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">Notes</h2>
            {notes.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {notes.map((note) => (
                  <li key={note.id} className="rounded-lg border border-border p-2.5">
                    <p className="text-sm text-foreground">{note.text}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {note.author} · {note.time}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No notes yet.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
