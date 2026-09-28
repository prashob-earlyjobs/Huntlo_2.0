"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_VOICE_RECRUITER_GEO } from "@/lib/aiVoiceRecruiter";

import { AiVoiceRecruiterClosing, AiVoiceStickyCta } from "./AiVoiceRecruiterClosing";
import { AiVoiceRecruiterHero } from "./AiVoiceRecruiterHero";
import { AiVoiceRecruiterSections } from "./AiVoiceRecruiterSections";
import { DemoCallsProvider } from "./DemoCallForm";

export function AiVoiceRecruiterPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <DemoCallsProvider>
      <div className="min-h-screen overflow-x-hidden bg-white text-[#101828] selection:bg-[#5b4dff] selection:text-white">
        <LandingNav />
        <main>
          <AiVoiceRecruiterHero reduceMotion={reduceMotion} />
          <AiVoiceRecruiterSections reduceMotion={reduceMotion} />
          <AiVoiceRecruiterClosing />
        </main>
        <LandingFooter
          aiAskPrompt={AI_VOICE_RECRUITER_GEO.askPrompt}
          aiAskTopic={AI_VOICE_RECRUITER_GEO.askTopic}
        />
        <AiVoiceStickyCta />
      </div>
    </DemoCallsProvider>
  );
}
