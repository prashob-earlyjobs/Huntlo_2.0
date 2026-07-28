"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { RECRUITMENT_OPERATIONS_GEO } from "@/lib/recruitmentOperations";

import {
  RecruitmentOperationsEnterprise,
  RecruitmentOperationsFaq,
  RecruitmentOperationsFinalCta,
  RecruitmentOperationsFuture,
} from "./RecruitmentOperationsClosing";
import { RecruitmentOperationsHero } from "./RecruitmentOperationsHero";
import { RecruitmentOperationsStory } from "./RecruitmentOperationsStory";
import { RecruitmentOperationsSystems } from "./RecruitmentOperationsSystems";

export function RecruitmentOperationsPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <RecruitmentOperationsHero reduceMotion={reduceMotion} />
        <RecruitmentOperationsStory reduceMotion={reduceMotion} />
        <RecruitmentOperationsSystems reduceMotion={reduceMotion} />
        <RecruitmentOperationsEnterprise />
        <RecruitmentOperationsFuture />
        <RecruitmentOperationsFaq />
        <RecruitmentOperationsFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={RECRUITMENT_OPERATIONS_GEO.askPrompt}
        aiAskTopic={RECRUITMENT_OPERATIONS_GEO.askTopic}
      />
    </div>
  );
}
