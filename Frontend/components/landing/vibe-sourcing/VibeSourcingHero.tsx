"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { IntentSignalVisual } from "./IntentSignalVisual";

type VibeSourcingHeroProps = {
  reduceMotion: boolean;
};

export function VibeSourcingHero({ reduceMotion }: VibeSourcingHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#050914] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-20 top-8 h-[28rem] w-[28rem] rounded-full bg-[#0050cb]/25 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[26rem] w-[26rem] rounded-full bg-[#1a3a8a]/30 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:px-12 lg:py-36">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8eb0ff]">
            Vibe Sourcing · Intent Driven Talent Discovery
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-[2.45rem] md:text-[3.1rem] lg:text-[3.3rem]">
            The best recruiters don&apos;t think in keywords.
            <span className="mt-2 block text-white/75">
              They think in talent, context, and intent.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Modern hiring isn&apos;t limited by candidate availability. It&apos;s limited by how
            intelligently recruiters can describe the talent they&apos;re looking for.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Great candidates aren&apos;t discovered through Boolean searches and endless filters.
            They&apos;re discovered when hiring intent becomes intelligence.
          </p>
          <p className="mt-8 text-lg font-semibold tracking-tight md:text-xl">
            Welcome to Vibe Sourcing.
            <span className="mt-1 block text-base font-medium text-[#8eb0ff] md:text-lg">
              Built for the future of Intent Driven Talent Discovery.
            </span>
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#vibe-sourcing" className={primaryCtaClass}>
              Explore Vibe Sourcing
            </Link>
            <Link href="/demo" className={secondaryCtaClass}>
              See Vibe Sourcing In Action
            </Link>
            <BookDemoLink className={ghostCtaClass}>Book Enterprise Demo</BookDemoLink>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.1 }}
        >
          <IntentSignalVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
