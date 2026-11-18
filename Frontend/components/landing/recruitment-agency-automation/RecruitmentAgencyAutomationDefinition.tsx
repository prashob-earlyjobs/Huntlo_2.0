"use client";

import { motion } from "motion/react";

type RecruitmentAgencyAutomationDefinitionProps = {
  reduceMotion: boolean;
};

export function RecruitmentAgencyAutomationDefinition({
  reduceMotion,
}: RecruitmentAgencyAutomationDefinitionProps) {
  return (
    <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            What Is AI Healthcare Recruiting Automation?
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            AI healthcare recruiting automation refers to the use of
            AI-assisted software workflows to support selected recruitment
            activities. Potential applications include candidate engagement,
            response organization, follow-up coordination and interview
            scheduling support.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Agentic workflow concepts can help connect these activities by
            interpreting relevant events and initiating permitted actions. For
            example, a candidate asking for more assignment details may
            require an information response. A candidate requesting a schedule
            change may require coordination. A question about licensing
            eligibility may require review by an authorized professional.
            These situations should not be handled as interchangeable events.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Candidate engagement",
              detail: "Communicating the opportunity and gathering initial interest.",
            },
            {
              label: "Response organization",
              detail: "Distinguishing interest, scheduling questions and clarification requests.",
            },
            {
              label: "Interview scheduling support",
              detail: "Coordinating scheduling and follow-up within approved workflows.",
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
