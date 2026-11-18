"use client";

import { motion } from "motion/react";

type RecruitmentAgencyAutomationProblemProps = {
  reduceMotion: boolean;
};

export function RecruitmentAgencyAutomationProblem({
  reduceMotion,
}: RecruitmentAgencyAutomationProblemProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            Why Healthcare Recruitment Workflows Are Different
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Healthcare staffing teams often operate in environments where
            accuracy and accountability matter as much as responsiveness. The
            recruitment process may involve multiple stakeholders, including
            staffing coordinators, recruiters, hiring managers and
            credentialing teams.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            A candidate&apos;s readiness cannot always be determined through a
            simple screening conversation. Professional credentials, licensing
            requirements and assignment-specific conditions may need
            independent verification. Communication also needs to be timely
            and precise. An unclear scheduling message or incomplete handoff
            can create unnecessary delays. Workflow automation should
            therefore focus on coordination without bypassing essential checks.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Multiple stakeholders",
              detail:
                "Staffing coordinators, recruiters, hiring managers and credentialing teams all touch the process.",
            },
            {
              title: "Independent verification",
              detail:
                "Professional credentials and licensing requirements may need verification through appropriate sources.",
            },
            {
              title: "Precise communication",
              detail:
                "An unclear scheduling message or incomplete handoff can create unnecessary delays.",
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
