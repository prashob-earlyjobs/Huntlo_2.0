"use client";

import {
  AudioLines,
  Bookmark,
  Building2,
  CalendarClock,
  ChevronDown,
  Contact,
  ListPlus,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Radar,
  Search,
  Send,
  StickyNote,
  Timer,
} from "lucide-react";
import { useState } from "react";

import { PipelineStatusBadge } from "@/components/candidates/pipeline-status-badge";
import {
  ContactReveal,
  type RevealState,
} from "@/components/sessions/contact-reveal";
import { breakdownItems } from "@/components/sessions/match-score";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { MatchScoreBadge } from "@/components/shared/match-score-badge";
import { ScoreBreakdown } from "@/components/shared/score-breakdown";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CANDIDATE_STATUSES,
  LIST_NAMES,
  type CandidateNote,
  type CandidateStatus,
  type PoolCandidate,
} from "@/lib/mock-candidates";
import {
  REVEAL_QUOTA,
  type CandidateActivityEntry,
} from "@/lib/mock-sessions";
import { cn } from "@/lib/utils";

const ACTIVITY_ICONS: Record<CandidateActivityEntry["kind"], typeof Search> = {
  sourced: Search,
  saved: Bookmark,
  "email-revealed": Mail,
  "phone-revealed": Phone,
  "added-to-list": ListPlus,
  "added-to-outreach": Send,
  "screening-started": AudioLines,
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </h2>
  );
}

function SkillChips({ skills }: { skills: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span
          key={skill}
          className="rounded-md bg-brand-subtle px-2 py-0.5 text-xs font-medium text-primary"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn("rounded-xl border border-border bg-card p-4", className)}
    >
      {children}
    </section>
  );
}

