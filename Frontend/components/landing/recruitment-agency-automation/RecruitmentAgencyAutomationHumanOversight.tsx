"use client";

import { motion } from "motion/react";

type RecruitmentAgencyAutomationHumanOversightProps = {
  reduceMotion: boolean;
};

export function RecruitmentAgencyAutomationHumanOversight({
  reduceMotion,
}: RecruitmentAgencyAutomationHumanOversightProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            Candidate Experience Still Matters
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Healthcare professionals are often managing demanding schedules.
            Recruitment communication should respect their time and provide
            relevant information without unnecessary repetition. A clear
            workflow can help candidates understand the assignment, next steps
            and contact options.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Organizations should also consider candidate privacy, applicable
            communication requirements and appropriate data handling. Sensitive
            information should not be collected simply because an automated
            system makes it technically possible.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Respect time",
              detail:
                "Communication respects demanding schedules and avoids unnecessary repetition.",
            },
            {
              title: "Clear next steps",
              detail:
                "Candidates understand the assignment, next steps and contact options.",
            },
            {
              title: "Privacy and data handling",
              detail:
                "Sensitive information is not collected simply because automation makes it technically possible.",
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
