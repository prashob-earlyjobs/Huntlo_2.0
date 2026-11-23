"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

type AiVoiceCandidateFollowUpHeroProps = {
  reduceMotion: boolean;
};

export function AiVoiceCandidateFollowUpHero({
  reduceMotion,
}: AiVoiceCandidateFollowUpHeroProps) {
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
            The First Candidate Conversation Is Only the Beginning.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            A recruiter completes an initial screening call. The candidate is
            interested in the role but needs time to confirm availability. The
            recruiter records a note and moves to the next applicant. Later,
            another candidate requests interview details. A third asks for a
            callback. A fourth misses a scheduled interview and needs an
            appropriate follow-up.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            None of these situations is unusual. But when a recruiting team
            manages hundreds of candidate conversations, follow-up work becomes
            difficult to organize. Important responses may be delayed.
            Candidates may receive repeated messages. Recruiters may spend time
            checking which conversations still need attention.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            AI voice candidate follow-up automation uses structured voice
            workflows to support selected recruitment follow-ups, confirmations
            and callback coordination. Its purpose is to make candidate
            communication more consistent without replacing recruiter judgment
            or ignoring candidate preferences.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#voice-follow-up-workflow" className={primaryCtaClass}>
              Explore Voice Follow-Up Automation
            </Link>
            <BookDemoLink className={secondaryCtaClass}>Book a Workflow Demo</BookDemoLink>
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
                    Candidate follow-up operations
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#141b2b]">
                    Trigger → call → response → record
                  </p>
                </div>
                <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
                  Illustrative
                </span>
              </div>
              <div className="mt-5 space-y-2">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="relative flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f0f5ff] text-[#0050cb] text-[0.6rem] font-bold ring-1 ring-[#d7e3f4]">
                      {index}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#141b2b]">Stage {index}</p>
                      <p className="text-xs text-[#5b6478]">Follow-up layer</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-[#e8eef7]" />
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                  Recruiter judgment retained
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
