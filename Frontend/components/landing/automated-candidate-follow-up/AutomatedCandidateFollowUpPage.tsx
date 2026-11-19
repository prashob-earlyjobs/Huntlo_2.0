"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AUTOMATED_CANDIDATE_FOLLOW_UP_GEO } from "@/lib/automatedCandidateFollowUp";

import {
  AutomatedCandidateFollowUpDemoTip,
  AutomatedCandidateFollowUpFaq,
  AutomatedCandidateFollowUpFinalCta,
} from "./AutomatedCandidateFollowUpClosing";
import { AutomatedCandidateFollowUpHero } from "./AutomatedCandidateFollowUpHero";
import { AutomatedCandidateFollowUpStory } from "./AutomatedCandidateFollowUpStory";
import { AutomatedCandidateFollowUpSystems } from "./AutomatedCandidateFollowUpSystems";

export function AutomatedCandidateFollowUpPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AutomatedCandidateFollowUpHero reduceMotion={reduceMotion} />
        <AutomatedCandidateFollowUpStory reduceMotion={reduceMotion} />
        <AutomatedCandidateFollowUpSystems reduceMotion={reduceMotion} />
        <AutomatedCandidateFollowUpDemoTip />
        <AutomatedCandidateFollowUpFaq />
        <AutomatedCandidateFollowUpFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={AUTOMATED_CANDIDATE_FOLLOW_UP_GEO.askPrompt}
        aiAskTopic={AUTOMATED_CANDIDATE_FOLLOW_UP_GEO.askTopic}
      />
    </div>
  );
}
