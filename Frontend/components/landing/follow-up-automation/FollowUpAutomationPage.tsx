"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { FOLLOW_UP_AUTOMATION_GEO } from "@/lib/followUpAutomation";

import {
  FollowUpAutomationEnterprise,
  FollowUpAutomationFaq,
  FollowUpAutomationFinalCta,
  FollowUpAutomationFuture,
} from "./FollowUpAutomationClosing";
import { FollowUpAutomationHero } from "./FollowUpAutomationHero";
import { FollowUpAutomationStory } from "./FollowUpAutomationStory";
import { FollowUpAutomationSystems } from "./FollowUpAutomationSystems";

export function FollowUpAutomationPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <FollowUpAutomationHero reduceMotion={reduceMotion} />
        <FollowUpAutomationStory reduceMotion={reduceMotion} />
        <FollowUpAutomationSystems reduceMotion={reduceMotion} />
        <FollowUpAutomationEnterprise />
        <FollowUpAutomationFuture />
        <FollowUpAutomationFaq />
        <FollowUpAutomationFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={FOLLOW_UP_AUTOMATION_GEO.askPrompt}
        aiAskTopic={FOLLOW_UP_AUTOMATION_GEO.askTopic}
      />
    </div>
  );
}
