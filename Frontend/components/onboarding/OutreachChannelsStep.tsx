"use client";

import { OptionCardList } from "@/components/onboarding/OptionCardList";
import { OUTREACH_CHANNEL_OPTIONS, type OutreachChannel } from "@/lib/onboarding";

export function OutreachChannelsStep({
  value,
  onChange,
}: {
  value: OutreachChannel[];
  onChange: (value: OutreachChannel[]) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Outreach channels</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Which channels do you use today? Preferences only — nothing is connected yet.
        </p>
      </div>
      <OptionCardList
        options={OUTREACH_CHANNEL_OPTIONS}
        value={value}
        multiple
        onChange={(next) => onChange(next as OutreachChannel[])}
      />
    </div>
  );
}
