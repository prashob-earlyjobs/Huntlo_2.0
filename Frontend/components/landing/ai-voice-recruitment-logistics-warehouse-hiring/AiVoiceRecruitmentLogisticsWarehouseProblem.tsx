"use client";

import { motion } from "motion/react";

type AiVoiceRecruitmentLogisticsWarehouseProblemProps = {
  reduceMotion: boolean;
};

export function AiVoiceRecruitmentLogisticsWarehouseProblem({
  reduceMotion,
}: AiVoiceRecruitmentLogisticsWarehouseProblemProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            Why Logistics Recruitment Has Distinct Requirements
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Logistics and warehouse hiring is often shaped by operational
            conditions. Work location matters. Shift availability may matter.
            Joining timelines can be important. Candidates may want practical
            details before agreeing to continue.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            These considerations differ from the screening needs of office-based
            or specialist roles. A useful recruitment workflow should therefore
            begin with the actual requirements of the position. Generic
            screening questions may collect information that is not useful
            while missing the details that matter.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Work location",
              detail:
                "The fixed site and commute feasibility shape whether a candidate can proceed.",
            },
            {
              title: "Shift availability",
              detail:
                "Particular shifts and joining expectations must align with the role.",
            },
            {
              title: "Role-specific screening",
              detail:
                "Generic questions may miss the details that matter for warehouse, delivery or supervisor roles.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-2xl border border-[#d7e3f4] bg-white p-6 md:p-8 shadow-sm"
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
