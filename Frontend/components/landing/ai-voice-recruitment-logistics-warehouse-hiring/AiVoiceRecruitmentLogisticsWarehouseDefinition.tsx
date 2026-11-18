"use client";

import { motion } from "motion/react";

type AiVoiceRecruitmentLogisticsWarehouseDefinitionProps = {
  reduceMotion: boolean;
};

export function AiVoiceRecruitmentLogisticsWarehouseDefinition({
  reduceMotion,
}: AiVoiceRecruitmentLogisticsWarehouseDefinitionProps) {
  return (
    <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            What Is AI Voice Logistics Recruitment?
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            AI voice logistics recruitment uses automated voice conversations
            within selected stages of logistics and warehouse hiring.
            Potential applications include candidate interest checks, location
            suitability questions, availability confirmation and basic
            interview coordination.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Depending on verified system capabilities, candidate responses may
            be organized for recruiter review or used to trigger approved
            follow-up actions. The purpose is to support initial
            communication, not to make final hiring decisions. Candidates
            should understand when they are speaking with an automated system
            and how to request human assistance.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Candidate interest checks",
              detail: "Assessing whether candidates want to proceed with the role.",
            },
            {
              label: "Location suitability",
              detail: "Confirming the candidate can reach the work location.",
            },
            {
              label: "Availability confirmation",
              detail: "Verifying shift availability and joining timelines.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6 md:p-8"
            >
              <h3 className="text-lg font-semibold text-[#141b2b]">{item.label}</h3>
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
