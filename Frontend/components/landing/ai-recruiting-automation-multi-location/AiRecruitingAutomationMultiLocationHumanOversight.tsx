"use client";

import { motion } from "motion/react";

type AiRecruitingAutomationMultiLocationHumanOversightProps = {
  reduceMotion: boolean;
};

export function AiRecruitingAutomationMultiLocationHumanOversight({
  reduceMotion,
}: AiRecruitingAutomationMultiLocationHumanOversightProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            Design for the Candidate Experience
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Candidates should not have to understand an employer&apos;s internal
            organizational structure. They should receive clear information
            about the position, location, interview process and next steps. If
            a candidate has applied to multiple locations, communication should
            not become repetitive or contradictory.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Recruiting teams should also respect applicable privacy, consent
            and employment requirements. Consistency is valuable only when it
            improves the experience rather than making it impersonal.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Clear information",
              detail:
                "Candidates receive position, location, interview process and next steps.",
            },
            {
              title: "Non-repetitive communication",
              detail:
                "Candidates applied to multiple locations receive coordinated, not contradictory, messages.",
            },
            {
              title: "Privacy and consent",
              detail:
                "Communication respects applicable privacy, consent and employment requirements.",
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
