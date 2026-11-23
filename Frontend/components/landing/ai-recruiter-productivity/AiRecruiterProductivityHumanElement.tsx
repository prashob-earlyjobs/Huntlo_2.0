"use client";

import { motion } from "motion/react";

import { HUMAN_ELEMENT_PRINCIPLES, FINAL_STATEMENT } from "@/lib/aiRecruiterProductivity";

type AiRecruiterProductivityHumanElementProps = {
  reduceMotion: boolean;
};

export function AiRecruiterProductivityHumanElement({
  reduceMotion,
}: AiRecruiterProductivityHumanElementProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="human-element">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Productivity without losing the human element
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Recruitment involves people making career decisions. Automation should reduce operational work, not human judgment.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {HUMAN_ELEMENT_PRINCIPLES.map((principle, index) => (
            <motion.div
              key={principle}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.06 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
            >
              <p className="text-base leading-relaxed text-[#434654]">{principle}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-[#c3c6d6]/30 bg-white p-6 md:p-8 text-center">
          <p className="text-lg font-semibold text-[#141b2b] md:text-xl">{FINAL_STATEMENT}</p>
        </div>
      </div>
    </section>
  );
}