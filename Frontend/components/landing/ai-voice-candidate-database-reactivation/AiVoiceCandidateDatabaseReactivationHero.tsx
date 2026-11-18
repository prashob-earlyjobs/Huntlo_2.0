"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import {
  ghostCtaClass,
  primaryCtaClass,
  secondaryCtaClass,
} from "./ctaClasses";

type AiVoiceCandidateDatabaseReactivationHeroProps = {
  reduceMotion: boolean;
};

export function AiVoiceCandidateDatabaseReactivationHero({
  reduceMotion,
}: AiVoiceCandidateDatabaseReactivationHeroProps) {
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
            Your Recruitment Database Is Full of Candidates. How Many Are Still
            Available?
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            A staffing agency receives a new hiring requirement. The team has
            worked on similar roles before. There are candidate records in the
            database, including people who previously applied, completed
            screenings, or expressed interest in related opportunities. The
            recruiter begins reviewing those profiles. Some appear relevant. But
            the information may be outdated.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            A candidate who was available three months ago may now be employed.
            Another may have changed location. Someone who declined an earlier
            opportunity may be interested in a different role today. The
            recruiter needs fresh information. That often means calling
            candidates again.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            <span className="font-semibold text-[#141b2b]">
              AI voice candidate database reactivation
            </span>{" "}
            focuses on using structured automated conversations to reconnect with
            previous candidates, confirm current interest, and organize relevant
            responses for recruiter review. The objective is not to repeatedly
            contact everyone in a database. It is to make existing candidate
            relationships more useful through relevant and responsible
            communication.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#workflow" className={primaryCtaClass}>
              Explore Candidate Reactivation
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
                    Candidate database reactivation
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#141b2b]">
                    Historical record → eligibility check → voice conversation → recruiter review
                  </p>
                </div>
                <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
                  Illustrative
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-[#e8eef7] bg-[#fafbfd] p-3.5">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                  Historical candidate record
                </p>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#141b2b]">
                      Sales Executive · Applied 3 months ago
                    </p>
                    <p className="text-xs text-[#5b6478]">
                      Status: Previously screened · Location: Mumbai
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#fef3e2] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#b5651a]">
                    Outdated
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {[
                  { label: "Contact eligibility", status: "Verified", tone: "green" as const },
                  { label: "Current availability", status: "Checking", tone: "amber" as const },
                  { label: "Location preference", status: "Checking", tone: "amber" as const },
                  { label: "Interest confirmation", status: "Pending", tone: "slate" as const },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.08 }}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#e8eef7] bg-white px-3 py-2.5"
                  >
                    <p className="text-sm font-medium text-[#141b2b]">{item.label}</p>
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