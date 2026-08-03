"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { TALENT_PIPELINE_GEO } from "@/lib/talentPipeline";

import {
  TalentPipelineEnterprise,
  TalentPipelineFaq,
  TalentPipelineFinalCta,
  TalentPipelineFuture,
} from "./TalentPipelineClosing";
import { TalentPipelineHero } from "./TalentPipelineHero";
import { TalentPipelineStory } from "./TalentPipelineStory";
import { TalentPipelineSystems } from "./TalentPipelineSystems";

export function TalentPipelinePage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <TalentPipelineHero reduceMotion={reduceMotion} />
        <TalentPipelineStory reduceMotion={reduceMotion} />
        <TalentPipelineSystems reduceMotion={reduceMotion} />
        <TalentPipelineEnterprise />
        <TalentPipelineFuture />
        <TalentPipelineFaq />
        <TalentPipelineFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={TALENT_PIPELINE_GEO.askPrompt}
        aiAskTopic={TALENT_PIPELINE_GEO.askTopic}
      />
    </div>
  );
}
