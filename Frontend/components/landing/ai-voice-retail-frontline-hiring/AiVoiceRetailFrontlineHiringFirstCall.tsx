"use client";

import { motion } from "motion/react";

import {
  FIRST_CALL_POINTS,
  CONVERSATION_TRANSCRIPT,
} from "@/lib/aiVoiceRetailFrontlineHiring";

type AiVoiceRetailFrontlineHiringFirstCallProps = {
  reduceMotion: boolean;
};

export function AiVoiceRetailFrontlineHiringFirstCall({
  reduceMotion,
}: AiVoiceRetailFrontlineHiringFirstCallProps) {
  return (
    <section
      className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="first-call"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Make the first call practical
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            A retail candidate may want to know where the store is located. They
            may need clarification about shift timings.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            They may be interested in the position but unavailable during the
            proposed interview period. A useful first-contact conversation
            should address these practical questions. The call should be concise
            and relevant. It should not collect unnecessary personal information
            or pressure candidates into continuing.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            The objective is to establish whether the candidate wants to proceed
            and what information the recruiter needs next.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {FIRST_CALL_POINTS.map((point, index) => (
              <motion.div
                key={point.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.06 }}
                className="rounded-xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-5"
              >
                <p className="text-base font-semibold text-[#141b2b]">{point.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#434654] md:text-[0.95rem]">
                  {point.detail}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.1 }}
            className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white shadow-[0_24px_60px_-40px_rgba(0,80,203,0.25)]"
            aria-label="Illustrative voice conversation transcript"
          >
            <div className="border-b border-[#e8eef7] bg-[#fafbfd] px-5 py-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
                Voice conversation
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[#141b2b]">
                Illustrative call transcript — shift and location preferences
              </p>
            </div>
            <div className="divide-y divide-[#e8eef7] p-5">
              {CONVERSATION_TRANSCRIPT.map((turn, index) => (
                <motion.div
                  key={index}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                  className="py-3"
                >
                  <p
                    className={`text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${
                      turn.speaker === "AI" ? "text-[#0050cb]" : "text-[#5b6478]"
                    }`}
                  >
                    {turn.speaker}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#434654]">
                    {turn.text}
                  </p>
                </motion.div>
              ))}
            </div>
            <p className="border-t border-[#e8eef7] px-5 py-3 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
              Conceptual conversation — not a live product screenshot
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}