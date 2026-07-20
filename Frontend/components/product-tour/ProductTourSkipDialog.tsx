"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDashboardProductTour } from "@/hooks/use-dashboard-product-tour";

export function ProductTourSkipDialog() {
  const { phase, cancelSkip, confirmSkip } = useDashboardProductTour();

  return (
    <AlertDialog
      open={phase === "skip_confirm"}
      onOpenChange={(open) => {
        if (!open) cancelSkip();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Skip the Huntlo tour?</AlertDialogTitle>
          <AlertDialogDescription>
            You can restart it later from the Help menu.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancelSkip}>Continue Tour</AlertDialogCancel>
          <AlertDialogAction onClick={() => void confirmSkip()}>
            Skip Tour
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
