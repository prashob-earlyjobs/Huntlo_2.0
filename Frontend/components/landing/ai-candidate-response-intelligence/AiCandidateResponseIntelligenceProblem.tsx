"use client";

import { motion } from "motion/react";

type AiCandidateResponseIntelligenceProblemProps = {
  reduceMotion: boolean;
};

export function AiCandidateResponseIntelligenceProblem({
  reduceMotion,
}: AiCandidateResponseIntelligenceProblemProps) {
  return (
    <section className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="problem">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Why candidate responses are operationally important
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Outreach activity is measured. Response meaning often is not.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Recruitment outreach is often measured by activity. Teams may track
            messages sent, replies received, and candidates contacted. Those
            measures can be useful, but they do not explain what the responses
            mean. A reply expressing interest is different from a question about
            compensation. A scheduling request is different from a request to
            stop communication. A candidate who is unavailable today may still
            be relevant to a future opportunity. Each response affects the
            recruiting process differently. When those distinctions are not
            captured consistently, recruiters spend time reconstructing context
            from conversations.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Interest vs. information",
              description:
                "A reply expressing interest is different from a question about compensation or logistics.",
            },
            {
              title: "Scheduling vs. opting out",
              description:
                "A scheduling request is different from a request to stop communication.",
            },
            {
              title: "Unavailable now, relevant later",
              description:
                "A candidate who is unavailable today may still be relevant to a future opportunity.",
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