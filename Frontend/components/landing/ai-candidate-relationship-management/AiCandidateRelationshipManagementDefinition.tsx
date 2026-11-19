"use client";

import { motion } from "motion/react";

import {
  CRM_DEFINITION,
  FRAGMENTATION_CAUSES,
  AI_CAPABILITIES,
  CRM_VS_ATS,
} from "@/lib/aiCandidateRelationshipManagement";

type AiCandidateRelationshipManagementDefinitionProps = {
  reduceMotion: boolean;
};

export function AiCandidateRelationshipManagementDefinition({
  reduceMotion,
}: AiCandidateRelationshipManagementDefinitionProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="definition">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            What is candidate relationship management?
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            The process of organizing and maintaining relationships with potential candidates over time.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            It may involve candidate profiles, communication history, preferences,
            previous opportunities, and future engagement. The purpose is to help
            recruiters understand who they have spoken with and how to communicate
            appropriately when a relevant opportunity arises.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CRM_DEFINITION.map((item, index) => (
            <motion.div
              key={item}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.06 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
            >
              <p className="text-base leading-relaxed text-[#434654]">{item}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Why recruiting relationships become fragmented
          </p>
          <h3 className="mt-4 text-[1.25rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[1.5rem]">
            Teams operate around active vacancies. When a position closes, attention shifts.
          </h3>
          <div className="mt-6 space-y-4">
            {FRAGMENTATION_CAUSES.map((cause, index) => (
              <motion.div
                key={cause}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05 }}
                className="flex items-start gap-3 rounded-xl border border-[#c3c6d6]/30 bg-white p-4"
              >
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f5ff] text-[#0050cb] text-sm font-semibold">
                  {index + 1}
                </span>
                <p className="text-base leading-relaxed text-[#434654]">{cause}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-16 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Where AI fits into candidate relationship management
          </p>
          <h3 className="mt-4 text-[1.25rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[1.5rem]">
            AI-assisted workflows help organize context, identify follow-ups, and coordinate engagement.
          </h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {AI_CAPABILITIES.map((capability, index) => (
              <motion.div
                key={capability}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05 }}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6"
              >
                <p className="text-base leading-relaxed text-[#434654]">{capability}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-16 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Candidate CRM is not the same as an ATS
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#c3c6d6]/40">
                  <th className="pb-3 font-semibold text-[#141b2b]">Aspect</th>
                  <th className="pb-3 font-semibold text-[#141b2b]">Recruiting CRM</th>
                  <th className="pb-3 font-semibold text-[#141b2b]">ATS</th>
                </tr>
              </thead>
              <tbody>
                {CRM_VS_ATS.map((row, index) => (
                  <tr key={row.aspect} className={`border-b border-[#c3c6d6]/20 ${index === CRM_VS_ATS.length - 1 ? "border-b-0" : ""}`}>
                    <td className="py-4 font-medium text-[#141b2b]">{row.aspect}</td>
                    <td className="py-4 text-[#434654]">{row.crm}</td>
                    <td className="py-4 text-[#434654]">{row.ats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm text-[#434654]">
              The two approaches can complement each other. An ATS may show which
              roles a candidate previously applied for. A recruiting CRM may help
              organize broader relationship information and future engagement preferences.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}