"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import {
  primaryCtaClass,
  secondaryCtaClass,
  secondaryCtaLightClass,
} from "./ctaClasses";
import { InfrastructureConstellation } from "./InfrastructureConstellation";

type AiHiringHeroProps = {
  reduceMotion: boolean;
};

export function AiHiringHero({ reduceMotion }: AiHiringHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#070d1a] text-white">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#0050cb]/25 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#1a3a8a]/35 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,80,203,0.18),_transparent_55%)]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8eb0ff]">
            AI Hiring Infrastructure
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight sm:text-[2.5rem] md:text-[3.25rem] lg:text-[3.75rem]">
            Hiring changed. Recruiting didn&apos;t.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
            The future of hiring won&apos;t be built on more recruiting tools. It will be built on
            intelligent hiring infrastructure.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60 md:text-base">
            Candidate discovery. Talent intelligence. AI recruiting agents. Workflow orchestration.
            Enterprise hiring. Connected through one intelligent layer built for modern recruiting
            teams.
          </p>
          <p className="mt-8 text-lg font-semibold tracking-tight text-white md:text-xl">
            Meet Huntlo.
            <span className="mt-1 block text-base font-medium text-[#8eb0ff] md:text-lg">
              The AI Hiring Infrastructure powering the future of hiring.
            </span>
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <BookDemoLink className={primaryCtaClass}>Book Demo</BookDemoLink>
            <Link href="/platform" className={secondaryCtaClass}>
              Explore The Platform
            </Link>
            <Link
              href="/demo"
              className={`${secondaryCtaLightClass} border-white/15 bg-transparent text-white hover:border-white/30 hover:bg-white/5 hover:text-white`}
            >
              See AI In Action
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.15 }}
          className="relative"
        >
          <InfrastructureConstellation reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
