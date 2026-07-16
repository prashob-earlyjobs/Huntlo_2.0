"use client";

import {
  AudioLines,
  CalendarClock,
  ChevronDown,
  Contact,
  Info,
  ListPlus,
  MapPin,
  MoreHorizontal,
  Send,
  StickyNote,
  Timer,
} from "lucide-react";
import { useEffect, useState } from "react";

import { PipelineStatusBadge } from "@/components/candidates/pipeline-status-badge";
import {
  ContactReveal,
  type RevealState,
} from "@/components/sessions/contact-reveal";
import { MatchScoreDetail } from "@/components/sessions/match-score";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  candidatePoolApi,
  candidatesApi,
  getApiErrorMessage,
  uiRevealKindToType,
} from "@/lib/api";
import {
  CANDIDATE_STATUSES,
  LIST_NAMES,
  type CandidateNote,
  type CandidateStatus,
  type PoolCandidate,
  type SavedList,
} from "@/lib/mock-candidates";
import { REVEAL_QUOTA } from "@/lib/mock-sessions";
import { cn } from "@/lib/utils";

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn("space-y-3 rounded-lg border border-border bg-card p-4", className)}
    >
      {children}
    </section>
  );
}

function SkillChips({ skills }: { skills: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span
          key={skill}
          className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

/** Compact "at a glance" row for the sidebar's pipeline activity card. */
function ActivityRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Send;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm text-foreground">{children}</div>
      </div>
    </div>
  );
}

