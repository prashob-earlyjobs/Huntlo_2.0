"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  AGENT_FLOW,
  CANDIDATES_REMEMBER,
  INFRA_CHANGES,
  SCHEDULING_IMPROVES,
  STRATEGIC_STACK,
} from "@/lib/interviewScheduling";

type InterviewSchedulingSystemsProps = {
  reduceMotion: boolean;
};

export function InterviewSchedulingSystems({ reduceMotion }: InterviewSchedulingSystemsProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              From calendars to velocity
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Scheduling is becoming hiring intelligence.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Future recruiting teams won&apos;t optimize calendar workflows. They&apos;ll optimize
              hiring velocity.
            </p>
          </div>

          <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SCHEDULING_IMPROVES.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-3.5 text-sm font-medium text-[#141b2b]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              AI recruiting agents
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              AI recruiting agents continuously improve hiring experiences.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Everything intelligently connected.
            </p>
          </div>

          <ol className="mt-12 space-y-3">
            {AGENT_FLOW.map((item, index) => (
              <motion.li
                key={item}
                initial={reduceMotion ? false : { opacity: 0, x: index % 2 === 0 ? -16 : 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.35 }}
                className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`flex max-w-md items-center gap-4 rounded-full border px-5 py-3.5 ${
                    item === "Scheduling Intelligence"
                      ? "border-[#0050cb]/50 bg-[#0050cb]/20"
                      : "border-white/12 bg-white/[0.05]"
                  }`}
                >
                  <span className="text-[0.65rem] font-semibold tabular-nums text-[#8eb0ff]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold text-white sm:text-base">{item}</span>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              What candidates remember
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Candidates remember experiences.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Candidates don&apos;t remember calendar invites. The future recruiter won&apos;t
              optimize interview schedules. They&apos;ll optimize candidate experiences.
            </p>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {CANDIDATES_REMEMBER.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-[#c3c6d6]/40 bg-white px-4 py-3.5 text-sm font-medium text-[#141b2b]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-14 max-w-6xl rounded-3xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Infrastructure shift
          </p>
          <h2 className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[1.85rem]">
            Scheduling Intelligence is becoming infrastructure.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#434654]">
            Future recruiting teams won&apos;t ask which interview slot is available. They&apos;ll
            ask which candidate interaction should happen next.
          </p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {INFRA_CHANGES.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-4 py-3 text-sm font-medium text-[#141b2b]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Positioning
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Not sourcing plus automation. AI Hiring Intelligence Infrastructure.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Scheduling Intelligence is one connected layer — from discovery and conversations
              through readiness, confidence, interviews, alignment, and hiring outcomes.
            </p>
          </div>

          <div className="mt-8 overflow-x-auto pb-2">
            <ol className="flex min-w-max items-stretch gap-0">
              {STRATEGIC_STACK.map((item, index) => (
                <li key={item} className="flex items-center">
                  <div
                    className={`min-w-[9.5rem] rounded-2xl border px-4 py-4 text-center ${
                      item === "Scheduling Intelligence" ||
                      item === "AI Hiring Intelligence Infrastructure"
                        ? "border-[#0050cb] bg-[#0050cb] text-white"
                        : "border-[#c3c6d6]/40 bg-[#f7f8fc] text-[#141b2b]"
                    }`}
                  >
                    <span className="text-sm font-semibold leading-snug">{item}</span>
                  </div>
                  {index < STRATEGIC_STACK.length - 1 ? (
                    <span className="mx-1.5 text-[#0050cb]/50" aria-hidden>
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>

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
              href="/hiring-workflows"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Hiring Workflows
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
