"use client";

import { motion } from "motion/react";

type AiExecutiveSearchAutomationHumanOversightProps = {
  reduceMotion: boolean;
};

export function AiExecutiveSearchAutomationHumanOversight({
  reduceMotion,
}: AiExecutiveSearchAutomationHumanOversightProps) {
  return (
    <section
      id="where-agentic-workflows-fit"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Where Agentic Workflows Fit
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Agentic automation can be useful when a search process includes
            repeated operational dependencies. A candidate&apos;s response may
            require an update to the search workflow. An interview change may
            affect several stakeholders. A consultant may need a reminder to
            review an unresolved conversation. An agentic system can be designed
            to coordinate such actions within defined boundaries.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            However, it should not independently make sensitive candidate
            judgments, disclose confidential client information, or conduct
            unrestricted outreach.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.1 }}
          className="mt-16 grid gap-6 md:grid-cols-2"
        >
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">Response Coordination</h3>
            <p className="mt-2 text-base text-[#434654]">
              Identify interest, questions, and scheduling requests for
              consultant attention.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">Workflow Updates</h3>
            <p className="mt-2 text-base text-[#434654]">
              Coordinate interview changes and stakeholder notifications within
              approved boundaries.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">Consultant Reminders</h3>
            <p className="mt-2 text-base text-[#434654]">
              Flag unresolved conversations and pending review items.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">Confidential Boundaries</h3>
            <p className="mt-2 text-base text-[#434654]">
              Prevent disclosure of sensitive client or candidate information.
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
            Confidentiality and Trust Are Non-Negotiable
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Executive search firms handle sensitive professional information.
            Candidates may expect discretion about their interest in a new
            opportunity. Clients may impose strict information-sharing
            requirements.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Any automation strategy must consider data access, retention,
            confidentiality, and appropriate communication practices. Human
            consultants should remain responsible for decisions that affect
            candidate relationships and client trust.
          </p>
        </motion.div>
      </div>
    </section>
  );
}