"use client";

import { motion } from "motion/react";

type AiRecruitingAgentsDayInLifeProps = {
  reduceMotion: boolean;
};

export function AiRecruitingAgentsDayInLife({
  reduceMotion,
}: AiRecruitingAgentsDayInLifeProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="day-in-life">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            A day in a coordinated recruiting operation
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            From fragmented tools to organized next actions.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Imagine a recruiter managing several active roles. During the
            morning, candidates respond to outreach messages. Some are
            interested. Others ask for job details. One requests a different
            interview time. In a fragmented process, the recruiter may need to
            open multiple applications, interpret each response, update records
            and decide what happens next.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-5 text-base leading-relaxed text-[#434654] md:text-lg">
              <p>
                In a well-designed agentic operating model, the system can help
                organize those events into meaningful next actions. Routine
                information requests may follow an approved response path.
              </p>
              <p>
                Scheduling requests can be routed to the appropriate
                coordination process. Ambiguous responses can be flagged for
                review. The recruiter begins with a clearer view of what needs
                attention.
              </p>
              <p className="font-semibold text-[#141b2b]">
                The technology does not eliminate the work of recruiting. It
                helps make that work more manageable.
              </p>
            </div>

            <ul className="mt-8 space-y-3">
              {[
                "Routine information requests follow an approved response path.",
                "Scheduling requests route to the appropriate coordination process.",
                "Ambiguous responses are flagged for recruiter review.",
                "The recruiter begins with a clearer view of what needs attention.",
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
            aria-label="Conceptual event-driven agent architecture"
          >
            <div className="border-b border-[#e8eef7] bg-[#fafbfd] px-5 py-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
                Event-driven agent architecture
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[#141b2b]">Input → interpretation → action → review</p>
            </div>
            <div className="divide-y divide-[#e8eef7] p-5">
              {[
                { label: "Candidate reply received", type: "Input" },
                { label: "Intent interpreted by agent", type: "Interpretation" },
                { label: "Approved action executed", type: "Approved action" },
                { label: "Recruiter reviews outcome", type: "Human review" },
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
                    <span className="shrink-0 rounded-full bg-[#f0f5ff] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[#0050cb]">
                      {item.type}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="border-t border-[#e8eef7] px-5 py-3 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
              Conceptual architecture — not a live product screenshot
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
