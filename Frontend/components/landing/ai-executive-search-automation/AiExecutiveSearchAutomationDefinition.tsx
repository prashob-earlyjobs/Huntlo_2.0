"use client";

import { motion } from "motion/react";

type AiExecutiveSearchAutomationDefinitionProps = {
  reduceMotion: boolean;
};

export function AiExecutiveSearchAutomationDefinition({
  reduceMotion,
}: AiExecutiveSearchAutomationDefinitionProps) {
  return (
    <section
      id="what-is-ai-executive-search-automation"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            What Is AI Executive Search Automation?
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            AI executive search automation refers to using AI-assisted tools and
            workflows to support selected operational activities within executive
            recruitment. Potential applications include research organization,
            outreach preparation, response tracking, follow-up coordination, and
            interview operations.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Agentic workflows may help coordinate permitted actions when relevant
            events occur. For example, a candidate requesting additional
            information may need a consultant-approved response. A scheduling
            request may require coordination. A confidential question about the
            client or role may require direct consultant involvement. These
            situations should not be treated identically.
          </p>
        </motion.div>
      </div>
    </section>
  );
}