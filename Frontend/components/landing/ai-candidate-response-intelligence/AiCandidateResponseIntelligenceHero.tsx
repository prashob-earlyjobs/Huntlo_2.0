"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import {
  ghostCtaClass,
  primaryCtaClass,
  secondaryCtaClass,
} from "./ctaClasses";

type AiCandidateResponseIntelligenceHeroProps = {
  reduceMotion: boolean;
};

export function AiCandidateResponseIntelligenceHero({
  reduceMotion,
}: AiCandidateResponseIntelligenceHeroProps) {
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
            United States
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.1] tracking-tight text-[#141b2b] sm:text-[2.45rem] md:text-[3.1rem] lg:text-[3.3rem]">
            A Candidate Reply Is More Than a Message. It Is a Signal About What
            Should Happen Next.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            A recruiter sends outreach to a group of relevant candidates.
            Responses begin arriving. One candidate is interested and asks for
            the job description. Another wants to know whether remote work is
            possible. A third requests a callback next week. Someone else
            declines the opportunity. These replies contain different kinds of
            information. But in many recruiting workflows, they are treated
            primarily as messages that someone must read and manually process.
            The recruiter opens each conversation, interprets the response,
            updates the candidate record, and decides what action to take. When
            the volume increases, this work becomes difficult to coordinate.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            <strong className="font-semibold text-[#141b2b]">
              AI candidate response intelligence
            </strong>{" "}
            is the use of AI-assisted analysis to help recruiting teams
            understand candidate communications and identify relevant next
            steps. Its value comes from turning unstructured responses into
            useful operational context without removing human oversight.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.1 }}
        >
          <div className="relative mx-auto w-full max-w-[460px]" aria-hidden>
            <div className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white shadow-[0_24px_60px_-40px_rgba(0,80,203,0.35)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#e8eef7] bg-[#fafbfd] px-5 py-4">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
                    Candidate conversation
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#141b2b]">
                    Inbox with an interpretation layer
                  </p>
                </div>
                <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
                  Illustrative
                </span>
              </div>
              <div className="space-y-3 px-5 py-5">
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.15 }}
                  className="rounded-xl border border-[#e8eef7] bg-[#fafbfd] px-4 py-3"
                >
                  <p className="text-sm leading-relaxed text-[#141b2b]">
                    &ldquo;Yes, I&apos;m interested — could you send the job
                    description?&rdquo;
                  </p>
                  <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#0050cb]">
                    Interpreted: interest + information request
                  </p>
                </motion.div>
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.25 }}
                  className="rounded-xl border border-[#0050cb]/25 bg-[#f0f5ff] px-4 py-3"
                >
                  <p className="text-sm leading-relaxed text-[#141b2b]">
                    &ldquo;I can talk after Thursday. Would next week
                    work?&rdquo;
                  </p>
                  <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#0050cb]">
                    Interpreted: scheduling need
                  </p>
                </motion.div>
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.35 }}
                  className="rounded-xl border border-[#e8eef7] bg-[#fafbfd] px-4 py-3"
                >
                  <p className="text-sm leading-relaxed text-[#141b2b]">
                    &ldquo;Please don&apos;t contact me about this role.&rdquo;
                  </p>
                  <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#0050cb]">
                    Interpreted: contact preference
                  </p>
                </motion.div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="h-px flex-1 bg-[#e8eef7]" />
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                    Human review of every interpretation
                  </span>
                  <span className="h-px flex-1 bg-[#e8eef7]" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}