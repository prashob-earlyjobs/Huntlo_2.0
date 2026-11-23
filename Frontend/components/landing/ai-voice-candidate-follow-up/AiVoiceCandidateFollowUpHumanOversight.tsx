"use client";

import { motion } from "motion/react";

type AiVoiceCandidateFollowUpHumanOversightProps = {
  reduceMotion: boolean;
};

export function AiVoiceCandidateFollowUpHumanOversight({
  reduceMotion,
}: AiVoiceCandidateFollowUpHumanOversightProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            Respect Candidate Time and Choice
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Automated follow-up can become counterproductive when it is
            excessive. Candidates should not receive repeated calls simply
            because they have not responded. Organizations need sensible
            contact limits, suppression processes and human escalation paths.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            They should also consider applicable Indian telecom requirements,
            privacy obligations and recording disclosures. The candidate&apos;s
            ability to decline further communication is an essential part of a
            responsible workflow.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Sensible contact limits",
              detail:
                "Candidates should not receive repeated calls due to non-response.",
            },
            {
              title: "Suppression and opt-out",
              detail:
                "A candidate who declines should not receive further automated contact.",
            },
            {
              title: "Human escalation",
              detail:
                "Unresolved matters route to the recruiter or appropriate team member.",
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
