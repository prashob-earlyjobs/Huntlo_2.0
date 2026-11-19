"use client";

import { motion } from "motion/react";

type FacilityConversationProps = {
  reduceMotion: boolean;
};

const TURNS = [
  {
    speaker: "Voice agent",
    text: "Hello, this is an automated call from the security staffing team about a guard position at a gated complex in Electronic City. Are you able to travel to that site?",
  },
  {
    speaker: "Candidate",
    text: "Electronic City is far for me. I stay closer to Yeshwanthpur.",
  },
  {
    speaker: "Voice agent",
    text: "Thank you. I will record that this site is not workable for you so the recruiter can check for a closer requirement.",
  },
] as const;

export function FacilityConversation({ reduceMotion }: FacilityConversationProps) {
  return (
    <section
      id="site-location-conversation"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white shadow-[0_24px_60px_-40px_rgba(0,80,203,0.25)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#e8eef7] bg-[#fafbfd] px-5 py-4">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
                  Sample site availability call
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[#141b2b]">
                  Location constraint captured
                </p>
              </div>
              <span className="rounded-full border border-[#d7e3f4] bg-white px-2.5 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-[#8a93a8]">
                Not a recording
              </span>
            </div>
            <div className="space-y-4 p-5">
              {TURNS.map((turn, index) => (
                <motion.div
                  key={index}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: reduceMotion ? 0 : index * 0.08,
                  }}
                  className={
                    turn.speaker === "Candidate"
                      ? "ml-4 rounded-xl bg-[#f7f8fc] p-3.5 sm:ml-8"
                      : "rounded-xl border border-[#e8eef7] p-3.5"
                  }
                >
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
                    {turn.speaker}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#434654]">
                    {turn.text}
                  </p>
                </motion.div>
              ))}
            </div>
            <div className="border-t border-[#e8eef7] px-5 py-3">
              <p className="text-[0.7rem] text-[#8a93a8]">
                Illustrative transcript. Consent, recording, and channel
                practices must be verified before publication.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.08 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Multi-site staffing
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem]">
              A Location Constraint Is Useful Information.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Facility management companies may recruit across several client
              locations. Each site may have different staffing needs. A candidate
              suitable for one location may not be available for another.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              A structured voice process can help maintain consistent initial
              communication while reflecting site-specific requirements. However,
              the workflow should not treat all locations or positions as
              interchangeable.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Candidates need accurate information about the opportunity being
              discussed — including when the answer is that this site will not
              work.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
