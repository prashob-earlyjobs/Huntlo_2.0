"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { CollaborationVisual } from "./CollaborationVisual";
import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

type AgenticHiringHeroProps = {
  reduceMotion: boolean;
};

export function AgenticHiringHero({ reduceMotion }: AgenticHiringHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#070d1a] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-[#0050cb]/20 blur-[110px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#1a3a8a]/30 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-12 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8eb0ff]">
            Agentic Hiring
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight sm:text-[2.45rem] md:text-[3.1rem] lg:text-[3.4rem]">
            AI won&apos;t replace recruiters.
            <span className="mt-2 block text-white/75">
              Recruiters using AI will define the future of hiring.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            The next generation of recruiting won&apos;t be powered by recruiters working alone or AI
            operating independently.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            It will be powered by intelligent collaboration between human expertise and AI systems
            purpose-built for hiring.
          </p>
          <p className="mt-8 text-lg font-semibold tracking-tight md:text-xl">
            Welcome to Agentic Hiring.
            <span className="mt-1 block text-base font-medium text-[#8eb0ff] md:text-lg">
              The future of Human + AI Recruiting.
            </span>
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#what-is-agentic-hiring" className={primaryCtaClass}>
              Explore Agentic Hiring
            </Link>
            <Link href="/platform" className={secondaryCtaClass}>
              Meet Huntlo
            </Link>
            <Link href="#ai-recruiting-team" className={ghostCtaClass}>
              See AI Recruiting Agents
            </Link>
          </div>

          <div className="mt-8">
            <BookDemoLink className="text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline">
              Or book a demo
            </BookDemoLink>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.12 }}
        >
          <CollaborationVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
