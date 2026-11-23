"use client";

import { motion } from "motion/react";

import { OUTDATED_REASONS } from "@/lib/aiVoiceCandidateDatabaseReactivation";

type AiVoiceCandidateDatabaseReactivationOutdatedProps = {
  reduceMotion: boolean;
};

export function AiVoiceCandidateDatabaseReactivationOutdated({
  reduceMotion,
}: AiVoiceCandidateDatabaseReactivationOutdatedProps) {
  return (
    <section
      className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="outdated"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Why recruitment databases become outdated
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Recruitment databases capture information at a particular point in
            time. A candidate&apos;s circumstances can change.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Availability, location preferences, experience, and career interests
            may evolve. Even a well-maintained database cannot guarantee that
            historical information remains accurate. Recruiters need to refresh
            relevant details before presenting a candidate for a new opportunity.
            A structured reactivation process can support that work.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {OUTDATED_REASONS.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 md:p-8"
            >
              <p className="text-base font-semibold text-[#141b2b]">{reason.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-base">
                {reason.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}