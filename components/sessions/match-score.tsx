"use client";

import { MatchScoreBadge } from "@/components/shared/match-score-badge";
import { ScoreBreakdown } from "@/components/shared/score-breakdown";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MATCH_CATEGORY_LABELS,
  type MatchBreakdown,
} from "@/lib/mock-sessions";

export function breakdownItems(breakdown: MatchBreakdown) {
  return (Object.keys(MATCH_CATEGORY_LABELS) as (keyof MatchBreakdown)[]).map(
    (key) => ({
      label: MATCH_CATEGORY_LABELS[key],
      score: breakdown[key],
    })
  );
}

/** Match score badge that reveals a category breakdown on click/focus. */
export function MatchScoreDetail({
  score,
  breakdown,
  name,
}: {
  score: number;
  breakdown: MatchBreakdown;
  name: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Match score ${score} for ${name} — view breakdown`}
        className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <MatchScoreBadge score={score} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <p className="text-xs font-semibold text-foreground">
          Match breakdown
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          How {name.split(" ")[0]} scores against this search
        </p>
        <ScoreBreakdown items={breakdownItems(breakdown)} className="mt-3" />
      </PopoverContent>
    </Popover>
  );
}
