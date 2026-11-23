"use client";

import { motion } from "motion/react";

import {
  WORKFLOW_VS_ANALYTICS,
  AI_ASSISTED_APPLICATIONS,
} from "@/lib/aiRecruitmentWorkflowIntelligence";

type AiRecruitmentWorkflowIntelligenceDefinitionProps = {
  reduceMotion: boolean;
};

export function AiRecruitmentWorkflowIntelligenceDefinition({
  reduceMotion,
}: AiRecruitmentWorkflowIntelligenceDefinitionProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="definition">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            What is recruitment workflow intelligence?
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Focus on the activities and handoffs that connect recruiting stages — not just pipeline counts.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Traditional reporting may show how many candidates are in a pipeline stage.
            Workflow intelligence asks what is happening inside that stage. Are candidates
            waiting for an action? Is a scheduling process repeatedly delayed? Are certain
            follow-ups requiring more manual effort than expected?
          </p>
        </div>

        <div className="mt-16 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Data visibility is not the same as operational understanding
          </p>
          <h3 className="mt-4 text-[1.25rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[1.5rem]">
            A dashboard shows status. Intelligence explains why work is stuck.
          </h3>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#c3c6d6]/40">
                  <th className="pb-3 font-semibold text-[#141b2b]">Aspect</th>
                  <th className="pb-3 font-semibold text-[#141b2b]">Traditional Analytics</th>
                  <th className="pb-3 font-semibold text-[#141b2b]">Workflow Intelligence</th>
                </tr>
              </thead>
              <tbody>
                {WORKFLOW_VS_ANALYTICS.map((row, index) => {
                  const isAnalytics = row.aspect === "Traditional Analytics";
                  return (
                    <tr key={row.aspect} className={`border-b border-[#c3c6d6]/20 ${index === WORKFLOW_VS_ANALYTICS.length - 1 ? "border-b-0" : ""}`}>
                      <td className="py-4 font-medium text-[#141b2b]">{row.aspect}</td>
                      <td className="py-4 text-[#434654]">
                        <p className="font-medium">{row.focus}</p>
                        {isAnalytics && 'limitation' in row && <p className="text-sm text-[#8a93a8]">{row.limitation}</p>}
                      </td>
                      <td className="py-4 text-[#434654]">
                        <p className="font-medium">{row.focus}</p>
                        {!isAnalytics && 'value' in row && <p className="text-sm text-[#8a93a8]">{row.value}</p>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-16 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Where AI-assisted analysis can help
          </p>
          <h3 className="mt-4 text-[1.25rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[1.5rem]">
            AI-assisted analysis may help organize workflow events, communication signals, and operational patterns.
          </h3>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            However, AI-generated interpretations can be incomplete or incorrect.
            Organizations should maintain access to underlying records and provide ways
            for recruiting teams to validate conclusions.
          </p>

          <div className="mt-8 space-y-4">
            {AI_ASSISTED_APPLICATIONS.map((application, index) => (
              <motion.div
                key={application}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05 }}
                className="flex items-start gap-3 rounded-xl border border-[#c3c6d6]/30 bg-white p-4"
              >
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f5ff] text-[#0050cb] text-sm font-semibold">
                  {index + 1}
                </span>
                <p className="text-base leading-relaxed text-[#434654]">{application}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}