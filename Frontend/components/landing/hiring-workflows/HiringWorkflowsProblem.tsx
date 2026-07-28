"use client";

import { motion } from "motion/react";

import {
  DISCONNECTED_RESULTS,
  OPERATIONAL_COMPLEXITY,
  WORKFLOW_IMPROVES,
  WORKFLOW_UNDERSTANDS,
} from "@/lib/hiringWorkflows";

type HiringWorkflowsProblemProps = {
  reduceMotion: boolean;
};

export function HiringWorkflowsProblem({ reduceMotion }: HiringWorkflowsProblemProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Operational reality
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Modern recruiting is operationally complex.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Recruiters don&apos;t just manage hiring. They manage hundreds of connected
              interactions happening simultaneously.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-2" role="list">
            {OPERATIONAL_COMPLEXITY.map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center gap-2" role="listitem">
                <span className="rounded-full border border-[#c3c6d6]/40 bg-[#f7f8fc] px-3.5 py-2 text-sm text-[#141b2b]">
                  {item}
                </span>
                {index < OPERATIONAL_COMPLEXITY.length - 1 ? (
                  <span className="hidden text-[#0050cb]/40 sm:inline" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-[#c3c6d6]/30 bg-[#f7f8fc] p-6 md:p-8">
            <p className="text-lg font-semibold text-[#141b2b] md:text-xl">
              The average hiring workflow isn&apos;t one process.
            </p>
            <p className="mt-3 text-base leading-relaxed text-[#434654] md:text-lg">
              It&apos;s hundreds of connected interactions happening simultaneously. Modern hiring
              deserves modern workflows.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Design problem
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              The problem isn&apos;t productivity. It&apos;s workflow design.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Hiring teams don&apos;t struggle because recruiters aren&apos;t productive. They
              struggle because workflows aren&apos;t connected.
            </p>
            <p className="mt-6 text-lg font-semibold text-white">
              Adding more software rarely solves disconnected workflows.
              <span className="mt-2 block text-[#8eb0ff]">Intelligent workflow design does.</span>
            </p>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {DISCONNECTED_RESULTS.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white/80"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-[#c3c6d6]/30 bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Category shift
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              The rise of intelligent hiring workflows
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              The next generation of recruiting platforms won&apos;t simply automate tasks.
              They&apos;ll understand context before workflows even begin.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {WORKFLOW_UNDERSTANDS.map((item, index) => (
              <motion.p
                key={item}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduceMotion ? 0 : index * 0.04, duration: 0.3 }}
                className="rounded-2xl border border-[#c3c6d6]/40 bg-white px-4 py-4 text-sm font-semibold text-[#141b2b]"
              >
                {item}
              </motion.p>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2 md:gap-3">
            {WORKFLOW_IMPROVES.map((item, index) => (
              <div key={item} className="flex items-center gap-2 md:gap-3">
                <span className="rounded-full border border-[#0050cb]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#141b2b]">
                  {item}
                </span>
                {index < WORKFLOW_IMPROVES.length - 1 ? (
                  <span className="text-[#0050cb]/50" aria-hidden>
                    +
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-3xl border border-[#c3c6d6]/30 bg-[#070d1a] px-6 py-12 text-white md:px-12 md:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Meet Huntlo
            </p>
            <h2 className="mt-4 max-w-3xl text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              One intelligent hiring workflow layer.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/65 md:text-lg">
              Huntlo brings candidate discovery, intelligence, AI recruiting agents, workflow
              orchestration, and recruiter productivity together through one connected layer.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/65 md:text-lg">
              Rather than managing disconnected processes, recruiters gain connected workflows
              designed around hiring outcomes.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
