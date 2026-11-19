"use client";

import { motion } from "motion/react";

type AiCandidateReEngagementTrustProps = {
  reduceMotion: boolean;
};

export function AiCandidateReEngagementTrust({
  reduceMotion,
}: AiCandidateReEngagementTrustProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="trust">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Candidate preferences and human oversight
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Make every return conversation worthwhile.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Candidates remember how organizations communicate. An unexpected,
            irrelevant message can weaken trust. A thoughtful invitation tied to
            a genuinely suitable opportunity can strengthen an existing
            relationship.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-5 text-base leading-relaxed text-[#434654] md:text-lg">
              <p>
                Recruiters should avoid assuming that past applications authorize
                unlimited future contact. The outreach process should respect
                privacy, applicable communication requirements and candidate
                preferences.
              </p>
              <p>
                Human recruiters should also remain involved when conversations
                require nuance or a personal explanation. Consent, suppression
                preferences and retention policies should be reviewed before any
                outreach is sent.
              </p>
            </div>

            <ul className="mt-8 space-y-3">
              {[
                "Check communication permissions before outreach.",
                "Respect suppression preferences and retention policies.",
                "Route nuanced conversations to a human recruiter.",
                "Honor decline requests by ceasing future contact.",
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
            aria-label="Conceptual preference management interface"
          >
            <div className="border-b border-[#e8eef7] bg-[#fafbfd] px-5 py-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
                Candidate preference center
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[#141b2b]">
                Communication controls and opt-out states
              </p>
            </div>
            <div className="divide-y divide-[#e8eef7] p-5">
              {[
                { label: "Email outreach", status: "Opted in" },
                { label: "Phone outreach", status: "Suppressed" },
                { label: "Future opportunities", status: "Opted in" },
                { label: "Data retention", status: "Active" },
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
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] ${
                      item.status === "Suppressed"
                        ? "bg-[#fef3e2] text-[#b5651a]"
                        : "bg-[#ecfdf5] text-[#16a34a]"
                    }`}>
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
