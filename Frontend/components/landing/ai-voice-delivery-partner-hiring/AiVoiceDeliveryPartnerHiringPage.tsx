"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_VOICE_DELIVERY_PARTNER_HIRING_GEO } from "@/lib/aiVoiceDeliveryPartnerHiring";

import { AiVoiceDeliveryPartnerHiringClosing } from "./AiVoiceDeliveryPartnerHiringClosing";
import { AiVoiceDeliveryPartnerHiringHero } from "./AiVoiceDeliveryPartnerHiringHero";
import { AiVoiceDeliveryPartnerHiringSections } from "./AiVoiceDeliveryPartnerHiringSections";

export function AiVoiceDeliveryPartnerHiringPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-white text-[#0b1220] selection:bg-[#2563eb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiVoiceDeliveryPartnerHiringHero reduceMotion={reduceMotion} />
        <AiVoiceDeliveryPartnerHiringSections reduceMotion={reduceMotion} />
        <AiVoiceDeliveryPartnerHiringClosing reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_VOICE_DELIVERY_PARTNER_HIRING_GEO.askPrompt}
        aiAskTopic={AI_VOICE_DELIVERY_PARTNER_HIRING_GEO.askTopic}
      />
    </div>
  );
}