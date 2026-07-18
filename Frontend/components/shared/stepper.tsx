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
  onStepSelect,
  errorSteps,
  maxEnabledStep,
  className,
}: {
  steps: StepperStep[];
  /** Zero-based index of the active step. */
  currentStep: number;
  /** When provided, steps become clickable buttons. */
  onStepSelect?: (index: number) => void;
  /** Zero-based indices of steps with validation errors. */
  errorSteps?: ReadonlySet<number>;
  /**
   * Highest step index the user may select (inclusive).
   * Steps beyond this are shown locked / disabled.
   */
  maxEnabledStep?: number;
  className?: string;
}) {
  const highestEnabled =
    maxEnabledStep === undefined ? steps.length - 1 : maxEnabledStep;

  return (
    <ol className={cn("flex flex-col gap-2 sm:flex-row sm:gap-0", className)}>
      {steps.map((step, index) => {
        const state =
          index < currentStep ? "done" : index === currentStep ? "active" : "todo";
        const hasError = errorSteps?.has(index) ?? false;
        const locked = index > highestEnabled;

        const content = (
          <>
            <div className="flex items-center gap-2 sm:w-full">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums",
                  locked
                    ? "border-border bg-muted/40 text-muted-foreground/50"
                    : hasError
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : state === "done"
                        ? "border-primary bg-primary text-primary-foreground"
                        : state === "active"
                          ? "border-primary bg-muted text-foreground"
                          : "border-border bg-card text-muted-foreground"
                )}
              >
                {state === "done" && !hasError && !locked ? (
                  <Check aria-hidden className="size-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "hidden h-px flex-1 sm:block",
                    index < currentStep && !locked ? "bg-primary" : "bg-border"
                  )}
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  "truncate text-sm font-medium",
                  locked
                    ? "text-muted-foreground/50"
                    : hasError
                      ? "text-destructive"
                      : state === "todo"
                        ? "text-muted-foreground"
                        : "text-foreground"
                )}
              >
                {step.title}
              </p>
              {step.description ? (
                <p className="truncate text-xs text-muted-foreground">
                  {step.description}
                </p>
              ) : null}
            </div>
          </>
        );

        return (
          <li
            key={step.id}
            aria-current={state === "active" ? "step" : undefined}
            className="flex min-w-0 flex-1"
          >
            {onStepSelect ? (
              <button
                type="button"
                disabled={locked}
                onClick={() => {
                  if (!locked) onStepSelect(index);
                }}
                aria-label={
                  locked
                    ? `Step ${index + 1}: ${step.title} (complete previous steps first)`
                    : `Go to step ${index + 1}: ${step.title}`
                }
                className={cn(
                  "flex flex-1 items-start gap-3 rounded-lg p-1.5 text-left outline-none transition-colors sm:flex-col sm:gap-2",
                  locked
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50",
                  !locked &&
                    index === currentStep &&
                    "bg-brand-subtle hover:bg-brand-subtle"
                )}
              >
                {content}
              </button>
            ) : (
              <div className="flex flex-1 items-start gap-3 sm:flex-col sm:gap-2">
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
