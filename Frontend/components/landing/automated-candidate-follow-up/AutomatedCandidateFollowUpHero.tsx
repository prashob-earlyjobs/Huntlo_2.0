"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { FollowUpThreadVisual } from "./FollowUpThreadVisual";

type AutomatedCandidateFollowUpHeroProps = {
  reduceMotion: boolean;
};

export function AutomatedCandidateFollowUpHero({
  reduceMotion,
}: AutomatedCandidateFollowUpHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#e8eef7] bg-[#f8fafc]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-20 top-8 h-[26rem] w-[26rem] rounded-full bg-[#dbe8ff]/65 blur-[110px]" />
        <div className="absolute bottom-0 right-0 h-[22rem] w-[22rem] rounded-full bg-[#eef3ff] blur-[90px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12 lg:px-12 lg:py-32">
        <motion.div
          className="text-left"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0050cb]">
            Automated candidate follow-up
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight text-[#141b2b] sm:text-[2.4rem] md:text-[3rem]">
            The candidate who did not reply may still be the right candidate.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            Reduce missed conversations with a thoughtful follow-up process - clear cadence, stop
            conditions, and recruiter takeover when someone answers.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/candidate-engagement" className={primaryCtaClass}>
              See candidate engagement workflows
            </Link>
            <BookDemoLink className={secondaryCtaClass}>Request a demo</BookDemoLink>
          </div>
        </motion.div>

        <motion.div
          className="w-full min-w-0"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.08 }}
        >
          <FollowUpThreadVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
