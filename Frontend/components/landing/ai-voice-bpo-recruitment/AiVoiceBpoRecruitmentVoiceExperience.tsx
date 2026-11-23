"use client";

import { motion } from "motion/react";

type AiVoiceBpoRecruitmentVoiceExperienceProps = {
  reduceMotion: boolean;
};

export function AiVoiceBpoRecruitmentVoiceExperience({
  reduceMotion,
}: AiVoiceBpoRecruitmentVoiceExperienceProps) {
  return (
    <section className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="voice-experience">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Voice experience
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            A sample conversation visualization, explicitly marked illustrative.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            The conversation gathers candidate responses about shift
            preferences, location suitability and willingness to continue with
            the hiring process. It is transparent about its automated nature
            and avoids collecting unnecessary personal information.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white shadow-[0_24px_60px_-40px_rgba(0,80,203,0.25)]">
          <div className="border-b border-[#e8eef7] bg-[#fafbfd] px-5 py-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
              Sample BPO screening conversation
            </p>
            <p className="mt-0.5 text-sm font-semibold text-[#141b2b]">
              Explicitly marked illustrative — not a live recording
            </p>
          </div>
          <div className="divide-y divide-[#e8eef7] p-5 space-y-4">
            {[
              { speaker: "Voice agent", text: "Hello, I&apos;m calling about the customer support role. Are you available to work evening shifts?" },
              { speaker: "Candidate", text: "Yes, I can work evenings." },
              { speaker: "Voice agent", text: "Thank you. Is the work location suitable for you, and can you attend an interview next week?" },
              { speaker: "Candidate", text: "Yes, the location works and I&apos;m available next week." },
            ].map((turn, index) => (
              <motion.div
                key={index}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.08 }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 shrink-0 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[#0050cb]">
                  {turn.speaker}
                </span>
                <p className="text-sm leading-relaxed text-[#434654]">{turn.text}</p>
              </motion.div>
            ))}
          </div>
          <p className="border-t border-[#e8eef7] px-5 py-3 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
            Illustrative transcript — not a live product recording
          </p>
        </div>
      </div>
    </section>
  );
}
