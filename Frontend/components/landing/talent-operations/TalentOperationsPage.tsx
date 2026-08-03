"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { TALENT_OPERATIONS_GEO } from "@/lib/talentOperations";

import {
  TalentOperationsEnterprise,
  TalentOperationsFaq,
  TalentOperationsFinalCta,
  TalentOperationsFuture,
} from "./TalentOperationsClosing";
import { TalentOperationsHero } from "./TalentOperationsHero";
import { TalentOperationsStory } from "./TalentOperationsStory";
import { TalentOperationsSystems } from "./TalentOperationsSystems";

export function TalentOperationsPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <TalentOperationsHero reduceMotion={reduceMotion} />
        <TalentOperationsStory reduceMotion={reduceMotion} />
        <TalentOperationsSystems reduceMotion={reduceMotion} />
        <TalentOperationsEnterprise />
        <TalentOperationsFuture />
        <TalentOperationsFaq />
        <TalentOperationsFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={TALENT_OPERATIONS_GEO.askPrompt}
        aiAskTopic={TALENT_OPERATIONS_GEO.askTopic}
      />
    </div>
  );
}
