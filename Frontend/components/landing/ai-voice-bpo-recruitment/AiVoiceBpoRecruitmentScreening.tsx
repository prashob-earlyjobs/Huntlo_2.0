"use client";

import { motion } from "motion/react";

import { BPO_VOICE_SCREENING_QUESTIONS } from "@/lib/aiVoiceBpoRecruitment";

type AiVoiceBpoRecruitmentScreeningProps = {
  reduceMotion: boolean;
};

export function AiVoiceBpoRecruitmentScreening({
  reduceMotion,
}: AiVoiceBpoRecruitmentScreeningProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="screening">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Role-specific screening questions
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Questions designed around the actual hiring requirement.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Voice workflows should be designed around the actual hiring
            requirement rather than a universal script. These are representative
            screening questions for BPO and customer support hiring.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {BPO_VOICE_SCREENING_QUESTIONS.map((question, index) => (
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
            >
              <p className="text-sm font-semibold text-[#5b6478]">Question {index + 1}</p>
              <p className="mt-2 text-base font-semibold text-[#141b2b]">{question}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
