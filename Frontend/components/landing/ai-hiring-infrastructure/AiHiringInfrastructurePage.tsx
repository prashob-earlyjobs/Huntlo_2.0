"use client";

import Link from "next/link";
import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_HIRING_GEO, FUTURE_RECRUITER_FOCUS } from "@/lib/aiHiringInfrastructure";

import { AiHiringEnterprise } from "./AiHiringEnterprise";
import { AiHiringFaq } from "./AiHiringFaq";
import { AiHiringFinalCta } from "./AiHiringFinalCta";
import { AiHiringHero } from "./AiHiringHero";
import { AiHiringPillars } from "./AiHiringPillars";
import { AiHiringProblem } from "./AiHiringProblem";
import { AiHiringRise } from "./AiHiringRise";
import { AiHiringTimeline } from "./AiHiringTimeline";
import { AiHiringWorkflows } from "./AiHiringWorkflows";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function AiHiringInfrastructurePage() {
  const reduceMotion = useReducedMotion();
  const prefersReduced = !!reduceMotion;

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <AiHiringHero reduceMotion={prefersReduced} />
        <AiHiringTimeline reduceMotion={prefersReduced} />
        <AiHiringProblem />
        <AiHiringRise fadeUp={fadeUp} reduceMotion={prefersReduced} />
        <AiHiringPillars reduceMotion={prefersReduced} />
        <AiHiringWorkflows reduceMotion={prefersReduced} />
        <AiHiringEnterprise />
        <section className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
                Future of hiring
              </p>
              <h2 className="mt-4 max-w-xl text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
                We believe the future of hiring will look different.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
                Recruiters won&apos;t spend their days searching. They&apos;ll spend their days:
              </p>
              <ul className="mt-5 space-y-2.5">
                {FUTURE_RECRUITER_FOCUS.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium text-[#141b2b] md:text-base"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0050cb]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f1f3ff] p-6 md:p-8">
              <p className="text-sm leading-relaxed text-[#434654] md:text-base">
                AI will handle repetitive work. Infrastructure will connect workflows. Recruiters
                will remain at the center of hiring.
              </p>
              <p className="mt-4 text-base font-semibold text-[#141b2b] md:text-lg">
                The future isn&apos;t AI replacing recruiters. It&apos;s recruiters becoming
                exponentially more productive through intelligent infrastructure.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/solutions"
                  className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
                >
                  Explore solutions
                </Link>
                <span className="text-[#c3c6d6]" aria-hidden>
                  ·
                </span>
                <Link
                  href="/compare"
                  className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
                >
                  Compare Huntlo
                </Link>
              </div>
            </div>
          </div>
        </section>
        <AiHiringFaq />
        <AiHiringFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={AI_HIRING_GEO.askPrompt}
        aiAskTopic={AI_HIRING_GEO.askTopic}
      />
    </div>
  );
}
