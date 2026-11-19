"use client";

import { motion } from "motion/react";

type AiRecruitmentAutomationRpoComplexityProblemProps = {
  reduceMotion: boolean;
};

export function AiRecruitmentAutomationRpoComplexityProblem({
  reduceMotion,
}: AiRecruitmentAutomationRpoComplexityProblemProps) {
  return (
    <section className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="complexity">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Why RPO operations are difficult to standardize
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Similar recruiting activities, very different operating requirements.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            A staffing agency may manage several clients, but an RPO provider is
            often deeply involved in the client&apos;s ongoing recruitment
            operations. That creates complex handoffs. Recruiters may work within
            client-owned systems. Hiring managers may follow different approval
            paths. Candidate communications may require specific wording or
            timing.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Client-owned systems",
              description:
                "Recruiters may work within systems owned by each client rather than a single shared environment.",
            },
            {
              title: "Different approval paths",
              description:
                "Each hiring manager may follow a distinct review and sign-off process for candidates.",
            },
            {
              title: "Program-specific standards",
              description:
                "Communication wording, timing and reporting expectations can vary substantially between programs.",
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
