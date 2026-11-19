"use client";

import { motion } from "motion/react";

import { INTERVIEW_OPEN_QUESTIONS } from "@/lib/aiVoiceInterviewReminderCalls";

type AiVoiceInterviewReminderCallsProblemProps = {
  reduceMotion: boolean;
};

export function AiVoiceInterviewReminderCallsProblem({
  reduceMotion,
}: AiVoiceInterviewReminderCallsProblemProps) {
  return (
    <section
      id="why-interview-reminders-matter"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Why Interview Reminders Matter
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Scheduling an interview creates an agreement about a future event.
            But circumstances can change. Candidates may have competing
            commitments. Interview details may need clarification. A hiring
            manager may revise the schedule. A candidate may decide not to
            proceed.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            A useful reminder process helps identify these situations early enough
            for the recruiting team to respond appropriately. The purpose is not
            to pressure candidates into attending. It is to make communication
            clearer.
          </p>
        </motion.div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white">
          <div className="hidden grid-cols-[1fr_1.2fr] gap-4 border-b border-[#e8eef7] bg-[#fbfcfe] px-6 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8] md:grid">
            <span>Unresolved interview question</span>
            <span>Coordination needed before the interview</span>
          </div>
          {INTERVIEW_OPEN_QUESTIONS.map((item, index) => (
            <motion.div
              key={item.situation}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.35,
                delay: reduceMotion ? 0 : index * 0.06,
              }}
              className="grid gap-1.5 border-b border-[#f0f3f9] px-6 py-4 last:border-b-0 md:grid-cols-[1fr_1.2fr] md:items-center md:gap-4"
            >
              <p className="text-sm font-semibold text-[#141b2b]">
                {item.situation}
              </p>
              <p className="text-sm leading-relaxed text-[#5b6478]">
                {item.coordination}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45 }}
          className="mt-10 rounded-2xl border border-[#0050cb]/20 bg-[#f0f5ff] p-6 md:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
            What these situations have in common
          </p>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Each one requires a conversation before the interview begins, and none
            of them can be resolved by sending the same reminder to every
            candidate. The recruiting team needs to know what the candidate
            actually said.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
