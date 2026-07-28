"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { HIRING_OS_GEO } from "@/lib/hiringOs";

import {
  HiringOsEnterprise,
  HiringOsFaq,
  HiringOsFinalCta,
  HiringOsFuture,
} from "./HiringOsClosing";
import { HiringOsHero } from "./HiringOsHero";
import { HiringOsStory } from "./HiringOsStory";
import { HiringOsSystems } from "./HiringOsSystems";

export function HiringOsPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <HiringOsHero reduceMotion={reduceMotion} />
        <HiringOsStory reduceMotion={reduceMotion} />
        <HiringOsSystems reduceMotion={reduceMotion} />
        <HiringOsEnterprise />
        <HiringOsFuture />
        <HiringOsFaq />
        <HiringOsFinalCta />
      </main>
      <LandingFooter aiAskPrompt={HIRING_OS_GEO.askPrompt} aiAskTopic={HIRING_OS_GEO.askTopic} />
    </div>
  );
}
