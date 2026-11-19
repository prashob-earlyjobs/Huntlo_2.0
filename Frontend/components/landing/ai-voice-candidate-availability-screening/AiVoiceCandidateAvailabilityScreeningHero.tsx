"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

import {
  PROBLEM_STATEMENTS,
} from "@/lib/aiVoiceCandidateAvailabilityScreening";

type AiVoiceCandidateAvailabilityScreeningHeroProps = {
  reduceMotion: boolean;
};

export function AiVoiceCandidateAvailabilityScreeningHero({
  reduceMotion,
}: AiVoiceCandidateAvailabilityScreeningHeroProps) {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_15%,_rgba(0,80,203,0.12),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0050cb]">
            India Market
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.1] tracking-tight text-[#141b2b] sm:text-[2.45rem] md:text-[3.1rem] lg:text-[3.3rem]">
            A Candidate Can Match the Role and Still Be Unavailable for the
            <br />
            <span className="text-[#0050cb]">Opportunity.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            A recruiter identifies a candidate with relevant experience. The profile
            looks promising. The location appears suitable. But the recruiter still
            needs to answer a practical question. Is the candidate available for
            this opportunity now?
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            The candidate may be completing a notice period. They may have recently
            accepted another position. They may be available for interviews but
            unable to join within the expected timeline.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#workflow" className={primaryCtaClass}>
              Explore Availability Screening
            </Link>
            <BookDemoLink className={secondaryCtaClass}>
              Book a Huntlo Demo
            </BookDemoLink>
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
          <div className="relative mx-auto w-full max-w-[460px]" aria-hidden>
            <div className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(0,80,203,0.35)] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
                    Availability Check
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#141b2b]">
                    Current status vs historical record
                  </p>
                </div>
                <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
                  Illustrative
                </span>
              </div>
              <ol className="mt-5 space-y-0">
                {PROBLEM_STATEMENTS.slice(0, 4).map((area, index) => (
                  <li key={area} className="relative">
                    {index < 3 ? (
                      <span className="absolute left-[1.15rem] top-10 h-[calc(100%-0.5rem)] w-px bg-[#d7e3f4]" />
                    ) : null}
                    <motion.div
                      initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.08 }}
                      className="relative flex items-start gap-3 rounded-xl border px-3.5 py-3 border-[#e8eef7] bg-[#fafbfd]"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold bg-white text-[#0050cb] ring-1 ring-[#d7e3f4]">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#141b2b]">{area}</p>
                        <p className="text-xs text-[#5b6478]">Availability gap</p>
                      </div>
                    </motion.div>
                    {index < 3 ? <div className="h-2" /> : null}
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-[#e8eef7]" />
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                  Recruiter reviews current status
                </span>
                <span className="h-px flex-1 bg-[#e8eef7]" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}