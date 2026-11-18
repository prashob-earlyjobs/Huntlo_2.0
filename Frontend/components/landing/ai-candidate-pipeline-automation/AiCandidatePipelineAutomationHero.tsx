"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import {
  ghostCtaClass,
  primaryCtaClass,
  secondaryCtaClass,
} from "./ctaClasses";

type AiCandidatePipelineAutomationHeroProps = {
  reduceMotion: boolean;
};

export function AiCandidatePipelineAutomationHero({
  reduceMotion,
}: AiCandidatePipelineAutomationHeroProps) {
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
            US Market
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.1] tracking-tight text-[#141b2b] sm:text-[2.45rem] md:text-[3.1rem] lg:text-[3.3rem]">
            A Recruiting Pipeline Is Only Useful When Candidates Keep Moving
            Through It.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            A recruiting manager opens the team&apos;s hiring dashboard. There
            are candidates in sourcing, screening, interview, and review stages.
            The pipeline looks organized. But several candidates have been
            waiting for follow-up. Others have completed interviews without
            receiving an update. Some are marked as active even though the hiring
            requirement has changed.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            The records exist. The actions needed to move the process forward are
            less clear.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            <span className="font-semibold text-[#141b2b]">
              AI candidate pipeline automation
            </span>{" "}
            focuses on coordinating recurring recruitment activities across
            pipeline stages so that candidates, recruiters, and hiring managers
            have a clearer path to the next action. The opportunity is not
            simply to move records between columns. It is to make the process
            behind those records more dependable.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#workflow" className={primaryCtaClass}>
              Explore Candidate Pipeline Automation
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
                    Candidate pipeline
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#141b2b]">
                    Stage → next action → handoff
                  </p>
                </div>
                <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
                  Illustrative
                </span>
              </div>

              <div className="mt-5 space-y-2.5">
                {[
                  { stage: "Sourcing", candidate: "Candidate A", action: "Awaiting outreach", status: "pending" },
                  { stage: "Screening", candidate: "Candidate B", action: "Recruiter review", status: "active" },
                  { stage: "Interview", candidate: "Candidate C", action: "Feedback pending", status: "waiting" },
                  { stage: "Review", candidate: "Candidate D", action: "Hiring manager decision", status: "active" },
                ].map((item, index) => (
                  <motion.div
                    key={item.candidate}
                    initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.08 }}
                    className="rounded-xl border border-[#e8eef7] bg-[#fafbfd] px-3.5 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[#141b2b]">{item.stage}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${
                          item.status === "pending"
                            ? "bg-[#fef3e2] text-[#b5651a]"
                            : item.status === "waiting"
                              ? "bg-[#fef3e2] text-[#b5651a]"
                              : "bg-[#ecfdf5] text-[#16a34a]"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-3">
                      <p className="text-xs text-[#5b6478]">{item.candidate}</p>
                      <p className="text-xs font-medium text-[#0050cb]">{item.action}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-[#e8eef7]" />
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                  Recruiter stays in control
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