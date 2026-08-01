"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { HIRING_WORKFLOWS_GEO } from "@/lib/hiringWorkflows";

import {
  HiringWorkflowsEnterprise,
  HiringWorkflowsFaq,
  HiringWorkflowsFinalCta,
  HiringWorkflowsFuture,
} from "./HiringWorkflowsClosing";
import { HiringWorkflowsHero } from "./HiringWorkflowsHero";
import { HiringWorkflowsStory } from "./HiringWorkflowsStory";
import { HiringWorkflowsSystems } from "./HiringWorkflowsSystems";

export function HiringWorkflowsPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <HiringWorkflowsHero reduceMotion={reduceMotion} />
        <HiringWorkflowsStory reduceMotion={reduceMotion} />
        <HiringWorkflowsSystems reduceMotion={reduceMotion} />
        <HiringWorkflowsEnterprise />
        <HiringWorkflowsFuture />
        <HiringWorkflowsFaq />
        <HiringWorkflowsFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={HIRING_WORKFLOWS_GEO.askPrompt}
        aiAskTopic={HIRING_WORKFLOWS_GEO.askTopic}
      />
    </div>
  );
}
