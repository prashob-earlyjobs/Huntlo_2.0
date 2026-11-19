"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { AI_VOICE_WORKFLOW } from "@/lib/aiVoiceRecruiter";

type WorkflowSectionProps = {
  reduceMotion?: boolean;
};

export function WorkflowSection({ reduceMotion = false }: WorkflowSectionProps) {
  return (
    <section className="border-t border-[#c3c6d6]/25 bg-[#f7f8fc] px-4 py-20 sm:px-6 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Getting started
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-epilogue)] text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            Upload leads → AI calls → Qualifies &amp; scores → Recruiter reviews
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Set up screening questions, hit Start Call Campaign, and step in only for top
            candidates.
          </p>
        </div>

        <div className="relative mt-14">
          <div className="absolute left-[10%] right-[10%] top-7 hidden h-px bg-[#e1e4ef] lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3">
            {AI_VOICE_WORKFLOW.map((step, i) => (
              <motion.div
                key={step.number}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: reduceMotion ? 0 : i * 0.08 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#0050cb]/20 bg-white text-sm font-bold text-[#0050cb] shadow-sm">
                  {step.number}
                </div>
                <div className="flex flex-col items-center">
                  <h3 className="font-[family-name:var(--font-epilogue)] text-base font-bold leading-tight text-[#141b2b] md:text-lg">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium leading-tight text-[#0050cb] md:text-sm">
                    {step.subtitle}
                  </p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#434654] md:text-sm">
                  {step.description}
                </p>

                {i < AI_VOICE_WORKFLOW.length - 1 && (
                  <div className="mt-6 text-[#c3c6d6] lg:hidden" aria-hidden>
                    <ArrowRight className="h-5 w-5 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
