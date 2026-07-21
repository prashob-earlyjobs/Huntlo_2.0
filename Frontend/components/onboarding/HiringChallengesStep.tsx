"use client";

import { OptionCardList } from "@/components/onboarding/OptionCardList";
import { HIRING_CHALLENGE_OPTIONS, type HiringChallenge } from "@/lib/onboarding";

export function HiringChallengesStep({
  value,
  onChange,
}: {
  value: HiringChallenge[];
  onChange: (value: HiringChallenge[]) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hiring challenges</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select at least one challenge your team faces most often.
        </p>
      </div>
      <OptionCardList
        options={HIRING_CHALLENGE_OPTIONS}
        value={value}
        multiple
        onChange={(next) => onChange(next as HiringChallenge[])}
      />
    </div>
  );
}
