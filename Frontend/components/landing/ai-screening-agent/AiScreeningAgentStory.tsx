"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  DECISION_COMBINES,
  EVALUATE_DIMENSIONS,
  LEARNING_LOOP,
  MEET_HUNTLO_FLOW,
  MODERN_HIRING,
  TRADITIONAL_SCREENING,
} from "@/lib/aiScreeningAgent";

type AiScreeningAgentStoryProps = {
  reduceMotion: boolean;
};

export function AiScreeningAgentStory({ reduceMotion }: AiScreeningAgentStoryProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Understanding driven
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Hiring isn&apos;t becoming screening driven.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Great hiring decisions require more than candidate evaluations. They require hiring
              intelligence. Modern recruiting isn&apos;t becoming filtering driven. It&apos;s
              becoming understanding driven.
            </p>
          </div>

          <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {EVALUATE_DIMENSIONS.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-4 py-3.5 text-sm font-medium text-[#141b2b]"
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
              Context over filters
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Great hiring decisions require context.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              The future belongs to understanding candidates — not filtering candidates.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/12 bg-white/5 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/50">
                Traditional screening
              </h3>
              <ol className="mt-4 space-y-2">
                {TRADITIONAL_SCREENING.map((item, index) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/70">
                    <span className="text-[0.65rem] font-semibold tabular-nums text-white/40">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border border-[#0050cb]/40 bg-[#0050cb]/15 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
                Modern hiring
              </h3>
              <ol className="mt-4 space-y-2">
                {MODERN_HIRING.map((item, index) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white">
                    <span className="text-[0.65rem] font-semibold tabular-nums text-[#8eb0ff]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section
        id="hiring-decision-intelligence"
        className="scroll-mt-24 border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Meet Hiring Decision Intelligence
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Understanding before hiring decisions are made.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Modern recruiting shouldn&apos;t ask which candidate to reject. It should ask which
              candidate creates the greatest confidence for this hiring outcome.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2 md:gap-3">
            {DECISION_COMBINES.map((item, index) => (
              <div key={item} className="flex items-center gap-2 md:gap-3">
                <span className="rounded-2xl border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-3 text-sm font-semibold text-[#141b2b]">
                  {item}
                </span>
                {index < DECISION_COMBINES.length - 1 ? (
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
              Continuous learning
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Great hiring decisions never stop learning.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Everything continuously improving hiring outcomes.
            </p>
          </div>

          <ol className="mt-10 space-y-3">
            {LEARNING_LOOP.map((item, index) => (
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
              More than candidate screening.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Recruiters gain intelligent hiring decisions designed around better business outcomes.
            </p>
          </div>

          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MEET_HUNTLO_FLOW.map((item, index) => (
              <li
                key={item}
                className={`rounded-2xl border px-4 py-5 ${
                  item === "AI Screening Agents" || item === "Hiring Decision Intelligence"
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
              href="/screening-engine"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Hiring Readiness
            </Link>
            <span className="text-[#c3c6d6]" aria-hidden>
              ·
            </span>
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
              href="/ai-recruiting-agent"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              AI Recruiting Agents
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
