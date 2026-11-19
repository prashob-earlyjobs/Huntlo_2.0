"use client";

import { motion } from "motion/react";

import {
  CONTEXT_NOT_PRESSURE,
  HERO_THREAD,
  PRODUCT_ENG_SEQUENCE,
  SILENCE_POINTS,
} from "@/lib/automatedCandidateFollowUp";

type AutomatedCandidateFollowUpStoryProps = {
  reduceMotion: boolean;
};

export function AutomatedCandidateFollowUpStory({
  reduceMotion,
}: AutomatedCandidateFollowUpStoryProps) {
  return (
    <>
      <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Silence
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Silence is not always a rejection
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
              {SILENCE_POINTS.map((point) => (
                <p key={point}>{point}</p>
              ))}
            </div>

            <aside className="mt-10 rounded-2xl border border-[#d7e3f4] bg-[#f0f5ff] px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
                Candidate scenario
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#5b6478] md:text-[0.95rem]">
                A product engineer opens your message on a travel day, means to reply, and forgets.
                A restrained reminder with role context reopens the conversation - pressure would
                close it.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Tone
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Follow-up should feel like context, not pressure
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              Good follow-up explains why you are writing again. It does not escalate urgency for
              its own sake.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {CONTEXT_NOT_PRESSURE.map((item, index) => (
              <motion.article
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.05 }}
                className="rounded-2xl border border-[#e8eef7] bg-white p-6"
              >
                <h3 className="text-base font-bold text-[#141b2b]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="sequence"
        className="scroll-mt-24 border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-12">
          <div className="max-w-xl text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Sequence design
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              A sequence with a clear beginning and end
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              Illustrative product engineering outreach - opening, context reminder, closing
              touch, and an explicit reply → pause branch.
            </p>
          </div>

          <ol className="hidden space-y-3 md:block">
            {PRODUCT_ENG_SEQUENCE.map((step, index) => (
              <motion.li
                key={step.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className={`rounded-2xl border px-4 py-4 text-left ${
                  step.title.includes("pause") || step.title.includes("Reply")
                    ? "border-[#0050cb]/35 bg-[#f0f5ff]"
                    : "border-[#e8eef7] bg-[#fafbfd]"
                }`}
              >
                <p className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {step.step}
                </p>
                <p className="mt-1.5 text-sm font-bold text-[#141b2b]">{step.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#5b6478] sm:text-sm">
                  {step.detail}
                </p>
              </motion.li>
            ))}
          </ol>

          <ol className="space-y-3 text-left md:hidden">
            {HERO_THREAD.map((msg, index) => (
              <motion.li
                key={`mobile-${msg.label}-${index}`}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className={`rounded-2xl border px-4 py-4 ${
                  msg.from === "candidate" || msg.label.includes("paused")
                    ? "border-[#0050cb]/30 bg-[#f0f5ff]"
                    : "border-[#e8eef7] bg-[#fafbfd]"
                }`}
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#8a93a8]">
                  {msg.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#141b2b]">{msg.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
