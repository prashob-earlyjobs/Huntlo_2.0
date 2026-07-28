"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { OUTREACH_ENGINE_GEO } from "@/lib/outreachEngine";

import {
  OutreachEngineEnterprise,
  OutreachEngineFaq,
  OutreachEngineFinalCta,
} from "./OutreachEngineClosing";
import { OutreachEngineHero } from "./OutreachEngineHero";
import { OutreachEngineStory } from "./OutreachEngineStory";
import { OutreachEngineSystems } from "./OutreachEngineSystems";

export function OutreachEnginePage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <OutreachEngineHero reduceMotion={reduceMotion} />
        <OutreachEngineStory reduceMotion={reduceMotion} />
        <OutreachEngineSystems reduceMotion={reduceMotion} />
        <OutreachEngineEnterprise />
        <OutreachEngineFaq />
        <OutreachEngineFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={OUTREACH_ENGINE_GEO.askPrompt}
        aiAskTopic={OUTREACH_ENGINE_GEO.askTopic}
      />
    </div>
  );
}
