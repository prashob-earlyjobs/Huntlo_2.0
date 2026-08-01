"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { EMAIL_OUTREACH_GEO } from "@/lib/emailOutreach";

import {
  EmailOutreachEnterprise,
  EmailOutreachFaq,
  EmailOutreachFinalCta,
  EmailOutreachFuture,
} from "./EmailOutreachClosing";
import { EmailOutreachHero } from "./EmailOutreachHero";
import { EmailOutreachStory } from "./EmailOutreachStory";
import { EmailOutreachSystems } from "./EmailOutreachSystems";

export function EmailOutreachPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <EmailOutreachHero reduceMotion={reduceMotion} />
        <EmailOutreachStory reduceMotion={reduceMotion} />
        <EmailOutreachSystems reduceMotion={reduceMotion} />
        <EmailOutreachEnterprise />
        <EmailOutreachFuture />
        <EmailOutreachFaq />
        <EmailOutreachFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={EMAIL_OUTREACH_GEO.askPrompt}
        aiAskTopic={EMAIL_OUTREACH_GEO.askTopic}
      />
    </div>
  );
}
