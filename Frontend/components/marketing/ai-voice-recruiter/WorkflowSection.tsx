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
          <div className="absolute left-[8%] right-[8%] top-[28px] hidden h-px bg-[#e1e4ef] lg:block" />

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {AI_VOICE_WORKFLOW.map((step, i) => (
              <motion.div
                key={step.title}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: reduceMotion ? 0 : i * 0.08 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#0050cb]/20 bg-white text-sm font-bold text-[#0050cb] shadow-sm">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-[family-name:var(--font-epilogue)] text-lg font-bold text-[#141b2b] md:text-xl">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#434654] md:text-[0.95rem]">
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
