"use client";

import {
  Bookmark,
  CalendarClock,
  CheckCircle2,
  Download,
  FileAudio,
  Pause,
  Phone,
  PhoneCall,
  Play,
  SkipBack,
  SkipForward,
  StickyNote,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { screeningApi, getApiErrorMessage } from "@/lib/api";
import type {
  AiRecommendation,
  RecruiterDecision,
  ResultActivityIcon,
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

function aiBadgeClass(status: string | null | undefined, fallback: AiRecommendation): string {
  const raw = String(status || "").toLowerCase();
  if (!raw) return REC_CLASSES[fallback];
  if (raw.includes("shortlist")) return REC_CLASSES.Shortlist;
  if (
    raw.includes("reject") ||
    raw.includes("not interested") ||
    raw.includes("not qualified")
  ) {
    return REC_CLASSES.Reject;
  }
  return REC_CLASSES["Needs review"];
}

const DECISION_CLASSES: Record<RecruiterDecision, string> = {
  Pending: "bg-muted text-muted-foreground",
  Shortlisted: "bg-brand-subtle text-primary",
  Rejected: "bg-destructive/10 text-destructive",
  "Interview scheduled": "bg-info/10 text-info",
};

const ACTIVITY_ICONS: Record<
  ResultActivityIcon,
  typeof PhoneCall
> = {
  phone: PhoneCall,
  check: CheckCircle2,
  bookmark: Bookmark,
  note: StickyNote,
  recording: FileAudio,
  score: CheckCircle2,
  failed: XCircle,
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

function EmptyDetail({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function AudioPlayerUI({
  durationSeconds,
  label,
  size,
  url,
}: {
  durationSeconds: number;
  label: string;
  size: string;
  url: string | null;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<HTMLButtonElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(
    durationSeconds > 0 ? durationSeconds : 0
  );

  useEffect(() => {
    if (durationSeconds > 0) {
      setDuration((current) => (current > 0 ? current : durationSeconds));
    }
  }, [durationSeconds]);

  const bars = useMemo(
    () =>
      Array.from({ length: 48 }, (_, index) => {
        const wave =
          28 +
          Math.round(
            36 * Math.abs(Math.sin(index * 0.55)) +
              18 * Math.abs(Math.sin(index * 1.3 + 0.4))
          );
        return Math.min(92, wave);
      }),
    []
  );

  const progress = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;
  const shortLabel = label.includes("_")
    ? label.replace(/^.*\//, "").replace(/_[0-9]+_plivo\.wav$/i, ".wav")
    : label;

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !url) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  function scrub(next: number) {
    const audio = audioRef.current;
    const max = duration > 0 ? duration : next;
    const clamped = Math.max(0, Math.min(max, next));
    setPosition(clamped);
    if (audio) audio.currentTime = clamped;
  }

  function seekFromClientX(clientX: number) {
    const track = trackRef.current;
    if (!track || duration <= 0) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    scrub(ratio * duration);
  }

  if (!url) {
    return (
      <EmptyDetail
        title="No recording yet"
        description="The recording URL will appear here when Hunar sends the call-recording webhook."
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <FileAudio aria-hidden className="size-4" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">
              Call recording
            </h3>
            <p className="truncate text-xs text-muted-foreground" title={label}>
              {shortLabel}
              {size && size !== "—" ? ` · ${size}` : null}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<a href={url} target="_blank" rel="noreferrer" download />}
        >
          <Download aria-hidden />
          Download
        </Button>
      </div>

      <div className="px-4 py-5">
        <audio
          ref={audioRef}
          src={url}
          preload="metadata"
          className="sr-only"
          onLoadedMetadata={(event) => {
            const next = event.currentTarget.duration;
            if (Number.isFinite(next) && next > 0) setDuration(next);
          }}
          onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
          onEnded={() => {
            setPlaying(false);
            setPosition(0);
          }}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
        />

        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            size="icon"
            className="size-11 shrink-0 rounded-full"
            aria-label={playing ? "Pause" : "Play"}
            onClick={() => void togglePlay()}
          >
            {playing ? (
              <Pause aria-hidden className="size-5" />
            ) : (
              <Play aria-hidden className="size-5 translate-x-px" />
            )}
          </Button>

          <div className="min-w-0 flex-1">
            <button
              ref={trackRef}
              type="button"
              aria-label="Seek recording"
              className="relative flex h-12 w-full cursor-pointer items-end gap-px overflow-hidden rounded-lg bg-muted/60 px-1.5 py-2"
              onClick={(event) => seekFromClientX(event.clientX)}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  scrub(position - 5);
                }
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  scrub(position + 5);
                }
              }}
            >
              {bars.map((height, index) => {
                const filled = (index / bars.length) * 100 <= progress;
                return (
                  <span
                    key={index}
                    className={cn(
                      "w-full rounded-[1px] transition-colors",
                      filled ? "bg-primary" : "bg-foreground/15"
                    )}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-2 w-0.5 rounded-full bg-foreground"
                style={{ left: `calc(${progress}% - 1px)` }}
              />
            </button>

            <div className="mt-2 flex items-center justify-between text-[11px] tabular-nums text-muted-foreground">
              <span>{formatTime(position)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-1 sm:flex">
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Skip back 10 seconds"
              onClick={() => scrub(position - 10)}
            >
              <SkipBack aria-hidden />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Skip forward 10 seconds"
              onClick={() => scrub(position + 10)}
            >
              <SkipForward aria-hidden />
            </Button>
          </div>
        </div>
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
        {detail.statusNote ? (
          <p className="mt-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            {detail.statusNote}
          </p>
        ) : null}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="text-xs font-semibold tracking-wide text-success uppercase">
              Strengths
            </h4>
            {detail.strengths.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No strengths captured in the webhook payload.
              </p>
            ) : (
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
            )}
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-wide text-warning uppercase">
              Concerns
            </h4>
            {detail.concerns.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No concerns captured in the webhook payload.
              </p>
            ) : (
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
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Key answers
          </h4>
          {detail.keyAnswers.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Answer fields will appear here when Hunar includes them in the call result.
            </p>
          ) : (
            <dl className="mt-2 space-y-3">
              {detail.keyAnswers.map((item) => (
                <div key={item.question}>
                  <dt className="text-xs text-muted-foreground">{item.question}</dt>
                  <dd className="mt-0.5 text-sm text-foreground">{item.answer}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <aside className="space-y-3">
        {detail.hcgQuestions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
            <p className="text-sm font-medium text-foreground">No questions yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Screening questions from the voice call will appear here.
            </p>
          </div>
        ) : (
          detail.hcgQuestions.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {item.question}
                </p>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize",
                    item.status === "passed"
                      ? "bg-success/10 text-success"
                      : item.status === "failed"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.status.replace(/_/g, " ") || "unanswered"}
                </span>
              </div>
              <p className="mt-1.5 text-sm font-semibold text-foreground">
                {item.answer || "—"}
              </p>
              {item.description ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </div>
          ))
        )}
      </aside>
    </div>
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
              Based on communication score from the call result
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

      {detail.categories.length === 0 ? (
        <EmptyDetail
          title="No score breakdown yet"
          description="Category scores appear when Hunar sends numeric fields in the call-result webhook."
        />
      ) : (
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
              {category.evidence ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Evidence: </span>
                  {category.evidence}
                </p>
              ) : null}
            </section>
          ))}
        </div>
      )}

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

  if (detail.extracted.length === 0) {
    return (
      <EmptyDetail
        title="No extracted variables yet"
        description="Variables from the Hunar result object will show here after the call-result webhook."
      />
    );
  }

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
  if (detail.activity.length === 0) {
    return (
      <EmptyDetail
        title="No activity yet"
        description="Webhook events, completion, decisions, and notes will appear in this timeline."
      />
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <ol className="space-y-0">
        {detail.activity.map((entry, index) => {
          const Icon = ACTIVITY_ICONS[entry.icon] || PhoneCall;
          return (
            <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
              {index < detail.activity.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute top-6 left-[11px] h-full w-px bg-border"
                />
              ) : null}
              <span className="relative mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                <Icon aria-hidden className="size-3 text-muted-foreground" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{entry.title}</p>
                <p className="text-xs text-muted-foreground">{entry.detail}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {formatResultWhen(entry.time)}
                </p>
              </div>
            </li>
          );
        })}
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
                {result.answeredBy ? (
                  <>
                    <span aria-hidden className="text-border">
                      ·
                    </span>
                    <span>
                      Answered by{" "}
                      {result.answeredBy.replace(/_/g, " ").toLowerCase()}
                    </span>
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
                  text={`AI: ${result.overallAIStatus || result.recommendation}`}
                  className={aiBadgeClass(
                    result.overallAIStatus,
                    result.recommendation
                  )}
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
            <TabsTrigger value="recording">Recording</TabsTrigger>
            <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
            <TabsTrigger value="extracted">Extracted Data</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="summary" className="pt-3">
          <SummaryTab detail={detail} />
        </TabsContent>
        <TabsContent value="recording" className="pt-3">
          <AudioPlayerUI
            durationSeconds={detail.recording.durationSeconds}
            label={detail.recording.label}
            size={detail.recording.size}
            url={detail.recording.url}
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
