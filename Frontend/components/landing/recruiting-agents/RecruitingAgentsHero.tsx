"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { AgenticOrbitVisual } from "./AgenticOrbitVisual";
import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

type RecruitingAgentsHeroProps = {
  reduceMotion: boolean;
};

export function RecruitingAgentsHero({ reduceMotion }: RecruitingAgentsHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#050914] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-10 h-[28rem] w-[28rem] rounded-full bg-[#0050cb]/25 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-[#1a3a8a]/35 blur-[140px]" />
        {!reduceMotion ? (
          <motion.div
            className="absolute left-1/2 top-1/3 h-px w-[120%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#0050cb]/40 to-transparent"
            animate={{ opacity: [0.2, 0.7, 0.2], x: ["-8%", "8%", "-8%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:py-36">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8eb0ff]">
            The future of hiring
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-[2.45rem] md:text-[3.1rem] lg:text-[3.4rem]">
            Hiring is about to change more in the next 5 years than it has in the last 50.
          </h1>
          <p className="mt-6 max-w-xl text-xl font-semibold leading-snug text-white md:text-2xl">
            The future won&apos;t be human or AI.
            <span className="mt-1 block text-[#8eb0ff]">It will be Human + AI.</span>
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Recruiters won&apos;t disappear. Hiring managers won&apos;t disappear. Candidate
            experiences won&apos;t disappear. What&apos;s changing is how intelligently hiring moves
            forward.
          </p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            The next generation of hiring won&apos;t be powered by more tools, dashboards, or
            automation. It will be powered by intelligence, workflows, conversations, context,
            relationships, and outcomes.
          </p>
          <p className="mt-8 text-lg font-semibold tracking-tight md:text-xl">
            Welcome to Agentic Hiring.
            <span className="mt-1 block text-base font-medium text-[#8eb0ff] md:text-lg">
              Built for the future of Human + AI Hiring.
            </span>
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#agentic-hiring" className={primaryCtaClass}>
              Explore Agentic Hiring
            </Link>
            <Link href="/demo" className={secondaryCtaClass}>
              See Huntlo In Action
            </Link>
            <BookDemoLink className={ghostCtaClass}>Book Enterprise Demo</BookDemoLink>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.12 }}
        >
          <AgenticOrbitVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
