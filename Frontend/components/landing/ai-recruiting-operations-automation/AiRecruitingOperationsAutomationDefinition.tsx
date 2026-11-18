"use client";

import { motion } from "motion/react";

type AiRecruitingOperationsAutomationDefinitionProps = {
  reduceMotion: boolean;
};

export function AiRecruitingOperationsAutomationDefinition({
  reduceMotion,
}: AiRecruitingOperationsAutomationDefinitionProps) {
  return (
    <section
      id="what-is-recruiting-operations-automation"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            What Is Recruiting Operations Automation?
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Recruiting operations automation refers to the use of software to
            support recurring operational activities across recruitment processes.
            These activities may include candidate communication, workflow updates,
            scheduling coordination, response handling, and exception management.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            AI-assisted orchestration can add contextual interpretation to selected
            events. For example, a candidate requesting a schedule change may
            require a different workflow from someone withdrawing from the process.
            The system should distinguish those situations and initiate only the
            actions permitted by the organization.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            The exact level of automation depends on verified product capabilities
            and connected systems.
          </p>
        </motion.div>
      </div>
    </section>
  );
}