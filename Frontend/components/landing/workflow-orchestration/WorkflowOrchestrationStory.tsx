"use client";

import { motion } from "motion/react";

import {
  AUTOMATION_DOESNT_SOLVE,
  AUTOMATION_SOLVES,
  COMPLEXITY_CHAIN,
  MEET_HUNTLO_FLOW,
  ORCHESTRATION_TRAITS,
  UNDERSTANDS_BEFORE_NEXT,
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
              Complexity
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Hiring isn&apos;t broken. Workflow complexity is.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Today&apos;s hiring teams continuously manage discovery, communication, pipelines,
              interviews, analytics, and outcomes — often at the same time.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-2" role="list">
            {COMPLEXITY_CHAIN.map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center gap-2" role="listitem">
                <span className="rounded-full border border-[#c3c6d6]/40 bg-[#f7f8fc] px-3.5 py-2 text-sm text-[#141b2b]">
                  {item}
                </span>
                {index < COMPLEXITY_CHAIN.length - 1 ? (
                  <span className="hidden text-[#0050cb]/40 sm:inline" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-6 rounded-3xl border border-[#c3c6d6]/30 bg-[#f7f8fc] p-6 md:grid-cols-2 md:p-8">
            <p className="text-lg font-semibold text-[#141b2b] md:text-xl">
              Every action creates another workflow. Hiring doesn&apos;t happen sequentially
              anymore. It happens simultaneously.
            </p>
            <p className="text-base leading-relaxed text-[#434654] md:text-lg">
              Modern hiring requires intelligent orchestration rather than disconnected automation.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Beyond automation
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Why automation isn&apos;t enough anymore.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/12 bg-white/[0.05] p-6 md:p-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/50">
                Automation solves
              </h3>
              <ul className="mt-5 space-y-2">
                {AUTOMATION_SOLVES.map((item) => (
                  <li key={item} className="text-sm text-white/70">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-[#0050cb]/40 bg-[#0050cb]/15 p-6 md:p-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
                Automation doesn&apos;t solve
              </h3>
              <ul className="mt-5 space-y-2">
                {AUTOMATION_DOESNT_SOLVE.map((item) => (
                  <li key={item} className="text-sm font-medium text-white">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 max-w-3xl">
            <p className="text-lg font-semibold text-white md:text-xl">
              Workflow orchestration understands what happened, why it happened, and what should
              happen next.
            </p>
            <p className="mt-3 text-base text-white/65 md:text-lg">That difference changes everything.</p>
          </div>
        </div>
      </section>

      <section
        id="workflow-intelligence"
        className="scroll-mt-24 border-b border-[#c3c6d6]/30 bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Category shift
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              The rise of intelligent workflow orchestration
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              We believe hiring workflows are becoming dynamic, intelligent, adaptive, connected,
              context-aware, and outcome-driven.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2 md:gap-3">
            {ORCHESTRATION_TRAITS.map((item, index) => (
              <div key={item} className="flex items-center gap-2 md:gap-3">
                <span className="rounded-full border border-[#0050cb]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#141b2b]">
                  {item}
                </span>
                {index < ORCHESTRATION_TRAITS.length - 1 ? (
                  <span className="text-[#0050cb]/50" aria-hidden>
                    +
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <p className="mt-10 text-base font-semibold text-[#141b2b] md:text-lg">
            The future workflow should continuously understand these signals before deciding what
            happens next:
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {UNDERSTANDS_BEFORE_NEXT.map((item, index) => (
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
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-3xl border border-[#c3c6d6]/30 bg-[#070d1a] px-6 py-12 text-white md:px-12 md:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Meet Huntlo
            </p>
            <h2 className="mt-4 max-w-3xl text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              One intelligent orchestration layer.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/65 md:text-lg">
              Rather than recruiters managing workflows manually, Huntlo intelligently coordinates
              them continuously.
            </p>
            <div className="mt-8 overflow-x-auto pb-2">
              <ol className="flex min-w-max items-stretch gap-0">
                {MEET_HUNTLO_FLOW.map((item, index) => (
                  <li key={item} className="flex items-center">
                    <div className="min-w-[9.5rem] rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-4 text-center">
                      <span className="text-sm font-semibold leading-snug text-white/90">{item}</span>
                    </div>
                    {index < MEET_HUNTLO_FLOW.length - 1 ? (
                      <span className="mx-1.5 text-[#8eb0ff]/50" aria-hidden>
                        →
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
