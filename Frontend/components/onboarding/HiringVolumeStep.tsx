"use client";

import { OptionCardList } from "@/components/onboarding/OptionCardList";
import { HIRING_VOLUME_OPTIONS, type HiringVolume } from "@/lib/onboarding";

export function HiringVolumeStep({
  value,
  onChange,
}: {
  value: HiringVolume | null;
  onChange: (value: HiringVolume) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hiring volume</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Roughly how many hires do you make in a typical year? This is a preference only and
          does not change your plan or quotas.
        </p>
      </div>
      <OptionCardList
        options={HIRING_VOLUME_OPTIONS}
        value={value}
        onChange={(next) => onChange(next as HiringVolume)}
      />
    </div>
  );
}
