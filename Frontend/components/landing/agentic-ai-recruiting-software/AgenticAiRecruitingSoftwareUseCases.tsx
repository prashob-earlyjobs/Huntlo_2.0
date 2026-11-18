"use client";

import { motion } from "motion/react";

import { USE_CASES } from "@/lib/agenticAiRecruitingSoftware";

type AgenticAiRecruitingSoftwareUseCasesProps = {
  reduceMotion: boolean;
};

export function AgenticAiRecruitingSoftwareUseCases({ reduceMotion }: AgenticAiRecruitingSoftwareUseCasesProps) {
  return (
    <section className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="use-cases">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Operational scenarios
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Evaluate agentic workflows for the process your team needs to improve.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Instead of adding another isolated dashboard, start with the process. Map the handoffs. Define the decisions. Identify which actions can be automated and which require a recruiter.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {USE_CASES.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 md:p-8"
            >
              <h3 className="text-lg font-semibold text-[#141b2b]">{useCase.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-[#434654]">
                {useCase.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}