"use client";

import { motion } from "motion/react";

import { VOICE_INTERVIEW_USE_CASES } from "@/lib/aiVoiceInterviewScheduling";

type AiVoiceInterviewSchedulingCandidateExperienceProps = {
  reduceMotion: boolean;
};

export function AiVoiceInterviewSchedulingCandidateExperience({
  reduceMotion,
}: AiVoiceInterviewSchedulingCandidateExperienceProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="candidate-experience">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Candidate experience should guide the call
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Make interview coordination more dependable for everyone involved.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            A scheduling call should not feel like a sales pitch. Candidates need
            to know who is calling, which interview is being discussed and how to
            request assistance. The conversation should be brief enough to respect
            their time. Where calls are recorded or personal information is
            processed, the organization must consider applicable notice, consent,
            privacy and telecom requirements.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {VOICE_INTERVIEW_USE_CASES.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
            >
              <h3 className="text-lg font-semibold text-[#141b2b]">{useCase.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-[#434654]">
                {useCase.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
