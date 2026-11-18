"use client";

import { motion } from "motion/react";

type AiVoiceBpoRecruitmentDefinitionProps = {
  reduceMotion: boolean;
};

export function AiVoiceBpoRecruitmentDefinition({
  reduceMotion,
}: AiVoiceBpoRecruitmentDefinitionProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="definition">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            What is AI voice recruitment for BPO hiring?
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Structured automated conversations for selected hiring stages.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            AI voice recruitment uses automated voice conversations to support
            selected stages of the hiring process. For BPO recruitment,
            potential applications include initial interest checks, availability
            confirmation, approved screening questions and interview-related
            follow-ups.
          </p>
        </div>

        <div className="mt-10 space-y-6 max-w-3xl">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">The first call should create clarity</h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              A useful initial conversation answers whether the candidate
              understands the role, is interested, has a suitable work location,
              can work within the required schedule and is available for the
              next stage.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.06 }}
            className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">Not a substitute for assessment</h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              Automated calls should not be presented as a substitute for a
              valid assessment of communication ability, job skills or other
              role requirements. The recruiter should review relevant
              information before making decisions about progression.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.12 }}
            className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">Transparent about its automated nature</h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              The conversation should be transparent about its automated nature
              and avoid collecting unnecessary personal information.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
