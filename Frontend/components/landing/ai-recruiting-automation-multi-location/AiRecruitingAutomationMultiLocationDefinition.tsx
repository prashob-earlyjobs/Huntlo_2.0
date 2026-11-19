"use client";

import { motion } from "motion/react";

type AiRecruitingAutomationMultiLocationDefinitionProps = {
  reduceMotion: boolean;
};

export function AiRecruitingAutomationMultiLocationDefinition({
  reduceMotion,
}: AiRecruitingAutomationMultiLocationDefinitionProps) {
  return (
    <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            What Is Multi-Location Recruiting Automation?
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Multi-location recruiting automation refers to the use of software
            to support recurring recruitment activities across different hiring
            locations. These activities may include candidate communication,
            response management, interview coordination and process updates.
            An agentic approach can extend this model by interpreting relevant
            workflow events and coordinating permitted next actions.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            For example, a candidate may be interested in a position but
            unavailable at the originally selected location. An appropriately
            designed workflow could identify the need for recruiter review
            rather than continuing an unsuitable outreach sequence. The exact
            automation possible depends on system capabilities, data access
            and organizational permissions.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {[
            {
              title: "Centralized standards",
              detail:
                "Communication standards, escalation requirements and reporting expectations set by a central team.",
            },
            {
              title: "Local flexibility",
              detail:
                "Local hiring managers retain control over interview availability, role-specific requirements and final hiring decisions.",
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
