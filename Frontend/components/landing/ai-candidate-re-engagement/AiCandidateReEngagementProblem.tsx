"use client";

import { motion } from "motion/react";

type AiCandidateReEngagementProblemProps = {
  reduceMotion: boolean;
};

export function AiCandidateReEngagementProblem({
  reduceMotion,
}: AiCandidateReEngagementProblemProps) {
  return (
    <section className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="problem">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            The archive gap
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Candidate databases are often treated as archives.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Recruiters add profiles during active hiring campaigns, update records
            during interviews and return to those records when they remember a
            particular person. Over time, the database grows. But the information
            becomes less reliable. A candidate&apos;s preferred location may change.
            Their salary expectations may increase. They may develop new skills or
            move into a different role.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Information ages",
              description:
                "A detailed historical profile cannot reliably describe a person&apos;s current interest in a new opportunity.",
            },
            {
              title: "Availability is invisible",
              description:
                "Stored candidate information does not show whether someone is open to changing jobs today.",
            },
            {
              title: "Sourcing repeats",
              description:
                "Teams start sourcing again instead of reconnecting with people who already know the organization.",
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
      </div>
    </section>
  );
}
