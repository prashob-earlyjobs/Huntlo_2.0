"use client";

import { motion } from "motion/react";

import { AVAILABILITY_SIGNALS } from "@/lib/aiContractStaffingAutomation";

type AiContractStaffingAutomationAvailabilityProps = {
  reduceMotion: boolean;
};

export function AiContractStaffingAutomationAvailability({
  reduceMotion,
}: AiContractStaffingAutomationAvailabilityProps) {
  return (
    <section
      className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="availability"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Candidate availability is a moving target
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            A candidate database may contain accurate historical experience but
            outdated availability information.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Contract recruiters need to know whether candidates are interested in
            a specific assignment now. They may also need to understand when a
            candidate expects to complete an existing commitment. That information
            can change. A structured engagement workflow helps recruiters refresh
            relevant details rather than rely entirely on older records.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            However, candidate availability should be treated as information
            requiring confirmation, not an automatic guarantee.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {AVAILABILITY_SIGNALS.map((signal, index) => (
            <motion.div
              key={signal.title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 md:p-8"
            >
              <h3 className="text-lg font-semibold text-[#141b2b]">{signal.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-base">
                {signal.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}