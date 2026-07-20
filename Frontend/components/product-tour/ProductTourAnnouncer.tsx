"use client";

import { useEffect } from "react";

import { useDashboardProductTour } from "@/hooks/use-dashboard-product-tour";

/** Announces the active tour step to assistive technology. */
export function ProductTourAnnouncer() {
  const { phase, activeStepIndex, totalSteps, activeStep, showingUsageSubstep } =
    useDashboardProductTour();

  useEffect(() => {
    const region = document.getElementById("product-tour-live-region");
    if (!region) return;
    if (phase === "idle") {
      region.textContent = "";
      return;
    }
    if (phase === "welcome") {
      region.textContent = `Huntlo product tour. Step 1 of ${totalSteps}. Welcome.`;
      return;
    }
    if (phase === "resume") {
      region.textContent = "Continue your Huntlo tour?";
      return;
    }
    if (phase === "skip_confirm") {
      region.textContent = "Skip the Huntlo tour?";
      return;
    }
    if (phase === "completed") {
      region.textContent = "You're ready to start hiring with Huntlo.";
      return;
    }
    if (phase === "driving" && activeStep) {
      const label = showingUsageSubstep
        ? "Plan usage"
        : activeStep.title;
      region.textContent = `Huntlo product tour. Step ${activeStepIndex + 1} of ${totalSteps}. ${label}.`;
    }
  }, [
    activeStep,
    activeStepIndex,
    phase,
    showingUsageSubstep,
    totalSteps,
  ]);

  return null;
}
