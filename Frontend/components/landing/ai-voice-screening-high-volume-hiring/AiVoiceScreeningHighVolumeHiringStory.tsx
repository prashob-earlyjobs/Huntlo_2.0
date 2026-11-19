"use client";

import { motion } from "motion/react";

import {
  VOICE_SCREENING_SHOULD,
  VOLUME_VS_CAPACITY,
} from "@/lib/aiVoiceScreeningHighVolumeHiring";

type AiVoiceScreeningHighVolumeHiringStoryProps = {
  reduceMotion: boolean;
};

export function AiVoiceScreeningHighVolumeHiringStory({
  reduceMotion,
}: AiVoiceScreeningHighVolumeHiringStoryProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              The gap
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              The gap between application and conversation
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              High-volume hiring often creates a queue of applications faster than recruiters can
              open real conversations. The result is delay - not a pipeline.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {VOLUME_VS_CAPACITY.map((column, index) => (
              <motion.article
                key={column.title}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.06 }}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
              >
                <h3 className="text-lg font-bold text-[#141b2b]">{column.title}</h3>
                <ul className="mt-4 space-y-3">
                  {column.points.map((point) => (
                    <li
                      key={point}
                      className="border-t border-[#c3c6d6]/30 pt-3 text-sm leading-relaxed text-[#434654] first:border-t-0 first:pt-0"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Design principles
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              What AI voice screening should do
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              The goal is structured first-contact information for recruiter review - not an
              automated hiring decision.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {VOICE_SCREENING_SHOULD.map((item, index) => (
              <motion.article
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6"
              >
                <p className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]/55">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-base font-bold text-[#141b2b]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#434654]">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
