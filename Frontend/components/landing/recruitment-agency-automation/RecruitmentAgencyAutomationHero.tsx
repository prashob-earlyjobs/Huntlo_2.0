"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { AGENCY_MANDATES } from "@/lib/recruitmentAgencyAutomation";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

type RecruitmentAgencyAutomationHeroProps = {
  reduceMotion: boolean;
};

export function RecruitmentAgencyAutomationHero({
  reduceMotion,
}: RecruitmentAgencyAutomationHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#e8eef7] bg-[#f8fafc]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-0 h-[26rem] w-[26rem] rounded-full bg-[#dbe8ff]/60 blur-[120px]" />
        <div className="absolute -right-16 bottom-0 h-[22rem] w-[22rem] rounded-full bg-[#eef3ff] blur-[100px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0050cb]">
            United States · Recruitment agencies
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight text-[#141b2b] sm:text-[2.4rem] md:text-[3rem]">
            Every Mandate, Candidate, and Client Update Shouldn&apos;t Need Its
            Own Manual System.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            An agency runs several client mandates at once. Recruiters move
            between requirements, candidates, and submission deadlines. The
            information exists — in inboxes, notes, and spreadsheets — but the
            coordination between them still depends on people remembering what
            happened last.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            <strong className="font-semibold text-[#141b2b]">
              Recruitment agency automation focuses on coordinating the
              operational work between client requirements, candidate
              conversations, submissions, and placement decisions.
            </strong>{" "}
            It supports the agency&apos;s process; it does not replace the
            recruiter&apos;s judgment about who to put forward.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#agency-workflow" className={primaryCtaClass}>
              Explore Agency Recruitment Automation
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
          <div className="relative mx-auto w-full max-w-[460px]" aria-hidden>
            <div className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(0,80,203,0.35)] sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
                    Agency mandate board
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#141b2b]">
                    Client → role → next operational step
                  </p>
                </div>
                <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
                  Illustrative
                </span>
              </div>

              <div className="mt-5 space-y-2">
                {AGENCY_MANDATES.map((mandate, index) => (
                  <motion.div
                    key={mandate.client}
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: reduceMotion ? 0 : index * 0.07,
                    }}
                    className="rounded-xl border border-[#e8eef7] bg-[#fbfcfe] px-3.5 py-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#8a93a8]">
                          {mandate.client}
                        </p>
                        <p className="truncate text-sm font-semibold text-[#141b2b]">
                          {mandate.role}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#f0f5ff] px-2 py-0.5 text-[0.55rem] font-semibold text-[#0050cb]">
                        {mandate.state}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-[#e8eef7]" />
                <span className="text-[0.58rem] font-semibold uppercase tracking-[0.13em] text-[#8a93a8]">
                  Recruiter approves submissions
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
