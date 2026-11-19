"use client";

import { motion } from "motion/react";

type AiCandidateResponseIntelligenceWorkflowBridgeProps = {
  reduceMotion: boolean;
};

const SCENARIOS = [
  {
    situation: "A candidate asking for the job description",
    action: "may need an approved information response",
    tone: "routine" as const,
  },
  {
    situation: "A candidate requesting a callback",
    action: "may need scheduling coordination",
    tone: "routine" as const,
  },
  {
    situation: "A candidate declining contact",
    action: "should have that preference respected",
    tone: "routine" as const,
  },
  {
    situation: "A candidate asking a sensitive or ambiguous question",
    action: "may need a recruiter",
    tone: "exception" as const,
  },
];

export function AiCandidateResponseIntelligenceWorkflowBridge({
  reduceMotion,
}: AiCandidateResponseIntelligenceWorkflowBridgeProps) {
  return (
    <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="coordination">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              From classification to workflow coordination
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Identifying a response category is only the beginning.
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-[#434654] md:text-lg">
              <p>
                The next question is what the recruiting process should do with
                that information. A candidate asking for the job description
                may need an approved information response. A candidate
                requesting a callback may need scheduling coordination. A
                candidate declining contact should have that preference
                respected. A candidate asking a sensitive or ambiguous question
                may need a recruiter.
              </p>
              <p>
                An agentic workflow can be designed to connect response
                interpretation with approved next actions. But the system should
                not act beyond its verified capabilities or authorized
                permissions.
              </p>
            </div>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-[#fafbfd] p-4 md:p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
                Response routing
              </p>
              <span className="rounded-full border border-[#d7e3f4] bg-white px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
                Illustrative
              </span>
            </div>
            <div className="space-y-2">
              {SCENARIOS.map((scenario, index) => (
                <motion.div
                  key={scenario.situation}
                  initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.08 }}
                  className="rounded-xl border border-[#e8eef7] bg-white px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="flex-1 text-sm leading-relaxed text-[#434654]">
                      <span className="font-semibold text-[#141b2b]">
                        {scenario.situation}
                      </span>{" "}
                      {scenario.action}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${
                        scenario.tone === "exception"
                          ? "bg-[#fef3e2] text-[#b5651a]"
                          : "bg-[#ecfdf5] text-[#16a34a]"
                      }`}
                    >
                      {scenario.tone === "exception" ? "Route to recruiter" : "Workflow"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="mt-4 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
              Exceptions escalate to human judgment
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}