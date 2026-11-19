"use client";

import { motion } from "motion/react";

type AiVoiceCandidateDatabaseReactivationConclusionProps = {
  reduceMotion: boolean;
};

export function AiVoiceCandidateDatabaseReactivationConclusion({
  reduceMotion,
}: AiVoiceCandidateDatabaseReactivationConclusionProps) {
  return (
    <section
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="conclusion"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Turn stored candidate records into meaningful conversations
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Huntlo&apos;s AI voice recruitment direction provides a framework for
            thinking about candidate database reactivation.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Start with a specific hiring category. Review the relevance and
            quality of existing candidate information. Define an appropriate
            contact process. Identify which responses need recruiter attention.
            Then evaluate how voice automation can support the workflow.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            The objective is not simply to make more calls to an old database. It
            is to reconnect with relevant candidates and establish whether a
            meaningful recruitment conversation should continue.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Start specific",
              description:
                "Begin with a specific hiring category. Relevance is easier to establish when the requirement is clear and consistent.",
            },
            {
              title: "Review relevance",
              description:
                "Review the relevance and quality of existing candidate information. Assess which records are worth refreshing and which are outdated.",
            },
            {
              title: "Define the contact process",
              description:
                "Define an appropriate contact process. Identify which responses need recruiter attention. Evaluate how voice automation can support the workflow.",
            },
          ].map((column, index) => (
            <motion.div
              key={column.title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
            >
              <p className="text-base font-semibold text-[#141b2b]">{column.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-base">
                {column.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.2 }}
          className="mt-10 rounded-2xl border border-[#0050cb]/20 bg-[#f0f5ff] p-8 text-center md:p-10"
        >
          <p className="text-lg font-semibold text-[#141b2b] md:text-xl">
            The objective is not simply to make more calls to an old database.
          </p>
          <p className="mt-3 text-base leading-relaxed text-[#434654] md:text-lg">
            It is to reconnect with relevant candidates and establish whether a
            meaningful recruitment conversation should continue.
          </p>
        </motion.div>
      </div>
    </section>
  );
}