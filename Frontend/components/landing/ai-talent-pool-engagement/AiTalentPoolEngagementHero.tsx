"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { TalentPoolHeroVisual } from "./TalentPoolHeroVisual";

type AiTalentPoolEngagementHeroProps = {
  reduceMotion: boolean;
};

export function AiTalentPoolEngagementHero({
  reduceMotion,
}: AiTalentPoolEngagementHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#e8eef7] bg-[#f8fafc]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-4 h-[26rem] w-[26rem] rounded-full bg-[#dbe8ff]/60 blur-[120px]" />
        <div className="absolute -right-16 bottom-0 h-[22rem] w-[22rem] rounded-full bg-[#eef3ff] blur-[100px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:gap-16 lg:px-12 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0050cb]">
            United States · Talent pool engagement
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight text-[#141b2b] sm:text-[2.4rem] md:text-[3rem]">
            A Talent Pool Is More Valuable When the Relationships Remain
            Relevant.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            A company completes a major recruitment campaign. The team has
            connected with many candidates. Some joined the organization. Others
            progressed through interviews but were not selected. A number of
            professionals expressed interest in future opportunities.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            Months later, the organization hires for similar positions and
            returns to the database. But candidate information may be outdated.
            Some people have changed roles. Others have different career
            priorities. The team needs a way to maintain useful relationships
            without sending irrelevant messages.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            <strong className="font-semibold text-[#141b2b]">
              AI talent pool engagement refers to using AI-assisted recruiting
              workflows to support relevant communication, organize candidate
              preferences, and coordinate future recruitment conversations.
            </strong>
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#talent-pool-workflow" className={primaryCtaClass}>
              Explore Talent Pool Engagement
            </Link>
            <BookDemoLink className={secondaryCtaClass}>Book a Huntlo Demo</BookDemoLink>
            <Link href="/demo" className={ghostCtaClass}>
              See Huntlo In Action
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.08 }}
        >
          <TalentPoolHeroVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
