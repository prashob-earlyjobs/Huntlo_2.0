"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  AGENT_ENSEMBLE,
  AGENT_OUTCOMES,
  CANDIDATE_REMEMBERS,
  ENTERPRISE_COORDINATES,
  ENTERPRISE_MANAGES,
  LEARNING_SIGNALS,
  ORCHESTRATION_IMPROVES,
} from "@/lib/workflowOrchestration";

type WorkflowOrchestrationSystemsProps = {
  reduceMotion: boolean;
};

export function WorkflowOrchestrationSystems({
  reduceMotion,
}: WorkflowOrchestrationSystemsProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Continuous learning
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Intelligent workflows never stop learning.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Every interaction continuously improves workflow intelligence — from candidate
              behaviour to hiring decisions.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LEARNING_SIGNALS.map((item, index) => (
              <motion.div
                key={item}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduceMotion ? 0 : index * 0.04, duration: 0.3 }}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-white px-4 py-5"
              >
                <p className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#141b2b]">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Agent collaboration
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              AI recruiting agents need workflow intelligence.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              AI agents operating independently create isolated automation. AI agents operating
              together create intelligent orchestration.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2 md:gap-3">
            {AGENT_ENSEMBLE.map((agent, index) => (
              <div key={agent.name} className="flex items-center gap-2 md:gap-3">
                <Link
                  href={agent.href}
                  className="rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-[#0050cb]/45"
                >
                  {agent.name}
                </Link>
                {index < AGENT_ENSEMBLE.length - 1 ? (
                  <span className="text-[#8eb0ff]/60" aria-hidden>
                    +
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <span className="text-[#8eb0ff]" aria-hidden>
              ↓
            </span>
            <div className="flex flex-wrap gap-2">
              {AGENT_OUTCOMES.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#0050cb]/45 bg-[#0050cb]/20 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-8 text-base font-semibold text-white md:text-lg">
            Everything continuously collaborating.
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Experience layer
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Candidate experiences are workflows too.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Candidates don&apos;t remember your recruiting stack. They remember how the journey
              felt.
            </p>
            <ul className="mt-6 space-y-2">
              {CANDIDATE_REMEMBERS.map((item) => (
                <li key={item} className="text-sm font-medium text-[#141b2b]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-[#0050cb]/20 bg-[#f1f3ff] p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
              Orchestration improves
            </p>
            <ul className="mt-5 space-y-3">
              {ORCHESTRATION_IMPROVES.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-[#c3c6d6]/30 bg-white px-4 py-3 text-base font-semibold text-[#141b2b]"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-[#434654]">
              Simultaneously — not as separate afterthoughts.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#c3c6d6]/30 bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Enterprise coordination
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Enterprise hiring requires intelligent coordination.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Large hiring teams manage recruiters, workflows, candidates, stakeholders, priorities,
              pipelines, and hiring intelligence at once.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <ul className="grid gap-2 sm:grid-cols-2">
              {ENTERPRISE_MANAGES.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-[#c3c6d6]/35 bg-white px-4 py-3 text-sm text-[#141b2b]"
                >
                  {item}
                </li>
              ))}
            </ul>
            <div className="rounded-3xl border border-[#c3c6d6]/35 bg-[#070d1a] p-6 text-white md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
                Orchestration coordinates
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {ENTERPRISE_COORDINATES.map((item, index) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-white/90">
                      {item}
                    </span>
                    {index < ENTERPRISE_COORDINATES.length - 1 ? (
                      <span className="text-[#8eb0ff]/50" aria-hidden>
                        +
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm text-white/65">Through one intelligent layer.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
