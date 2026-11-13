"use client";

import { motion } from "motion/react";

import {
  COMPLEXITY_RESULTS,
  COMPLEXITY_STACK,
  ORCHESTRATION_FLOW,
} from "@/lib/workflowOrchestration";

type WorkflowOrchestrationStoryProps = {
  reduceMotion: boolean;
};

export function WorkflowOrchestrationStory({ reduceMotion }: WorkflowOrchestrationStoryProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Rising complexity
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Hiring has become increasingly complex.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Hiring became workflow heavy. It&apos;s becoming intelligence native.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2 md:gap-3">
            {COMPLEXITY_STACK.map((item, index) => (
              <div key={item} className="flex items-center gap-2 md:gap-3">
                <span className="rounded-2xl border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-3 text-sm font-medium text-[#141b2b]">
                  {item}
                </span>
                {index < COMPLEXITY_STACK.length - 1 ? (
                  <span className="text-[#0050cb]/40" aria-hidden>
                    +
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
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
        id="workflow-intelligence"
        className="scroll-mt-24 bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Introducing
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Introducing Hiring Intelligence Orchestration™
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Everything intelligently moving forward. No managing workflows. No coordinating
              disconnected systems. Everything continuously improving.
            </p>
          </div>

          <ol className="mt-10 space-y-3">
            {ORCHESTRATION_FLOW.map((item, index) => (
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
