"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { MULTILINGUAL_RECRUITMENT_GEO } from "@/lib/multilingualRecruitment";

import {
  MultilingualRecruitmentFaq,
  MultilingualRecruitmentFinalCta,
  MultilingualRecruitmentGettingStarted,
} from "./MultilingualRecruitmentClosing";
import { MultilingualRecruitmentHero } from "./MultilingualRecruitmentHero";
import { MultilingualRecruitmentStory } from "./MultilingualRecruitmentStory";
import { MultilingualRecruitmentSystems } from "./MultilingualRecruitmentSystems";

export function MultilingualRecruitmentPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-white text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <MultilingualRecruitmentHero reduceMotion={reduceMotion} />
        <MultilingualRecruitmentStory reduceMotion={reduceMotion} />
        <MultilingualRecruitmentSystems reduceMotion={reduceMotion} />
        <MultilingualRecruitmentGettingStarted />
        <MultilingualRecruitmentFaq />
        <MultilingualRecruitmentFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={MULTILINGUAL_RECRUITMENT_GEO.askPrompt}
        aiAskTopic={MULTILINGUAL_RECRUITMENT_GEO.askTopic}
      />
    </div>
  );
}
