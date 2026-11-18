"use client";

import { motion } from "motion/react";

import {
  AUTOMATION_MEANS,
  HANDOFF_STACK,
  PRACTICAL_WORKFLOW,
} from "@/lib/recruitingWorkflowAutomation";

type RecruitingWorkflowAutomationStoryProps = {
  reduceMotion: boolean;
};

export function RecruitingWorkflowAutomationStory({
  reduceMotion,
}: RecruitingWorkflowAutomationStoryProps) {
  return (
    <>
      <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-16">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              The work between the work
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Handoffs create more friction than hiring itself.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              Recruiting rarely fails because teams lack effort. It stalls in the gaps -
              between discovery and outreach, outreach and reply, reply and review. Those gaps
              turn into forgotten candidates and duplicated work.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
              Workflow automation is useful when it makes those handoffs visible, owned, and
              resumable - without removing recruiter judgment.
            </p>
          </div>

          <ol className="space-y-3">
            {HANDOFF_STACK.map((item, index) => (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="rounded-2xl border border-[#e8eef7] bg-[#f8fafc] px-5 py-4"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#141b2b]">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#5b6478]">{item.description}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Definition
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              What recruiting workflow automation actually means
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              It is not a promise that hiring runs itself. It is a way to connect repeatable
              steps while keeping people responsible for relationships and decisions.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {AUTOMATION_MEANS.map((item, index) => (
              <motion.article
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.05 }}
                className="rounded-2xl border border-[#e8eef7] bg-white p-6"
              >
                <h3 className="text-base font-bold text-[#141b2b]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="practical-workflow"
        className="scroll-mt-24 border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              From search to response
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              A practical workflow, from search to response
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              Illustrative Monday for a staffing team - one vacancy, one connected path, with a
              human review gate before advancement.
            </p>
          </div>

          <ol className="mt-10 flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-2">
            {PRACTICAL_WORKFLOW.map((step, index) => (
              <motion.li
                key={step.title}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className={`relative flex-1 rounded-2xl border px-4 py-5 ${
                  step.gate
                    ? "border-[#0050cb]/35 bg-[#f0f5ff]"
                    : "border-[#e8eef7] bg-[#fafbfd]"
                }`}
              >
                <p className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {step.stage}
                </p>
                <p className="mt-2 text-sm font-bold text-[#141b2b]">{step.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-[#5b6478] sm:text-sm">
                  {step.detail}
                </p>
                {step.gate ? (
                  <p className="mt-3 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
                    Human review gate
                  </p>
                ) : null}
                {index < PRACTICAL_WORKFLOW.length - 1 ? (
                  <span
                    className="pointer-events-none absolute -right-2 top-1/2 hidden h-px w-4 -translate-y-1/2 bg-[#d7e3f4] lg:block"
                    aria-hidden
                  />
                ) : null}
              </motion.li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
