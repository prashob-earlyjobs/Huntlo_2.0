"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { VIBE_SOURCING_GEO } from "@/lib/vibeSourcing";

import {
  VibeSourcingEnterprise,
  VibeSourcingFaq,
  VibeSourcingFinalCta,
  VibeSourcingFuture,
} from "./VibeSourcingClosing";
import { VibeSourcingHero } from "./VibeSourcingHero";
import { VibeSourcingStory } from "./VibeSourcingStory";
import { VibeSourcingSystems } from "./VibeSourcingSystems";

export function VibeSourcingPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <VibeSourcingHero reduceMotion={reduceMotion} />
        <VibeSourcingStory reduceMotion={reduceMotion} />
        <VibeSourcingSystems reduceMotion={reduceMotion} />
        <VibeSourcingEnterprise />
        <VibeSourcingFuture />
        <VibeSourcingFaq />
        <VibeSourcingFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={VIBE_SOURCING_GEO.askPrompt}
        aiAskTopic={VIBE_SOURCING_GEO.askTopic}
      />
    </div>
  );
}
