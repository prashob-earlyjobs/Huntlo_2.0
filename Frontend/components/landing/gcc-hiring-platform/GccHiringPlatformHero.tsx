"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { GccControlCenterVisual } from "./GccControlCenterVisual";

type GccHiringPlatformHeroProps = {
  reduceMotion: boolean;
};

export function GccHiringPlatformHero({ reduceMotion }: GccHiringPlatformHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#050914] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,_rgba(0,80,203,0.25),_transparent_50%)]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-12 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8eb0ff]">
            GCC Hiring Platform
          </p>
          <h1 className="mt-5 max-w-xl text-[2.1rem] font-bold leading-[1.08] tracking-tight sm:text-[2.6rem] md:text-[3.1rem]">
            One hiring platform for every GCC workflow
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/65 md:text-lg">
            Unify sourcing, candidate engagement, interviews, and recruiter productivity — so your
            team runs hiring from one system, not nine.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <BookDemoLink className={primaryCtaClass}>Book Demo</BookDemoLink>
            <Link href="/signup" className={secondaryCtaClass}>
              Start Free Trial
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.08 }}
        >
          <GccControlCenterVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
