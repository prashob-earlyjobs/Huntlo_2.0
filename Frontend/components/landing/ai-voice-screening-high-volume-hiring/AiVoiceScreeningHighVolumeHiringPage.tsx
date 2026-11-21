"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_GEO } from "@/lib/aiVoiceScreeningHighVolumeHiring";

import {
  AiVoiceScreeningHighVolumeHiringDemoTip,
  AiVoiceScreeningHighVolumeHiringFaq,
  AiVoiceScreeningHighVolumeHiringFinalCta,
} from "./AiVoiceScreeningHighVolumeHiringClosing";
import { AiVoiceScreeningHighVolumeHiringHero } from "./AiVoiceScreeningHighVolumeHiringHero";
import { AiVoiceScreeningHighVolumeHiringStory } from "./AiVoiceScreeningHighVolumeHiringStory";
import { AiVoiceScreeningHighVolumeHiringSystems } from "./AiVoiceScreeningHighVolumeHiringSystems";

export function AiVoiceScreeningHighVolumeHiringPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-white text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiVoiceScreeningHighVolumeHiringHero reduceMotion={reduceMotion} />
        <AiVoiceScreeningHighVolumeHiringStory reduceMotion={reduceMotion} />
        <AiVoiceScreeningHighVolumeHiringSystems reduceMotion={reduceMotion} />
        <AiVoiceScreeningHighVolumeHiringDemoTip />
        <AiVoiceScreeningHighVolumeHiringFaq />
        <AiVoiceScreeningHighVolumeHiringFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_GEO.askPrompt}
        aiAskTopic={AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_GEO.askTopic}
      />
    </div>
  );
}
