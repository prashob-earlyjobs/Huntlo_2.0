"use client";

import { motion } from "motion/react";

type AiPassiveCandidateEngagementConclusionProps = {
  reduceMotion: boolean;
};

export function AiPassiveCandidateEngagementConclusion({
  reduceMotion,
}: AiPassiveCandidateEngagementConclusionProps) {
  return (
    <section
      className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="conclusion"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Make passive candidate engagement more intentional
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Better recruiting outreach begins with relevance, not volume.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Huntlo&apos;s SOURCE and ENGAGE positioning provides a foundation for
            thinking about candidate discovery and communication as connected
            parts of recruitment. Start with a specific talent segment.
            Understand what makes the opportunity relevant. Define appropriate
            outreach and follow-up boundaries. Then evaluate how AI-assisted
            workflows can support the process.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Start specific",
              description:
                "Begin with a specific talent segment rather than a broad audience. Relevance is easier to establish when the requirement is clear.",
            },
            {
              title: "Understand relevance",
              description:
                "Understand what makes the opportunity relevant to the individual. Ground outreach in the role and the candidate's background.",
            },
            {
              title: "Define boundaries",
              description:
                "Define appropriate outreach and follow-up boundaries before any message is sent. Respect preferences and communication requirements.",
            },
          ].map((column, index) => (
            <motion.div
              key={column.title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 md:p-8"
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
            Then evaluate how AI-assisted workflows can support the process.
          </p>
          <p className="mt-3 text-base leading-relaxed text-[#434654] md:text-lg">
            The objective is not to contact every available profile. It is to
            make thoughtful candidate engagement more manageable.
          </p>
        </motion.div>
      </div>
    </section>
  );
}