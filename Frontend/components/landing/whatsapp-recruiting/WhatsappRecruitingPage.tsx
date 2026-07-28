"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { WHATSAPP_RECRUITING_GEO } from "@/lib/whatsappRecruiting";

import {
  WhatsappRecruitingEnterprise,
  WhatsappRecruitingFaq,
  WhatsappRecruitingFinalCta,
  WhatsappRecruitingFuture,
} from "./WhatsappRecruitingClosing";
import { WhatsappRecruitingHero } from "./WhatsappRecruitingHero";
import { WhatsappRecruitingStory } from "./WhatsappRecruitingStory";
import { WhatsappRecruitingSystems } from "./WhatsappRecruitingSystems";

export function WhatsappRecruitingPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <WhatsappRecruitingHero reduceMotion={reduceMotion} />
        <WhatsappRecruitingStory reduceMotion={reduceMotion} />
        <WhatsappRecruitingSystems reduceMotion={reduceMotion} />
        <WhatsappRecruitingEnterprise />
        <WhatsappRecruitingFuture />
        <WhatsappRecruitingFaq />
        <WhatsappRecruitingFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={WHATSAPP_RECRUITING_GEO.askPrompt}
        aiAskTopic={WHATSAPP_RECRUITING_GEO.askTopic}
      />
    </div>
  );
}
