"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { DemoCallsProvider } from "@/components/landing/ai-voice-recruiter/DemoCallForm";
import { AI_VOICE_RECRUITER_GEO } from "@/lib/aiVoiceRecruiter";

import { BeforeAfterSection } from "./BeforeAfterSection";
import { ComplianceSection } from "./ComplianceSection";
import { FaqSection } from "./FaqSection";
import { FeaturesGrid } from "./FeaturesGrid";
import { FinalCTA } from "./FinalCTA";
import { HeroSection } from "./HeroSection";
import { OverviewSection } from "./OverviewSection";
import { RelatedLinksSection } from "./RelatedLinksSection";
import { ResultsSection } from "./ResultsSection";
import { SampleCallsSection } from "./SampleCallsSection";
import { SummaryMockSection } from "./SummaryMockSection";
import { TrustMetricsSection } from "./TrustMetricsSection";
import { WorkflowSection } from "./WorkflowSection";

export function AiVoiceRecruiterPageContent() {
  const reduceMotion = !!useReducedMotion();

  return (
    <DemoCallsProvider>
      <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] font-sans text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
        <LandingNav />
        <main>
          <HeroSection reduceMotion={reduceMotion} />
          <TrustMetricsSection reduceMotion={reduceMotion} />
          <OverviewSection reduceMotion={reduceMotion} />
          <FeaturesGrid reduceMotion={reduceMotion} />
          <WorkflowSection reduceMotion={reduceMotion} />
          <BeforeAfterSection reduceMotion={reduceMotion} />
          <SummaryMockSection reduceMotion={reduceMotion} />
          <SampleCallsSection />
          <ResultsSection reduceMotion={reduceMotion} />
          <ComplianceSection reduceMotion={reduceMotion} />
          <RelatedLinksSection reduceMotion={reduceMotion} />
          <FaqSection />
          <FinalCTA reduceMotion={reduceMotion} />
        </main>
        <LandingFooter
          aiAskPrompt={AI_VOICE_RECRUITER_GEO.askPrompt}
          aiAskTopic={AI_VOICE_RECRUITER_GEO.askTopic}
        />
      </div>
    </DemoCallsProvider>
  );
}
