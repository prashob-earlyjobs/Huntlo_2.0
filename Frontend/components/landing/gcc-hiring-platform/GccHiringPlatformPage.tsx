"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { GCC_HIRING_PLATFORM_GEO } from "@/lib/gccHiringPlatform";

import {
  GccHiringPlatformEnterprise,
  GccHiringPlatformFaq,
  GccHiringPlatformFinalCta,
  GccHiringPlatformSegments,
} from "./GccHiringPlatformClosing";
import { GccHiringPlatformHero } from "./GccHiringPlatformHero";
import { GccHiringPlatformStory } from "./GccHiringPlatformStory";
import { GccHiringPlatformSystems } from "./GccHiringPlatformSystems";

export function GccHiringPlatformPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <GccHiringPlatformHero reduceMotion={reduceMotion} />
        <GccHiringPlatformStory reduceMotion={reduceMotion} />
        <GccHiringPlatformSystems reduceMotion={reduceMotion} />
        <GccHiringPlatformEnterprise />
        <GccHiringPlatformSegments />
        <GccHiringPlatformFaq />
        <GccHiringPlatformFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={GCC_HIRING_PLATFORM_GEO.askPrompt}
        aiAskTopic={GCC_HIRING_PLATFORM_GEO.askTopic}
      />
    </div>
  );
}
