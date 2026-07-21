"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDashboardProductTour } from "@/hooks/use-dashboard-product-tour";

export function ProductTourResumeDialog() {
  const {
    phase,
    resumeFromStep,
    continueTour,
    restartFromBeginning,
    requestSkip,
  } = useDashboardProductTour();
  const open = phase === "resume";
  const stepNumber = Math.max(1, resumeFromStep + 1);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) requestSkip();
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Continue your Huntlo tour?</DialogTitle>
          <DialogDescription>
            You stopped at step {stepNumber}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={requestSkip}>
            Skip Tour
          </Button>
          <Button variant="outline" onClick={restartFromBeginning}>
            Start Again
          </Button>
          <Button onClick={continueTour}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
