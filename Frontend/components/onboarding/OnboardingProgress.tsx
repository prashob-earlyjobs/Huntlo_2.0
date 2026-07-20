"use client";

import { cn } from "@/lib/utils";
import { ONBOARDING_STEPS } from "@/lib/onboarding";

export function OnboardingProgress({ step }: { step: number }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Step {step + 1} of {ONBOARDING_STEPS.length}
      </p>
      <div className="flex gap-1.5">
        {ONBOARDING_STEPS.map((item) => (
          <div
            key={item.key}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              item.id <= step ? "bg-foreground" : "bg-muted"
            )}
            title={item.label}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{ONBOARDING_STEPS[step]?.label}</p>
    </div>
  );
}
