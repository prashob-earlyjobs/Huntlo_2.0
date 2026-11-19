"use client";

import { motion } from "motion/react";

import { RPO_EVALUATION_AREAS } from "@/lib/aiRecruitmentAutomationRpo";

type AiRecruitmentAutomationRpoUseCasesProps = {
  reduceMotion: boolean;
};

export function AiRecruitmentAutomationRpoUseCases({
  reduceMotion,
}: AiRecruitmentAutomationRpoUseCasesProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="use-cases">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Five areas worth evaluating
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Evaluate where RPO programs can become more coordinated.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            The exact level of automation should reflect verified product
            functionality and the RPO provider&apos;s contractual
            responsibilities.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {RPO_EVALUATION_AREAS && RPO_EVALUATION_AREAS.length > 0 ? (
            RPO_EVALUATION_AREAS.map((area, index) => (
              <motion.div
                key={area.title}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 md:p-8"
              >
                <h3 className="text-lg font-semibold text-[#141b2b]">{area.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-[#434654]">
                  {area.detail}
                </p>
              </motion.div>
            ))
          ) : null}
        </div>
      </div>
    </section>
  );
}
