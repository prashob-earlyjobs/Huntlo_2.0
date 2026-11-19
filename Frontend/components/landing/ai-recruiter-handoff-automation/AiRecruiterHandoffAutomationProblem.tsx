"use client";

import { motion } from "motion/react";

import { HANDOFF_PARTICIPANTS } from "@/lib/aiRecruiterHandoffAutomation";

type AiRecruiterHandoffAutomationProblemProps = {
  reduceMotion: boolean;
};

export function AiRecruiterHandoffAutomationProblem({
  reduceMotion,
}: AiRecruiterHandoffAutomationProblemProps) {
  return (
    <section
      id="why-recruiter-handoffs-create-friction"
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
            Why Recruiter Handoffs Create Friction
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Recruitment is frequently collaborative. Sourcers identify
            candidates. Recruiters conduct screening conversations. Coordinators
            arrange interviews. Hiring managers evaluate applicants. Staffing
            agencies may also involve account managers and client delivery teams.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Each participant needs relevant information. But not everyone needs
            access to every detail. When handoffs depend on informal messages or
            manual summaries, information may be incomplete.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {HANDOFF_PARTICIPANTS.map((participant, index) => (
            <motion.div
              key={participant.role}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: reduceMotion ? 0 : index * 0.06,
              }}
              className="rounded-2xl border border-[#d7e3f4] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-[#141b2b]">
                  {participant.role}
                </h3>
                <span className="rounded-full bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#0050cb]">
                  Handoff
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#5b6478]">
                {participant.owns}
              </p>
              <p className="mt-3 border-t border-[#f0f3f9] pt-3 text-sm leading-relaxed text-[#434654]">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#8a93a8]">
                  Passes on
                </span>
                <br />
                {participant.hands}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mt-12 rounded-2xl border border-[#f0dcc1] bg-[#fdf8f1] p-6 md:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a5b18]">
            The gap that creates repeated work
          </p>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            A recruiter may not know that a candidate requested a callback. An
            interview coordinator may lack the candidate&apos;s availability. A
            hiring manager may receive an outdated description of the
            candidate&apos;s interest. These gaps create unnecessary work and can
            affect candidate experience.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