export function CandidateProfile({ candidate }: { candidate: PoolCandidate }) {
  const [status, setStatus] = useState<CandidateStatus>(
    candidate.pipelineStatus
  );
  const [profile, setProfile] = useState(candidate);
  const [revealed, setRevealed] = useState<RevealState>({
    email: candidate.emailRevealed,
    phone: candidate.phoneRevealed,
  });
  const [notes, setNotes] = useState<CandidateNote[]>(candidate.notes);
  const [noteDraft, setNoteDraft] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [lists, setLists] = useState<SavedList[]>([]);
  const [noteBusy, setNoteBusy] = useState(false);

  useEffect(() => {
    setProfile(candidate);
    setStatus(candidate.pipelineStatus);
    setNotes(candidate.notes);
    setRevealed({
      email: candidate.emailRevealed,
      phone: candidate.phoneRevealed,
    });
  }, [candidate]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [nextNotes, nextLists] = await Promise.all([
          candidatePoolApi.listNotes(candidate.id),
          candidatePoolApi.listLists(),
        ]);
        if (!cancelled) {
          if (nextNotes.length > 0 || candidate.notes.length === 0) {
            setNotes(nextNotes);
          }
          setLists(nextLists);
        }
      } catch {
        // Keep local notes / mock list names when API is unavailable.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [candidate.id, candidate.notes.length]);

  function flash(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2400);
  }

  async function handleReveal(kind: "email" | "phone") {
    setRevealError(null);
    try {
      const result = await candidatesApi.revealContact({
        candidateId: profile.id,
        type: uiRevealKindToType(kind),
      });
      const value = result.value || result.values[0] || "";
      setProfile((previous) =>
        kind === "email"
          ? { ...previous, email: value || previous.email, emailRevealed: true }
          : { ...previous, phone: value || previous.phone, phoneRevealed: true }
      );
      setRevealed((previous) => ({ ...previous, [kind]: true }));
      flash(
        result.charged
          ? `Revealed (${result.creditsCharged} credits)`
          : "Already unlocked — no credits charged"
      );
    } catch (err) {
      setRevealError(getApiErrorMessage(err));
    }
  }

  async function handleStatusChange(option: CandidateStatus) {
    const previous = status;
    setStatus(option);
    try {
      await candidatePoolApi.update(profile.id, { pipelineStatus: option });
      flash(`Status changed to “${option}”.`);
    } catch (err) {
      setStatus(previous);
      flash(getApiErrorMessage(err));
    }
  }

  async function addNote() {
    if (!noteDraft.trim() || noteBusy) return;
    const body = noteDraft.trim();
    setNoteBusy(true);
    try {
      const note = await candidatePoolApi.addNote(profile.id, body);
      setNotes((previous) => [note, ...previous]);
      setNoteDraft("");
      flash("Note added.");
    } catch (err) {
      flash(getApiErrorMessage(err));
    } finally {
      setNoteBusy(false);
    }
  }

  async function addToList(list: SavedList) {
    try {
      await candidatePoolApi.bulkAddToList([profile.id], list.id);
      setProfile((previous) =>
        previous.lists.includes(list.name)
          ? previous
          : { ...previous, lists: [...previous.lists, list.name] }
      );
      flash(`Added ${candidate.name} to “${list.name}”.`);
    } catch (err) {
      flash(getApiErrorMessage(err));
    }
  }

  const latestOutreach = profile.outreachHistory[0] ?? null;
  const latestScreening = profile.screeningResults[0] ?? null;
  const nextInterview =
    profile.interviews.find((entry) => entry.outcome === null) ??
    profile.interviews[0] ??
    null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <CandidateAvatar
              name={candidate.name}
              className="size-12 text-base"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                  {candidate.name}
                </h1>
                <PipelineStatusBadge status={status} />
              </div>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {candidate.currentRole} · {candidate.currentCompany}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <MatchScoreDetail
                  score={candidate.matchScore}
                  breakdown={candidate.matchBreakdown}
                  name={candidate.name}
                />
                <span className="inline-flex items-center gap-1">
                  <MapPin aria-hidden className="size-3" />
                  {candidate.location}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Timer aria-hidden className="size-3" />
                  {candidate.experienceYears} yrs
                </span>
                <span>Owner: {candidate.owner}</span>
                <span>Source: {candidate.source}</span>
              </div>
            </div>
          </div>

          {/* Main actions */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger render={<Button size="sm" variant="outline" />}>
                <Contact aria-hidden />
                Reveal Contact
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-3">
                <p className="mb-2 text-xs font-semibold text-foreground">
                  Contact details
                </p>
                <ContactReveal
                  candidate={profile as unknown as import("@/lib/mock-sessions").SessionCandidate}
                  revealed={revealed}
                  onReveal={(kind) => void handleReveal(kind)}
                  layout="stack"
                />
                {revealError ? (
                  <p role="alert" className="mt-2 text-xs text-destructive">
                    {revealError}
                  </p>
                ) : null}
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
                <ListPlus aria-hidden />
                Add to List
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>Add to list</DropdownMenuLabel>
                {(lists.length > 0 ? lists.map((list) => list.name) : LIST_NAMES).map(
                  (listName) => {
                    const list = lists.find((entry) => entry.name === listName);
                    return (
                      <DropdownMenuItem
                        key={listName}
                        onClick={() => {
                          if (list) void addToList(list);
                          else flash(`Added ${candidate.name} to “${listName}”.`);
                        }}
                      >
                        {listName}
                      </DropdownMenuItem>
                    );
                  }
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              variant="outline"
              onClick={() => flash(`${candidate.name} added to outreach.`)}
            >
              <Send aria-hidden />
              Start Outreach
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
                Change Status
                <ChevronDown aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Move to status</DropdownMenuLabel>
                {CANDIDATE_STATUSES.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => void handleStatusChange(option)}
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button size="icon-sm" variant="ghost" aria-label="More actions" />
                }
              >
                <MoreHorizontal aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  onClick={() => flash(`Screening started for ${candidate.name}.`)}
                >
                  <AudioLines aria-hidden />
                  Start Screening
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => flash("Interview scheduling opened.")}>
                  <CalendarClock aria-hidden />
                  Schedule Interview
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {feedback ? (
          <p
            role="status"
            className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
          >
            {feedback}
          </p>
        ) : null}
      </Card>

      {/* 8/4 layout */}
      <div className="grid items-start gap-4 lg:grid-cols-12">
        {/* Profile content */}
        <div className="space-y-4 lg:col-span-8">
          <Card>
            <SectionHeader title="Summary" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {candidate.summary}
            </p>
            {candidate.signals.length > 0 ? (
              <ul className="space-y-1.5 border-t border-border pt-3">
                {candidate.signals.map((signal) => (
                  <li
                    key={signal}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <Info
                      aria-hidden
                      className="size-3.5 shrink-0 text-muted-foreground"
                    />
                    {signal}
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>

          <Card>
            <SectionHeader title="Experience" />
            <ol className="space-y-0">
              {candidate.experience.map((entry, index) => (
                <li
                  key={`${entry.company}-${entry.role}`}
                  className="relative flex gap-3 pb-5 last:pb-0"
                >
                  {index < candidate.experience.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute top-4 left-[5px] h-full w-px bg-border"
                    />
                  ) : null}
                  <span
                    aria-hidden
                    className={cn(
                      "relative mt-1.5 size-[11px] shrink-0 rounded-full border-2",
                      entry.current
                        ? "border-primary bg-primary"
                        : "border-primary bg-card"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {entry.role}
                      </p>
                      {entry.current ? (
                        <span className="rounded-md bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                          Current
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {entry.company} · {entry.duration}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {entry.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <SectionHeader title="Skills" />
            <SkillChips skills={candidate.skills} />
          </Card>

          <Card>
            <SectionHeader title="Education" />
            <ul className="divide-y divide-border">
              {candidate.education.map((entry) => (
                <li key={entry.school} className="py-2.5 first:pt-0 last:pb-0">
                  <p className="text-sm font-medium text-foreground">
                    {entry.school}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {entry.degree}, {entry.field}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {entry.years}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Recruiter context */}
        <div className="space-y-4 lg:col-span-4">
          <Card>
            <SectionHeader title="Contact" />
            <ContactReveal
              candidate={profile as unknown as import("@/lib/mock-sessions").SessionCandidate}
              revealed={revealed}
              onReveal={(kind) => void handleReveal(kind)}
              layout="stack"
            />
            {revealError ? (
              <p role="alert" className="text-xs text-destructive">
                {revealError}
              </p>
            ) : null}
            <p className="border-t border-border pt-3 text-xs text-muted-foreground">
              {REVEAL_QUOTA.emailRemaining.toLocaleString("en-IN")} email and{" "}
              {REVEAL_QUOTA.mobileRemaining.toLocaleString("en-IN")} mobile reveals
              remaining this cycle.
            </p>
          </Card>

          <Card className="space-y-0 divide-y divide-border">
            <SectionHeader title="Pipeline activity" className="pb-2.5" />
            <ActivityRow icon={ListPlus} label="Lists">
              {candidate.lists.length > 0 ? (
                candidate.lists.join(" · ")
              ) : (
                <span className="text-muted-foreground">Not in any list yet</span>
              )}
            </ActivityRow>
            <ActivityRow icon={Send} label="Outreach">
              {latestOutreach ? (
                <>
                  {latestOutreach.outcome}
                  <span className="text-muted-foreground">
                    {" "}
                    · {latestOutreach.step} · {latestOutreach.time}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">No outreach yet</span>
              )}
            </ActivityRow>
            <ActivityRow icon={AudioLines} label="Screening">
              {latestScreening ? (
                <>
                  {latestScreening.score}/100 — {latestScreening.outcome}
                  <span className="text-muted-foreground"> · {latestScreening.time}</span>
                </>
              ) : (
                <span className="text-muted-foreground">No screening yet</span>
              )}
            </ActivityRow>
            <ActivityRow icon={CalendarClock} label="Interviews">
              {nextInterview ? (
                <>
                  {nextInterview.type}
                  <span className="text-muted-foreground">
                    {" "}
                    · {nextInterview.dateTime} with {nextInterview.interviewer}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">No interviews scheduled</span>
              )}
            </ActivityRow>
          </Card>

          <Card>
            <SectionHeader title="Notes" />
            <div className="space-y-2">
              <Textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Compensation, notice period, preferences…"
                aria-label="New note"
                className="min-h-16 text-sm"
              />
              <div className="flex justify-end">
                <Button
                  size="xs"
                  onClick={() => void addNote()}
                  disabled={!noteDraft.trim() || noteBusy}
                >
                  <StickyNote aria-hidden />
                  Add Note
                </Button>
              </div>
            </div>
            {notes.length > 0 ? (
              <ul className="space-y-2.5 border-t border-border pt-3">
                {notes.map((note) => (
                  <li key={note.id}>
                    <p className="text-sm leading-relaxed text-foreground">
                      {note.text}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {note.author} · {note.time}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border-t border-border pt-3 text-sm text-muted-foreground">
                No notes yet — be the first to add context.
              </p>
            )}
          </Card>

          <Card>
            <SectionHeader title="Activity" />
            <ActivityTimeline items={candidate.activity} />
          </Card>
        </div>
      </div>
    </div>
  );
}
