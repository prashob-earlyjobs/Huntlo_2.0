import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface StepperStep {
  id: string;
  title: string;
  description?: string;
}

export function Stepper({
  steps,
  currentStep,
  className,
}: {
  steps: StepperStep[];
  /** Zero-based index of the active step. */
  currentStep: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex flex-col gap-4 sm:flex-row sm:gap-0", className)}>
      {steps.map((step, index) => {
        const state =
          index < currentStep ? "done" : index === currentStep ? "active" : "todo";
        return (
          <li
            key={step.id}
            aria-current={state === "active" ? "step" : undefined}
            className="flex flex-1 items-start gap-3 sm:flex-col sm:gap-2"
          >
            <div className="flex items-center gap-2 sm:w-full">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums",
                  state === "done" && "border-primary bg-primary text-primary-foreground",
                  state === "active" && "border-primary bg-muted text-foreground",
                  state === "todo" && "border-border bg-card text-muted-foreground"
                )}
              >
                {state === "done" ? <Check aria-hidden className="size-3.5" /> : index + 1}
              </span>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "hidden h-px flex-1 sm:block",
                    index < currentStep ? "bg-primary" : "bg-border"
                  )}
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-sm font-medium",
                  state === "todo" ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {step.title}
              </p>
              {step.description ? (
                <p className="text-xs text-muted-foreground">{step.description}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
