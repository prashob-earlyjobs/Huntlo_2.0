"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  CANDIDATE_FEELS,
  EARLIER_LOOP,
  FRICTION_CHAIN,
  MEET_HUNTLO_FLOW,
  RECRUITER_COORDINATES,
  SCHEDULING_INTELLIGENCE_COMBINES,
  TEAMS_OPTIMIZE,
} from "@/lib/interviewScheduling";

type InterviewSchedulingStoryProps = {
  reduceMotion: boolean;
};

export function InterviewSchedulingStory({ reduceMotion }: InterviewSchedulingStoryProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Experience problem
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Scheduling isn&apos;t a calendar problem. It&apos;s a candidate experience problem.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              The problem isn&apos;t scheduling. It&apos;s workflow intelligence.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
                Recruiters continuously coordinate
              </h3>
              <ul className="mt-4 space-y-2">
                {RECRUITER_COORDINATES.map((item) => (
                  <li key={item} className="text-sm font-medium text-[#141b2b]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[#c3c6d6]/35 bg-[#070d1a] p-6 text-white">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
                Candidates continuously experience
              </h3>
              <ul className="mt-4 space-y-2">
                {CANDIDATE_FEELS.map((item) => (
                  <li key={item} className="text-sm font-medium text-white/80">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Hiring velocity
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Great hiring moves faster.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Scheduling shouldn&apos;t create operational complexity. It should create hiring
              velocity.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {TEAMS_OPTIMIZE.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/12 bg-white/5 px-3.5 py-2 text-sm text-white/80"
              >
                {item}
              </span>
            ))}
          </div>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
            Yet hiring still slows down because of
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {FRICTION_CHAIN.map((item, index) => (
              <div key={item} className="flex items-center gap-2">
                <span className="rounded-full border border-[#0050cb]/40 bg-[#0050cb]/15 px-3.5 py-2 text-sm text-white">
                  {item}
                </span>
                {index < FRICTION_CHAIN.length - 1 ? (
                  <span className="text-white/30" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="scheduling-intelligence"
        className="scroll-mt-24 border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Meet Scheduling Intelligence
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Understanding before interviews are scheduled.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Modern recruiting shouldn&apos;t ask which slot to send. It should ask which candidate
              experience should be created next.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2 md:gap-3">
            {SCHEDULING_INTELLIGENCE_COMBINES.map((item, index) => (
              <div key={item} className="flex items-center gap-2 md:gap-3">
                <span className="rounded-2xl border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-3 text-sm font-semibold text-[#141b2b]">
                  {item}
                </span>
                {index < SCHEDULING_INTELLIGENCE_COMBINES.length - 1 ? (
                  <span className="text-[#0050cb]/50" aria-hidden>
                    +
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Earlier experiences
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Great hiring experiences begin earlier.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Everything continuously improving candidate experiences.
            </p>
          </div>

          <ol className="mt-10 space-y-3">
            {EARLIER_LOOP.map((item, index) => (
              <motion.li
                key={item}
                initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="flex items-center gap-4 rounded-2xl border border-[#c3c6d6]/35 bg-white px-5 py-4"
              >
                <span className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-semibold text-[#141b2b] sm:text-base">{item}</span>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Meet Huntlo
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              More than interview scheduling.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Recruiters gain intelligent hiring workflows designed around candidate experiences and
              better hiring outcomes.
            </p>
          </div>

          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MEET_HUNTLO_FLOW.map((item, index) => (
              <li
                key={item}
                className={`rounded-2xl border px-4 py-5 ${
                  item === "Scheduling Intelligence"
                    ? "border-[#0050cb] bg-[#0050cb] text-white"
                    : "border-[#c3c6d6]/35 bg-[#f7f8fc] text-[#141b2b]"
                }`}
              >
                <span className="text-[0.65rem] font-semibold tabular-nums opacity-60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-sm font-semibold leading-snug">{item}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/interview-orchestration"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Interview Intelligence
            </Link>
            <span className="text-[#c3c6d6]" aria-hidden>
              ·
            </span>
            <Link
              href="/screening-engine"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Hiring Readiness
            </Link>
            <span className="text-[#c3c6d6]" aria-hidden>
              ·
            </span>
            <Link
              href="/ai-hiring-infrastructure"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              AI Hiring Infrastructure
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
