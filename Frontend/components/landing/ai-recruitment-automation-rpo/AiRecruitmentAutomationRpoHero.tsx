"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

type AiRecruitmentAutomationRpoHeroProps = {
  reduceMotion: boolean;
};

export function AiRecruitmentAutomationRpoHero({
  reduceMotion,
}: AiRecruitmentAutomationRpoHeroProps) {
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
            When You Recruit for Multiple Clients, Workflow Consistency Becomes a
            <br />
            Competitive Advantage.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            Recruitment process outsourcing providers operate inside an unusual
            combination of responsibilities. They must understand the hiring
            priorities of their clients, maintain candidate relationships,
            coordinate recruiting teams and deliver a consistent service across
            different programs.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            AI recruitment workflow automation for RPO providers focuses on
            coordinating repetitive recruitment activities across defined client
            programs while preserving program-specific rules and human
            accountability.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#orchestration" className={primaryCtaClass}>
              Explore RPO Automation
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
                    Multi-program operations
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#141b2b]">
                    Separate workflows, shared oversight layer
                  </p>
                </div>
                <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
                  Illustrative
                </span>
              </div>
              <ol className="mt-5 space-y-0">
                {[1, 2, 3].map((index) => (
                  <li key={index} className="relative">
                    {index < 3 ? (
                      <span className="absolute left-[1.15rem] top-10 h-[calc(100%-0.5rem)] w-px bg-[#d7e3f4]" />
                    ) : null}
                    <motion.div
                      initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.08 }}
                      className="relative flex items-start gap-3 rounded-xl border px-3.5 py-3 border-[#e8eef7] bg-[#fafbfd]"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#0050cb] ring-1 ring-[#d7e3f4] text-[0.65rem] font-bold">
                        {index}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#141b2b]">
                          Program {index}
                        </p>
                        <p className="text-xs text-[#5b6478]">Client-specific workflow</p>
                      </div>
                    </motion.div>
                    {index < 3 ? <div className="h-2" /> : null}
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-[#e8eef7]" />
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                  RPO stays in control
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
