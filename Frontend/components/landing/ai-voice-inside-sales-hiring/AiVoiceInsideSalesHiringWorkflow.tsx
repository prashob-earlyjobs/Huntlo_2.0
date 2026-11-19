"use client";

import { motion } from "motion/react";

import { PRACTICAL_WORKFLOW, VOICE_VS_ASSESSMENT, RESPONSIBLE_CALLING } from "@/lib/aiVoiceInsideSalesHiring";

type AiVoiceInsideSalesHiringWorkflowProps = {
  reduceMotion: boolean;
};

export function AiVoiceInsideSalesHiringWorkflow({
  reduceMotion,
}: AiVoiceInsideSalesHiringWorkflowProps) {
  return (
    <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="workflow">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            A practical inside sales voice recruitment workflow
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Seven steps to organize first-contact communication without replacing professional evaluation.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            This is an illustrative workflow and must be matched to actual Huntlo
            functionality before publication.
          </p>
        </div>

        <div className="mt-12 space-y-6">
          {PRACTICAL_WORKFLOW.map((step, index) => (
            <motion.div
              key={step.step}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: reduceMotion ? 0 : index * 0.08 }}
              className="relative flex gap-6 rounded-2xl border border-[#c3c6d6]/30 bg-white p-6 md:p-8"
            >
              <div className="relative flex-shrink-0">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0f5ff] text-[#0050cb] text-xl font-bold">
                  {index + 1}
                </span>
                {index < PRACTICAL_WORKFLOW.length - 1 && (
                  <span className="absolute left-[0.75rem] top-12 h-[calc(100%+1rem)] w-px bg-[#d7e3f4]" />
                )}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="text-lg font-semibold text-[#141b2b]">{step.step}</h3>
                <p className="mt-2 text-base leading-relaxed text-[#434654]">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-[#c3c6d6]/30 bg-[#f7f8fc] p-6 md:p-8">
          <h3 className="text-lg font-semibold text-[#141b2b]">Do not confuse voice screening with sales assessment</h3>
          <div className="mt-6 space-y-4">
            {VOICE_VS_ASSESSMENT.map((item, index) => (
              <motion.div
                key={item}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05 }}
                className="flex items-start gap-3"
              >
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f0f5ff] text-[#0050cb] text-[0.65rem] font-bold">
                  {index + 1}
                </span>
                <p className="text-base leading-relaxed text-[#434654]">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-[#c3c6d6]/30 bg-white p-6 md:p-8">
          <h3 className="text-lg font-semibold text-[#141b2b]">High-volume hiring needs responsible calling</h3>
          <div className="mt-6 space-y-4">
            {RESPONSIBLE_CALLING.map((item, index) => (
              <motion.div
                key={item}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05 }}
                className="flex items-start gap-3"
              >
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f0f5ff] text-[#0050cb] text-[0.65rem] font-bold">
                  {index + 1}
                </span>
                <p className="text-base leading-relaxed text-[#434654]">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}