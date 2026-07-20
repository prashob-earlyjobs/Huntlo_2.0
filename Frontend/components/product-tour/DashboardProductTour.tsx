"use client";

import { ProductTourWelcome } from "@/components/product-tour/ProductTourWelcome";
import { ProductTourCompletion } from "@/components/product-tour/ProductTourCompletion";
import { ProductTourSkipDialog } from "@/components/product-tour/ProductTourSkipDialog";
import { ProductTourResumeDialog } from "@/components/product-tour/ProductTourResumeDialog";
import { ProductTourAnnouncer } from "@/components/product-tour/ProductTourAnnouncer";

/** Tour dialogs — mount inside DashboardProductTourProvider. */
export function ProductTourDialogs() {
  return (
    <>
      <ProductTourWelcome />
      <ProductTourResumeDialog />
      <ProductTourSkipDialog />
      <ProductTourCompletion />
      <ProductTourAnnouncer />
      <div
        className="sr-only"
        aria-live="polite"
        id="product-tour-live-region"
      />
    </>
  );
}
