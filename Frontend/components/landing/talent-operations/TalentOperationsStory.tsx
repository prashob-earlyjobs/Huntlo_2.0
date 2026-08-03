"use client";

import { motion } from "motion/react";

import {
  COMPLEXITY_LAYERS,
  COMPLEXITY_RESULTS,
  OPERATIONS_FLOW,
} from "@/lib/talentOperations";

type TalentOperationsStoryProps = {
  reduceMotion: boolean;
};

export function TalentOperationsStory({ reduceMotion }: TalentOperationsStoryProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Operational complexity
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Hiring operations have become increasingly complex.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Modern hiring requires intelligence — not operational overhead.
            </p>
          </div>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
            Today&apos;s organizations manage
          </p>
          <ul className="mt-4 flex flex-wrap items-center gap-2">
            {COMPLEXITY_LAYERS.map((item, index) => (
              <li key={item} className="flex items-center gap-2">
                <span className="rounded-xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-3.5 py-2.5 text-sm font-medium text-[#141b2b]">
                  {item}
                </span>
                {index < COMPLEXITY_LAYERS.length - 1 ? (
                  <span className="text-[#0050cb]/50" aria-hidden>
                    +
                  </span>
                ) : null}
              </li>
            ))}
          </ul>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-[#434654]">
            Resulting in
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {COMPLEXITY_RESULTS.map((item) => (
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
        id="hiring-operations"
        className="scroll-mt-24 bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Introducing
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Introducing Hiring Operations Intelligence™
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Everything continuously improving — without organizations continuously managing
              operational complexity.
            </p>
          </div>

          <ol className="mt-10 space-y-3">
            {OPERATIONS_FLOW.map((item, index) => (
              <motion.li
                key={item}
                initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
              >
                <span className="text-[0.65rem] font-semibold tabular-nums text-[#8eb0ff]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-semibold text-white sm:text-base">{item}</span>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
