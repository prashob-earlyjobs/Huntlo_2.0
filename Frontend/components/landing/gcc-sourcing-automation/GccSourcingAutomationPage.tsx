"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { GCC_SOURCING_AUTOMATION_GEO } from "@/lib/gccSourcingAutomation";

import {
  GccSourcingAutomationEnterprise,
  GccSourcingAutomationFaq,
  GccSourcingAutomationFinalCta,
  GccSourcingAutomationIndustries,
} from "./GccSourcingAutomationClosing";
import { GccSourcingAutomationHero } from "./GccSourcingAutomationHero";
import { GccSourcingAutomationStory } from "./GccSourcingAutomationStory";
import { GccSourcingAutomationSystems } from "./GccSourcingAutomationSystems";

export function GccSourcingAutomationPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <GccSourcingAutomationHero reduceMotion={reduceMotion} />
        <GccSourcingAutomationStory reduceMotion={reduceMotion} />
        <GccSourcingAutomationSystems reduceMotion={reduceMotion} />
        <GccSourcingAutomationEnterprise />
        <GccSourcingAutomationIndustries />
        <GccSourcingAutomationFaq />
        <GccSourcingAutomationFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={GCC_SOURCING_AUTOMATION_GEO.askPrompt}
        aiAskTopic={GCC_SOURCING_AUTOMATION_GEO.askTopic}
      />
    </div>
  );
}
