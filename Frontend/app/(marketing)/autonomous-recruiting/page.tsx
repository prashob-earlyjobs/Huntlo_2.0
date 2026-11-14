import type { Metadata } from "next";

import { PlatformCategoryJsonLd } from "@/components/landing/platform-category/PlatformCategoryJsonLd";
import { PlatformCategoryPage } from "@/components/landing/platform-category/PlatformCategoryPage";
import { AUTONOMOUS_RECRUITING, platformCategoryMetadata } from "@/lib/platformCategoryPages";

export const metadata: Metadata = platformCategoryMetadata(AUTONOMOUS_RECRUITING);

export default function AutonomousRecruitingRoutePage() {
  return (
    <>
      <PlatformCategoryJsonLd page={AUTONOMOUS_RECRUITING} />
      <PlatformCategoryPage page={AUTONOMOUS_RECRUITING} />
    </>
  );
}
