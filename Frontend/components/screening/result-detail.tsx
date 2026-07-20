"use client";

import {
  Bookmark,
  CalendarClock,
  CheckCircle2,
  Download,
  Pause,
  Phone,
  Play,
  SkipBack,
  SkipForward,
  StickyNote,
  Volume2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { screeningApi, getApiErrorMessage } from "@/lib/api";
import type {
  AiRecommendation,
  RecruiterDecision,
  ScreeningResult,
  ScreeningResultDetail,
} from "@/lib/mock-screening";
import {
  candidateDetailPath,
  jobDetailPath,
  screeningDetailPath,
} from "@/lib/routes";
import { cn } from "@/lib/utils";

const REC_CLASSES: Record<AiRecommendation, string> = {
  Shortlist: "bg-success/10 text-success",
  Reject: "bg-destructive/10 text-destructive",
  "Needs review": "bg-warning/10 text-warning",
};

const DECISION_CLASSES: Record<RecruiterDecision, string> = {
  Pending: "bg-muted text-muted-foreground",
  Shortlisted: "bg-brand-subtle text-primary",
  Rejected: "bg-destructive/10 text-destructive",
  "Interview scheduled": "bg-info/10 text-info",
};

function Badge({ text, className }: { text: string; className: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-2 text-xs font-medium whitespace-nowrap",
        className
      )}
    >
      {text}
    </span>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Visual-only audio player — no remote media is loaded or played. */
function AudioPlayerUI({
  durationSeconds,
  label,
  size,
}: {
  durationSeconds: number;
  label: string;
  size: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const progress = durationSeconds > 0 ? (position / durationSeconds) * 100 : 0;

  function togglePlay() {
    setPlaying((previous) => !previous);
  }

  function scrub(next: number) {
    setPosition(Math.max(0, Math.min(durationSeconds, next)));
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">Recording</h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {label} · {size} · UI preview only — no audio is streamed
          </p>
        </div>
        <Badge
          text={playing ? "Playing (preview)" : "Paused"}
          className={
            playing ? "bg-info/10 text-info" : "bg-muted text-muted-foreground"
          }
        />
      </div>

      {/* Waveform placeholder */}
      <div
        aria-hidden
        className="mt-4 flex h-16 items-end gap-0.5 overflow-hidden rounded-lg bg-muted/50 px-2 py-2"
      >
        {Array.from({ length: 64 }).map((_, index) => {
          const height = 20 + ((index * 17) % 60);
          const filled = (index / 64) * 100 <= progress;
          return (
            <span
              key={index}
              className={cn(
                "w-full rounded-sm",
                filled ? "bg-primary/70" : "bg-border"
              )}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>

      <div className="mt-3">
        <input
          type="range"
          min={0}
          max={durationSeconds}
          value={position}
          onChange={(event) => scrub(Number(event.target.value))}
          aria-label="Playback position"
          className="w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-[11px] tabular-nums text-muted-foreground">
          <span>{formatTime(position)}</span>
          <span>{formatTime(durationSeconds)}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Skip back 10 seconds"
          onClick={() => scrub(position - 10)}
        >
          <SkipBack aria-hidden />
        </Button>
        <Button
          size="icon"
          aria-label={playing ? "Pause" : "Play"}
          onClick={togglePlay}
        >
          {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Skip forward 10 seconds"
          onClick={() => scrub(position + 10)}
        >
          <SkipForward aria-hidden />
        </Button>
        <span className="ml-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Volume2 aria-hidden className="size-3.5" />
          100%
        </span>
      </div>
    </section>
  );
}

function SummaryTab({ detail }: { detail: ScreeningResultDetail }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
        <h3 className="text-sm font-semibold text-foreground">
          AI-generated summary
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {detail.summary}
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="text-xs font-semibold tracking-wide text-success uppercase">
              Strengths
            </h4>
            <ul className="mt-2 space-y-1.5">
              {detail.strengths.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-1.5 text-sm text-foreground"
                >
                  <CheckCircle2
                    aria-hidden
                    className="mt-0.5 size-3.5 shrink-0 text-success"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-wide text-warning uppercase">
              Concerns
            </h4>
            <ul className="mt-2 space-y-1.5">
              {detail.concerns.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-1.5 text-sm text-foreground"
                >
                  <XCircle
                    aria-hidden
                    className="mt-0.5 size-3.5 shrink-0 text-warning"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Key answers
          </h4>
          <dl className="mt-2 space-y-3">
            {detail.keyAnswers.map((item) => (
              <div key={item.question}>
                <dt className="text-xs text-muted-foreground">{item.question}</dt>
                <dd className="mt-0.5 text-sm text-foreground">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <aside className="space-y-3">
        {(
          [
            ["Salary expectation", detail.salaryExpectation],
            ["Notice period", detail.noticePeriod],
            ["Preferred location", detail.preferredLocation],
            ["Candidate interest", detail.candidateInterest],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1.5 text-sm font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </aside>
    </div>
  );
}

function TranscriptTab({ detail }: { detail: ScreeningResultDetail }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">Call transcript</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Speakers labelled as AI agent and candidate
      </p>
      <ol className="mt-4 space-y-3">
        {detail.transcript.map((turn) => (
          <li
            key={turn.id}
            className={cn(
              "flex gap-3",
              turn.speaker === "Candidate" && "flex-row-reverse"
            )}
          >
            <span
              className={cn(
                "mt-1 flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                turn.speaker === "AI"
                  ? "bg-brand-subtle text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {turn.speaker === "AI" ? "AI" : "C"}
            </span>
            <div
              className={cn(
                "max-w-[85%] rounded-xl px-3 py-2",
                turn.speaker === "AI"
                  ? "bg-brand-subtle/40 text-foreground"
                  : "bg-muted text-foreground"
              )}
            >
              <p className="text-sm leading-relaxed">{turn.text}</p>
              <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">
                {turn.time} · {turn.speaker}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ScorecardTab({
  result,
  detail,
}: {
  result: ScreeningResult;
  detail: ScreeningResultDetail;
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Overall score
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Based on communication score
            </p>
          </div>
          <p
            className={cn(
              "text-4xl font-semibold tabular-nums",
              result.overallScore >= 75
                ? "text-success"
                : result.overallScore < 60
                  ? "text-destructive"
                  : "text-foreground"
            )}
          >
            {result.overallScore}
            <span className="text-lg text-muted-foreground">/100</span>
          </p>
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        {detail.categories.map((category) => (
          <section
            key={category.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="text-sm font-medium text-foreground">
                {category.label}
              </h4>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {category.score}
              </span>
            </div>
            <Progress
              value={category.score}
              aria-label={`${category.label}: ${category.score} out of 100`}
              className="mt-2"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Evidence: </span>
              {category.evidence}
            </p>
          </section>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Knockout results
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Configured rules from the screening. A failed rule forces Reject.
            </p>
          </div>
          {detail.knockouts.length > 0 ? (
            <Badge
              text={
                detail.knockouts.some((item) => !item.passed)
                  ? `${detail.knockouts.filter((item) => !item.passed).length} failed`
                  : "All passed"
              }
              className={
                detail.knockouts.some((item) => !item.passed)
                  ? "bg-destructive/10 text-destructive"
                  : "bg-success/10 text-success"
              }
            />
          ) : null}
        </div>
        {detail.knockouts.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No knockout criteria were configured for this screening.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {detail.knockouts.map((knockout) => (
              <li
                key={knockout.criterion}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {knockout.criterion}
                  </p>
                  <p className="text-xs text-muted-foreground">{knockout.detail}</p>
                </div>
                <Badge
                  text={knockout.passed ? "Passed" : "Failed"}
                  className={
                    knockout.passed
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ExtractedTab({ detail }: { detail: ScreeningResultDetail }) {
  const confidenceClass = {
    High: "bg-success/10 text-success",
    Medium: "bg-warning/10 text-warning",
    Low: "bg-muted text-muted-foreground",
  } as const;

  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Extracted data</h3>
        <p className="text-xs text-muted-foreground">
          Variables pulled from the conversation for downstream workflows
        </p>
      </div>
      <dl className="divide-y divide-border">
        {detail.extracted.map((field) => (
          <div
            key={field.id}
            className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
          >
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{field.label}</dt>
              <dd className="text-sm font-medium text-foreground">
                {field.value}
              </dd>
            </div>
            <Badge
              text={field.confidence}
              className={confidenceClass[field.confidence]}
            />
          </div>
        ))}
      </dl>
    </section>
  );
}

function ActivityTab({ detail }: { detail: ScreeningResultDetail }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <ol className="space-y-0">
        {detail.activity.map((entry, index) => (
          <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
            {index < detail.activity.length - 1 ? (
              <span
                aria-hidden
                className="absolute top-6 left-[11px] h-full w-px bg-border"
              />
            ) : null}
            <span className="relative mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
              <entry.icon aria-hidden className="size-3 text-muted-foreground" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{entry.title}</p>
              <p className="text-xs text-muted-foreground">{entry.detail}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {entry.time}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function formatResultWhen(value: string): string {
  if (!value || value === "—") return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ResultDetail({
  result,
  detail,
  onChanged,
}: {
  result: ScreeningResult;
  detail: ScreeningResultDetail;
  onChanged?: () => void;
}) {
  const [decision, setDecision] = useState<RecruiterDecision>(result.decision);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  function flash(text: string) {
    setFeedback(text);
    window.setTimeout(() => setFeedback(null), 2400);
  }

  async function runMutation(
    action: () => Promise<unknown>,
    successMessage: string,
    nextDecision?: RecruiterDecision
  ) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
      if (nextDecision) setDecision(nextDecision);
      flash(successMessage);
      onChanged?.();
    } catch (error) {
      flash(getApiErrorMessage(error, "Action failed."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <CandidateAvatar
              name={result.candidateName}
              className="size-12 shrink-0 text-base"
            />
            <div className="min-w-0 space-y-2">
              {result.candidateId ? (
                <Link
                  href={candidateDetailPath(result.candidateId)}
                  className="block truncate text-xl font-semibold tracking-tight text-foreground underline-offset-4 hover:underline"
                >
                  {result.candidateName}
                </Link>
              ) : (
                <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
                  {result.candidateName}
                </h1>
              )}
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                {result.jobId ? (
                  <Link
                    href={jobDetailPath(result.jobId)}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {result.jobTitle || "Job"}
                  </Link>
                ) : result.jobTitle ? (
                  <span>{result.jobTitle}</span>
                ) : null}
                {result.screeningName ? (
                  <>
                    {result.jobTitle ? (
                      <span aria-hidden className="text-border">
                        ·
                      </span>
                    ) : null}
                    <Link
                      href={screeningDetailPath(result.screeningId)}
                      className="underline-offset-4 hover:underline"
                    >
                      {result.screeningName}
                    </Link>
                  </>
                ) : null}
                {result.duration && result.duration !== "—" ? (
                  <>
                    <span aria-hidden className="text-border">
                      ·
                    </span>
                    <span>{result.duration}</span>
                  </>
                ) : null}
                {result.completedDate ? (
                  <>
                    <span aria-hidden className="text-border">
                      ·
                    </span>
                    <span>{formatResultWhen(result.completedDate)}</span>
                  </>
                ) : null}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  text={`AI: ${result.recommendation}`}
                  className={REC_CLASSES[result.recommendation]}
                />
                <Badge text={decision} className={DECISION_CLASSES[decision]} />
                {detail.knockouts.some((item) => !item.passed) ? (
                  <Badge
                    text="Knockout failed"
                    className="bg-destructive/10 text-destructive"
                  />
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-baseline gap-1 rounded-lg border border-border bg-muted/30 px-4 py-3 sm:min-w-30 sm:flex-col sm:items-end">
            <p
              className={cn(
                "text-3xl font-semibold tabular-nums leading-none",
                result.overallScore >= 75
                  ? "text-success"
                  : result.overallScore < 60
                    ? "text-destructive"
                    : "text-foreground"
              )}
            >
              {result.overallScore}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="sm:hidden">/</span>100 communication
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              disabled={busy}
              onClick={() =>
                void runMutation(
                  () => screeningApi.shortlistResult(result.id),
                  `Shortlisted ${result.candidateName}.`,
                  "Shortlisted"
                )
              }
            >
              <Bookmark aria-hidden />
              Shortlist
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() =>
                void runMutation(
                  () => screeningApi.rejectResult(result.id),
                  `Rejected ${result.candidateName}.`,
                  "Rejected"
                )
              }
            >
              <XCircle aria-hidden />
              Reject
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setDecision("Interview scheduled");
                flash(
                  `Open scheduling for ${result.candidateName} from Schedule.`
                );
              }}
            >
              <CalendarClock aria-hidden />
              Schedule
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() =>
                void runMutation(
                  () => screeningApi.callAgainResult(result.id),
                  `Queued another call for ${result.candidateName}.`,
                  "Pending"
                )
              }
            >
              <Phone aria-hidden />
              Call again
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setNoteOpen((previous) => !previous)}
            >
              <StickyNote aria-hidden />
              Add note
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                flash("Report download will be available from exports.")
              }
            >
              <Download aria-hidden />
              Download
            </Button>
          </div>
        </div>

        {noteOpen ? (
          <div className="mt-3 space-y-2 rounded-lg border border-border bg-muted/30 p-3">
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Recruiter note — visible on the candidate timeline…"
              className="min-h-20 bg-card"
              aria-label="Recruiter note"
            />
            <div className="flex justify-end gap-2">
              <Button size="xs" variant="ghost" onClick={() => setNoteOpen(false)}>
                Cancel
              </Button>
              <Button
                size="xs"
                disabled={busy || !note.trim()}
                onClick={() => {
                  void runMutation(
                    () => screeningApi.addResultNote(result.id, note.trim()),
                    "Note added."
                  ).then(() => {
                    setNoteOpen(false);
                    setNote("");
                  });
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

      <Tabs defaultValue="summary">
        <div className="overflow-x-auto">
          <TabsList className="min-w-max">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="recording">Recording</TabsTrigger>
            <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
            <TabsTrigger value="extracted">Extracted Data</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="summary" className="pt-3">
          <SummaryTab detail={detail} />
        </TabsContent>
        <TabsContent value="transcript" className="pt-3">
          <TranscriptTab detail={detail} />
        </TabsContent>
        <TabsContent value="recording" className="pt-3">
          <AudioPlayerUI
            durationSeconds={detail.recording.durationSeconds}
            label={detail.recording.label}
            size={detail.recording.size}
          />
        </TabsContent>
        <TabsContent value="scorecard" className="pt-3">
          <ScorecardTab result={result} detail={detail} />
        </TabsContent>
        <TabsContent value="extracted" className="pt-3">
          <ExtractedTab detail={detail} />
        </TabsContent>
        <TabsContent value="activity" className="pt-3">
          <ActivityTab detail={detail} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
