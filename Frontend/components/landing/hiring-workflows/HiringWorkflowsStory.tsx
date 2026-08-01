"use client";

import { motion } from "motion/react";

import {
  INTELLIGENT_FLOW,
  TRADITIONAL_PROBLEMS,
  TRADITIONAL_WORKFLOW,
} from "@/lib/hiringWorkflows";

type HiringWorkflowsStoryProps = {
  reduceMotion: boolean;
};

export function HiringWorkflowsStory({ reduceMotion }: HiringWorkflowsStoryProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Outdated by design
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Hiring workflows were never designed for modern hiring.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Modern hiring requires intelligence — not operational complexity.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#434654]">
                Today&apos;s recruiting workflows
              </h3>
              <ol className="mt-4 space-y-2">
                {TRADITIONAL_WORKFLOW.map((item, index) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-[#434654]">
                    <span className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]/50">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border border-[#0050cb]/25 bg-[#0050cb]/8 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
                The problem
              </h3>
              <ul className="mt-4 space-y-2">
                {TRADITIONAL_PROBLEMS.map((item) => (
                  <li key={item} className="text-sm font-medium text-[#141b2b]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        id="hiring-workflows"
        className="scroll-mt-24 bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Introducing
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Introducing Intelligent Hiring Workflows™
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Everything continuously improving itself — without recruiters becoming workflow
              managers.
            </p>
          </div>

          <ol className="mt-10 space-y-3">
            {INTELLIGENT_FLOW.map((item, index) => (
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
