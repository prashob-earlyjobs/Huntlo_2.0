"use client";

import { motion } from "motion/react";

import { AGENTIC_EVENTS } from "@/lib/aiContractStaffingAutomation";

type AiContractStaffingAutomationAgenticProps = {
  reduceMotion: boolean;
};

export function AiContractStaffingAutomationAgentic({
  reduceMotion,
}: AiContractStaffingAutomationAgenticProps) {
  return (
    <section
      className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="agentic"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            How agentic workflows can support contract recruiting
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Contract recruitment involves frequent changes.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            A client may revise the assignment start date. A candidate may extend
            an existing contract. An interview may need to be rescheduled.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            An agentic workflow can be designed to identify these events and
            coordinate appropriate next steps. But the system should not promise
            candidate availability, make unsupported qualification judgments, or
            independently confirm contractual terms. Recruiters remain responsible
            for verifying relevant details and maintaining accurate client
            communication.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {AGENTIC_EVENTS.map((event, index) => (
            <motion.div
              key={event.event}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 md:p-8"
            >
              <h3 className="text-lg font-semibold text-[#141b2b]">{event.event}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-base">
                {event.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}