"use client";

import { motion } from "motion/react";

type AiRecruitingAutomationRetailProblemProps = {
  reduceMotion: boolean;
};

export function AiRecruitingAutomationRetailProblem({
  reduceMotion,
}: AiRecruitingAutomationRetailProblemProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            Why Retail Hiring Creates Workflow Pressure
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Retail recruitment often combines high application volumes with
            location-specific requirements. A candidate may be suitable for
            one store but not another. Shift availability can be important.
            Hiring timelines may change quickly as staffing needs evolve.
            Store managers may have limited time to coordinate interviews
            during operating hours.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            These conditions create frequent handoffs between central
            recruiters, local managers and applicants. Without a clear
            workflow, candidates may experience delays or receive inconsistent
            information. The operational challenge becomes more significant
            when hiring spans many stores.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              title: "High application volume",
              detail:
                "Many applications arrive across stores during busy hiring periods.",
            },
            {
              title: "Location-specific requirements",
              detail:
                "Shift availability, weekend needs and store preferences vary by location.",
            },
            {
              title: "Distributed handoffs",
              detail:
                "Central recruiters, store managers and applicants must coordinate outreach, screening and scheduling.",
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
