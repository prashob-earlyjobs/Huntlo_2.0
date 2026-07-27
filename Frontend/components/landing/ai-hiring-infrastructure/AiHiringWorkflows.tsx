"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  AI_AGENTS,
  CANDIDATE_INTELLIGENCE_NEEDS,
  TALENT_INTELLIGENCE_TOPICS,
  WORKFLOW_ORCHESTRATION,
} from "@/lib/aiHiringInfrastructure";

type AiHiringWorkflowsProps = {
  reduceMotion: boolean;
};

export function AiHiringWorkflows({ reduceMotion }: AiHiringWorkflowsProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Beyond resumes
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Candidate intelligence
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Candidates are becoming more than resumes. Hiring teams increasingly need deeper
              context to prioritize the right people.
            </p>
            <ul className="mt-6 space-y-3">
              {CANDIDATE_INTELLIGENCE_NEEDS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 border-b border-[#c3c6d6]/25 pb-3 text-sm font-medium text-[#141b2b] last:border-b-0"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0050cb]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-base font-semibold text-[#141b2b] md:text-lg">
              The future belongs to candidate intelligence rather than candidate databases.
            </p>
            <Link
              href="/candidate-pool"
              className="mt-4 inline-flex text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Explore candidate pools
            </Link>
          </div>

          <div className="rounded-3xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Decision quality
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Talent intelligence
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              The best hiring decisions are intelligence problems — not search problems.
            </p>
            <p className="mt-4 text-sm font-semibold text-[#141b2b]">Understand before hiring begins:</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {TALENT_INTELLIGENCE_TOPICS.map((item) => (
                <p
                  key={item}
                  className="rounded-xl border border-[#c3c6d6]/30 bg-white px-3.5 py-3 text-sm text-[#434654]"
                >
                  {item}
                </p>
              ))}
            </div>
            <Link
              href="/people-scout"
              className="mt-6 inline-flex text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Explore People Scout
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Working alongside AI
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              AI recruiting agents
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              The future recruiter will work alongside specialized agents that remove repetitive
              work — so humans can focus on judgment, conversations, and hiring decisions.
            </p>
          </div>

          <ol className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {AI_AGENTS.map((agent, index) => (
              <motion.li
                key={agent.name}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduceMotion ? 0 : index * 0.05, duration: 0.35 }}
              >
                <Link
                  href={agent.href}
                  className="flex h-full items-center gap-4 rounded-2xl border border-[#c3c6d6]/40 bg-white px-5 py-4 transition-colors hover:border-[#0050cb]/35"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0050cb]/10 text-xs font-bold text-[#0050cb]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold text-[#141b2b] md:text-base">
                    {agent.name}
                  </span>
                </Link>
              </motion.li>
            ))}
          </ol>

          <p className="mt-8 max-w-3xl text-base font-semibold text-[#141b2b] md:text-lg">
            AI doesn&apos;t replace recruiters. It removes repetitive work so recruiters can focus on
            judgment, conversations, and hiring decisions.
          </p>
        </div>
      </section>

      <section className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Orchestration
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Workflow infrastructure
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Hiring isn&apos;t one workflow. It&apos;s hundreds of connected decisions happening
              simultaneously.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Huntlo helps orchestrate sourcing, outreach, screening, assessments, interviews,
              communication, follow-ups, analytics, and productivity through one connected
              infrastructure layer.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {WORKFLOW_ORCHESTRATION.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-2.5 text-sm font-medium text-[#141b2b] transition-colors hover:border-[#0050cb]/40 hover:text-[#0050cb]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
