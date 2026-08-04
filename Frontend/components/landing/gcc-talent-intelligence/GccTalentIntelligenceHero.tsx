"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { TalentCommandCenterVisual } from "./TalentCommandCenterVisual";

type GccTalentIntelligenceHeroProps = {
  reduceMotion: boolean;
};

export function GccTalentIntelligenceHero({ reduceMotion }: GccTalentIntelligenceHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#050914] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,_rgba(0,80,203,0.26),_transparent_52%)]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-12 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8eb0ff]">
            GCC Talent Intelligence
          </p>
          <h1 className="mt-5 max-w-xl text-[2.1rem] font-bold leading-[1.08] tracking-tight sm:text-[2.55rem] md:text-[3rem]">
            Talent intelligence that helps recruiters make better hiring decisions
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/65 md:text-lg">
            See talent availability, engagement, recruiter productivity, and pipeline health in one
            AI-powered view — before competitors do.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <BookDemoLink className={primaryCtaClass}>Book Demo</BookDemoLink>
            <Link href="#talent-visibility" className={secondaryCtaClass}>
              Explore Platform
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.08 }}
        >
          <TalentCommandCenterVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
