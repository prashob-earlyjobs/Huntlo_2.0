"use client";

import { motion } from "motion/react";

import {
  EXCEPTION_QUEUE,
  HUMAN_BOUNDARIES,
  WORKFLOW_STAGES,
} from "@/lib/aiInterviewSchedulingAutomation";

type AiInterviewSchedulingAutomationSystemsProps = {
  reduceMotion: boolean;
};

export function AiInterviewSchedulingAutomationSystems({
  reduceMotion,
}: AiInterviewSchedulingAutomationSystemsProps) {
  return (
    <>
      <section className="border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Coordinated workflow
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              A More Coordinated Interview Workflow
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              These steps should form one coherent process rather than a series of disconnected
              messages - with an approval checkpoint when changes need a person.
            </p>
          </div>

          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {WORKFLOW_STAGES.map((item, index) => (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className={`rounded-2xl border px-4 py-5 ${
                  item.checkpoint
                    ? "border-[#0050cb]/35 bg-[#f0f5ff]"
                    : "border-[#e8eef7] bg-white"
                }`}
              >
                <p className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {item.step}
                </p>
                <p className="mt-2 text-sm font-bold text-[#141b2b]">{item.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-[#5b6478] sm:text-sm">
                  {item.detail}
                </p>
                {item.checkpoint ? (
                  <p className="mt-3 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#0050cb]">
                    Approval checkpoint
                  </p>
                ) : null}
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
                Recruiter oversight
              </p>
              <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
                Where Recruiters Should Remain Involved
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
                Not every scheduling issue should be resolved automatically. A good automation
                strategy recognizes these boundaries - and keeps unresolved issues visible.
              </p>
              <ul className="mt-8 space-y-4">
                {HUMAN_BOUNDARIES.map((item) => (
                  <li key={item.title}>
                    <p className="text-sm font-bold text-[#141b2b]">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#5b6478]">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-[#f8fafc] shadow-[0_24px_60px_-44px_rgba(0,80,203,0.35)]"
            >
              <div className="flex items-center justify-between border-b border-[#e8eef7] bg-white px-4 py-3">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
                    Scheduling dashboard
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#141b2b]">Exceptions &amp; status</p>
                </div>
                <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
                  Illustrative
                </span>
              </div>
              <ul className="space-y-2 p-4">
                {EXCEPTION_QUEUE.map((row) => (
                  <li
                    key={row.name}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#e8eef7] bg-white px-3 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#141b2b]">{row.name}</p>
                      <p className="mt-0.5 text-xs text-[#5b6478]">{row.issue}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[0.6rem] font-semibold ${
                        row.status === "On track"
                          ? "bg-[#eef7f1] text-[#1f6b3a]"
                          : "bg-[#f0f5ff] text-[#0050cb]"
                      }`}
                    >
                      {row.status}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
