"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { TALENT_DISCOVERY_GEO } from "@/lib/talentDiscovery";

import {
  TalentDiscoveryEnterprise,
  TalentDiscoveryFaq,
  TalentDiscoveryFinalCta,
  TalentDiscoveryFuture,
} from "./TalentDiscoveryClosing";
import { TalentDiscoveryHero } from "./TalentDiscoveryHero";
import { TalentDiscoveryStory } from "./TalentDiscoveryStory";
import { TalentDiscoverySystems } from "./TalentDiscoverySystems";

export function TalentDiscoveryPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <TalentDiscoveryHero reduceMotion={reduceMotion} />
        <TalentDiscoveryStory reduceMotion={reduceMotion} />
        <TalentDiscoverySystems reduceMotion={reduceMotion} />
        <TalentDiscoveryEnterprise />
        <TalentDiscoveryFuture />
        <TalentDiscoveryFaq />
        <TalentDiscoveryFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={TALENT_DISCOVERY_GEO.askPrompt}
        aiAskTopic={TALENT_DISCOVERY_GEO.askTopic}
      />
    </div>
  );
}
