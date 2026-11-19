"use client";

import { motion } from "motion/react";

type AiRecruitingOperationsAutomationHumanOversightProps = {
  reduceMotion: boolean;
};

export function AiRecruitingOperationsAutomationHumanOversight({
  reduceMotion,
}: AiRecruitingOperationsAutomationHumanOversightProps) {
  return (
    <section
      id="where-agentic-ai-can-add-value"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Where Agentic AI Can Add Value
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Agentic AI introduces the possibility of coordinating multiple
            permitted actions based on relevant context. A candidate response
            might require information retrieval, workflow updates, or recruiter
            review. A scheduling conflict might trigger an exception-handling
            process. A closed vacancy might require changes to active
            communication workflows. The objective is to make operations more
            responsive without creating uncontrolled automation.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Recruiters and administrators need to understand what actions occurred
            and why.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.1 }}
          className="mt-16 grid gap-6 md:grid-cols-2"
        >
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">Event Detection</h3>
            <p className="mt-2 text-base text-[#434654]">
              Identify candidate responses, scheduling changes, and vacancy
              updates as they occur.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">Contextual Routing</h3>
            <p className="mt-2 text-base text-[#434654]">
              Distinguish response types and route to appropriate workflows.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">Exception Handling</h3>
            <p className="mt-2 text-base text-[#434654]">
              Escalate missing info, ambiguous responses, and failed actions.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">Action Transparency</h3>
            <p className="mt-2 text-base text-[#434654]">
              Make automated actions visible and auditable to recruiters and
              administrators.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.15 }}
          className="mt-16"
        >
          <h3 className="text-xl font-semibold text-[#141b2b]">
            Governance Is Part of Good Automation
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Recruiting operations involve personal information and decisions that
            can affect employment opportunities. Organizations need appropriate
            data access controls, candidate communication policies, auditability,
            and human oversight. AI-generated interpretations should not become
            unquestioned employment decisions.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Automated workflows must also respect applicable privacy, consent, and
            employment requirements. Operational efficiency is valuable only when
            it remains accountable.
          </p>
        </motion.div>
      </div>
    </section>
  );
}