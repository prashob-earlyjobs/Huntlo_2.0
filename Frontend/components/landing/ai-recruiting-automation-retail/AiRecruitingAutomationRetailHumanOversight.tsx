"use client";

import { motion } from "motion/react";

type AiRecruitingAutomationRetailHumanOversightProps = {
  reduceMotion: boolean;
};

export function AiRecruitingAutomationRetailHumanOversight({
  reduceMotion,
}: AiRecruitingAutomationRetailHumanOversightProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            Keep the Candidate Experience Simple
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Retail candidates should not need to navigate complicated
            recruitment systems. They need clear information about the role,
            location, schedule and interview process. Communication should be
            concise, accessible and relevant. Candidates should also have a
            way to request assistance or stop further contact.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Recruiting teams should consider applicable employment, privacy
            and communication requirements when designing automated processes.
            AI retail recruiting does not replace store managers. Store
            managers and recruiters should retain responsibility for
            appropriate hiring decisions and human interactions.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Clear information",
              detail:
                "Candidates receive role, location, schedule and interview process details.",
            },
            {
              title: "Concise communication",
              detail:
                "Messages are accessible, relevant and avoid repetitive contact.",
            },
            {
              title: "Human decisions retained",
              detail:
                "Store managers and recruiters retain responsibility for hiring decisions and human interactions.",
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
