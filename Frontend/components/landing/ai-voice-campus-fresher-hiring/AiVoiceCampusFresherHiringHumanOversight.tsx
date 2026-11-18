"use client";

import { motion } from "motion/react";

type AiVoiceCampusFresherHiringHumanOversightProps = {
  reduceMotion: boolean;
};

export function AiVoiceCampusFresherHiringHumanOversight({
  reduceMotion,
}: AiVoiceCampusFresherHiringHumanOversightProps) {
  return (
    <section
      id="candidate-trust-matters-at-the-beginning-of-a-career"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Candidate Trust Matters at the Beginning of a Career
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            For many students, campus recruitment is an early professional
            experience. Clear communication can help them understand what to
            expect. Organizations should identify themselves appropriately,
            explain the automated nature of calls, and provide a route to human
            assistance.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            They should also consider applicable consent, privacy, telecom, and
            recording requirements. Unnecessary repeated contact should be
            avoided. Student information should be handled carefully and used
            only for appropriate recruitment purposes.
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
              Calls identify the organization and explain the automated nature.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">Human Escalation</h3>
            <p className="mt-2 text-base text-[#434654]">
              Provide a route to human assistance for student questions.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">Privacy & Consent</h3>
            <p className="mt-2 text-base text-[#434654]">
              Respect consent, privacy, telecom, and recording requirements.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d7e3f4] bg-[#f7f8fc] p-6">
            <h3 className="text-lg font-semibold text-[#141b2b]">No Pressure</h3>
            <p className="mt-2 text-base text-[#434654]">
              Avoid pressuring students or creating confusion about status.
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
            Student Experience
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Mobile-friendly recruitment information interface for students to
            access details about roles, process, and timeline.
          </p>
        </motion.div>
      </div>
    </section>
  );
}