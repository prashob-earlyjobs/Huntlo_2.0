"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_RECRUITING_FOR_GCCS_GEO } from "@/lib/aiRecruitingForGccs";

import {
  AiRecruitingForGccsFaq,
  AiRecruitingForGccsFinalCta,
  AiRecruitingForGccsIndustries,
} from "./AiRecruitingForGccsClosing";
import { AiRecruitingForGccsHero } from "./AiRecruitingForGccsHero";
import { AiRecruitingForGccsStory } from "./AiRecruitingForGccsStory";
import { AiRecruitingForGccsSystems } from "./AiRecruitingForGccsSystems";

export function AiRecruitingForGccsPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiRecruitingForGccsHero reduceMotion={reduceMotion} />
        <AiRecruitingForGccsStory reduceMotion={reduceMotion} />
        <AiRecruitingForGccsSystems reduceMotion={reduceMotion} />
        <AiRecruitingForGccsIndustries />
        <AiRecruitingForGccsFaq />
        <AiRecruitingForGccsFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={AI_RECRUITING_FOR_GCCS_GEO.askPrompt}
        aiAskTopic={AI_RECRUITING_FOR_GCCS_GEO.askTopic}
      />
    </div>
  );
}
