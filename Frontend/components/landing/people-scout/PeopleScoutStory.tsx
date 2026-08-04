"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  DISCOVERY_COMBINES,
  LEARNING_LOOP,
  MODERN_FLOW,
  TODAY_FLOW,
  UNDERSTANDING_NEEDS,
} from "@/lib/peopleScout";

type PeopleScoutStoryProps = {
  reduceMotion: boolean;
};

export function PeopleScoutStory({ reduceMotion }: PeopleScoutStoryProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Discovery is broken
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Talent discovery is broken.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Talent discovery shouldn&apos;t feel operational. It should feel intelligent.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#434654]">
                Today&apos;s recruiters spend their time
              </h3>
              <ol className="mt-4 space-y-2">
                {TODAY_FLOW.map((item, index) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-[#434654]">
                    <span className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]/50">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border border-[#0050cb]/30 bg-[#0050cb]/8 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
                Modern hiring should look like
              </h3>
              <ol className="mt-4 space-y-2">
                {MODERN_FLOW.map((item, index) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium text-[#141b2b]">
                    <span className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
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

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Understanding first
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Great recruiters don&apos;t find talent. They understand talent.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              People Scout continuously improves talent understanding — before hiring begins.
            </p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {UNDERSTANDING_NEEDS.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white/85"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="talent-discovery"
        className="scroll-mt-24 border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Meet Talent Discovery Intelligence
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Understanding before sourcing begins.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Modern recruiting shouldn&apos;t ask which profiles to search for. It should ask which
              talent to understand next.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2 md:gap-3">
            {DISCOVERY_COMBINES.map((item, index) => (
              <div key={item} className="flex items-center gap-2 md:gap-3">
                <span className="rounded-2xl border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-3 text-sm font-semibold text-[#141b2b]">
                  {item}
                </span>
                {index < DISCOVERY_COMBINES.length - 1 ? (
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
              Talent discovery never stops learning.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Everything continuously improving candidate discovery.
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

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/candidate-sourcing"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Candidate Discovery
            </Link>
            <span className="text-[#c3c6d6]" aria-hidden>
              ·
            </span>
            <Link
              href="/talent-intelligence"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Talent Intelligence
            </Link>
            <span className="text-[#c3c6d6]" aria-hidden>
              ·
            </span>
            <Link
              href="/ai-sourcing-agent"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              AI Discovery Intelligence
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
