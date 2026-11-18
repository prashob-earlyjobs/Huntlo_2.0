"use client";

import { motion } from "motion/react";

import {
  ANATOMY_SECTIONS,
  OPERATIONAL_OUTCOMES,
  ORCHESTRATION_STEPS,
} from "@/lib/aiRecruitingWorkflowOrchestration";

type AiRecruitingWorkflowOrchestrationSystemsProps = {
  reduceMotion: boolean;
};

export function AiRecruitingWorkflowOrchestrationSystems({
  reduceMotion,
}: AiRecruitingWorkflowOrchestrationSystemsProps) {
  return (
    <>
      <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Practical model
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              A Practical Recruiting Orchestration Model
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              The strongest orchestration strategy is often built from one narrow workflow before
              expanding across the recruiting lifecycle.
            </p>
          </div>

          <ol className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {ORCHESTRATION_STEPS.map((item, index) => (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="rounded-2xl border border-[#e8eef7] bg-[#fafbfd] px-5 py-5"
              >
                <p className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {item.step}
                </p>
                <p className="mt-2 text-sm font-bold text-[#141b2b]">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">{item.detail}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-16">
          {ANATOMY_SECTIONS.map((section, index) => (
            <motion.div
              key={section.title}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className={`grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-12 ${
                index % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
                  {section.eyebrow}
                </p>
                <h2 className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[1.85rem]">
                  {section.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
                  {section.body}
                </p>
              </div>
              <div className="rounded-2xl border border-[#e8eef7] bg-white px-6 py-8">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8a93a8]">
                  Checkpoint
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#5b6478]">
                  {section.eyebrow === "Triggers" &&
                    "Ask: which events should start work - and which should pause it?"}
                  {section.eyebrow === "Permissions" &&
                    "Ask: what can run automatically, and what always needs a person?"}
                  {section.eyebrow === "Human checkpoints" &&
                    "Ask: can a recruiter see completed, pending, and escalated actions in one place?"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Operational outcomes
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              From Fragmented Recruiting to Coordinated Execution
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              A better recruiting workflow does not necessarily require more software. It requires
              clearer ownership of what happens between tools, conversations, and decisions -
              without unsupported statistics.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {OPERATIONAL_OUTCOMES.map((item, index) => (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="rounded-2xl border border-[#e8eef7] bg-[#fafbfd] px-5 py-5"
              >
                <p className="text-sm font-bold text-[#141b2b]">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">{item.description}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
