"use client";

import {
  Bookmark,
  BookmarkCheck,
  Building2,
  Eye,
  GraduationCap,
  Link2,
  MapPin,
  Send,
  Timer,
} from "lucide-react";

import { ContactReveal, type RevealState } from "@/components/sessions/contact-reveal";
import { MatchScoreDetail } from "@/components/sessions/match-score";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { Button } from "@/components/ui/button";
import type { SessionCandidate } from "@/lib/mock-sessions";
import { cn } from "@/lib/utils";

export function CandidateCard({
  candidate,
  selected,
  onToggleSelect,
  saved,
  onToggleSave,
  revealed,
  onReveal,
  onOpenProfile,
  onAddToOutreach,
}: {
  candidate: SessionCandidate;
  selected: boolean;
  onToggleSelect: () => void;
  saved: boolean;
  onToggleSave: () => void;
  revealed: RevealState;
  onReveal: (kind: "email" | "phone") => void;
  onOpenProfile: () => void;
  onAddToOutreach: () => void;
}) {
  const education = candidate.education[0];

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border bg-card p-4 transition-colors",
        selected ? "border-primary/50 bg-brand-subtle/30" : "border-border hover:border-input"
      )}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          aria-label={`Select ${candidate.name}`}
          className="mt-1 size-3.5 shrink-0 accent-primary"
        />
        <CandidateAvatar name={candidate.name} className="size-10" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenProfile}
                className="truncate text-sm font-semibold text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {candidate.name}
              </button>
              {candidate.linkedin ? (
                <Link2 aria-hidden className="size-3 shrink-0 text-info" />
              ) : null}
            </div>
            <MatchScoreDetail
              score={candidate.matchScore}
              breakdown={candidate.matchBreakdown}
              name={candidate.name}
            />
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {candidate.currentRole} · {candidate.currentCompany}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden className="size-3" />
              {candidate.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Timer aria-hidden className="size-3" />
              {candidate.experienceYears} yrs
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {candidate.skills.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="rounded-md bg-brand-subtle px-1.5 py-0.5 text-xs font-medium text-primary"
          >
            {skill}
          </span>
        ))}
        {candidate.skills.length > 4 ? (
          <span className="text-xs tabular-nums text-muted-foreground">
            +{candidate.skills.length - 4}
          </span>
        ) : null}
      </div>

      <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Building2 aria-hidden className="size-3 shrink-0" />
          <dt className="sr-only">Previous company</dt>
          <dd className="truncate">Previously {candidate.previousCompany}</dd>
        </div>
        {education ? (
          <div className="flex items-center gap-1.5">
            <GraduationCap aria-hidden className="size-3 shrink-0" />
            <dt className="sr-only">Education</dt>
            <dd className="truncate">
              {education.degree}, {education.school}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-3">
        <ContactReveal
          candidate={candidate}
          revealed={revealed}
          onReveal={onReveal}
        />
      </div>

      <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3">
        <Button
          type="button"
          size="xs"
          variant={saved ? "secondary" : "outline"}
          onClick={onToggleSave}
          aria-pressed={saved}
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
        <Button type="button" size="xs" variant="outline" onClick={onOpenProfile}>
          <Eye aria-hidden />
          View profile
        </Button>
        <Button type="button" size="xs" className="ml-auto" onClick={onAddToOutreach}>
          <Send aria-hidden />
          Outreach
        </Button>
      </div>
    </article>
  );
}
