"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { HIRING_OS_GEO } from "@/lib/hiringOs";

import { HiringOsAgents } from "./HiringOsAgents";
import { HiringOsFaq } from "./HiringOsFaq";
import { HiringOsFinalCta } from "./HiringOsFinalCta";
import { HiringOsFragmentation } from "./HiringOsFragmentation";
import { HiringOsFuture } from "./HiringOsFuture";
import { HiringOsHero } from "./HiringOsHero";
import { HiringOsOperations } from "./HiringOsOperations";
import { HiringOsRise } from "./HiringOsRise";
import { HiringOsWorkflow } from "./HiringOsWorkflow";

export function HiringOsPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <HiringOsHero reduceMotion={reduceMotion} />
        <HiringOsFragmentation />
        <HiringOsRise reduceMotion={reduceMotion} />
        <HiringOsWorkflow reduceMotion={reduceMotion} />
        <HiringOsAgents reduceMotion={reduceMotion} />
        <HiringOsOperations />
        <HiringOsFuture />
        <HiringOsFaq />
        <HiringOsFinalCta />
      </main>
      <LandingFooter aiAskPrompt={HIRING_OS_GEO.askPrompt} aiAskTopic={HIRING_OS_GEO.askTopic} />
    </div>
  );
}
