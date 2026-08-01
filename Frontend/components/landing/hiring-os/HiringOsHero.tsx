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
    <section className="relative overflow-hidden bg-[#03060f] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-0 h-[32rem] w-[32rem] rounded-full bg-[#0050cb]/26 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-[#1a3a8a]/32 blur-[130px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:py-40">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8eb0ff]">
            Hiring OS · AI Native Operating System
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.08] tracking-tight sm:text-[2.5rem] md:text-[3.15rem] lg:text-[3.35rem]">
            Hiring doesn&apos;t need another platform.
            <span className="mt-2 block text-white/75">It needs an operating system.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Modern hiring teams don&apos;t struggle because they lack recruiting software. They
            struggle because hiring lives across fragmented tools, disconnected workflows,
            operational complexity, and siloed candidate experiences.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            The future of hiring won&apos;t be powered by more platforms, automation, or dashboards.
            It will be powered by intelligence, conversations, workflows, and outcomes.
          </p>
          <p className="mt-8 text-lg font-semibold tracking-tight md:text-xl">
            Welcome to the AI Native Hiring Operating System.
            <span className="mt-1 block text-base font-medium text-[#8eb0ff] md:text-lg">
              Built for the future of Human + AI Hiring.
            </span>
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <BookDemoLink className={primaryCtaClass}>Book Enterprise Demo</BookDemoLink>
            <Link href="#hiring-os" className={secondaryCtaClass}>
              Explore Hiring OS
            </Link>
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
          <HiringOsFlowVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
