"use client";

import { BeforeAfterSection } from "@/components/marketing/ai-voice-recruiter/BeforeAfterSection";
import { FeaturesGrid } from "@/components/marketing/ai-voice-recruiter/FeaturesGrid";
import { OverviewSection } from "@/components/marketing/ai-voice-recruiter/OverviewSection";
import { SummaryMockSection } from "@/components/marketing/ai-voice-recruiter/SummaryMockSection";
import { TrustMetricsSection } from "@/components/marketing/ai-voice-recruiter/TrustMetricsSection";
import { WorkflowSection } from "@/components/marketing/ai-voice-recruiter/WorkflowSection";

/** @deprecated Prefer marketing/ai-voice-recruiter page sections */
export function AiVoiceRecruiterSections({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <>
      <TrustMetricsSection reduceMotion={reduceMotion} />
      <OverviewSection reduceMotion={reduceMotion} />
      <FeaturesGrid reduceMotion={reduceMotion} />
      <WorkflowSection reduceMotion={reduceMotion} />
      <BeforeAfterSection reduceMotion={reduceMotion} />
      <SummaryMockSection reduceMotion={reduceMotion} />
    </>
  );
}
