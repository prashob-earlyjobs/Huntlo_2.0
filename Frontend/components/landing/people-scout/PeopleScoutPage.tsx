"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { PEOPLE_SCOUT_GEO } from "@/lib/peopleScout";

import {
  PeopleScoutEnterprise,
  PeopleScoutFaq,
  PeopleScoutFinalCta,
  PeopleScoutFuture,
} from "./PeopleScoutClosing";
import { PeopleScoutHero } from "./PeopleScoutHero";
import { PeopleScoutStory } from "./PeopleScoutStory";
import { PeopleScoutSystems } from "./PeopleScoutSystems";

export function PeopleScoutPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <PeopleScoutHero reduceMotion={reduceMotion} />
        <PeopleScoutStory reduceMotion={reduceMotion} />
        <PeopleScoutSystems reduceMotion={reduceMotion} />
        <PeopleScoutEnterprise />
        <PeopleScoutFuture />
        <PeopleScoutFaq />
        <PeopleScoutFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={PEOPLE_SCOUT_GEO.askPrompt}
        aiAskTopic={PEOPLE_SCOUT_GEO.askTopic}
      />
    </div>
  );
}
