"use client";

import { motion } from "motion/react";

type AiVoiceInterviewSchedulingDefinitionProps = {
  reduceMotion: boolean;
};

export function AiVoiceInterviewSchedulingDefinition({
  reduceMotion,
}: AiVoiceInterviewSchedulingDefinitionProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="definition">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            What is AI voice interview scheduling?
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Automated voice conversations within the interview coordination process.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            AI voice interview scheduling is the use of automated voice
            interactions within the interview coordination process. A workflow
            may ask a candidate to confirm availability, acknowledge interview
            details, request a callback or indicate that a schedule change is
            needed.
          </p>
        </div>

        <div className="mt-10 space-y-6 max-w-3xl">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">Conversation vs reminder</h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              A recorded reminder delivers information. A conversational voice
              workflow may be designed to capture a response and identify what
              should happen next. A candidate confirming attendance needs a
              different follow-up from someone requesting another time.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.06 }}
            className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">Calendar access is not automatic</h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              Automated calling does not automatically mean the system can
              access calendars, create meetings or resolve conflicts. Those
              functions require verified integrations and permissions.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.12 }}
            className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">Concise, understandable, relevant</h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              The conversation should remain brief enough to respect the
              candidate&apos;s time and relevant to the interview at hand.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
