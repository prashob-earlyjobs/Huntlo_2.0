"use client";

import { motion } from "motion/react";

import {
  AGENTIC_SCENARIOS,
  GOVERNANCE_PRINCIPLES,
} from "@/lib/aiRecruitingWorkflowIntegration";

type AiRecruitingWorkflowIntegrationGovernanceProps = {
  reduceMotion: boolean;
};

export function AiRecruitingWorkflowIntegrationGovernance({
  reduceMotion,
}: AiRecruitingWorkflowIntegrationGovernanceProps) {
  return (
    <section
      id="agentic-coordination-and-governance"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Where Agentic Workflows Can Add Value
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Agentic automation may help coordinate actions across systems when
            the workflow requires context. The pattern is consistent: an event
            occurs, the system interprets what it may mean, and only permitted
            actions follow.
          </p>
        </motion.div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white">
          <div className="hidden grid-cols-[1.1fr_1.2fr_0.9fr] gap-4 border-b border-[#e8eef7] bg-[#fbfcfe] px-6 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8] md:grid">
            <span>Event</span>
            <span>Coordination</span>
            <span>Human boundary</span>
          </div>
          {AGENTIC_SCENARIOS.map((scenario, index) => (
            <motion.div
              key={scenario.event}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.35,
                delay: reduceMotion ? 0 : index * 0.06,
              }}
              className="grid gap-3 border-b border-[#f0f3f9] px-6 py-5 last:border-b-0 md:grid-cols-[1.1fr_1.2fr_0.9fr] md:items-start md:gap-4"
            >
              <p className="text-sm font-semibold text-[#141b2b]">
                {scenario.event}
              </p>
              <p className="text-sm leading-relaxed text-[#5b6478]">
                {scenario.coordination}
              </p>
              <p className="text-sm leading-relaxed text-[#0050cb]">
                {scenario.boundary}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.08 }}
          className="mt-16"
        >
          <h3 className="text-xl font-semibold tracking-tight text-[#141b2b] md:text-2xl">
            Data Quality and Governance Matter
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Connected systems can amplify both useful information and errors. If a
            candidate record contains outdated information, an automated workflow
            may act on it unless appropriate safeguards exist. Organizations
            should establish data ownership, access controls, logging, and
            exception handling.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Privacy and employment requirements must also be considered. A
            reliable integration strategy needs transparency about which system
            contains authoritative information.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GOVERNANCE_PRINCIPLES.map((principle, index) => (
            <motion.div
              key={principle.title}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: reduceMotion ? 0 : index * 0.05,
              }}
              className="rounded-2xl border border-[#d7e3f4] bg-white p-6"
            >
              <h4 className="text-sm font-semibold text-[#141b2b]">
                {principle.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">
                {principle.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
