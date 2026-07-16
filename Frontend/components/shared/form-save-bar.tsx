"use client";

import { AlertTriangle, Check, Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FormSaveStatus = "idle" | "saving" | "success" | "error";

export function FormSaveBar({
  dirty,
  status,
  errorMessage,
  successMessage = "Changes saved.",
  onSave,
  onReset,
  className,
}: {
  dirty: boolean;
  status: FormSaveStatus;
  errorMessage?: string;
  successMessage?: string;
  onSave: () => void;
  onReset: () => void;
  className?: string;
}) {
  const showBar = dirty || status === "success" || status === "error";

  if (!showBar) return null;

  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-1 mt-6 border-t border-border bg-background/95 px-1 py-3 backdrop-blur supports-backdrop-filter:bg-background/80",
        className
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 text-sm">
          {status === "error" ? (
            <p className="flex items-start gap-1.5 text-destructive">
              <AlertTriangle aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              <span>{errorMessage ?? "Could not save changes. Try again."}</span>
            </p>
          ) : status === "success" && !dirty ? (
            <p className="flex items-center gap-1.5 text-success">
              <Check aria-hidden className="size-3.5 shrink-0" />
              {successMessage}
            </p>
          ) : dirty ? (
            <p className="text-muted-foreground">
              You have unsaved changes.
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!dirty || status === "saving"}
            onClick={onReset}
          >
            <RotateCcw aria-hidden />
            Reset
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!dirty || status === "saving"}
            onClick={onSave}
          >
            {status === "saving" ? (
              <>
                <Loader2 aria-hidden className="animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
