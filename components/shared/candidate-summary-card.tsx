import { MapPin } from "lucide-react";

import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { MatchScoreBadge } from "@/components/shared/match-score-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { Candidate } from "@/lib/types";

export function CandidateSummaryCard({
  candidate,
  className,
}: {
  candidate: Candidate;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-card p-4 transition-colors hover:border-input",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <CandidateAvatar name={candidate.name} className="size-9" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">
              {candidate.name}
            </h3>
            <MatchScoreBadge score={candidate.matchScore} />
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {candidate.title} · {candidate.company}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin aria-hidden className="size-3" />
            {candidate.location}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <StatusBadge status={candidate.status} />
        {candidate.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
          >
            {skill}
          </span>
        ))}
      </div>
    </article>
  );
}
