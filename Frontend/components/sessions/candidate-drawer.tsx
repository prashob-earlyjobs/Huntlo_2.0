"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  AudioLines,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Info,
  ListPlus,
  Mail,
  MapPin,
  Phone,
  Search,
  Send,
  Timer,
} from "lucide-react";

import { ContactReveal, type RevealState } from "@/components/sessions/contact-reveal";
import { MatchScoreCompact } from "@/components/sessions/match-score";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { CompanyDomainLogo } from "@/components/shared/company-domain-logo";
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
  type CandidateActivityEntry,
  type SessionCandidate,
} from "@/lib/mock-sessions";
import { useRevealQuota } from "@/hooks/use-reveal-quota";
import { isOpenToWork } from "@/lib/candidate-signals";
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
  if (skills.length === 0) {
    return <p className="text-sm text-muted-foreground">No skills listed.</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill, index) => (
        <span
          key={`${skill}-${index}`}
          className="rounded-md bg-brand-subtle px-2 py-0.5 text-xs font-medium text-primary"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

function displayPart(value: string | null | undefined): string {
  const text = value?.trim() ?? "";
  return text && text !== "—" ? text : "";
}

function metaLine(parts: Array<string | null | undefined>): string {
  return parts.map(displayPart).filter(Boolean).join(" · ");
}

function TimelineDot({ current }: { current: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative mt-1.5 size-[11px] shrink-0 rounded-full border-2",
        current ? "border-primary bg-primary" : "border-primary bg-card"
      )}
    />
  );
}

