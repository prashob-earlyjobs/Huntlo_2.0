"use client";

import { motion } from "motion/react";

type AiVoiceCandidateFollowUpDefinitionProps = {
  reduceMotion: boolean;
};

export function AiVoiceCandidateFollowUpDefinition({
  reduceMotion,
}: AiVoiceCandidateFollowUpDefinitionProps) {
  return (
    <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            What Is AI Voice Candidate Follow-Up?
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            AI voice candidate follow-up refers to the use of automated voice
            conversations to support selected follow-up activities in
            recruitment. These may include availability checks, callback
            requests, interview confirmations and routine information
            gathering. A conversational workflow may be designed to distinguish
            between different candidate responses.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Someone confirming an interview needs a different next step from
            someone requesting a schedule change. Someone asking to stop
            communication should not continue receiving reminders. The value of
            the workflow depends on how accurately it handles these
            differences and how clearly it escalates exceptions.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Availability checks",
              detail: "Confirming whether a candidate can proceed with next steps.",
            },
            {
              label: "Callback requests",
              detail: "Following up on candidates who asked to be contacted later.",
            },
            {
              label: "Interview confirmations",
              detail: "Supporting scheduling confirmation and relevant reminders.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6 md:p-8"
            >
              <h3 className="text-lg font-semibold text-[#141b2b]">{item.label}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#434654]">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
