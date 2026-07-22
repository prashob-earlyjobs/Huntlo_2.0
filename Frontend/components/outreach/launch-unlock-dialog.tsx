"use client";

import { CheckCircle2, Loader2, LockKeyhole, Mail, Phone, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { REVEAL_COSTS } from "@/hooks/use-reveal-quota";
import { cn } from "@/lib/utils";

export type LaunchUnlockEstimate = {
  emailUnlocks: number;
  phoneUnlocks: number;
  emailCredits: number;
  phoneCredits: number;
  totalCredits: number;
};

export type LaunchUnlockResult = {
  emailNeeded?: number;
  phoneNeeded?: number;
  emailUnlocked?: number;
  phoneUnlocked?: number;
  emailCreditsCharged?: number;
  phoneCreditsCharged?: number;
  skipped?: number;
  failed?: number;
};

export type LaunchUnlockPhase =
  | "confirm"
  | "running"
  | "success"
  | "error";

export function LaunchUnlockDialog({
  open,
  onOpenChange,
  phase,
  estimate,
  result = null,
  error = null,
  revealRemaining = null,
  onConfirm,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phase: LaunchUnlockPhase;
  estimate: LaunchUnlockEstimate;
  result?: LaunchUnlockResult | null;
  error?: string | null;
  revealRemaining?: { emailRemaining: number; mobileRemaining: number } | null;
  onConfirm: () => void;
  onDone: () => void;
}) {
  const busy = phase === "running";
  const canClose = phase === "confirm" || phase === "success" || phase === "error";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && busy) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={canClose && !busy}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LockKeyhole aria-hidden className="size-4 text-primary" />
            {phase === "confirm"
              ? "Unlock contacts to launch"
              : phase === "running"
                ? "Unlocking contacts…"
                : phase === "success"
                  ? "Contacts unlocked"
                  : "Launch failed"}
          </DialogTitle>
          <DialogDescription>
            {phase === "confirm"
              ? "Selected channels need contact details. We’ll unlock them now and charge reveal credits, then launch the campaign."
              : phase === "running"
                ? "Please wait while we unlock missing emails/phones and start the campaign."
                : phase === "success"
                  ? "Unlock finished and the campaign is launching."
                  : "Something went wrong while unlocking or launching."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail aria-hidden className="size-3.5" />
                Email unlocks
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {phase === "success" && result
                  ? `${result.emailUnlocked ?? 0}`
                  : estimate.emailUnlocks}
              </p>
              <p className="text-xs text-muted-foreground">
                {estimate.emailUnlocks > 0
                  ? `~${estimate.emailCredits} credits (${REVEAL_COSTS.email} each)`
                  : "Not needed for selected channels"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone aria-hidden className="size-3.5" />
                Mobile unlocks
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {phase === "success" && result
                  ? `${result.phoneUnlocked ?? 0}`
                  : estimate.phoneUnlocks}
              </p>
              <p className="text-xs text-muted-foreground">
                {estimate.phoneUnlocks > 0
                  ? `~${estimate.phoneCredits} credits (${REVEAL_COSTS.mobile} each)`
                  : "Not needed for selected channels"}
              </p>
            </div>
          </div>

          {revealRemaining ? (
            <p className="text-xs text-muted-foreground">
              Available: {revealRemaining.emailRemaining.toLocaleString("en-IN")}{" "}
              email · {revealRemaining.mobileRemaining.toLocaleString("en-IN")}{" "}
              mobile reveal credits
            </p>
          ) : null}

          {phase === "running" ? (
            <p className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground">
              <Loader2 aria-hidden className="size-4 animate-spin text-primary" />
              Unlocking contacts and launching campaign…
            </p>
          ) : null}

          {phase === "success" && result ? (
            <p
              className={cn(
                "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm",
                (result.failed ?? 0) > 0
                  ? "border-warning/30 bg-warning/5 text-warning"
                  : "border-success/30 bg-success/10 text-success"
              )}
            >
              <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>
                Unlocked {result.emailUnlocked ?? 0} email
                {(result.emailUnlocked ?? 0) === 1 ? "" : "s"} and{" "}
                {result.phoneUnlocked ?? 0} mobile
                {(result.phoneUnlocked ?? 0) === 1 ? "" : "s"}
                {(result.emailCreditsCharged ?? 0) +
                  (result.phoneCreditsCharged ?? 0) >
                0
                  ? ` · charged ${(result.emailCreditsCharged ?? 0) + (result.phoneCreditsCharged ?? 0)} reveal credits`
                  : ""}
                {(result.failed ?? 0) > 0
                  ? ` · ${result.failed} unlock${result.failed === 1 ? "" : "s"} failed`
                  : ""}
                .
              </span>
            </p>
          ) : null}

          {phase === "error" && error ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
            >
              <XCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          {phase === "confirm" ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={onConfirm}>
                Unlock & Launch
              </Button>
            </>
          ) : null}
          {phase === "running" ? (
            <Button type="button" size="sm" disabled>
              <Loader2 aria-hidden className="animate-spin" />
              Working…
            </Button>
          ) : null}
          {phase === "success" || phase === "error" ? (
            <Button type="button" size="sm" onClick={onDone}>
              {phase === "success" ? "Continue" : "Close"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