function ExperienceCompanyMark({
  website,
  fjLogoUrl,
  company,
  current,
}: {
  website?: string;
  fjLogoUrl?: string;
  company: string;
  current: boolean;
}) {
  if (displayPart(website)) {
    return (
      <CompanyDomainLogo
        websiteOrDomain={website}
        name={company}
        size={28}
        className="relative mt-0.5"
      />
    );
  }
  if (fjLogoUrl) {
    return (
      <FjStaticImage
        src={fjLogoUrl}
        className="relative mt-0.5 size-7 shrink-0 rounded-md border border-border bg-muted object-cover"
        fallback={<TimelineDot current={current} />}
      />
    );
  }
  return <TimelineDot current={current} />;
}
function FjStaticImage({
  src,
  className,
  fallback,
}: {
  src: string;
  className?: string;
  fallback: ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return fallback;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote Future Jobs CDN URLs
    <img
      src={src}
      alt=""
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
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
  listName = null,
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
  listName?: string | null;
  onToggleSave: () => void;
  onAddToOutreach: () => void;
  detailsLoading?: boolean;
  detailsError?: string | null;
}) {
  const revealQuota = useRevealQuota();

  if (!candidate) return null;

  const experience = [...candidate.experience].sort((a, b) => {
    const byCurrent = Number(b.current) - Number(a.current);
    if (byCurrent) return byCurrent;
    const ka = experienceSortKey(a.duration);
    const kb = experienceSortKey(b.duration);
    return kb.end - ka.end || kb.start - ka.start;
  });
  const headline = displayPart(candidate.headline);
  const roleCompany = metaLine([candidate.currentRole, candidate.currentCompany]);
  const showRoleCompany = Boolean(roleCompany) && roleCompany !== headline;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 bg-card p-0 max-sm:max-w-full data-[side=right]:sm:max-w-lg"
      >
        <SheetHeader className="border-b border-border pb-3">
          <div className="flex items-start gap-3 pr-8">
            <CandidateAvatar name={candidate.name} src={candidate.avatarUrl} className="size-11" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <SheetTitle className="truncate">{candidate.name}</SheetTitle>
                <MatchScoreCompact score={candidate.matchScore} fit={candidate.fit} className="shrink-0" />
              </div>
              {headline ? (
                <SheetDescription className="mt-0.5 text-left text-sm leading-snug whitespace-normal">
                  {candidate.headline}
                </SheetDescription>
              ) : (
                <SheetDescription className="sr-only">Candidate profile</SheetDescription>
              )}
              {showRoleCompany ? (
                <p className="mt-1 text-sm text-foreground">{roleCompany}</p>
              ) : null}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                {displayPart(candidate.location) ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin aria-hidden className="size-3" />
                    {candidate.location}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1">
                  <Timer aria-hidden className="size-3" />
                  {candidate.experienceYears != null
                    ? `${candidate.experienceYears} yrs total`
                    : "Experience unknown"}
                </span>
                {candidate.linkedinUrl ? (
                  <a
                    href={candidate.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <ExternalLink aria-hidden className="size-3" />
                    LinkedIn
                  </a>
                ) : null}
                {isOpenToWork(candidate.signals) ? (
                  <span className="rounded-md bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                    Open to work
                  </span>
                ) : null}
                <StatusBadge status={candidate.status} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <Tabs defaultValue="summary" className="p-4">
            <TabsList className="flex h-9 w-full">
              <TabsTrigger value="summary" className="min-w-0 flex-1 px-1.5">
                Summary
              </TabsTrigger>
              <TabsTrigger value="education" className="min-w-0 flex-1 px-1.5">
                Education
              </TabsTrigger>
              <TabsTrigger value="activity" className="min-w-0 flex-1 px-1.5">
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-5 pt-2">
              {detailsLoading ? (
                <p className="text-xs text-muted-foreground">Loading full profile…</p>
              ) : null}
              {detailsError ? (
                <p className="text-xs text-destructive">{detailsError}</p>
              ) : null}
              <div className="space-y-2">
                <SectionTitle>Contact</SectionTitle>
                <div className="w-full rounded-lg border border-border bg-muted/20 p-3">
                  <p className="text-xs font-semibold text-foreground">
                    Reveal contact details
                  </p>
                  <div className="mt-2">
                    <ContactReveal
                      candidate={candidate}
                      revealed={revealed}
                      onReveal={onReveal}
                      layout="row"
                      fill
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {revealQuota.emailRemaining.toLocaleString("en-IN")} email ·{" "}
                    {revealQuota.mobileRemaining.toLocaleString("en-IN")} mobile
                    reveals remaining this cycle.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <SectionTitle>Summary</SectionTitle>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {displayPart(candidate.summary)
                    ? candidate.summary
                    : "No summary available for this profile."}
                </p>
              </div>
              <div className="space-y-2">
                <SectionTitle>Top skills</SectionTitle>
                <SkillChips skills={candidate.skills} />
              </div>
              <div className="space-y-2">
                <SectionTitle>Experience</SectionTitle>
                {detailsLoading && experience.length <= 1 ? (
                  <p className="text-sm text-muted-foreground">Loading experience…</p>
                ) : null}
                {!detailsLoading && experience.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No experience listed.</p>
                ) : null}
                <ol className="space-y-0">
                  {experience.map((entry, index) => {
                    const companyLine = metaLine([
                      entry.company,
                      entry.duration,
                      entry.location,
                    ]);
                    const detailLine = metaLine([
                      entry.seniority,
                      entry.employmentType,
                      entry.companySize,
                      entry.companyHq,
                    ]);
                    return (
                    <li
                      key={`${entry.company}-${entry.role}-${index}`}
                      className="relative flex gap-3 pb-5 last:pb-0"
                    >
                      {index < experience.length - 1 ? (
                        <span
                          aria-hidden
                          className="absolute top-4 left-[5px] h-full w-px bg-border"
                        />
                      ) : null}
                      <ExperienceCompanyMark
                        website={entry.companyWebsite}
                        fjLogoUrl={entry.companyLogoUrl}
                        company={entry.company}
                        current={entry.current}
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
                        {companyLine ? (
                          <p className="text-sm text-muted-foreground">{companyLine}</p>
                        ) : null}
                        {detailLine ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">{detailLine}</p>
                        ) : null}
                        {entry.industries && entry.industries.length > 0 ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {entry.industries.join(" · ")}
                          </p>
                        ) : null}
                        {entry.description ? (
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {entry.description}
                          </p>
                        ) : null}
                      </div>
                    </li>
                    );
                  })}
                </ol>
              </div>
              {candidate.signals.length > 0 ? (
                <div className="space-y-2">
                  <SectionTitle>Profile signals</SectionTitle>
                  <ul className="space-y-1.5">
                    {candidate.signals.map((signal, index) => (
                      <li
                        key={`${signal}-${index}`}
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
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="education" className="space-y-3 pt-2">
              {detailsLoading && candidate.education.length === 0 ? (
                <p className="text-sm text-muted-foreground">Loading education…</p>
              ) : null}
              {!detailsLoading && candidate.education.length === 0 ? (
                <p className="text-sm text-muted-foreground">No education listed.</p>
              ) : null}
              {candidate.education.map((entry, index) => {
                const degreeLine = metaLine([
                  displayPart(entry.degree),
                  displayPart(entry.field),
                ]);
                return (
                <div
                  key={`${entry.school}-${entry.degree}-${index}`}
                  className="flex gap-3 rounded-lg border border-border px-3 py-2.5"
                >
                  {entry.schoolLogoUrl ? (
                    <FjStaticImage
                      src={entry.schoolLogoUrl}
                      className="mt-0.5 size-8 shrink-0 rounded-md border border-border bg-muted object-cover"
                      fallback={null}
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {entry.school}
                    </p>
                    {degreeLine ? (
                      <p className="text-sm text-muted-foreground">{degreeLine}</p>
                    ) : null}
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {metaLine([entry.years, entry.location]) || "—"}
                    </p>
                  </div>
                </div>
                );
              })}
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
            title={listName ?? undefined}
          >
            {saved ? <BookmarkCheck aria-hidden /> : <Bookmark aria-hidden />}
            <span className="max-w-[12rem] truncate">
              {listName ? listName : "Add to list"}
            </span>
          </Button>

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
