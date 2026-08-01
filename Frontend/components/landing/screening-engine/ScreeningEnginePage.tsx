"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { SCREENING_ENGINE_GEO } from "@/lib/screeningEngine";

import {
  ScreeningEngineEnterprise,
  ScreeningEngineFaq,
  ScreeningEngineFinalCta,
  ScreeningEngineFuture,
} from "./ScreeningEngineClosing";
import { ScreeningEngineHero } from "./ScreeningEngineHero";
import { ScreeningEngineStory } from "./ScreeningEngineStory";
import { ScreeningEngineSystems } from "./ScreeningEngineSystems";

export function ScreeningEnginePage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <ScreeningEngineHero reduceMotion={reduceMotion} />
        <ScreeningEngineStory reduceMotion={reduceMotion} />
        <ScreeningEngineSystems reduceMotion={reduceMotion} />
        <ScreeningEngineEnterprise />
        <ScreeningEngineFuture />
        <ScreeningEngineFaq />
        <ScreeningEngineFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={SCREENING_ENGINE_GEO.askPrompt}
        aiAskTopic={SCREENING_ENGINE_GEO.askTopic}
      />
    </div>
  );
}
