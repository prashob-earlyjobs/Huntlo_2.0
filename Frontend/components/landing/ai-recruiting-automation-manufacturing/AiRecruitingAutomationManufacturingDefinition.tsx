"use client";

import { motion } from "motion/react";

type AiRecruitingAutomationManufacturingDefinitionProps = {
  reduceMotion: boolean;
};

export function AiRecruitingAutomationManufacturingDefinition({
  reduceMotion,
}: AiRecruitingAutomationManufacturingDefinitionProps) {
  return (
    <section
      id="what-is-ai-manufacturing-recruiting-automation"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            What Is AI Manufacturing Recruiting Automation?
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            AI manufacturing recruiting automation refers to using software and
            AI-assisted workflows to support recurring recruitment activities in
            manufacturing environments. Potential applications include candidate
            engagement, response organization, interview coordination, and
            follow-up management.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Agentic workflow concepts can extend this approach by interpreting
            relevant events and coordinating permitted next steps. For example, a
            candidate asking whether a position involves night shifts requires
            different handling from someone confirming interview availability. An
            appropriately designed workflow should distinguish those situations and
            route them correctly.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            The exact automation possible depends on verified system capabilities,
            permissions, and integrations.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.1 }}
          className="mt-16"
        >
          <h3 className="text-xl font-semibold text-[#141b2b]">
            Build Workflows Around the Plant, Not Just the Job Title
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Two facilities may hire for the same role but have different
            operational expectations. One machine operator position may involve
            rotating shifts. Another may require a specific production environment.
            A maintenance technician role may involve specialized equipment. These
            differences should appear in the recruitment workflow.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Recruiters need a clear understanding of essential job requirements
            before outreach begins. Candidate communications should reflect those
            requirements accurately. Automation should support consistency without
            eliminating necessary role-specific judgment.
          </p>
        </motion.div>
      </div>
    </section>
  );
}