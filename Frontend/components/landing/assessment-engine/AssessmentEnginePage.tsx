"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { ASSESSMENT_ENGINE_GEO } from "@/lib/assessmentEngine";

import {
  AssessmentEngineEnterprise,
  AssessmentEngineFaq,
  AssessmentEngineFinalCta,
  AssessmentEngineFuture,
} from "./AssessmentEngineClosing";
import { AssessmentEngineHero } from "./AssessmentEngineHero";
import { AssessmentEngineStory } from "./AssessmentEngineStory";
import { AssessmentEngineSystems } from "./AssessmentEngineSystems";

export function AssessmentEnginePage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <AssessmentEngineHero reduceMotion={reduceMotion} />
        <AssessmentEngineStory reduceMotion={reduceMotion} />
        <AssessmentEngineSystems reduceMotion={reduceMotion} />
        <AssessmentEngineEnterprise />
        <AssessmentEngineFuture />
        <AssessmentEngineFaq />
        <AssessmentEngineFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={ASSESSMENT_ENGINE_GEO.askPrompt}
        aiAskTopic={ASSESSMENT_ENGINE_GEO.askTopic}
      />
    </div>
  );
}
