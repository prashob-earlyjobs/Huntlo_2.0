"use client";

import { motion } from "motion/react";

type AiRecruitingAutomationManufacturingHumanOversightProps = {
  reduceMotion: boolean;
};

export function AiRecruitingAutomationManufacturingHumanOversight({
  reduceMotion,
}: AiRecruitingAutomationManufacturingHumanOversightProps) {
  return (
    <section
      id="where-agentic-workflows-can-help"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Where Agentic Workflows Can Help
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Manufacturing recruitment often involves changing conditions. A hiring
            manager may revise a shift requirement. A candidate may become
            unavailable. A facility may temporarily pause a vacancy. An agentic
            workflow can be designed to recognize such events and coordinate
            appropriate next actions.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            But automation should not independently determine whether a candidate
            meets safety, licensing, or technical qualification requirements.
            Those assessments require appropriate verification and human
            accountability.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.1 }}
          className="mt-16 grid gap-6 md:grid-cols-2"
        >
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">Event Detection</h3>
            <p className="mt-2 text-base text-[#434654]">
              Identify shift changes, candidate availability updates, and vacancy
              pauses as they occur.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">Coordinated Response</h3>
            <p className="mt-2 text-base text-[#434654]">
              Route notifications, update workflows, and trigger permitted next
              steps within defined boundaries.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">Human Escalation</h3>
            <p className="mt-2 text-base text-[#434654]">
              Flag qualification, safety, and licensing decisions for appropriate
              human review and accountability.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">Operational Visibility</h3>
            <p className="mt-2 text-base text-[#434654]">
              Help recruitment teams understand which activities remain pending
              across facilities.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.15 }}
          className="mt-16"
        >
          <h3 className="text-xl font-semibold text-[#141b2b]">
            Respect the Candidate&apos;s Practical Concerns
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Manufacturing candidates often need straightforward information. They
            want to understand the role, location, schedule, and interview
            process. Recruitment communication should be clear rather than overly
            promotional. Candidates should also have a way to ask questions or
            request human assistance.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Organizations must consider applicable privacy, employment, and
            communication requirements when automating outreach.
          </p>
        </motion.div>
      </div>
    </section>
  );
}