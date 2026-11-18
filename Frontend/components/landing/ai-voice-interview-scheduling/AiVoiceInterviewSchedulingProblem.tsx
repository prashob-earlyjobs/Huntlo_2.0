"use client";

import { motion } from "motion/react";

type AiVoiceInterviewSchedulingProblemProps = {
  reduceMotion: boolean;
};

export function AiVoiceInterviewSchedulingProblem({
  reduceMotion,
}: AiVoiceInterviewSchedulingProblemProps) {
  return (
    <section className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="problem">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Why voice-based coordination matters
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            A phone conversation can be the most direct way to confirm availability.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Recruitment teams often rely on a combination of phone calls,
            messaging applications and email. Each channel has its place. But for
            some candidates, a phone conversation is the most direct way to
            confirm availability or clarify a scheduling question. This may be
            particularly relevant in high-volume recruitment for customer
            support, field sales, logistics, retail and operational roles.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Candidates are unreachable by text",
              description:
                "Some candidates are working shifts, traveling or unable to respond immediately to written messages.",
            },
            {
              title: "Coordination tasks accumulate",
              description:
                "For Indian recruitment teams managing large candidate volumes, small scheduling tasks add up quickly.",
            },
            {
              title: "Channel preference varies",
              description:
                "The experience should never assume that every candidate prefers an automated call.",
            },
          ].map((column, index) => (
            <motion.div
              key={column.title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 md:p-8"
            >
              <p className="text-base font-semibold text-[#141b2b]">{column.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-base">
                {column.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