export function CandidateProfile({ candidate }: { candidate: PoolCandidate }) {
  const [tab, setTab] = useState("overview");
  const [status, setStatus] = useState<CandidateStatus>(
    candidate.pipelineStatus
  );
  const [revealed, setRevealed] = useState<RevealState>({
    email: false,
    phone: false,
  });
  const [notes, setNotes] = useState<CandidateNote[]>(candidate.notes);
  const [noteDraft, setNoteDraft] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  function flash(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2400);
  }

  function addNote() {
    if (!noteDraft.trim()) return;
    setNotes((previous) => [
      {
        id: `n-${Date.now()}`,
        author: "Ananya Sharma",
        text: noteDraft.trim(),
        time: "Just now",
      },
      ...previous,
    ]);
    setNoteDraft("");
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <CandidateAvatar
              name={candidate.name}
              className="size-14 text-base"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  {candidate.name}
                </h1>
                <MatchScoreBadge score={candidate.matchScore} />
                <PipelineStatusBadge status={status} />
              </div>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {candidate.headline}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Building2 aria-hidden className="size-3" />
                  {candidate.currentCompany}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin aria-hidden className="size-3" />
                  {candidate.location}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Timer aria-hidden className="size-3" />
                  {candidate.experienceYears} yrs total
                </span>
                <span>Owner: {candidate.owner}</span>
                <span>Source: {candidate.source}</span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => setTab("contact")}>
              <Contact aria-hidden />
              Reveal Contact
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
                <ListPlus aria-hidden />
                Add to List
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>Add to list</DropdownMenuLabel>
                {LIST_NAMES.map((list) => (
                  <DropdownMenuItem
                    key={list}
                    onClick={() => flash(`Added ${candidate.name} to “${list}”.`)}
                  >
                    {list}
                  </DropdownMenuItem>
                ))}
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => flash(`Screening started for ${candidate.name}.`)}
            >
              <AudioLines aria-hidden />
              Start Screening
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => flash("Interview scheduling opened.")}
            >
              <CalendarClock aria-hidden />
              Schedule Interview
            </Button>
            <Button size="sm" variant="outline" onClick={() => setTab("notes")}>
              <StickyNote aria-hidden />
              Add Note
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
                    onClick={() => {
                      setStatus(option);
                      flash(`Status changed to “${option}”.`);
                    }}
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {feedback ? (
          <p
            role="status"
            className="mt-3 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
          >
            {feedback}
          </p>
        ) : null}
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(value) => value && setTab(value)}>
        <div className="overflow-x-auto">
          <TabsList className="min-w-max">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="outreach">Outreach</TabsTrigger>
            <TabsTrigger value="screening">Screening</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </div>

        {/* Overview */}
        <TabsContent value="overview" className="pt-3">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Card className="space-y-2">
                <SectionTitle>Summary</SectionTitle>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {candidate.summary}
                </p>
              </Card>
              <Card className="space-y-2">
                <SectionTitle>Top skills</SectionTitle>
                <SkillChips skills={candidate.skills} />
              </Card>
              <Card className="space-y-2">
                <SectionTitle>Profile signals</SectionTitle>
                <ul className="space-y-1.5">
                  {candidate.signals.map((signal) => (
                    <li
                      key={signal}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <Radar
                        aria-hidden
                        className="size-3.5 shrink-0 text-primary"
                      />
                      {signal}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
            <div className="space-y-4">
              <Card className="space-y-2">
                <SectionTitle>Match breakdown</SectionTitle>
                <ScoreBreakdown
                  items={breakdownItems(candidate.matchBreakdown)}
                />
              </Card>
              <Card className="space-y-2">
                <SectionTitle>Contact</SectionTitle>
                <ContactReveal
                  candidate={candidate}
                  revealed={revealed}
                  onReveal={(kind) =>
                    setRevealed((previous) => ({ ...previous, [kind]: true }))
                  }
                  layout="stack"
                />
              </Card>
              <Card className="space-y-2">
                <SectionTitle>Lists</SectionTitle>
                {candidate.lists.length > 0 ? (
                  <ul className="space-y-1.5">
                    {candidate.lists.map((list) => (
                      <li
                        key={list}
                        className="flex items-center gap-2 text-sm text-foreground"
                      >
                        <ListPlus
                          aria-hidden
                          className="size-3.5 shrink-0 text-muted-foreground"
                        />
                        {list}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Not in any list yet.
                  </p>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Experience */}
        <TabsContent value="experience" className="pt-3">
          <Card>
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
        </TabsContent>

        {/* Education */}
        <TabsContent value="education" className="space-y-3 pt-3">
          {candidate.education.map((entry) => (
            <Card key={entry.school}>
              <p className="text-sm font-medium text-foreground">
                {entry.school}
              </p>
              <p className="text-sm text-muted-foreground">
                {entry.degree}, {entry.field}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {entry.years}
              </p>
            </Card>
          ))}
        </TabsContent>

        {/* Skills */}
        <TabsContent value="skills" className="pt-3">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="space-y-2">
              <SectionTitle>Skills</SectionTitle>
              <SkillChips skills={candidate.skills} />
            </Card>
            <Card className="space-y-2">
              <SectionTitle>Skill-related match</SectionTitle>
              <ScoreBreakdown
                items={breakdownItems(candidate.matchBreakdown).filter((item) =>
                  ["Skills match", "Role match", "Industry match"].includes(
                    item.label
                  )
                )}
              />
            </Card>
          </div>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact" className="pt-3">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="space-y-3">
              <SectionTitle>Contact details</SectionTitle>
              <ContactReveal
                candidate={candidate}
                revealed={revealed}
                onReveal={(kind) =>
                  setRevealed((previous) => ({ ...previous, [kind]: true }))
                }
                layout="stack"
              />
            </Card>
            <Card className="space-y-1 text-xs text-muted-foreground">
              <SectionTitle>Reveal quota</SectionTitle>
              <p className="pt-1">
                Email reveals remaining:{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {REVEAL_QUOTA.emailRemaining.toLocaleString("en-IN")}
                </span>{" "}
                of {REVEAL_QUOTA.emailTotal.toLocaleString("en-IN")}
              </p>
              <p>
                Mobile reveals remaining:{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {REVEAL_QUOTA.mobileRemaining.toLocaleString("en-IN")}
                </span>{" "}
                of {REVEAL_QUOTA.mobileTotal.toLocaleString("en-IN")}
              </p>
              <p>Contacts already revealed are never charged again.</p>
            </Card>
          </div>
        </TabsContent>

        {/* Outreach */}
        <TabsContent value="outreach" className="pt-3">
          {candidate.outreachHistory.length > 0 ? (
            <div className="space-y-3">
              {candidate.outreachHistory.map((entry) => (
                <Card
                  key={entry.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
                    <MessageSquare
                      aria-hidden
                      className="size-4 text-muted-foreground"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {entry.campaign}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.channel} · {entry.step} · {entry.time}
                    </p>
                  </div>
                  <span className="rounded-md bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                    {entry.outcome}
                  </span>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Send}
              title="No outreach yet"
              description="This candidate hasn't been added to any outreach campaign."
              actionLabel="Start Outreach"
              onAction={() => flash(`${candidate.name} added to outreach.`)}
            />
          )}
        </TabsContent>

        {/* Screening */}
        <TabsContent value="screening" className="pt-3">
          {candidate.screeningResults.length > 0 ? (
            <div className="space-y-3">
              {candidate.screeningResults.map((entry) => (
                <Card key={entry.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {entry.batch}
                    </p>
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-medium",
                        entry.outcome === "Qualified"
                          ? "bg-success/10 text-success"
                          : entry.outcome === "Rejected"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-warning/10 text-warning"
                      )}
                    >
                      {entry.outcome}
                    </span>
                    <span className="ml-auto text-sm font-semibold tabular-nums text-foreground">
                      {entry.score}/100
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {entry.summary}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.time}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={AudioLines}
              title="No screening results"
              description="Run an AI voice screening to evaluate this candidate against a job."
              actionLabel="Start Screening"
              onAction={() => flash(`Screening started for ${candidate.name}.`)}
            />
          )}
        </TabsContent>

        {/* Interviews */}
        <TabsContent value="interviews" className="pt-3">
          {candidate.interviews.length > 0 ? (
            <div className="space-y-3">
              {candidate.interviews.map((entry) => (
                <Card
                  key={entry.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
                    <CalendarClock
                      aria-hidden
                      className="size-4 text-muted-foreground"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {entry.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.dateTime} · with {entry.interviewer}
                    </p>
                  </div>
                  {entry.outcome ? (
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {entry.outcome}
                    </span>
                  ) : (
                    <span className="rounded-md bg-info/10 px-2 py-0.5 text-xs font-medium text-info">
                      Upcoming
                    </span>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarClock}
              title="No interviews scheduled"
              description="Schedule an interview once the candidate is ready to move forward."
              actionLabel="Schedule Interview"
              onAction={() => flash("Interview scheduling opened.")}
            />
          )}
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes" className="space-y-3 pt-3">
          <Card className="space-y-2">
            <SectionTitle>Add a note</SectionTitle>
            <Textarea
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              placeholder="Share context with your team — compensation, notice period, preferences…"
              aria-label="New note"
              className="min-h-20"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={addNote} disabled={!noteDraft.trim()}>
                <StickyNote aria-hidden />
                Add Note
              </Button>
            </div>
          </Card>
          {notes.length > 0 ? (
            notes.map((note) => (
              <Card key={note.id}>
                <p className="text-sm leading-relaxed text-foreground">
                  {note.text}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {note.author} · {note.time}
                </p>
              </Card>
            ))
          ) : (
            <p className="px-1 text-sm text-muted-foreground">
              No notes yet — be the first to add context.
            </p>
          )}
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity" className="pt-3">
          <Card>
            <ol className="space-y-0">
              {candidate.activity.map((entry, index) => {
                const Icon = ACTIVITY_ICONS[entry.kind];
                return (
                  <li
                    key={entry.id}
                    className="relative flex gap-3 pb-5 last:pb-0"
                  >
                    {index < candidate.activity.length - 1 ? (
                      <span
                        aria-hidden
                        className="absolute top-6 left-[11px] h-full w-px bg-border"
                      />
                    ) : null}
                    <span className="relative mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                      <Icon
                        aria-hidden
                        className="size-3 text-muted-foreground"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {entry.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {entry.time}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
