"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { CANDIDATE_OUTREACH_GEO } from "@/lib/candidateOutreach";

import { CampaignFlowSection } from "./CampaignFlowSection";
import { FaqSection } from "./FaqSection";
import { FeaturesGrid } from "./FeaturesGrid";
import { FinalCTA } from "./FinalCTA";
import { HeroSection } from "./HeroSection";
import { OversightSection } from "./OversightSection";
import { OverviewSection } from "./OverviewSection";
import { ProblemSection } from "./ProblemSection";
import { RelatedLinksSection } from "./RelatedLinksSection";
import { UseCaseSection } from "./UseCaseSection";
import { WorkflowSection } from "./WorkflowSection";

export function CandidateOutreachPageContent() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f7f8fc] font-sans text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <HeroSection reduceMotion={reduceMotion} />
        <OverviewSection reduceMotion={reduceMotion} />
        <ProblemSection reduceMotion={reduceMotion} />
        <FeaturesGrid reduceMotion={reduceMotion} />
        <CampaignFlowSection reduceMotion={reduceMotion} />
        <WorkflowSection reduceMotion={reduceMotion} />
        <OversightSection reduceMotion={reduceMotion} />
        <UseCaseSection reduceMotion={reduceMotion} />
        <RelatedLinksSection reduceMotion={reduceMotion} />
        <FaqSection />
        <FinalCTA reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={CANDIDATE_OUTREACH_GEO.askPrompt}
        aiAskTopic={CANDIDATE_OUTREACH_GEO.askTopic}
      />
    </div>
  );
}
