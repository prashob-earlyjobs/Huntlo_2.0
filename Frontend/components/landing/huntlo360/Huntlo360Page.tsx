"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { HUNTLO360_GEO } from "@/lib/huntlo360";

import {
  Huntlo360Enterprise,
  Huntlo360Faq,
  Huntlo360FinalCta,
  Huntlo360Future,
} from "./Huntlo360Closing";
import { Huntlo360Hero } from "./Huntlo360Hero";
import { Huntlo360Story } from "./Huntlo360Story";
import { Huntlo360Systems } from "./Huntlo360Systems";

export function Huntlo360Page() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <Huntlo360Hero reduceMotion={reduceMotion} />
        <Huntlo360Story reduceMotion={reduceMotion} />
        <Huntlo360Systems reduceMotion={reduceMotion} />
        <Huntlo360Enterprise />
        <Huntlo360Future />
        <Huntlo360Faq />
        <Huntlo360FinalCta />
      </main>
      <LandingFooter aiAskPrompt={HUNTLO360_GEO.askPrompt} aiAskTopic={HUNTLO360_GEO.askTopic} />
    </div>
  );
}
