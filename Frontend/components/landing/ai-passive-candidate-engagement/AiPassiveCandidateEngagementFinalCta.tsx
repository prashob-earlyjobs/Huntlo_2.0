"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { primaryCtaClass, secondaryCtaClass, ghostCtaClass } from "./ctaClasses";

type AiPassiveCandidateEngagementFinalCtaProps = {
  reduceMotion: boolean;
};

export function AiPassiveCandidateEngagementFinalCta({
  reduceMotion,
}: AiPassiveCandidateEngagementFinalCtaProps) {
  return (
    <section className="relative overflow-hidden bg-[#050914] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12" id="cta">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,80,203,0.28),_transparent_58%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
            Explore Passive Candidate Engagement with Huntlo.
            <span className="mt-2 block text-[#8eb0ff]">Relevance over volume.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
            Huntlo&apos;s SOURCE and ENGAGE positioning provides a foundation for
            thinking about candidate discovery and communication as connected
            parts of recruitment. Start with a specific talent segment.
            Understand what makes the opportunity relevant. Define appropriate
            outreach and follow-up boundaries.
          </p>
          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href="#workflow" className={primaryCtaClass}>
              Explore Candidate Engagement
            </Link>
            <BookDemoLink className={secondaryCtaClass}>
              Book a Huntlo Demo
            </BookDemoLink>
            <Link href="/demo" className={ghostCtaClass}>
              See Huntlo In Action
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}