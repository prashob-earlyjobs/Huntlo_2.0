import type { Metadata } from "next";

import { PlatformCategoryJsonLd } from "@/components/landing/platform-category/PlatformCategoryJsonLd";
import { PlatformCategoryPage } from "@/components/landing/platform-category/PlatformCategoryPage";
import {
  FUTURE_OF_HIRING_INFRASTRUCTURE,
  platformCategoryMetadata,
} from "@/lib/platformCategoryPages";

export const metadata: Metadata = platformCategoryMetadata(FUTURE_OF_HIRING_INFRASTRUCTURE);

export default function FutureOfHiringInfrastructureRoutePage() {
  return (
    <>
      <PlatformCategoryJsonLd page={FUTURE_OF_HIRING_INFRASTRUCTURE} />
      <PlatformCategoryPage page={FUTURE_OF_HIRING_INFRASTRUCTURE} />
    </>
  );
}
