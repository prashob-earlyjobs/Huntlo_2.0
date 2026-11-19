"use client";

import { motion } from "motion/react";

import { INACTIVE_SIGNALS } from "@/lib/aiTalentPoolEngagement";

type AiTalentPoolEngagementProblemProps = {
  reduceMotion: boolean;
};

export function AiTalentPoolEngagementProblem({
  reduceMotion,
}: AiTalentPoolEngagementProblemProps) {
  return (
    <section
      id="why-talent-pools-become-inactive"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
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
            Why Talent Pools Become Inactive
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Organizations often invest significant effort in candidate discovery.
            But after a vacancy closes, engagement may stop. Recruiters move to
            new requirements. Candidate records remain in the database without an
            active relationship strategy.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Over time, contact information and preferences may become less
            reliable. A large talent pool can therefore provide limited
            operational value if the information is outdated or communication is
            poorly managed.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl border border-[#e0e4ee] bg-[#f7f8fc] p-6 md:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a93a8]">
              Static candidate database
            </p>
            <p className="mt-3 text-base leading-relaxed text-[#5b6478]">
              Records accumulate. Preference fields are filled once and never
              reviewed. Outreach is assembled from whatever data happens to be
              available.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-[#8a93a8]">
              <li>Records outnumber maintained relationships</li>
              <li>Contact permissions are unclear</li>
              <li>Messages repeat the last campaign&apos;s framing</li>
            </ul>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.08 }}
            className="rounded-2xl border border-[#0050cb]/25 bg-[#f0f5ff] p-6 md:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
              Active relationship management
            </p>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              Relevance is reviewed before a person is contacted. Preferences are
              current, and the reason for each message is clear.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-[#434654]">
              <li>Segments reflect candidate interest</li>
              <li>Contact permissions are checked</li>
              <li>Outreach is tied to a genuinely relevant role</li>
            </ul>
          </motion.div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INACTIVE_SIGNALS.map((item, index) => (
            <motion.div
              key={item.title}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: reduceMotion ? 0 : index * 0.06,
              }}
              className="rounded-xl border border-[#e8eef7] bg-white p-5"
            >
              <p className="text-[0.65rem] font-bold tracking-[0.14em] text-[#8a93a8]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-sm font-semibold text-[#141b2b]">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#5b6478]">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 max-w-3xl text-base font-medium leading-relaxed text-[#141b2b] md:text-lg"
        >
          Maintaining relevance is more important than simply accumulating
          records.
        </motion.p>
      </div>
    </section>
  );
}
