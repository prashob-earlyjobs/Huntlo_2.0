"use client";

import {
  AudioLines,
  Bookmark,
  BookmarkCheck,
  Building2,
  ListPlus,
  Mail,
  MapPin,
  Phone,
  Radar,
  Search,
  Send,
  Timer,
} from "lucide-react";

import { ContactReveal, type RevealState } from "@/components/sessions/contact-reveal";
import { breakdownItems } from "@/components/sessions/match-score";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { MatchScoreBadge } from "@/components/shared/match-score-badge";
import { ScoreBreakdown } from "@/components/shared/score-breakdown";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  REVEAL_QUOTA,
  type CandidateActivityEntry,
  type SessionCandidate,
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
    <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </h3>
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

export function CandidateDrawer({
  candidate,
  open,
  onOpenChange,
  revealed,
  onReveal,
  saved,
  onToggleSave,
  onAddToOutreach,
}: {
  candidate: SessionCandidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revealed: RevealState;
  onReveal: (kind: "email" | "phone") => void;
  saved: boolean;
  onToggleSave: () => void;
  onAddToOutreach: () => void;
}) {
  if (!candidate) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 bg-card p-0 max-sm:max-w-full sm:max-w-lg"
      >
        <SheetHeader className="border-b border-border pb-3">
          <div className="flex items-start gap-3 pr-8">
            <CandidateAvatar name={candidate.name} className="size-11" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <SheetTitle className="truncate">{candidate.name}</SheetTitle>
                <MatchScoreBadge score={candidate.matchScore} />
              </div>
              <SheetDescription className="truncate">
                {candidate.headline}
              </SheetDescription>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin aria-hidden className="size-3" />
                  {candidate.location}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Timer aria-hidden className="size-3" />
                  {candidate.experienceYears} yrs total
                </span>
                <span className="inline-flex items-center gap-1">
                  <Building2 aria-hidden className="size-3" />
                  {candidate.currentCompany}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="xs"
              variant={saved ? "secondary" : "outline"}
              onClick={onToggleSave}
            >
              {saved ? (
                <>
                  <BookmarkCheck aria-hidden />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark aria-hidden />
                  Save
                </>
              )}
            </Button>
            <Button type="button" size="xs" onClick={onAddToOutreach}>
              <Send aria-hidden />
              Add to outreach
            </Button>
            <StatusBadge status={candidate.status} />
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <Tabs defaultValue="overview" className="p-4">
            <div className="overflow-x-auto">
              <TabsList className="min-w-max">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-5 pt-2">
              <div className="space-y-2">
                <SectionTitle>Contact</SectionTitle>
                <ContactReveal
                  candidate={candidate}
                  revealed={revealed}
                  onReveal={onReveal}
                  layout="stack"
                />
              </div>
              <div className="space-y-2">
                <SectionTitle>Match breakdown</SectionTitle>
                <ScoreBreakdown items={breakdownItems(candidate.matchBreakdown)} />
              </div>
              <div className="space-y-2">
                <SectionTitle>Top skills</SectionTitle>
                <SkillChips skills={candidate.skills} />
              </div>
              <div className="space-y-2">
                <SectionTitle>Summary</SectionTitle>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {candidate.summary}
                </p>
              </div>
              <div className="space-y-2">
                <SectionTitle>Profile signals</SectionTitle>
                <ul className="space-y-1.5">
                  {candidate.signals.map((signal) => (
                    <li
                      key={signal}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <Radar aria-hidden className="size-3.5 shrink-0 text-primary" />
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <SectionTitle>Similar candidates</SectionTitle>
                <ul className="space-y-2">
                  {candidate.similar.map((similar) => (
                    <li
                      key={similar.id}
                      className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2"
                    >
                      <CandidateAvatar name={similar.name} className="size-7" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {similar.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {similar.headline}
                        </p>
                      </div>
                      <MatchScoreBadge score={similar.matchScore} />
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="experience" className="pt-2">
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
            </TabsContent>

            <TabsContent value="education" className="space-y-3 pt-2">
              {candidate.education.map((entry) => (
                <div
                  key={entry.school}
                  className="rounded-lg border border-border px-3 py-2.5"
                >
                  <p className="text-sm font-medium text-foreground">
                    {entry.school}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {entry.degree}, {entry.field}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {entry.years}
                  </p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="skills" className="space-y-4 pt-2">
              <div className="space-y-2">
                <SectionTitle>Skills</SectionTitle>
                <SkillChips skills={candidate.skills} />
              </div>
              <div className="space-y-2">
                <SectionTitle>Skill-related match</SectionTitle>
                <ScoreBreakdown
                  items={breakdownItems(candidate.matchBreakdown).filter((item) =>
                    ["Skills match", "Role match", "Industry match"].includes(
                      item.label
                    )
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 pt-2">
              <ContactReveal
                candidate={candidate}
                revealed={revealed}
                onReveal={onReveal}
                layout="stack"
              />
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
                <p>
                  Email reveals remaining:{" "}
                  <span className="font-medium tabular-nums text-foreground">
                    {REVEAL_QUOTA.emailRemaining.toLocaleString("en-IN")}
                  </span>{" "}
                  of {REVEAL_QUOTA.emailTotal.toLocaleString("en-IN")}
                </p>
                <p className="mt-1">
                  Mobile reveals remaining:{" "}
                  <span className="font-medium tabular-nums text-foreground">
                    {REVEAL_QUOTA.mobileRemaining.toLocaleString("en-IN")}
                  </span>{" "}
                  of {REVEAL_QUOTA.mobileTotal.toLocaleString("en-IN")}
                </p>
                <p className="mt-1">
                  Contacts already revealed are never charged again.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="pt-2">
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
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
