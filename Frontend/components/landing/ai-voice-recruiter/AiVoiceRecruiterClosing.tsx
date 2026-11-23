"use client";

import { FaqSection } from "@/components/marketing/ai-voice-recruiter/FaqSection";
import { FinalCTA } from "@/components/marketing/ai-voice-recruiter/FinalCTA";

/** @deprecated Prefer marketing/ai-voice-recruiter closing sections */
export function AiVoiceRecruiterClosing() {
  return (
    <>
      <FaqSection />
      <FinalCTA />
    </>
  );
}

export function AiVoiceStickyCta() {
  return null;
}
