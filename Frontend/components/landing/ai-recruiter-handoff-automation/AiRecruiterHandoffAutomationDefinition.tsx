"use client";

import { motion } from "motion/react";

type AiRecruiterHandoffAutomationDefinitionProps = {
  reduceMotion: boolean;
};

const POTENTIAL_APPLICATIONS = [
  "Organizing conversation context for the next owner",
  "Identifying pending actions and commitments",
  "Coordinating workflow ownership between authorized people",
] as const;

export function AiRecruiterHandoffAutomationDefinition({
  reduceMotion,
}: AiRecruiterHandoffAutomationDefinitionProps) {
  return (
    <section
      id="what-is-ai-recruiter-handoff-automation"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Definition
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
              What Is AI Recruiter Handoff Automation?
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#434654] md:text-lg">
              AI recruiter handoff automation refers to using AI-assisted
              workflows to support the transfer of relevant recruitment
              information and tasks between authorized team members.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              An agentic workflow may be designed to recognize when a candidate
              reaches a stage requiring another team member. It could then
              initiate an approved handoff process. The exact capabilities depend
              on verified software functionality and system permissions.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Automated summaries or interpretations should remain reviewable
              because they may omit or misrepresent important details.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.1 }}
            className="rounded-2xl border border-[#d7e3f4] bg-[#fbfcfe] p-6 md:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a93a8]">
              Potential applications
            </p>
            <ul className="mt-5 space-y-3">
              {POTENTIAL_APPLICATIONS.map((item, index) => (
                <motion.li
                  key={item}
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: reduceMotion ? 0 : index * 0.07,
                  }}
                  className="flex items-start gap-3 rounded-xl border border-[#e8eef7] bg-white p-4"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f0f5ff] text-[0.6rem] font-bold text-[#0050cb]">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-[#434654]">{item}</p>
                </motion.li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-[#8a93a8]">
              Conceptual scope, not a confirmed feature list. Verify capabilities
              before describing them as available.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
