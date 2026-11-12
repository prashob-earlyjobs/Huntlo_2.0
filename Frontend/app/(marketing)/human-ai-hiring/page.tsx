import type { Metadata } from "next";

import { PlatformCategoryJsonLd } from "@/components/landing/platform-category/PlatformCategoryJsonLd";
import { PlatformCategoryPage } from "@/components/landing/platform-category/PlatformCategoryPage";
import { HUMAN_AI_HIRING, platformCategoryMetadata } from "@/lib/platformCategoryPages";

export const metadata: Metadata = platformCategoryMetadata(HUMAN_AI_HIRING);

export default function HumanAiHiringRoutePage() {
  return (
    <>
      <PlatformCategoryJsonLd page={HUMAN_AI_HIRING} />
      <PlatformCategoryPage page={HUMAN_AI_HIRING} />
    </>
  );
}
