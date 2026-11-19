"use client";

import { motion } from "motion/react";

import { HANDOFF_QUESTIONS } from "@/lib/aiRecruiterHandoffAutomation";

type AiRecruiterHandoffAutomationBriefProps = {
  reduceMotion: boolean;
};

export function AiRecruiterHandoffAutomationBrief({
  reduceMotion,
}: AiRecruiterHandoffAutomationBriefProps) {
  return (
    <section
      id="a-good-handoff-answers-four-questions"
      className="relative overflow-hidden bg-[#050914] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,80,203,0.22),_transparent_60%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8eb0ff]">
            The handoff brief
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.2] tracking-tight md:text-[2.25rem] lg:text-[2.5rem]">
            A Good Handoff Answers Four Questions
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/60 md:text-lg">
            These questions sound simple. But answering them consistently becomes
            more difficult as recruiting teams grow. A structured workflow can
            help maintain clarity — and should also avoid transferring
            unnecessary personal information.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {HANDOFF_QUESTIONS.map((item, index) => (
            <motion.div
              key={item.number}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: reduceMotion ? 0 : index * 0.06,
              }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
            >
              <p className="text-[0.65rem] font-bold tracking-[0.16em] text-[#8eb0ff]">
                {item.number}
              </p>
              <h3 className="mt-3 text-base font-semibold leading-snug">
                {item.question}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
