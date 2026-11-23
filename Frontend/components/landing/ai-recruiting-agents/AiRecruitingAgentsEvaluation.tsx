"use client";

import { motion } from "motion/react";

import { EVALUATION_QUESTIONS } from "@/lib/aiRecruitingAgents";

type AiRecruitingAgentsEvaluationProps = {
  reduceMotion: boolean;
};

export function AiRecruitingAgentsEvaluation({
  reduceMotion,
}: AiRecruitingAgentsEvaluationProps) {
  return (
    <section className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="evaluation">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            How to evaluate AI recruiting agents
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Start with the workflow, not the demonstration.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Ask what information the agent needs, what systems it can access and
            which actions it can perform. Understand how errors are handled.
            Review whether recruiters can inspect the history of actions and
            intervene when necessary.
          </p>
        </div>

        <div className="mt-10 space-y-4 max-w-3xl">
          {EVALUATION_QUESTIONS.map((question, index) => (
            <motion.li
              key={index}
              initial={reduceMotion ? false : { opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="flex items-start gap-4 rounded-2xl border border-[#c3c6d6]/30 bg-[#f7f8fc] p-5"
            >
              <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#c3c6d6]/40 bg-white text-[#434654]">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="text-base leading-relaxed text-[#434654]">{question}</span>
            </motion.li>
          ))}
        </div>
      </div>
    </section>
  );
}
