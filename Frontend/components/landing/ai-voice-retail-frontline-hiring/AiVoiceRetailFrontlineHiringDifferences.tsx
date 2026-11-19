"use client";

import { motion } from "motion/react";

import { STORE_REQUIREMENTS } from "@/lib/aiVoiceRetailFrontlineHiring";

type AiVoiceRetailFrontlineHiringDifferencesProps = {
  reduceMotion: boolean;
};

export function AiVoiceRetailFrontlineHiringDifferences({
  reduceMotion,
}: AiVoiceRetailFrontlineHiringDifferencesProps) {
  return (
    <section
      className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="differences"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Why retail frontline recruitment is different
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Retail hiring often involves practical requirements. Candidates need
            to understand the store location, role expectations, work schedule,
            and next steps.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            A position at one location may not be suitable for a candidate who
            lives near another store. Shift availability may affect whether an
            opportunity is relevant. Seasonal requirements can also change the
            timing of recruitment. These conditions make role-specific and
            location-specific communication important. A generic calling script
            may overlook the information recruiters need.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STORE_REQUIREMENTS.map((column, index) => (
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
                {column.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}