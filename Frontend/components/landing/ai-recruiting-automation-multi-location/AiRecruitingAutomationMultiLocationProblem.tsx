"use client";

import { motion } from "motion/react";

type AiRecruitingAutomationMultiLocationProblemProps = {
  reduceMotion: boolean;
};

export function AiRecruitingAutomationMultiLocationProblem({
  reduceMotion,
}: AiRecruitingAutomationMultiLocationProblemProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            Why Multi-Location Recruitment Becomes Complex
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Recruiting across several locations introduces dependencies that do
            not always exist in a single-office hiring process. Candidate
            availability may depend on geography. Interview coordination may
            involve different managers. Communication expectations may vary
            between teams. Hiring requirements may change at different times.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            When each location develops its own process, central recruitment
            teams can struggle to understand what is happening across the
            organization. A shared applicant tracking system provides
            visibility into records, but it does not automatically coordinate
            every action required to move candidates forward. This is where
            workflow design becomes important.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Geographic dependencies",
              detail:
                "Candidate availability and interview coordination vary by location and manager.",
            },
            {
              title: "Distributed processes",
              detail:
                "Each location can develop its own process, reducing central visibility into hiring activity.",
            },
            {
              title: "Coordination gaps",
              detail:
                "An ATS shows records but does not automatically coordinate every action to move candidates forward.",
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
