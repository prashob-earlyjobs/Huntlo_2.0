"use client";

import { motion } from "motion/react";

type AiVoiceRecruitmentLogisticsWarehouseHumanOversightProps = {
  reduceMotion: boolean;
};

export function AiVoiceRecruitmentLogisticsWarehouseHumanOversight({
  reduceMotion,
}: AiVoiceRecruitmentLogisticsWarehouseHumanOversightProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            High-Volume Calling Needs Clear Boundaries
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Automated recruitment calling must be designed carefully.
            Candidates should know who is contacting them and why. Calls should
            respect applicable telecom rules, consent requirements and privacy
            obligations.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Where calls are recorded or personal information is processed,
            appropriate notices and controls are necessary. A candidate who
            declines further communication should not continue receiving
            repeated calls. The objective is useful engagement, not maximum
            calling volume.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Transparency",
              detail:
                "Candidates should know who is contacting them and why.",
            },
            {
              title: "Consent and privacy",
              detail:
                "Calls respect telecom rules, consent requirements and privacy obligations.",
            },
            {
              title: "Opt-out honored",
              detail:
                "A candidate who declines should not receive repeated calls.",
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
