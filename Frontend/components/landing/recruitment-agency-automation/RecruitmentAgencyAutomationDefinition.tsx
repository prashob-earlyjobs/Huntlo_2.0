"use client";

import { motion } from "motion/react";

type RecruitmentAgencyAutomationDefinitionProps = {
  reduceMotion: boolean;
};

const LAYERS = [
  {
    title: "Mandate context",
    detail:
      "The client, role, requirements, and agreed submission process stay attached to the work.",
  },
  {
    title: "Candidate state",
    detail:
      "Interest, availability, and ownership are visible before another conversation starts.",
  },
  {
    title: "Permitted actions",
    detail:
      "Routine updates and outreach can be coordinated; submissions and recommendations stay with recruiters.",
  },
] as const;

export function RecruitmentAgencyAutomationDefinition({
  reduceMotion,
}: RecruitmentAgencyAutomationDefinitionProps) {
  return (
    <section
      id="what-is-recruitment-agency-automation"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.95fr] lg:items-start lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Definition
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
              What Is Recruitment Agency Automation?
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#434654] md:text-lg">
              Recruitment agency automation refers to software workflows that
              coordinate recurring agency activities across client mandates. It
              is not a replacement for an applicant tracking system, and it is
              not simply a bulk messaging tool.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              An agency workflow has to answer questions a single-employer
              process rarely faces. Which client owns this requirement? Has this
              candidate already been submitted elsewhere? What did the client ask
              for after the last interview? Automation is useful when it keeps
              those answers available to the person making the next decision.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Specific capabilities depend on the systems an agency uses,
              supported integrations, permissions, and the actual product
              implementation.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.1 }}
            className="rounded-2xl border border-[#d7e3f4] bg-white p-6 md:p-8"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[#141b2b]">
                What agency automation connects
              </h3>
              <span className="rounded-full border border-[#d7e3f4] bg-[#fbfcfe] px-2.5 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-[#8a93a8]">
                Conceptual
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {LAYERS.map((layer, index) => (
                <motion.div
                  key={layer.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: reduceMotion ? 0 : index * 0.07,
                  }}
                  className="rounded-xl border border-[#e8eef7] bg-[#fbfcfe] p-4"
                >
                  <p className="text-sm font-semibold text-[#141b2b]">
                    {layer.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#5b6478]">
                    {layer.detail}
                  </p>
                </motion.div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-[#8a93a8]">
              This is a framework for evaluating agency workflows, not a claim
              about verified Huntlo integrations.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
