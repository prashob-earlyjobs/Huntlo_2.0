"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import {
  ghostCtaClass,
  primaryCtaClass,
  secondaryCtaClass,
} from "./ctaClasses";

type AiRecruitmentCallManagementHeroProps = {
  reduceMotion: boolean;
};

const CALL_ROWS = [
  {
    candidate: "Anita R.",
    outcome: "Interested",
    next: "Recruiter screening",
    tone: "positive" as const,
  },
  {
    candidate: "Vikram S.",
    outcome: "Callback requested",
    next: "Schedule follow-up",
    tone: "pending" as const,
  },
  {
    candidate: "Meera P.",
    outcome: "No answer",
    next: "Appropriate retry",
    tone: "neutral" as const,
  },
  {
    candidate: "Arjun K.",
    outcome: "Do not contact",
    next: "Remove from outreach",
    tone: "negative" as const,
  },
] as const;

export function AiRecruitmentCallManagementHero({
  reduceMotion,
}: AiRecruitmentCallManagementHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#e8eef7] bg-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_15%,_rgba(37,99,235,0.10),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:py-36">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2563eb]">
            India · Recruitment Calling
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight text-[#0b1220] sm:text-[2.4rem] md:text-[3rem]">
            Recruitment Calling Is More Than Dialing Numbers. It Is Managing
            What Happens After Every Conversation.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            A recruiter begins the day with a list of candidates to contact.
            Some calls are answered. Others go unanswered. A few candidates
            request callbacks. Some express interest but need more information.
            Others are no longer looking for work. By the end of the day, the
            recruiter has completed many conversations. But the operational
            challenge remains. Which candidates need follow-up? Which questions
            are unresolved? Who requested a callback? Which conversations
            require another recruiter? How should the team avoid contacting
            someone who has declined?
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            <strong className="font-semibold text-[#0b1220]">
              AI recruitment call management
            </strong>{" "}
            focuses on organizing candidate calling workflows, conversation
            outcomes, follow-ups, and recruiter handoffs. The objective is to
            make recruitment communication easier to coordinate rather than
            simply increasing the number of calls.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#workflow" className={primaryCtaClass}>
              Explore Recruitment Call Management
            </Link>
            <BookDemoLink className={secondaryCtaClass}>
              Discuss a Calling Workflow
            </BookDemoLink>
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
          <div
            className="relative mx-auto w-full max-w-[480px]"
            aria-label="Conceptual recruitment calling operations interface"
          >
            <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_24px_60px_-40px_rgba(37,99,235,0.35)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#e8eef7] bg-[#fafbfd] px-5 py-4">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                    Calling operations
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#0b1220]">
                    Candidate conversation states
                  </p>
                </div>
                <span className="rounded-full border border-[#e2e8f0] bg-white px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#2563eb]">
                  Illustrative
                </span>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1.1fr] border-b border-[#e8eef7] bg-[#fafbfd] px-5 py-2.5">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#8a93a8]">
                  Candidate
                </p>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#8a93a8]">
                  Outcome
                </p>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#2563eb]">
                  Next action
                </p>
              </div>

              <div className="divide-y divide-[#e8eef7]">
                {CALL_ROWS.map((row, index) => (
                  <motion.div
                    key={row.candidate}
                    initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: reduceMotion ? 0 : index * 0.08,
                    }}
                    className="grid grid-cols-[1fr_1fr_1.1fr] items-center gap-2 px-5 py-3"
                  >
                    <p className="text-sm font-medium text-[#0b1220]">
                      {row.candidate}
                    </p>
                    <div>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.08em] ${
                          row.tone === "positive"
                            ? "bg-[#ecfdf5] text-[#16a34a]"
                            : row.tone === "pending"
                              ? "bg-[#fef3e2] text-[#b5651a]"
                              : row.tone === "negative"
                                ? "bg-[#fef2f2] text-[#dc2626]"
                                : "bg-[#f1f5f9] text-[#5b6478]"
                        }`}
                      >
                        {row.outcome}
                      </span>
                    </div>
                    <p className="text-sm text-[#5b6478]">{row.next}</p>
                  </motion.div>
                ))}
              </div>

              <p className="border-t border-[#e8eef7] bg-[#fafbfd] px-5 py-3 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                Every outcome routes to a clear next step
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}