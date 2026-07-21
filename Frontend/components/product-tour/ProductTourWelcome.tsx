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

export function ProductTourWelcome() {
  const { phase, requestSkip, goNext, totalSteps } = useDashboardProductTour();
  const open = phase === "welcome";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) requestSkip();
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        showCloseButton
        aria-describedby="product-tour-welcome-desc"
      >
        <DialogHeader>
          <DialogTitle>Welcome to Huntlo</DialogTitle>
          <DialogDescription id="product-tour-welcome-desc">
            Huntlo helps you source candidates, run personalised outreach,
            screen applicants and schedule interviews from one workspace.
          </DialogDescription>
        </DialogHeader>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Step 1 of {totalSteps}
        </p>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={requestSkip}>
            Skip for now
          </Button>
          <Button onClick={goNext}>Start tour</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
