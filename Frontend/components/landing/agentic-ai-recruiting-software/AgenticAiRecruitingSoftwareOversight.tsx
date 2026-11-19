"use client";

import { motion } from "motion/react";

import { APPROVAL_QUEUE } from "@/lib/agenticAiRecruitingSoftware";

type AgenticAiRecruitingSoftwareOversightProps = {
  reduceMotion: boolean;
};

export function AgenticAiRecruitingSoftwareOversight({ reduceMotion }: AgenticAiRecruitingSoftwareOversightProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="human-oversight">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Human accountability
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Where human recruiters still matter.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Recruitment involves judgment about skills, motivation, career context, and organizational fit. AI-generated signals should not become unquestioned hiring decisions. Recruiters remain responsible for consequential decisions.
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
                An effective agentic recruiting system should make it easier to understand what happened, why an action was triggered, and when a person needs to intervene.
              </p>
              <p>
                It should also support appropriate privacy controls, candidate communication preferences, and review of potential bias.
              </p>
              <p className="font-semibold text-[#141b2b]">
                The goal is not to measure how many automated messages a system can send. A better question is how much unnecessary coordination a recruiting team can remove while maintaining candidate trust.
              </p>
            </div>

            <ul className="mt-8 space-y-3">
              {[
                "Can recruiters spend less time checking whether someone replied?",
                "Can candidate conversations continue without being lost between tools?",
                "Can managers identify exceptions before they become delays?",
                "Can candidates receive timely, relevant communication rather than repeated generic reminders?",
              ].map((question, index) => (
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
                  {question}
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
            aria-label="Conceptual approval queue interface"
          >
            <div className="border-b border-[#e8eef7] bg-[#fafbfd] px-5 py-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
                Recruiter approval queue
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[#141b2b]">Agent actions awaiting human review</p>
            </div>
            <div className="divide-y divide-[#e8eef7] p-5">
              {APPROVAL_QUEUE.map((item, index) => (
                <motion.div
                  key={item.candidate}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.08 }}
                  className="py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#141b2b]">{item.candidate}</p>
                      <p className="text-sm text-[#5b6478]">{item.signal}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#fef3e2] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[#b5651a]">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#0050cb]">Suggested action: {item.action}</p>
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