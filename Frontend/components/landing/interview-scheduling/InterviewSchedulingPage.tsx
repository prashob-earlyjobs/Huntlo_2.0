"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { INTERVIEW_SCHEDULING_GEO } from "@/lib/interviewScheduling";

import {
  InterviewSchedulingEnterprise,
  InterviewSchedulingFaq,
  InterviewSchedulingFinalCta,
  InterviewSchedulingFuture,
} from "./InterviewSchedulingClosing";
import { InterviewSchedulingHero } from "./InterviewSchedulingHero";
import { InterviewSchedulingStory } from "./InterviewSchedulingStory";
import { InterviewSchedulingSystems } from "./InterviewSchedulingSystems";

export function InterviewSchedulingPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <InterviewSchedulingHero reduceMotion={reduceMotion} />
        <InterviewSchedulingStory reduceMotion={reduceMotion} />
        <InterviewSchedulingSystems reduceMotion={reduceMotion} />
        <InterviewSchedulingEnterprise />
        <InterviewSchedulingFuture />
        <InterviewSchedulingFaq />
        <InterviewSchedulingFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={INTERVIEW_SCHEDULING_GEO.askPrompt}
        aiAskTopic={INTERVIEW_SCHEDULING_GEO.askTopic}
      />
    </div>
  );
}
