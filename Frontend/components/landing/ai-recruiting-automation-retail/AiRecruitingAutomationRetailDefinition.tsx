"use client";

import { motion } from "motion/react";

type AiRecruitingAutomationRetailDefinitionProps = {
  reduceMotion: boolean;
};

export function AiRecruitingAutomationRetailDefinition({
  reduceMotion,
}: AiRecruitingAutomationRetailDefinitionProps) {
  return (
    <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            What Is AI Retail Recruiting Automation?
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            AI retail recruiting automation refers to using AI-assisted
            workflows to support repetitive recruiting activities. These may
            include candidate engagement, response organization, scheduling
            coordination and routine follow-up management. Agentic workflow
            concepts can extend the process by interpreting relevant candidate
            events and identifying permitted next actions.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            For example, a candidate asking about a different store location
            requires a different response from someone confirming interview
            attendance. An appropriately designed workflow should recognize
            the distinction and route the situation correctly. Actual
            capabilities depend on the software implementation and connected
            systems.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {[
            {
              title: "Shared process standards",
              detail:
                "Establish common recruitment steps while allowing approved store-specific information and actions.",
            },
            {
              title: "Store-level requirements",
              detail:
                "Evening availability, department-specific roles and seasonal hiring needs are reflected in routing.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6 md:p-8"
            >
              <h3 className="text-lg font-semibold text-[#141b2b]">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#434654]">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
