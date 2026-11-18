"use client";

import { motion } from "motion/react";

import { DEFINITION_POINTS } from "@/lib/aiContractStaffingAutomation";

type AiContractStaffingAutomationDefinitionProps = {
  reduceMotion: boolean;
};

export function AiContractStaffingAutomationDefinition({
  reduceMotion,
}: AiContractStaffingAutomationDefinitionProps) {
  return (
    <section
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="definition"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            What is AI contract staffing automation?
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            AI-assisted software workflows that support recruiting candidates for
            temporary or contract assignments.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            AI contract staffing automation refers to using AI-assisted software
            workflows to support selected activities involved in recruiting
            candidates for temporary or contract assignments. Potential
            applications include candidate outreach, availability checks, response
            organization, follow-up coordination, and interview operations.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Agentic workflow concepts can help interpret relevant events and
            coordinate permitted next actions. For example, a candidate who
            becomes available next month requires different handling from someone
            who can begin immediately. A candidate requesting assignment details
            may need an approved information response. Someone declining further
            contact should have that preference respected.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Specific functionality depends on the platform&apos;s verified
            capabilities and integrations.
          </p>
        </div>

        <div className="mt-10 space-y-5 max-w-3xl">
          {DEFINITION_POINTS.map((point, index) => (
            <motion.div
              key={point.title}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.06 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
            >
              <h3 className="text-lg font-semibold text-[#141b2b]">{point.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-[#434654]">
                {point.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}