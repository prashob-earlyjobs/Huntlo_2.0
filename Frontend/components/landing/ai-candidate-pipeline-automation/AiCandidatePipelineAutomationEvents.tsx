"use client";

import { motion } from "motion/react";

import { EVENT_TRIGGERS } from "@/lib/aiCandidatePipelineAutomation";

type AiCandidatePipelineAutomationEventsProps = {
  reduceMotion: boolean;
};

export function AiCandidatePipelineAutomationEvents({
  reduceMotion,
}: AiCandidatePipelineAutomationEventsProps) {
  return (
    <section
      className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="events"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Design the pipeline around events
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            A pipeline is often represented as a sequence of stages. But
            recruitment progresses through events.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            A candidate expresses interest. A screening is completed. An
            interview is scheduled. Feedback is submitted. A hiring manager makes
            a decision. Each event creates a possible next action. A coordinated
            pipeline workflow should define what happens after those events. It
            should also account for exceptions when the expected action cannot be
            completed.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {EVENT_TRIGGERS.map((trigger, index) => (
            <motion.div
              key={trigger.event}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.06 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0050cb]/10 text-sm font-bold text-[#0050cb]">
                {index + 1}
              </div>
              <h3 className="mt-3 text-base font-semibold text-[#141b2b]">{trigger.event}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#434654]">
                {trigger.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}