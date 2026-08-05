"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { CANDIDATE_ENGAGEMENT_GEO } from "@/lib/candidateEngagement";

import {
  CandidateEngagementEnterprise,
  CandidateEngagementFaq,
  CandidateEngagementFinalCta,
  CandidateEngagementFuture,
} from "./CandidateEngagementClosing";
import { CandidateEngagementHero } from "./CandidateEngagementHero";
import { CandidateEngagementStory } from "./CandidateEngagementStory";
import { CandidateEngagementSystems } from "./CandidateEngagementSystems";

export function CandidateEngagementPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <CandidateEngagementHero reduceMotion={reduceMotion} />
        <CandidateEngagementStory reduceMotion={reduceMotion} />
        <CandidateEngagementSystems reduceMotion={reduceMotion} />
        <CandidateEngagementEnterprise />
        <CandidateEngagementFuture />
        <CandidateEngagementFaq />
        <CandidateEngagementFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={CANDIDATE_ENGAGEMENT_GEO.askPrompt}
        aiAskTopic={CANDIDATE_ENGAGEMENT_GEO.askTopic}
      />
    </div>
  );
}
