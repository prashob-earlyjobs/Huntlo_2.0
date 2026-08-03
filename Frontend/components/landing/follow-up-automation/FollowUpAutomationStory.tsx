"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  CANDIDATES_REMEMBER,
  MEET_HUNTLO_FLOW,
  MODERN_FLOW,
  MOMENTUM_COMBINES,
  MOMENTUM_STRUGGLES,
  TRADITIONAL_FLOW,
} from "@/lib/followUpAutomation";

type FollowUpAutomationStoryProps = {
  reduceMotion: boolean;
};

export function FollowUpAutomationStory({ reduceMotion }: FollowUpAutomationStoryProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              No pause between stages
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Great hiring doesn&apos;t pause between stages.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Modern hiring should move from discovery to outcomes without losing momentum.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#434654]">
                Traditional recruiting
              </h3>
              <ol className="mt-4 space-y-2">
                {TRADITIONAL_FLOW.map((item, index) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-[#434654]">
                    <span className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]/60">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border border-[#0050cb]/30 bg-[#070d1a] p-6 text-white">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
                Modern hiring
              </h3>
              <ol className="mt-4 space-y-2">
                {MODERN_FLOW.map((item, index) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/85">
                    <span className="text-[0.65rem] font-semibold tabular-nums text-[#8eb0ff]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
              <p className="mt-5 text-sm font-semibold text-[#8eb0ff]">Without losing momentum.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Candidate momentum
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Hiring velocity depends on candidate momentum.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              The problem isn&apos;t follow-ups. It&apos;s hiring momentum. Teams shouldn&apos;t ask
              whether another reminder was sent. They should ask which candidate interaction should
              happen next.
            </p>
          </div>

          <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {MOMENTUM_STRUGGLES.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-white/12 bg-white/5 px-4 py-3.5 text-sm font-medium text-white/90"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="hiring-momentum"
        className="scroll-mt-24 border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Meet Hiring Momentum Intelligence
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Understanding before hiring workflows slow down.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Continuously connected context, conversations, readiness, interviews, engagement,
              priorities, and velocity.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2 md:gap-3">
            {MOMENTUM_COMBINES.map((item, index) => (
              <div key={item} className="flex items-center gap-2 md:gap-3">
                <span className="rounded-2xl border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-3 text-sm font-semibold text-[#141b2b]">
                  {item}
                </span>
                {index < MOMENTUM_COMBINES.length - 1 ? (
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
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Experience driven
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Great hiring experiences never feel fragmented.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Candidates don&apos;t remember how many reminders recruiters sent. Modern recruiting
              isn&apos;t becoming reminder driven. It&apos;s becoming experience driven.
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
      </section>

      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Meet Huntlo
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              More than follow-up automation.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Recruiters gain intelligent hiring workflows designed around maintaining candidate
              momentum.
            </p>
          </div>

          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MEET_HUNTLO_FLOW.map((item, index) => (
              <motion.li
                key={item}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduceMotion ? 0 : index * 0.04, duration: 0.3 }}
                className={`rounded-2xl border px-4 py-5 ${
                  item === "Hiring Momentum Intelligence"
                    ? "border-[#0050cb] bg-[#0050cb] text-white"
                    : "border-[#c3c6d6]/35 bg-[#f7f8fc] text-[#141b2b]"
                }`}
              >
                <span className="text-[0.65rem] font-semibold tabular-nums opacity-60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-sm font-semibold leading-snug">{item}</p>
              </motion.li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/candidate-engagement"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Candidate Engagement
            </Link>
            <span className="text-[#c3c6d6]" aria-hidden>
              ·
            </span>
            <Link
              href="/interview-scheduling"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Scheduling Intelligence
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
