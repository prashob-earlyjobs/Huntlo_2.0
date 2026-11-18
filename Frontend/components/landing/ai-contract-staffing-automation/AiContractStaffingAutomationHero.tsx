"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import {
  ghostCtaClass,
  primaryCtaClass,
  secondaryCtaClass,
} from "./ctaClasses";

type AiContractStaffingAutomationHeroProps = {
  reduceMotion: boolean;
};

export function AiContractStaffingAutomationHero({
  reduceMotion,
}: AiContractStaffingAutomationHeroProps) {
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
            Contract Staffing Runs on Timing. Your Recruiting Workflow Needs to Respond.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            A staffing agency receives a contract hiring requirement. The client
            needs someone with relevant experience who can begin within a defined
            period. The recruiting team has a database of candidates who have
            worked on similar assignments. But historical suitability does not
            guarantee current availability. Some candidates are completing
            existing contracts. Others are interested in new opportunities but
            prefer different locations or working arrangements. A few may be
            available immediately.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            The agency needs to establish which candidates are relevant and ready
            for the next conversation. That process involves sourcing, outreach,
            availability checks, follow-ups, and client coordination.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            <span className="font-semibold text-[#141b2b]">
              AI recruiting automation for contract staffing
            </span>{" "}
            focuses on connecting these recurring activities into structured
            workflows that help recruiters manage changing candidate and
            assignment information. The goal is to make contract recruitment more
            coordinated without replacing professional judgment.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#workflow" className={primaryCtaClass}>
              Explore Contract Staffing Automation
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
                    Contract staffing workflow
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#141b2b]">
                    Assignment intake → availability → route
                  </p>
                </div>
                <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
                  Illustrative
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-[#e8eef7] bg-[#fafbfd] p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                      Assignment
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#141b2b]">
                      Senior Data Engineer
                    </p>
                    <p className="text-xs text-[#5b6478]">
                      6-month contract · Hybrid · Start: Feb 15
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#f0f5ff] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#0050cb]">
                    Active
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {[
                  { name: "Candidate A", status: "Available now", tone: "green" as const },
                  { name: "Candidate B", status: "Available in 2 weeks", tone: "amber" as const },
                  { name: "Candidate C", status: "Completing contract", tone: "slate" as const },
                  { name: "Candidate D", status: "Not interested", tone: "slate" as const },
                ].map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.08 }}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#e8eef7] bg-white px-3 py-2.5"
                  >
                    <p className="text-sm font-medium text-[#141b2b]">{item.name}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${
                        item.tone === "green"
                          ? "bg-[#ecfdf5] text-[#16a34a]"
                          : item.tone === "amber"
                            ? "bg-[#fef3e2] text-[#b5651a]"
                            : "bg-[#f1f2f6] text-[#5b6478]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-[#e8eef7]" />
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                  Recruiter review required
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