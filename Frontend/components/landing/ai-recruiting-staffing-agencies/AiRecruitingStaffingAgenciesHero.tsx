"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { DeskWorkflowVisual } from "./DeskWorkflowVisual";

type AiRecruitingStaffingAgenciesHeroProps = {
  reduceMotion: boolean;
};

export function AiRecruitingStaffingAgenciesHero({
  reduceMotion,
}: AiRecruitingStaffingAgenciesHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#050914] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-20 top-8 h-[28rem] w-[28rem] rounded-full bg-[#0050cb]/22 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[26rem] w-[26rem] rounded-full bg-[#1a3a8a]/28 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:py-36">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8eb0ff]">
            For staffing agencies
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-[2.45rem] md:text-[3.1rem]">
            More open requisitions should not mean more disconnected work.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Staffing desks move fast across clients, cities, and candidate conversations. Sourcing
            and engagement workflows should keep recruiter oversight intact - and make candidate
            handoffs clearer.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/solutions/staffing-agencies" className={primaryCtaClass}>
              Explore Huntlo for staffing teams
            </Link>
            <BookDemoLink className={secondaryCtaClass}>Schedule a workflow demo</BookDemoLink>
            <Link href="/agentic-ai-platform" className={ghostCtaClass}>
              View platform
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.1 }}
        >
          <DeskWorkflowVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
