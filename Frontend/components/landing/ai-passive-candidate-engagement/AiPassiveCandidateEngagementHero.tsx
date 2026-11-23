"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import {
  ghostCtaClass,
  primaryCtaClass,
  secondaryCtaClass,
} from "./ctaClasses";

type AiPassiveCandidateEngagementHeroProps = {
  reduceMotion: boolean;
};

export function AiPassiveCandidateEngagementHero({
  reduceMotion,
}: AiPassiveCandidateEngagementHeroProps) {
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
            The Best Candidate for Your Next Role May Not Be Looking for a Job.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            A recruiter begins searching for candidates for a difficult-to-fill
            position. The role requires specific experience, and the available
            applicant pool is limited. Some potentially relevant professionals
            are not actively applying for jobs. They may be satisfied in their
            current roles, focused on ongoing projects, or simply not considering
            a career move. A traditional job advertisement may never reach them.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            The recruiter needs a different approach: identify relevant
            professionals, understand why the opportunity might matter to them,
            and begin a respectful conversation. That process takes preparation.
            A generic outreach message rarely explains why a particular person
            should pay attention. A poorly timed follow-up can make the
            experience worse.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            <span className="font-semibold text-[#141b2b]">
              AI passive candidate engagement
            </span>{" "}
            refers to using AI-assisted recruiting workflows to support relevant
            outreach, organize responses, and coordinate appropriate follow-ups
            with professionals who are not actively seeking work. The objective
            is not to contact every available profile. It is to make thoughtful
            candidate engagement more manageable.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
                    Passive candidate engagement
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#141b2b]">
                    Discover → personalize → engage → route
                  </p>
                </div>
                <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
                  Illustrative
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.1 }}
                  className="rounded-xl border border-[#e8eef7] bg-[#fafbfd] p-3.5"
                >
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                    Candidate discovery
                  </p>
                  <div className="mt-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#141b2b]">
                        Senior Backend Engineer
                      </p>
                      <p className="text-xs text-[#5b6478]">
                        Not actively looking · Relevant background
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#16a34a]">
                      Relevant
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.2 }}
                  className="rounded-xl border border-[#e8eef7] bg-white p-3.5"
                >
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                    Personalized outreach preview
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#141b2b]">
                    Hi Priya — given your experience scaling payment
                    infrastructure, I wanted to share a role that may align with
                    your background...
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-[#f0f5ff] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#0050cb]">
                      Draft
                    </span>
                    <span className="text-[0.65rem] text-[#8a93a8]">
                      Recruiter review required
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.3 }}
                  className="rounded-xl border border-[#e8eef7] bg-white p-3.5"
                >
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                    Response state
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {[
                      { label: "Interested", tone: "green" },
                      { label: "Question", tone: "blue" },
                      { label: "Later contact", tone: "amber" },
                      { label: "Declined", tone: "slate" },
                    ].map((item) => (
                      <span
                        key={item.label}
                        className={`rounded-lg px-2.5 py-1.5 text-center text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${
                          item.tone === "green"
                            ? "bg-[#ecfdf5] text-[#16a34a]"
                            : item.tone === "blue"
                              ? "bg-[#f0f5ff] text-[#0050cb]"
                              : item.tone === "amber"
                                ? "bg-[#fef3e2] text-[#b5651a]"
                                : "bg-[#f1f2f6] text-[#5b6478]"
                        }`}
                      >
                        {item.label}
                      </span>
                    ))}
                  </div>
                </motion.div>
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