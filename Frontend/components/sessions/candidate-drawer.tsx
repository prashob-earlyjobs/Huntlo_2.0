"use client";

import Link from "next/link";
import {
  AudioLines,
  Bookmark,
  BookmarkCheck,
  Info,
  ListPlus,
  Mail,
  MapPin,
  Phone,
  Search,
  Send,
  Timer,
} from "lucide-react";

import { ContactReveal, RevealedValue, type RevealState } from "@/components/sessions/contact-reveal";
import { breakdownItems, MatchScoreCompact } from "@/components/sessions/match-score";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { ScoreBreakdown } from "@/components/shared/score-breakdown";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  type CandidateActivityEntry,
  type SessionCandidate,
} from "@/lib/mock-sessions";
import { useRevealQuota } from "@/hooks/use-reveal-quota";
import { ROUTES } from "@/lib/routes";
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

function experienceSortKey(duration: string) {
  const years = duration.match(/\b(?:19|20)\d{2}\b/g)?.map(Number) ?? [];
  const ongoing = /present|current|now/i.test(duration);
  const end = ongoing ? Number.MAX_SAFE_INTEGER : Math.max(...years, 0);
  const start = years.length ? Math.min(...years) : 0;
  return { end, start };
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
  detailsLoading = false,
  detailsError = null,
}: {
  candidate: SessionCandidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revealed: RevealState;
  onReveal: (kind: "email" | "phone") => void;
  saved: boolean;
  onToggleSave: () => void;
  onAddToOutreach: () => void;
  detailsLoading?: boolean;
  detailsError?: string | null;
}) {
  const revealQuota = useRevealQuota();

  if (!candidate) return null;

  const emailVisible = revealed.email || candidate.emailRevealed;
  const phoneVisible = revealed.phone || candidate.phoneRevealed;
  const hasRevealedContact = emailVisible || phoneVisible;
  const experience = [...candidate.experience].sort((a, b) => {
    const byCurrent = Number(b.current) - Number(a.current);
    if (byCurrent) return byCurrent;
    const ka = experienceSortKey(a.duration);
    const kb = experienceSortKey(b.duration);
    return kb.end - ka.end || kb.start - ka.start;
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 bg-card p-0 max-sm:max-w-full sm:max-w-lg"
      >
        <SheetHeader className="border-b border-border pb-3">
          <div className="flex items-start gap-3 pr-8">
            <CandidateAvatar name={candidate.name} src={candidate.avatarUrl} className="size-11" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <SheetTitle className="truncate">{candidate.name}</SheetTitle>
                <MatchScoreCompact score={candidate.matchScore} className="shrink-0" />
              </div>
              <SheetDescription className="truncate">
                {candidate.currentRole} · {candidate.currentCompany}
              </SheetDescription>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin aria-hidden className="size-3" />
                  {candidate.location}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Timer aria-hidden className="size-3" />
                  {candidate.experienceYears} yrs total
                </span>
                <StatusBadge status={candidate.status} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <Tabs defaultValue="summary" className="p-4">
            <div className="overflow-x-auto scrollbar-none">
              <TabsList className="min-w-max">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="rationale">Match rationale</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="summary" className="space-y-5 pt-2">
              {detailsLoading ? (
                <p className="text-xs text-muted-foreground">Loading full profile…</p>
              ) : null}
              {detailsError ? (
                <p className="text-xs text-destructive">{detailsError}</p>
              ) : null}
              <div className="space-y-2">
                <SectionTitle>Contact</SectionTitle>
                {hasRevealedContact ? (
                  <div className="flex flex-col gap-1.5">
                    {emailVisible ? (
                      <RevealedValue
                        icon={Mail}
                        value={candidate.email}
                        verified={candidate.emailVerified}
                        label="email"
                        previouslyRevealed={candidate.emailRevealed && !revealed.email}
                      />
                    ) : null}
                    {phoneVisible ? (
                      <RevealedValue
                        icon={Phone}
                        value={candidate.phone}
                        verified={candidate.phoneVerified}
                        label="phone number"
                        previouslyRevealed={candidate.phoneRevealed && !revealed.phone}
                      />
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Not revealed yet — use Reveal in the action bar below.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <SectionTitle>Summary</SectionTitle>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {candidate.summary}
                </p>
              </div>
              <div className="space-y-2">
                <SectionTitle>Top skills</SectionTitle>
                <SkillChips skills={candidate.skills} />
              </div>
              <div className="space-y-2">
                <SectionTitle>Profile signals</SectionTitle>
                <ul className="space-y-1.5">
                  {candidate.signals.map((signal) => (
                    <li
                      key={signal}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <Info aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="experience" className="pt-2">
              {detailsLoading && experience.length <= 1 ? (
                <p className="mb-3 text-sm text-muted-foreground">Loading experience…</p>
              ) : null}
              {!detailsLoading && experience.length === 0 ? (
                <p className="text-sm text-muted-foreground">No experience listed.</p>
              ) : null}
              <ol className="space-y-0">
                {experience.map((entry, index) => (
                  <li
                    key={`${entry.company}-${entry.role}`}
                    className="relative flex gap-3 pb-5 last:pb-0"
                  >
                    {index < experience.length - 1 ? (
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

            <TabsContent value="skills" className="pt-2">
              <SkillChips skills={candidate.skills} />
            </TabsContent>

            <TabsContent value="education" className="space-y-3 pt-2">
              {detailsLoading && candidate.education.length === 0 ? (
                <p className="text-sm text-muted-foreground">Loading education…</p>
              ) : null}
              {!detailsLoading && candidate.education.length === 0 ? (
                <p className="text-sm text-muted-foreground">No education listed.</p>
              ) : null}
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

            <TabsContent value="rationale" className="space-y-5 pt-2">
              <div className="space-y-2">
                <SectionTitle>Match breakdown</SectionTitle>
                <p className="text-xs text-muted-foreground">
                  A directional score against this search&rsquo;s criteria — not a
                  precise ranking.
                </p>
                <ScoreBreakdown
                  items={breakdownItems(candidate.matchBreakdown)}
                  className="mt-2"
                />
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
                      <MatchScoreCompact score={similar.matchScore} showLabel={false} />
                    </li>
                  ))}
                </ul>
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

        {/* Sticky action bar */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border bg-card p-3">
          <Button
            type="button"
            size="sm"
            variant={saved ? "secondary" : "outline"}
            onClick={onToggleSave}
            aria-pressed={saved}
          >
            {saved ? <BookmarkCheck aria-hidden /> : <Bookmark aria-hidden />}
            Add to list
          </Button>

          <Popover>
            <PopoverTrigger render={<Button type="button" size="sm" variant="outline" />}>
              <Mail aria-hidden />
              Reveal
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64">
              <p className="text-xs font-semibold text-foreground">
                Reveal contact details
              </p>
              <div className="mt-2">
                <ContactReveal
                  candidate={candidate}
                  revealed={revealed}
                  onReveal={onReveal}
                  layout="stack"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {revealQuota.emailRemaining.toLocaleString("en-IN")} email ·{" "}
                {revealQuota.mobileRemaining.toLocaleString("en-IN")} mobile reveals
                remaining this cycle.
              </p>
            </PopoverContent>
          </Popover>

          <Button type="button" size="sm" onClick={onAddToOutreach}>
            <Send aria-hidden />
            Add to Outreach
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="ml-auto"
            nativeButton={false}
            render={<Link href={ROUTES.screeningNew} />}
          >
            <AudioLines aria-hidden />
            Start Screening
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
