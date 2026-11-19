"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { HandoffChainVisual } from "./HandoffChainVisual";

type AiRecruiterHandoffAutomationHeroProps = {
  reduceMotion: boolean;
};

export function AiRecruiterHandoffAutomationHero({
  reduceMotion,
}: AiRecruiterHandoffAutomationHeroProps) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_10%,_rgba(0,80,203,0.1),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:gap-16 lg:px-12 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0050cb]">
            United States · Recruiter handoffs
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight text-[#141b2b] sm:text-[2.4rem] md:text-[3rem]">
            Candidate Conversations Shouldn&apos;t Lose Context When They Move
            Between Recruiters.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            A sourcing recruiter identifies a promising candidate. The candidate
            responds positively and asks several questions about the opportunity.
            The sourcing recruiter gathers initial information and prepares to
            transfer the conversation to a delivery recruiter.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            The next recruiter needs to understand what has already happened.
            Which opportunity was discussed? What did the candidate ask? What
            information was promised? What is the next agreed action?
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            <strong className="font-semibold text-[#141b2b]">
              AI recruiter handoff automation focuses on coordinating the transfer
              of relevant candidate context, responsibilities, and next actions
            </strong>{" "}
            between recruitment team members. The goal is to maintain continuity
            as candidates move through different stages of the process.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#handoff-workflow" className={primaryCtaClass}>
              Explore Recruiter Handoff Workflows
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
          <HandoffChainVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
