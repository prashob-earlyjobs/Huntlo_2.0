"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { BULK_AI_CALLING_RECRUITMENT_GEO } from "@/lib/bulkAiCallingRecruitment";

import {
  BulkAiCallingRecruitmentDemoTip,
  BulkAiCallingRecruitmentFaq,
  BulkAiCallingRecruitmentFinalCta,
} from "./BulkAiCallingRecruitmentClosing";
import { BulkAiCallingRecruitmentHero } from "./BulkAiCallingRecruitmentHero";
import { BulkAiCallingRecruitmentStory } from "./BulkAiCallingRecruitmentStory";
import { BulkAiCallingRecruitmentSystems } from "./BulkAiCallingRecruitmentSystems";

export function BulkAiCallingRecruitmentPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-white text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <BulkAiCallingRecruitmentHero reduceMotion={reduceMotion} />
        <BulkAiCallingRecruitmentStory reduceMotion={reduceMotion} />
        <BulkAiCallingRecruitmentSystems reduceMotion={reduceMotion} />
        <BulkAiCallingRecruitmentDemoTip />
        <BulkAiCallingRecruitmentFaq />
        <BulkAiCallingRecruitmentFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={BULK_AI_CALLING_RECRUITMENT_GEO.askPrompt}
        aiAskTopic={BULK_AI_CALLING_RECRUITMENT_GEO.askTopic}
      />
    </div>
  );
}
