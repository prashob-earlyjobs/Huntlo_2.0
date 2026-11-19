"use client";

import { motion } from "motion/react";

import {
  DISTINCT_NEEDS,
  VOICE_RECRUITMENT_CAPABILITIES,
  GOOD_FIRST_CALL,
} from "@/lib/aiVoiceInsideSalesHiring";

type AiVoiceInsideSalesHiringDefinitionProps = {
  reduceMotion: boolean;
};

export function AiVoiceInsideSalesHiringDefinition({
  reduceMotion,
}: AiVoiceInsideSalesHiringDefinitionProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="definition">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Why inside sales recruitment has distinct needs
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Inside sales roles vary. The initial conversation should be designed around the specific hiring requirement.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Some positions require prior experience. Others may be suitable for
            freshers. Candidates may need to understand the role, work arrangement,
            schedule, and expectations before deciding whether to continue.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DISTINCT_NEEDS.map((need, index) => (
            <motion.div
              key={need}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.06 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
            >
              <p className="text-base leading-relaxed text-[#434654]">{need}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            What is AI voice inside sales recruitment?
          </p>
          <h3 className="mt-4 text-[1.25rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[1.5rem]">
            Automated voice conversations within selected stages of sales hiring.
          </h3>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Potential applications include candidate interest checks, availability
            confirmation, approved screening questions, and interview-related follow-ups.
            The process should not automatically conclude that a candidate is suitable
            or unsuitable based solely on an automated conversation.
          </p>

          <div className="mt-8 space-y-4">
            {VOICE_RECRUITMENT_CAPABILITIES.map((capability, index) => (
              <motion.div
                key={capability}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05 }}
                className="flex items-start gap-3 rounded-xl border border-[#c3c6d6]/30 bg-white p-4"
              >
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f5ff] text-[#0050cb] text-sm font-semibold">
                  {index + 1}
                </span>
                <p className="text-base leading-relaxed text-[#434654]">{capability}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-16 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            A good first call creates clarity
          </p>
          <h3 className="mt-4 text-[1.25rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[1.5rem]">
            Candidates should understand the opportunity and what happens next.
          </h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {GOOD_FIRST_CALL.map((item, index) => (
              <motion.div
                key={item}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05 }}
                className="rounded-xl border border-[#c3c6d6]/30 bg-white p-4"
              >
                <p className="text-base leading-relaxed text-[#434654]">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}