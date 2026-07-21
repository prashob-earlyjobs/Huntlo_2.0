"use client";

import Link from "next/link";

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
import { ROUTES } from "@/lib/routes";

export function ProductTourCompletion() {
  const { phase, closeCompletion } = useDashboardProductTour();
  const open = phase === "completed";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeCompletion();
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>You&apos;re ready to start hiring with Huntlo</DialogTitle>
          <DialogDescription>
            Search candidates, save them to your pool, and run outreach from the
            dashboard whenever you need.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" onClick={closeCompletion}>
            Close
          </Button>
          <Button render={<Link href={ROUTES.search} />} onClick={closeCompletion}>
            Search Candidates
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
