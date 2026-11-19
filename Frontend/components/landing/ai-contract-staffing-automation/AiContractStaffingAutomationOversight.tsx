"use client";

import { motion } from "motion/react";

import { OVERSIGHT_CHECKPOINTS } from "@/lib/aiContractStaffingAutomation";

type AiContractStaffingAutomationOversightProps = {
  reduceMotion: boolean;
};

export function AiContractStaffingAutomationOversight({
  reduceMotion,
}: AiContractStaffingAutomationOversightProps) {
  return (
    <section
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="oversight"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Keep candidate relationships central
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Contract professionals may work with staffing agencies repeatedly over
            time. Their experience matters.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Relevant outreach, accurate assignment information, and respectful
            communication can help maintain those relationships. Automation
            should not create repeated unwanted contact or pressure candidates to
            accept unsuitable assignments. Organizations must also consider
            applicable privacy, communication, and employment requirements.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {OVERSIGHT_CHECKPOINTS.map((checkpoint, index) => (
                <motion.div
                  key={checkpoint.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.06 }}
                  className="rounded-xl border border-[#c3c6d6]/35 bg-white p-5"
                >
                  <p className="text-base font-semibold text-[#141b2b]">{checkpoint.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#434654] md:text-[0.95rem]">
                    {checkpoint.detail}
                  </p>
                </motion.div>
              ))}
            </div>

            <ul className="mt-8 space-y-3">
              {[
                "Verify assignment terms before candidate outreach.",
                "Confirm candidate availability through appropriate communication.",
                "Route qualification and contractual decisions to human recruiters.",
                "Respect candidate preferences and communication requirements.",
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.06 }}
                  className="flex items-start gap-3 text-sm text-[#434654]"
                >
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0050cb]/30 bg-[#f0f5ff] text-[#0050cb]">
                    <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.1 }}
            className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white shadow-[0_24px_60px_-40px_rgba(0,80,203,0.25)]"
            aria-label="Conceptual contract staffing oversight interface"
          >
            <div className="border-b border-[#e8eef7] bg-[#fafbfd] px-5 py-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
                Contract staffing oversight
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[#141b2b]">
                Assignment and qualification review checkpoints
              </p>
            </div>
            <div className="divide-y divide-[#e8eef7] p-5">
              {[
                { label: "Assignment terms", status: "Verified" },
                { label: "Candidate availability", status: "Confirmed" },
                { label: "Qualification review", status: "Pending" },
                { label: "Client submission", status: "Approved" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.08 }}
                  className="py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#141b2b]">{item.label}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] ${
                        item.status === "Pending"
                          ? "bg-[#fef3e2] text-[#b5651a]"
                          : "bg-[#ecfdf5] text-[#16a34a]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="border-t border-[#e8eef7] px-5 py-3 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
              Conceptual interface — not a live product screenshot
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}