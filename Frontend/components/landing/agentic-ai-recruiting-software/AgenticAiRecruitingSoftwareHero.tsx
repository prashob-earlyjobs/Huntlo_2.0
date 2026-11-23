"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { AgenticWorkflowVisual } from "./AgenticWorkflowVisual";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { HERO_FLOW } from "@/lib/agenticAiRecruitingSoftware";

type AgenticAiRecruitingSoftwareHeroProps = {
  reduceMotion: boolean;
};

export function AgenticAiRecruitingSoftwareHero({ reduceMotion }: AgenticAiRecruitingSoftwareHeroProps) {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_15%,_rgba(0,80,203,0.12),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0050cb]">
            US Market
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.1] tracking-tight text-[#141b2b] sm:text-[2.45rem] md:text-[3.1rem] lg:text-[3.3rem]">
            Recruiting needs more than another AI tool.
            <span className="mt-2 block text-[#141b2b]/75">It needs a workflow that moves.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            Recruiting teams have more technology than ever — ATS, sourcing platforms, email automation, candidate databases, scheduling tools. Yet a surprising amount of recruiting work still depends on someone remembering what happens next.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            Agentic AI recruiting connects these steps into workflows that respond to events, carry out permitted actions, and involve a recruiter when human judgment is required.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#agentic-workflow" className={primaryCtaClass}>
              Explore Agentic Recruiting
            </Link>
            <BookDemoLink className={secondaryCtaClass}>Book a Workflow Demo</BookDemoLink>
            <Link href="/demo" className={ghostCtaClass}>
              See Huntlo In Action
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.1 }}
        >
          <AgenticWorkflowVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}