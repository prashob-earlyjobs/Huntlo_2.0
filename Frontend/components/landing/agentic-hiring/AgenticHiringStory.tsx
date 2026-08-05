"use client";

import { motion } from "motion/react";

import {
  AGENTIC_DOES,
  HUMAN_AI_EQUATION,
  SOFTWARE_STACK,
  STILL_STRUGGLE,
} from "@/lib/agenticHiring";

type AgenticHiringStoryProps = {
  reduceMotion: boolean;
};

export function AgenticHiringStory({ reduceMotion }: AgenticHiringStoryProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              The unfinished shift
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Recruiting changed. Hiring didn&apos;t.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              The problem isn&apos;t talent. The problem is hiring infrastructure.
            </p>
          </div>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
            Over the last twenty years we built
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2 md:gap-3">
            {SOFTWARE_STACK.map((item, index) => (
              <div key={item} className="flex items-center gap-2 md:gap-3">
                <span className="rounded-2xl border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-3 text-sm font-medium text-[#141b2b]">
                  {item}
                </span>
                {index < SOFTWARE_STACK.length - 1 ? (
                  <span className="text-[#0050cb]/40" aria-hidden>
                    +
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
            Yet organizations still struggle with
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {STILL_STRUGGLE.map((item) => (
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

      <section
        id="agentic-hiring"
        className="scroll-mt-24 bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Category definition
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              What is Agentic Hiring™?
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Agentic Hiring™ is a new approach to hiring where intelligent systems continuously
              work alongside hiring teams — before recruiters ever need to intervene.
            </p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AGENTIC_DOES.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white/85"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-lg font-semibold text-white">
            Hiring continuously moves itself forward intelligently.
          </p>
        </div>
      </section>

      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Human + AI Hiring
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Future organizations won&apos;t choose humans or AI alone.
            </h2>
            <p className="mt-5 text-lg font-semibold text-[#141b2b] md:text-xl">
              They&apos;ll choose Human + AI Hiring.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2 md:gap-3">
            {HUMAN_AI_EQUATION.map((item, index) => (
              <motion.div
                key={item}
                className="flex items-center gap-2 md:gap-3"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduceMotion ? 0 : index * 0.05, duration: 0.35 }}
              >
                <span className="rounded-2xl border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-3 text-sm font-semibold text-[#141b2b]">
                  {item}
                </span>
                {index < HUMAN_AI_EQUATION.length - 1 ? (
                  <span className="text-[#0050cb]/50" aria-hidden>
                    +
                  </span>
                ) : null}
              </motion.div>
            ))}
            <span className="text-[#0050cb]/50" aria-hidden>
              →
            </span>
            <span className="rounded-2xl border border-[#0050cb] bg-[#0050cb] px-4 py-3 text-sm font-semibold text-white">
              Hiring Outcomes
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
