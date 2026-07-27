"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { WorkflowIslandVisual } from "./WorkflowIslandVisual";

type HiringWorkflowsHeroProps = {
  reduceMotion: boolean;
};

export function HiringWorkflowsHero({ reduceMotion }: HiringWorkflowsHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#070d1a] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-[#0050cb]/20 blur-[110px]" />
        <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-[#1a3a8a]/30 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-12 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8eb0ff]">
            Hiring Workflows
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight sm:text-[2.45rem] md:text-[3.1rem] lg:text-[3.4rem]">
            Hiring doesn&apos;t happen in stages.
            <span className="mt-2 block text-white/75">It happens in connected decisions.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Every hiring decision influences another. Candidate discovery affects engagement.
            Engagement affects interviews. Interviews affect hiring outcomes.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            The future of recruiting won&apos;t be powered by disconnected processes. It will be
            powered by intelligent hiring workflows.
          </p>
          <p className="mt-8 text-base font-medium leading-relaxed text-[#8eb0ff] md:text-lg">
            Huntlo connects candidate discovery, intelligence, engagement, and hiring operations
            into intelligent workflows designed for modern recruiting teams.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#connected-workflows" className={primaryCtaClass}>
              Explore Hiring Workflows
            </Link>
            <Link href="/demo" className={secondaryCtaClass}>
              See Huntlo In Action
            </Link>
            <BookDemoLink className={ghostCtaClass}>Book Demo</BookDemoLink>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.12 }}
        >
          <WorkflowIslandVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
