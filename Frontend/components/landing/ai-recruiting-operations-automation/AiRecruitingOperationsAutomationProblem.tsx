"use client";

import { motion } from "motion/react";

type AiRecruitingOperationsAutomationProblemProps = {
  reduceMotion: boolean;
};

export function AiRecruitingOperationsAutomationProblem({
  reduceMotion,
}: AiRecruitingOperationsAutomationProblemProps) {
  return (
    <section
      id="why-recruiting-operations-become-fragmented"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Why Recruiting Operations Become Fragmented
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Recruitment teams often adopt technology to solve specific problems.
            An ATS manages applicant records. A sourcing tool helps identify
            candidates. Communication tools support outreach. Scheduling systems
            organize interviews. Reporting tools help teams understand performance.
            Each system may be useful. But the process connecting them can remain
            manual.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Recruiters may need to copy information between tools, check responses,
            and coordinate the next action. Recruiting operations leaders then
            spend time designing workarounds for gaps between systems. The result
            is a process that depends heavily on individual effort.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.1 }}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          {[
            {
              title: "Applicant Tracking",
              detail: "Records & stages",
            },
            {
              title: "Sourcing & Outreach",
              detail: "Candidate discovery",
            },
            {
              title: "Communication",
              detail: "Multi-channel contact",
            },
            {
              title: "Scheduling",
              detail: "Interview coordination",
            },
            {
              title: "Reporting",
              detail: "Performance metrics",
            },
            {
              title: "Operations Gap",
              detail: "Manual coordination",
            },
          ].map((tool, index) => (
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.15 + index * 0.08 }}
              className="relative rounded-2xl border border-[#d7e3f4] bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-[#141b2b]">{tool.title}</h3>
              <p className="mt-1 text-sm text-[#5b6478]">{tool.detail}</p>
              {index === 5 && (
                <div className="mt-4 pt-4 border-t border-[#e8eef7]">
                  <p className="text-xs font-semibold text-[#0050cb]">
                    The connection layer
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.1 }}
          className="mt-16"
        >
          <h3 className="text-xl font-semibold text-[#141b2b]">
            Move From Task Automation to Process Coordination
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Automating a task is valuable. Coordinating the process around that
            task can be more valuable. Consider candidate follow-up. A simple
            automation sends a reminder after a defined interval. A coordinated
            workflow first considers whether the candidate has already responded,
            whether the opportunity remains active, and whether further
            communication is appropriate.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            The difference is context. Recruiting operations automation should
            account for events, dependencies, permissions, and exceptions. That
            creates a stronger foundation for consistent execution.
          </p>
        </motion.div>
      </div>
    </section>
  );
}