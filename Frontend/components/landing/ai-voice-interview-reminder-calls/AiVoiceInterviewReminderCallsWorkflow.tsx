"use client";

import { motion } from "motion/react";

import {
  REMINDER_RESPONSE_TYPES,
  REMINDER_WORKFLOW,
} from "@/lib/aiVoiceInterviewReminderCalls";

type AiVoiceInterviewReminderCallsWorkflowProps = {
  reduceMotion: boolean;
};

export function AiVoiceInterviewReminderCallsWorkflow({
  reduceMotion,
}: AiVoiceInterviewReminderCallsWorkflowProps) {
  return (
    <section
      id="reminder-workflow"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Operating model
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            A Practical Interview Reminder Workflow
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Each step exists to keep the interview record accurate and to make
            exceptions visible before the interview day.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {REMINDER_WORKFLOW.map((item, index) => (
            <motion.div
              key={item.step}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: reduceMotion ? 0 : index * 0.05,
              }}
              className="rounded-2xl border border-[#d7e3f4] bg-[#fbfcfe] p-5"
            >
              <span className="text-[0.65rem] font-bold tracking-[0.16em] text-[#0050cb]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-sm font-semibold text-[#141b2b]">
                {item.step}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#5b6478]">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.06 }}
          className="mt-14"
        >
          <h3 className="text-xl font-semibold tracking-tight text-[#141b2b] md:text-2xl">
            Each response leads somewhere different
          </h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {REMINDER_RESPONSE_TYPES.map((item, index) => (
              <div
                key={item.response}
                className="rounded-xl border border-[#e8eef7] bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f0f5ff] text-[0.6rem] font-bold text-[#0050cb]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#141b2b]">
                      {item.response}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#5b6478]">
                      {item.next}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-[#8a93a8]">
          This is an illustrative workflow and must be matched to actual Huntlo
          functionality before publication.
        </p>
      </div>
    </section>
  );
}
