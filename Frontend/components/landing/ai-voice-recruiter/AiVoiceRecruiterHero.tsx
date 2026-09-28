"use client";

import { motion } from "motion/react";

import { DemoCallForm } from "./DemoCallForm";

type HeroProps = {
  reduceMotion: boolean;
};

export function AiVoiceRecruiterHero({ reduceMotion }: HeroProps) {
  return (
    <section className="relative flex min-h-[calc(100dvh-4.75rem)] items-center overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-10 h-[28rem] w-[28rem] rounded-full bg-[#5b4dff]/15 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-[#0866fc]/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-[80rem] items-center gap-10 px-3 py-8 sm:px-4 md:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:gap-14 lg:px-12 lg:py-10">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5b4dff]">
            AI Voice Recruiter
          </p>
          <h1 className="mt-3 max-w-[16ch] text-[2.35rem] font-semibold leading-[1.05] tracking-tight text-[#101828] sm:text-5xl lg:text-[3.25rem]">
            Stop Screening Candidates Manually.
          </h1>
          <p className="mt-4 max-w-[38rem] text-lg font-medium leading-snug text-[#344054] sm:text-xl">
            Let AI Recruiter call, qualify, and shortlist candidates before you even open their
            profile.
          </p>
          <p className="mt-4 max-w-[38rem] text-base leading-relaxed text-[#667085]">
            Huntlo AI Voice Recruiter automatically calls candidates, asks role-specific questions,
            understands responses, qualifies intent, and delivers interview-ready candidates
            directly to your hiring pipeline.
          </p>
          <p className="mt-3 max-w-[38rem] text-sm font-medium text-[#475467]">
            Built for Staffing Agencies, Recruiters, Talent Acquisition Teams & High-Volume Hiring.
          </p>

          {/*
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="#hero-demo"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#5b4dff] px-6 text-sm font-semibold text-white shadow-lg shadow-[#5b4dff]/25 transition hover:bg-[#4a3de6]"
            >
              Try AI Voice Demo
            </a>
            <a
              href="#conversation"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#d0d5dd] bg-white px-6 text-sm font-semibold text-[#101828] transition hover:bg-[#f8f9fb]"
            >
              Watch 2 Minute Demo
            </a>
          </div>
          */}
        </motion.div>

        <motion.div
          id="hero-demo"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.55 }}
        >
          <DemoCallForm variant="hero" />
        </motion.div>
      </div>
    </section>
  );
}
