"use client";

import { motion } from "motion/react";

import { PRODUCTIVITY_MEANING, SOFTWARE_CAPABILITIES } from "@/lib/aiRecruiterProductivity";

type AiRecruiterProductivityDefinitionProps = {
  reduceMotion: boolean;
};

export function AiRecruiterProductivityDefinition({
  reduceMotion,
}: AiRecruiterProductivityDefinitionProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="definition">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            What does recruiter productivity actually mean?
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Recruiter productivity is not simply activity metrics. It is operational efficiency and quality of recruiting work.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            A recruiter who sends hundreds of irrelevant messages may generate more
            activity without creating better candidate conversations. Another
            recruiter may spend less time on outreach but invest more effort in
            understanding the role and communicating with relevant professionals.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCTIVITY_MEANING.map((meaning, index) => (
            <motion.div
              key={meaning}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.06 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
            >
              <h3 className="text-lg font-semibold text-[#141b2b]">{meaning}</h3>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            What is AI recruiter productivity software?
          </p>
          <h3 className="mt-4 text-[1.25rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[1.5rem]">
            Tools that use AI-assisted functionality to support selected recruitment tasks.
          </h3>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Potential applications include outreach preparation, response organization,
            follow-up coordination, and workflow visibility. Agentic recruiting concepts
            can extend these capabilities by interpreting relevant events and
            coordinating permitted actions.
          </p>

          <div className="mt-8 space-y-4">
            {SOFTWARE_CAPABILITIES.map((capability, index) => (
              <motion.div
                key={capability}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05 }}
                className="flex items-start gap-3 rounded-xl border border-[#c3c6d6]/30 bg-white p-4"
              >
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f5ff] text-[#0050cb] text-sm font-semibold">
                  {index + 1}
                </span>
                <p className="text-base leading-relaxed text-[#434654]">{capability}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}