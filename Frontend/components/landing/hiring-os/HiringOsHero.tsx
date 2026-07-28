"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { HiringOsFlowVisual } from "./HiringOsFlowVisual";

type HiringOsHeroProps = {
  reduceMotion: boolean;
};

export function HiringOsHero({ reduceMotion }: HiringOsHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#070d1a] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -right-20 top-0 h-80 w-80 rounded-full bg-[#0050cb]/20 blur-[110px]" />
        <div className="absolute bottom-10 left-0 h-72 w-72 rounded-full bg-[#1a3a8a]/30 blur-[100px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-12 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8eb0ff]">
            Hiring Operating System
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight sm:text-[2.5rem] md:text-[3.15rem] lg:text-[3.5rem]">
            Recruiters don&apos;t need more tools.
            <span className="mt-2 block text-white/75">They need an operating system.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Modern recruiting teams work across sourcing tools, communication platforms, interview
            systems, candidate databases, spreadsheets, and disconnected workflows.
          </p>
          <p className="mt-4 max-w-xl text-base font-medium text-white/90">
            Hiring doesn&apos;t happen in one application. Why should recruiters work that way?
          </p>
          <p className="mt-8 text-lg font-semibold tracking-tight md:text-xl">
            Meet Huntlo.
            <span className="mt-2 block text-base font-medium leading-relaxed text-[#8eb0ff] md:text-lg">
              The Hiring Operating System designed to connect candidate discovery, talent
              intelligence, recruiter workflows, AI recruiting agents, and enterprise hiring
              infrastructure through one intelligent platform.
            </span>
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <BookDemoLink className={primaryCtaClass}>Book Demo</BookDemoLink>
            <Link href="/platform" className={secondaryCtaClass}>
              Explore Huntlo
            </Link>
            <Link href="#hiring-workflow" className={ghostCtaClass}>
              See The Hiring OS
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.12 }}
        >
          <HiringOsFlowVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
