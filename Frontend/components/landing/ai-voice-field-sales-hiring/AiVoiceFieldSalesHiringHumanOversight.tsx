"use client";

import { motion } from "motion/react";

type AiVoiceFieldSalesHiringHumanOversightProps = {
  reduceMotion: boolean;
};

export function AiVoiceFieldSalesHiringHumanOversight({
  reduceMotion,
}: AiVoiceFieldSalesHiringHumanOversightProps) {
  return (
    <section
      id="respect-candidate-choice"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Respect Candidate Choice
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Automated calls should clearly identify the recruiting organization
            and the purpose of contact. Candidates should not receive repeated
            unwanted calls. Organizations must consider applicable telecom rules,
            consent requirements, privacy obligations, and recording disclosures.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            The process should provide a suitable route to human assistance. A
            candidate&apos;s decision not to continue should be respected.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.1 }}
          className="mt-16 grid gap-6 md:grid-cols-2"
        >
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">Clear Identification</h3>
            <p className="mt-2 text-base text-[#434654]">
              Calls identify the recruiting organization and purpose upfront.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">Consent & Privacy</h3>
            <p className="mt-2 text-base text-[#434654]">
              Respect telecom rules, consent requirements, and recording
              disclosures.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">Human Escalation</h3>
            <p className="mt-2 text-base text-[#434654]">
              Provide a route to human assistance when candidates request it.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">Opt-Out Respected</h3>
            <p className="mt-2 text-base text-[#434654]">
              Candidate decisions not to continue are honored immediately.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.15 }}
          className="mt-16"
        >
          <h3 className="text-xl font-semibold text-[#141b2b]">
            Use Cases
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Distribution sales, retail field sales, and territory-based
            recruitment across multiple cities.
          </p>
        </motion.div>
      </div>
    </section>
  );
}