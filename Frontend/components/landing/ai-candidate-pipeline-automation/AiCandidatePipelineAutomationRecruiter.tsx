"use client";

import { motion } from "motion/react";

import { PIPELINE_QUESTIONS } from "@/lib/aiCandidatePipelineAutomation";

type AiCandidatePipelineAutomationRecruiterProps = {
  reduceMotion: boolean;
};

export function AiCandidatePipelineAutomationRecruiter({
  reduceMotion,
}: AiCandidatePipelineAutomationRecruiterProps) {
  return (
    <section
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="recruiter"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Make the pipeline useful for recruiters
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Recruiters need to know more than where a candidate appears. They
            need to understand what is pending.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            What information is missing? Who needs to respond? Which candidate
            requires a personal conversation? Which workflow has encountered an
            exception? A useful pipeline automation strategy makes these
            questions easier to answer. It should reduce unnecessary checking
            rather than create another system that recruiters must monitor
            constantly.
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
              {PIPELINE_QUESTIONS.map((question, index) => (
                <motion.div
                  key={question.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.06 }}
                  className="rounded-xl border border-[#c3c6d6]/35 bg-white p-5"
                >
                  <p className="text-base font-semibold text-[#141b2b]">{question.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#434654] md:text-[0.95rem]">
                    {question.detail}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 space-y-5 text-base leading-relaxed text-[#434654] md:text-lg">
              <p>
                Candidates experience the recruitment pipeline through
                communication. They do not see internal stage labels. They notice
                whether interview details are clear, whether their questions
                receive answers, and whether the process progresses appropriately.
              </p>
              <p>
                Automation should support timely, accurate communication while
                respecting privacy and candidate preferences. The candidate
                experience should remain understandable even when the underlying
                workflow is complex.
              </p>
            </div>

            <ul className="mt-8 space-y-3">
              {[
                "Surface pending actions and missing information.",
                "Route handoffs to the appropriate recruiter or stakeholder.",
                "Keep candidate communication timely and accurate.",
                "Maintain human oversight for consequential decisions.",
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
            aria-label="Conceptual pipeline dashboard showing pending handoffs and exceptions"
          >
            <div className="border-b border-[#e8eef7] bg-[#fafbfd] px-5 py-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
                Operational visibility
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[#141b2b]">
                Pending handoffs and unresolved exceptions
              </p>
            </div>
            <div className="divide-y divide-[#e8eef7] p-5">
              {[
                { label: "Feedback pending", detail: "Candidate C · Interview stage", tone: "amber" as const },
                { label: "Recruiter review", detail: "Candidate B · Screening stage", tone: "amber" as const },
                { label: "Hiring manager decision", detail: "Candidate D · Review stage", tone: "blue" as const },
                { label: "Information requested", detail: "Candidate A · Sourcing stage", tone: "slate" as const },
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
                      <p className="mt-1 text-sm text-[#5b6478]">{item.detail}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] ${
                        item.tone === "amber"
                          ? "bg-[#fef3e2] text-[#b5651a]"
                          : item.tone === "blue"
                            ? "bg-[#f0f5ff] text-[#0050cb]"
                            : "bg-[#f1f2f6] text-[#5b6478]"
                      }`}
                    >
                      {item.label.split(" ")[0]}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-[#e8eef7] bg-[#fafbfd] px-5 py-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#8a93a8]">
                Candidate communication timeline
              </p>
              <div className="mt-3 space-y-2">
                {[
                  { event: "Application received", tone: "done" },
                  { event: "Screening completed", tone: "done" },
                  { event: "Interview scheduled", tone: "active" },
                  { event: "Feedback pending", tone: "pending" },
                ].map((item, index) => (
                  <motion.div
                    key={item.event}
                    initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.08 }}
                    className="flex items-center gap-2"
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        item.tone === "done"
                          ? "bg-[#16a34a]"
                          : item.tone === "active"
                            ? "bg-[#0050cb]"
                            : "bg-[#c3c6d6]"
                      }`}
                    />
                    <p className="text-xs text-[#434654]">{item.event}</p>
                  </motion.div>
                ))}
              </div>
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