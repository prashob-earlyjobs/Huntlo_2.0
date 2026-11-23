"use client";

import { motion } from "motion/react";

type AiVoiceCandidateFollowUpProblemProps = {
  reduceMotion: boolean;
};

export function AiVoiceCandidateFollowUpProblem({
  reduceMotion,
}: AiVoiceCandidateFollowUpProblemProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            Why Candidate Follow-Up Matters
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Recruitment does not end when a candidate expresses interest.
            Candidates may need additional information before continuing. They
            may be unavailable when the recruiter first contacts them.
            Interview schedules can change. Joining plans may require
            clarification. Each situation creates a new communication
            requirement.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            When follow-ups depend entirely on manual reminders, recruiting
            teams can lose visibility into which candidates need attention.
            The problem is not necessarily a lack of effort. It is the
            difficulty of coordinating many small conversations at the same
            time.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Delayed responses",
              detail:
                "Important candidate replies may be missed when follow-ups are tracked manually.",
            },
            {
              title: "Repeated messages",
              detail:
                "Candidates may receive redundant outreach when coordination is unclear.",
            },
            {
              title: "Lost visibility",
              detail:
                "Recruiters spend time checking which conversations still need attention.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-2xl border border-[#d7e3f4] bg-white p-6 md:p-8 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-[#141b2b]">{item.title}</h3>
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
