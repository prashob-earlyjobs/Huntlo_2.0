"use client";

import { motion } from "motion/react";

import { DIFFERENCES } from "@/lib/aiContractStaffingAutomation";

type AiContractStaffingAutomationDifferencesProps = {
  reduceMotion: boolean;
};

export function AiContractStaffingAutomationDifferences({
  reduceMotion,
}: AiContractStaffingAutomationDifferencesProps) {
  return (
    <section
      className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="differences"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Why contract staffing is operationally different
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Permanent recruitment and contract staffing share many activities.
            Contract staffing introduces additional timing considerations.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            A candidate may be suitable for a role but unavailable until an
            existing assignment ends. A client may have a defined start date. A
            contract may require a particular duration, location, or work
            arrangement. These details can affect whether an opportunity is
            relevant to a candidate at a particular time.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Recruiters need to gather accurate information and communicate
            changes quickly. When candidate availability is tracked
            inconsistently, teams may spend time contacting people who cannot
            proceed.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {DIFFERENCES.map((column, index) => (
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