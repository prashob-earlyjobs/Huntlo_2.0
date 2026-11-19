"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { primaryCtaClass, secondaryCtaClass, ghostCtaClass } from "./ctaClasses";

type AiCandidateResponseIntelligenceFinalCtaProps = {
  reduceMotion: boolean;
};

export function AiCandidateResponseIntelligenceFinalCta({
  reduceMotion,
}: AiCandidateResponseIntelligenceFinalCtaProps) {
  return (
    <section
      className="relative overflow-hidden bg-[#050914] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12"
      id="cta"
    >
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
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8eb0ff]">
            Make candidate conversations more actionable
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
            Start with the responses your recruiters handle most.
            <span className="mt-2 block text-[#8eb0ff]">
              Understanding over volume.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
            Huntlo&apos;s ANALYZE positioning provides a useful direction for
            exploring how recruitment conversations can inform workflow
            decisions. Start with the response types your recruiters handle
            most frequently. Identify which require routine coordination and
            which demand human judgment. Then evaluate how response
            intelligence can help make those distinctions clearer. The
            objective is not to generate more candidate data. It is to make
            existing conversations easier to understand and act upon.
          </p>
          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href="#workflow" className={primaryCtaClass}>
              Explore Candidate Response Intelligence
            </Link>
            <BookDemoLink className={secondaryCtaClass}>
              Discuss a Workflow
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